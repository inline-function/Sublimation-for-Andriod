# Termux 无 Gradle 构建可行性评估

目标：不安装完整 AndroidSDK/Gradle，只用 `aapt2`、`apksigner`、`zipalign`、`android.jar`、`d8`、`adb`、`kotlinc`（含基本库与协程库）、`JRE`，在 Termux 里构建本项目的 APK。

## 结论：高度可行，需一处改造

工具链在 Termux（aarch64）上全部可得，且**都不来自完整 SDK**：

| 工具 | Termux 来源 | 架构 | 备注 |
|---|---|---|---|
| JRE (openjdk-17) | `pkg install openjdk-17` ✅ 官方包 | 纯 Java + arm64 原生 | 大约 300MB，`java`/`keytool` 都有 |
| kotlinc | `pkg install kotlin` ✅ 官方包（或解压官方 jvm 发行版，JRE 上直接跑） | 纯 Java | 协程库 `kotlinx-coroutines-core.jar` 跟随 maven 中心仓下载一次即可 |
| d8/r8 | 构建 r8.jar（纯 Java）或取 build-tools 里的 `d8.jar` | 纯 Java | `java -cp r8.jar com.android.tools.r8.D8 --lib android.jar ...` |
| aapt2 | `pkg install aapt2` ✅ 官方包 | arm64 原生 | issue #26858 指出其版本偏旧（不支持 SDK 36 新属性）；本应用用不到新属性，无碍 |
| apksigner | `pkg install apksigner` ✅ 官方包 | 纯 Java | 签名 v1/v2/v3，配合 JRE 的 keytool 生成 keystore |
| zipalign | `rendiix/termux-zipalign` 预构建；也可用纯 python 版 | arm64 原生 | 唯一需要第三方预构建的件 |
| adb | `pkg install android-tools` ✅ 官方包 | arm64 原生 | 装到别的设备 / 无线调试 |
| android.jar | PC 的 SDK 里拷一个文件即可 | 纯 jar（架构无关） | 只是编译/链接时的框架存根，不参与运行 |

## 唯一必须的改造：去掉 AndroidX/Material 依赖

当前 app 的 `build.gradle.kts` 引用了三个 AAR：`core-ktx`、`appcompat`、`material`。无 Gradle 就没有 maven 依赖解析与 AAR 合并（classes.jar + res + assets + manifest overlay）。逐项核对实际使用：

- `material`：仅 `DshBridge` 用 `MaterialButton`（唯一用途是比 `Button` 好看的圆角）。**换成 `android.widget.Button`** 即可完全去掉——功能、`text`、`enabled`、`setOnClickListener` 接口完全相同，一行改动。
- `appcompat`：`MainActivity` 继承的是 `android.app.Activity`（没用 `AppCompatActivity`）→ 可去掉。
- `core-ktx`：代码里没有使用任何 ktx 扩展 → 可去掉。

零依赖后 `kotlinc` 的 classpath 只剩 `android.jar` + kotlin-stdlib +（可选）协程 jar——恰好就是题目给定的工具集。**纯原生 Framework API**。

顺带收益：dex 体积从约 5MB（material/appcompat 全家桶）降到约 1.5MB，手机上 dex 编译快得多。

## 资源：可以零 res

AndroidManifest 引用了 `@style/Theme.Sublimation`（在 `res/values/themes.xml`）。Termux 构建有两条路：

1. **零 res**：删掉 `android:theme` 属性，使用系统默认主题。WebView 应用对主题几乎无感（按钮/文本仍正常渲染），Toast/弹窗不受影响。这条最省事。
2. **保留 res**：`aapt2 compile res/values/themes.xml -o fl/ && aapt2 link fl/*.flat -I android.jar --manifest ...` —— 原生 aapt2 也能编译 values 资源，只是多一步。

图标同理：不声明 `android:icon` 即可（安装后用系统默认图标）；想要图标就走路线 2 编译一个 mipmap。

## 构建管线（落地脚本骨架）

