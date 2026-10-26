# AndroidSDK for CandyIDE

为 Sublimation/CandyIDE 准备的**精简安卓工具包**：不含完整 AndroidSDK、不含 Gradle，
仅用 aapt2 / d8 / apksigner / zipalign / android.jar / Kotlin 编译器（纯 Java）+ JRE 即可
把安卓工程构建为可安装的 APK（含 Material Design 库）。

## 目录结构

```
AndroidSDK for CandyIDE/
├── bin/    aapt2、zipalign（Windows x86_64 原生；其它平台请用 PATH 中的同名工具）
├── lib/    android.jar、d8.jar、apksigner.jar、
│           kotlin-compiler.jar、kotlin-stdlib.jar、trove4j.jar
├── libs/   AndroidX + Material 全套依赖（AAR/JAR，版本钉死）
├── keystore/debug.keystore   构建签名（candydebug，机器间可互换）
├── build/  build-apk.ps1 / build-apk.sh / gen-r.py
└── template-app/  应用模板（壳工程，开箱即改即构建）
```

## 模板工程（template-app）

`template-app/` 是一个最小可用的安卓壳工程：单活动 + WebView + `DshBridge`
（JS-KT 桥，证书 `functor.sublimation.android`），含占位 `app.js`。
插件开发者复制该目录即可起步——既可走精简工具链，也保留了 Gradle 包装
（`gradlew`、`build.gradle.kts`）兼容完整 Gradle 构建。

构建模板（无 Gradle，约 1 分钟）：

```bash
powershell -ExecutionPolicy Bypass -File "build/build-apk.ps1" \
  -Project template-app/app -Out app-debug.apk
```

### 模板渲染能力清单（DshBridge 视图分支）

| 视图 tag | 说明 |
| --- | --- |
| `Box` | 竖排/横排容器；`scrollable=true` 包进 ScrollView（纵向）/HorizontalScrollView（横向）；
含 `FloatingButton` 子视图时自动改 FrameLayout 悬浮叠放（其余子视图照常排布） |
| `Button` / `FloatingButton` | MaterialButton；FloatingButton 为 MD 悬浮按钮（Gravity BOTTOM\|END，16dp 边距） |
| `Text` / `TextField` | TextView；EditText 输入 |
| `Switch` / `Checkbox` | MaterialSwitch；MaterialCheckBox |
| `Slider` | MaterialSlider（值滑块） |
| `Image` | ImageView（网络/项目图片） |
| `Progress` | ProgressBar |
| `Chart` | 折线/柱状自绘图表（ChartView：points/labels/kind/color） |
| `TimelineView` | 时间线列表（纵向/横向可滑动） |

平台能力（`__dshAndroid`）：剪贴板、持久化、振动、屏幕信息、安装应用列表、
`fmtTime`（毫秒→"MM-dd HH:mm"）等，详见编译器仓的安卓注解处理器与安卓标准库文档。

## 使用

```bash
# Windows
powershell -ExecutionPolicy Bypass -File "build/build-apk.ps1" \
  -Project <含 src/main 的工程目录> -Out <apk 输出路径>

# Termux / Linux / macOS（先 pkg install aapt2 zipalign openjdk-17）
sh build/build-apk.sh -p <工程目录> -o <apk 路径>
```

工程布局：`<Project>/src/main/{AndroidManifest.xml, java/**/*.kt, res, assets}`
（Gradle 布局的工程传 `app/` 模块目录，如 `template-app/app`）。
构建步骤（约 1 分钟，全量）：解压依赖 AAR → aapt2 编译/链接资源 → 生成库 R 类 →
编译 Kotlin → d8 打 dex → 注入 dex+assets → zipalign → apksigner 签名。

## 为什么不需要 Gradle（R 类合成）

安卓库（Material/AppCompat…）的字节码在运行时会 getstatic 自己包的 `R${R.attr|R.style|…}`。
Gradle 的活儿里有一件关键：按最终资源表重写这些 R 类。本工具包的做法：
aapt2 link 用 `--java` 输出合并后的 R.java，`gen-r.py` 把它按 17 个库包的需求表
（编译时从 dex 反扫得到）转换成 Kotlin 的 `class R { class style { companion object { const val … } } }`，
与工程源码一起编译——零 javac、零 Gradle。

## 更新依赖

`libs/` 版本钉死，更新需要：改 `build/gen-r.py` 与 `build-apk.ps1` 里的 `R_NEED` 需求表
（或在构建后反扫 dex：`grep -aoE 'L[a-z0-9._/]+/R\$[a-z]+;' classes.dex | sort -u`），
并替换 AAR。AAR 可从 Gradle 缓存（`~/.gradle/caches/modules-2/files-2.1`）或 maven 中心仓取得。

## 签名

`keystore/debug.keystore`（alias=candydebug，口令 android）随包发布，便于同一应用多次
覆盖安装；正式发布请换用自己的签名。
