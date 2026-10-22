#!/usr/bin/env bash
# AndroidSDK for CandyIDE —— 无 Gradle 构建脚本（bash 版：Termux/Linux/macOS）
# 用法: build-apk.sh -p <含 src/main 的工程目录> [-o apk路径] [-k 包名] [-m minSdk] [-t targetSdk]
set -euo pipefail

PROJECT=""
OUT=""
PACKAGE="functor.sublimation.android"
MINSDK=24
TARGETSDK=35

while [ $# -gt 0 ]; do
  case "$1" in
    -p) PROJECT="$2"; shift 2;;
    -o) OUT="$2"; shift 2;;
    -k) PACKAGE="$2"; shift 2;;
    -m) MINSDK="$2"; shift 2;;
    -t) TARGETSDK="$2"; shift 2;;
    *) echo "未知参数: $1" >&2; exit 2;;
  esac
done

if [ -z "$PROJECT" ]; then echo "需要 -p 工程目录" >&2; exit 2; fi

SDK="$(cd "$(dirname "$0")/.." && pwd)"
BIN="$SDK/bin"; LIB="$SDK/lib"; KEY="$SDK/keystore/debug.keystore"
# 原生工具有架构差异：bin/ 存在用 bin/，否则用 PATH（Termux: pkg install aapt2 zipalign）
AAPT2="$BIN/aapt2"; [ -x "$AAPT2" ] || AAPT2="aapt2"
ZIPALIGN="$BIN/zipalign"; [ -x "$ZIPALIGN" ] || ZIPALIGN="zipalign"
CPSEP=":"
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*|*Windows*) CPSEP=";";; esac

# LiteASDK 内置 termux 共享库（aapt2 依赖 protobuf/abseil/fmt 等，全部随包携带）
if [ -d "$SDK/lib/native" ]; then
  export LD_LIBRARY_PATH="$SDK/lib/native${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi
if [ -z "$OUT" ]; then OUT="$SDK/out/app-debug.apk"; fi
WORK="$SDK/work"
rm -rf "$WORK"
mkdir -p "$WORK/aar" "$WORK/classes" "$WORK/res" "$WORK/compiled" "$WORK/dex"

echo "[1/8] 解压依赖库 (sdk-lite/libs)"
CLASSJARS=()
for f in "$SDK"/libs/*; do
  case "$f" in
    *.jar) CLASSJARS+=("$f"); continue;;
  esac
  name=$(basename "$f" .aar)
  tmp="$WORK/aar/$name"
  mkdir -p "$tmp"
  unzip -oq "$f" -d "$tmp"
  if [ -f "$tmp/classes.jar" ]; then
    cp "$tmp/classes.jar" "$WORK/classes/$name.jar"
    CLASSJARS+=("$WORK/classes/$name.jar")
  fi
  if [ -d "$tmp/res" ]; then cp -r "$tmp/res" "$WORK/res/$name"; fi
done

echo "[2/8] 编译资源 (aapt2 compile)"
if [ -d "$PROJECT/src/main/res" ]; then
  "$AAPT2" compile --dir "$PROJECT/src/main/res" -o "$WORK/compiled/app.zip"
fi
for d in "$WORK"/res/*/; do
  [ -d "$d" ] || continue
  name=$(basename "$d")
  "$AAPT2" compile --dir "$d" -o "$WORK/compiled/$name.zip"
done

echo "[3/8] 链接清单与资源 (aapt2 link)"
MAN="$WORK/AndroidManifest.xml"
if grep -q 'package=' "$PROJECT/src/main/AndroidManifest.xml"; then
  cp "$PROJECT/src/main/AndroidManifest.xml" "$MAN"
else
  sed "s|<manifest\b|<manifest package=\"$PACKAGE\"|" "$PROJECT/src/main/AndroidManifest.xml" > "$MAN"
fi
mkdir -p "$WORK/rgen"
LINKARGS=(link --auto-add-overlay --manifest "$MAN" -I "$LIB/android.jar"
  --min-sdk-version "$MINSDK" --target-sdk-version "$TARGETSDK"
  --version-code 1 --version-name 1.0 --java "$WORK/rgen" -o "$WORK/base.apk")
for z in "$WORK"/compiled/*.zip; do LINKARGS+=(-R "$z"); done
"$AAPT2" "${LINKARGS[@]}"

echo "[3.5/8] 生成库 R 类 (Kotlin)"
RJAVA=$(find "$WORK/rgen" -name R.java | head -1)
if [ -z "$RJAVA" ]; then echo "aapt2 未生成 R.java" >&2; exit 1; fi
mkdir -p "$WORK/rsrc"
python3 "$SDK/build/gen-r.py" "$RJAVA" "$WORK/rsrc"

echo "[4/8] 编译 Kotlin (kotlin-compiler.jar)"
mkdir -p "$WORK/appclasses"
CP="$LIB/kotlin-stdlib.jar$CPSEP$LIB/android.jar"
for j in "${CLASSJARS[@]}"; do CP="$CP$CPSEP$j"; done
COMPILERCP="$LIB/kotlin-compiler.jar$CPSEP$LIB/kotlin-stdlib.jar$CPSEP$LIB/trove4j.jar"
java -cp "$COMPILERCP$CPSEP$CP" org.jetbrains.kotlin.cli.jvm.K2JVMCompiler -no-stdlib -cp "$CP" \
  -d "$WORK/appclasses" $(find "$PROJECT/src/main/java" -name '*.kt') $(find "$WORK/rsrc" -name 'R.kt')

echo "[5/8] 打包应用类 + d8 生成 dex"
(cd "$WORK/appclasses" && zip -rqX "$WORK/appclasses.jar" .)
java -cp "$LIB/d8.jar" com.android.tools.r8.D8 --lib "$LIB/android.jar" --min-api "$MINSDK" \
  --output "$WORK/dex" "$WORK/appclasses.jar" "${CLASSJARS[@]}"

echo "[6/8] 注入 dex 与 assets"
cp "$WORK/base.apk" "$WORK/app-unaligned.apk"
(cd "$WORK" && zip -q "$WORK/app-unaligned.apk" dex/*.dex)
if [ -d "$PROJECT/src/main/assets" ]; then
  (cd "$PROJECT/src/main" && zip -rq "$WORK/app-unaligned.apk" assets)
fi

echo "[7/8] zipalign 对齐"
"$ZIPALIGN" -p -f 4 "$WORK/app-unaligned.apk" "$WORK/app-aligned.apk"

echo "[8/8] apksigner 签名"
mkdir -p "$(dirname "$OUT")"
java -jar "$LIB/apksigner.jar" sign --ks "$KEY" --ks-pass pass:android --ks-key-alias candydebug \
  --key-pass pass:android --min-sdk-version "$MINSDK" --out "$OUT" "$WORK/app-aligned.apk"
SIZE=$(du -h "$OUT" | cut -f1)
echo "完成: $OUT ($SIZE)"