```sh
# 一次性：生成调试签名（JRE 自带 keytool）
keytool -genkey -v -keystore debug.keystore -alias androiddebugkey -dname 'CN=Android Debug,O=Android,C=US' -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000

# 一次性：编译固定的 KT 外壳（MainActivity + DshBridge，约 700 行）
kotlinc -cp android.jar:kotlin-stdlib.jar -d classes functor/sublimation/android/*.kt
cd classes && zip -r ../classes.jar . && cd ..
d8 --lib android.jar --release --output dex classes.jar   # d8 输出 classes.dex

# 每次构建：
# 1) Sublimation 编译器（JVM jar，postcompile 钩子驱动下面步骤）
java -jar cli.jar compile app/ -o app/out.js -p 'annotation processer' \
    -A appDir=. -A jsPath=app/out.js -A outDir=./build-apk
# 2) 打包：aapt2 链接 manifest + assets（app.js）
aapt2 link --manifest AndroidManifest.xml -I android.jar \
    --min-sdk-version 24 --target-sdk-version 34 \
    --assets-dir assets -o base.apk
# 3) 塞入 dex
zip -j base.apk classes.dex
# 4) 对齐 + 签名
zipalign -p -f 4 base.apk app.apk
apksigner sign --ks debug.keystore --ks-pass pass:android app.apk
# 5) 装机
adb install app.apk          # 装别的设备
pm install -r /path/app.apk  # 装本机：需 Shizuku/Root（adb 无法回环本机）
```

> 注意：当前 `android-app` 的 postcompile 钩子调的是 `gradlew assembleDebug`——termux 版改为调用上面这个 `build.sh` 即可（`-A` 参数不变），处理器脚本本身不用改。

## 本应用带来的两个放大优势

1. **JS 侧才是变量**：KT 外壳（Activity/DshBridge）是固定的，一座编译一次就够。日常改的是 `.subl` → `assets/app.js`。因此可以更进一步：**预置骨架 APK**——base.apk 里 dex/manifest 固定，每次只需替换 assets 里的 app.js 再重签。整条环路退化为 `zip 替换 + zipalign + apksigner`，秒级，kotlinc/d8 都不用跑。
2. **编译器是 JVM jar**：`cli.jar`、注解处理器解释器全在 JRE 上跑，与 Gradle 无关。整个「手机上写 .subl → 编译 → 装 APK → WebView 运行」闭环可以在 Termux 内完成。

## 风险与注意点

- **aapt2 版本偏旧**（termux 打包滞后）：只要 manifest 不用 SDK 35+ 的全新属性就无事；`--target-sdk-version` 建议写 34。
- **协程实为非必需**：当前外壳用 `runOnUiThread`/`WebView.post`，没有用协程——工具清单里的协程库可以不留（留着也只是 dex 稍大）。若以后外壳要协程，`kotlinx-coroutines-core.jar`（纯 JVM，~2.5MB）加入 d8 输入即可。
- **本机安装的最后一公里**：adb 不能连本机（除非 root/无线回环）。文档里已规划的 Shizuku + `pm install` 是现成解法；或者无线 adb 连 PC。
- **内存**：kotlinc（JVM）在手机上跑要给 `-Xmx`（openjdk 默认堆可能偏大/偏小都慢）；一次编译 700 行外壳在合理手机上约 30s 量级，可接受。
- **d8 与 android.jar 版本要对上**：用 SDK 34/35 的 `android.jar` 配较新的 r8.jar；太旧的 r8 不认新 API 级别。
- **assets 不压缩**：aapt2 默认不压缩 `assets/` 里的东西无妨（WebView 经 AAssetManager 读取，压缩与否都能读）；要保持 `app.js` 可被 `file:///android_asset/` 读到只需路径正确。

## 建议的下一步

1. 新建 `termux-app/`（或改造现有 `android-app` 加一个 `build.sh` + 无依赖的 manifest/kotlin 源），`MaterialButton`→`Button`。
2. 先在 PC 上用同一套工具链（aapt2/d8/apksigner/zipalign，不经 Gradle）验证一遍 APK 能装能跑，确认产物与 Gradle 版等价。
3. 再把同一脚本搬到 Termux 验证。
4. 长期方案：把 `assets/app.js` 增量替换 + 重签做成秒级环路。
