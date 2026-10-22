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
└── build/  build-apk.ps1 / build-apk.sh / gen-r.py
```

## 使用

```bash
# Windows
powershell -ExecutionPolicy Bypass -File "build/build-apk.ps1" \
  -Project <含 src/main 的工程目录> -Out <apk 输出路径>

# Termux / Linux / macOS（先 pkg install aapt2 zipalign openjdk-17）
sh build/build-apk.sh -p <工程目录> -o <apk 路径>
```

工程布局：`<Project>/src/main/{AndroidManifest.xml, java/**/*.kt, res, assets}`。
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
