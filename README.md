# Sublimation for Android

这个工程使得 Sublimation 编译器获得把代码编译为 APK 的能力。

Sublimation 语言（声明式、受 Rust/Kotlin 启发的设计验证语言）的安卓目标工程。
本仓库把安卓相关的注解处理器、安卓标准库与安卓壳工程集中在一处：
用 Sublimation 写应用 → 编译器生成 JS → 经 WebView 桥在安卓壳里运行，
KT 端用普通 MD 视图（MaterialButton/TextView/LinearLayout，不使用 Compose）动态构建界面。

## 目录结构

| 目录 | 内容 |
| --- | --- |
| `android doc/` | 安卓目标文档：《安卓标准库》《精简工具链》 |
| `annotation processer/` | 安卓注解处理器（`@android` 内建校验、`@view` 视图变换、`@postcompile` APK 构建钩子） |
| `app/` | 编译输入目录：示例应用（`main.subl`）、安卓标准库（`*.subl`）与 `core/` 标准库副本 |
| `android-app/` | 壳工程：单活动 + WebView + `DshBridge`（JS-KT 桥），兼容 Gradle 与精简工具链两种构建 |
| `sdk-lite/` | 精简工具链工作区（Windows 版，aapt2/d8/apksigner/kotlinc，本体为 `AndroidSDK for CandyIDE.zip`，不入库，见 `android doc/精简工具链.md`） |
| `LiteASDK/` | 安卓/Termux 精简工具链（aapt2/zipalign 为 aarch64 原生，取自 Termux 官方包；本体随 `LiteASDK.zip` 分发，不入库，见 `LiteASDK/README.md`） |

## 端到端流程

```
java -cp <编译器 jars> sugared.functor.MainKt compile <app 目录> \
    -o <out.js 路径> \
    -A appDir=<android-app 路径> -A jsPath=<out.js 路径> \
    -A outDir=<APK 输出目录> -A sdkDir=<sdk-lite 路径>
```

1. 语义检查（`@android` 白名单/`@impure`/无体校验、`@composable` 视图纪律）与 JS 生成：
   `@android` 内建桥接为 `__dshAndroid(kind, args)`；生命周期注册为 `__dshLifecycle_onCreate` 等；
   `layout` 的视图树经 `JSON.stringify` 传给 KT 端原生构建。
2. **编译后阶段**（`@postcompile build`）：把 `out.js` 拷进 `android-app/app/src/main/assets/app.js`，
   用精简工具链（aapt2/d8/apksigner/zipalign，无 Gradle）构建签名 APK 到 `outDir`。
3. `adb install -r` 后启动：壳活动的 WebView 载入 `app.js.html`，JS 注册生命周期 →
   KT 端按事件回调 JS（JS-KT 双向通信）。

## 架构要点

- **单活动**：`MainActivity`（AppCompatActivity）持有 WebView 与 `DshBridge`（注入为全局 `__dshAndroid`）。
- **视图树协议**：JS 端 `@view` 结构体（Box/Button/Text/TextField/Switch/Checkbox/Slider/Image/Progress）
  序列化为 `{tag, children, modifier, ...}` JSON；KT 端递归构建原生视图。函数型字段（`onClick`/`onChange` 等）
  注册为 `globalThis.__dshFn_<key>`、字段值换成 key，KT 端按 key 回调 JS 闭包。
- **重组合通道**：视图字段变异 → `__dc` 深拷贝 → `androidRecompose(viewName, ordinal, v)` → KT 端增量重建
  （新旧子树深比较，完全相等的子树原样保留）。
- **生命周期秩序**：KT 端在页面加载前触发的事件记入 `firedEvents`，JS 注册时补发，
  避免页面未就绪时注册丢失。
- **平台能力**：意图（openUrl/shareText/dial/sms/openSettings/launchApp）、剪贴板、持久化、
  屏幕常亮、振动、屏幕信息、文件选择等经 `unchecked` 调用 `__dshAndroid` 落到 KT 端。

## 编译器参数（-A）

| 键 | 说明 |
| --- | --- |
| `appDir` | 安卓壳工程目录（含 `app/`） |
| `jsPath` | 编译器 JS 产物路径 |
| `outDir` | APK 输出目录（默认 `appDir/build/apk`） |
| `sdkDir` | 精简工具链解压目录（不填则回退壳工程的 Gradle 构建） |

## 相关仓库

- 编译器主仓：`KotlinProject/sublimation`（词法/语法/语义/JS 代码生成/注解处理器框架）。