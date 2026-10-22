# AndroidSDK for CandyIDE —— 无 Gradle 构建脚本（PowerShell 版）
# 用法: ./build/build-apk.ps1 -Project <含 src/main 的工程目录> [-Out apk路径] [-Package 包名] [-MinSdk 24] [-TargetSdk 35]
param(
  [Parameter(Mandatory = $true)][string]$Project,
  [string]$Out = "",
  [string]$Package = "functor.sublimation.android",
  [int]$MinSdk = 24,
  [int]$TargetSdk = 35
)
$ErrorActionPreference = "Stop"
$SDK = Split-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) -Parent
$BIN = Join-Path $SDK "bin"
$LIB = Join-Path $SDK "lib"
$KEY = Join-Path $SDK "keystore" | Join-Path -ChildPath "debug.keystore"
$AAPT2 = Join-Path $BIN "aapt2.exe"
$ZIPALIGN = Join-Path $BIN "zipalign.exe"
if ([string]::IsNullOrEmpty($Out)) { $Out = (Join-Path $SDK "out" | Join-Path -ChildPath "app-debug.apk") }
$work = Join-Path $SDK "work"
Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue
$dirs = @("aar", "classes", "res", "compiled", "dex")
foreach ($d in $dirs) { New-Item -ItemType Directory -Force -Path (Join-Path $work $d) | Out-Null }
Add-Type -AssemblyName System.IO.Compression.FileSystem

Write-Host "[1/8] 解压依赖库 (sdk-lite/libs)"
$classJars = @()
$aarFiles = Get-ChildItem (Join-Path $SDK "libs") -ErrorAction SilentlyContinue
foreach ($f in $aarFiles) {
  if ($f.Extension -eq ".jar") { $classJars += $f.FullName; continue }
  $name = [IO.Path]::GetFileNameWithoutExtension($f.Name)
  $tmp = Join-Path $work (Join-Path "aar" $name)
  [IO.Compression.ZipFile]::ExtractToDirectory($f.FullName, $tmp)
  $cj = Join-Path $tmp "classes.jar"
  if (Test-Path $cj) {
    $dst = Join-Path $work (Join-Path "classes" ($name + ".jar"))
    Copy-Item $cj $dst -Force
    $classJars += $dst
  }
  $rdir = Join-Path $tmp "res"
  if (Test-Path $rdir) {
    Copy-Item $rdir (Join-Path $work (Join-Path "res" $name)) -Recurse -Force
  }
}

Write-Host "[2/8] 编译资源 (aapt2 compile)"
$appRes = Join-Path $Project (Join-Path "src" (Join-Path "main" "res"))
$resDirs = @()
if (Test-Path $appRes) { $resDirs += , @{dir = $appRes; name = "app"} }
Get-ChildItem (Join-Path $work "res") -Directory -ErrorAction SilentlyContinue | ForEach-Object {
  $resDirs += , @{dir = $_.FullName; name = $_.Name}
}
$compiledDir = Join-Path $work "compiled"
foreach ($r in $resDirs) {
  $outZip = Join-Path $compiledDir ($r.name + ".zip")
  Remove-Item $outZip -Force -ErrorAction SilentlyContinue
  & $AAPT2 compile --dir $r.dir -o $outZip
  if ($LASTEXITCODE -ne 0) { throw ("aapt2 compile 失败: " + $r.name) }
}

Write-Host "[3/8] 链接清单与资源 (aapt2 link)"
$manifest = Join-Path $Project (Join-Path "src" (Join-Path "main" "AndroidManifest.xml"))
$patched = Join-Path $work "AndroidManifest.xml"
$m = Get-Content $manifest -Raw -Encoding UTF8
if ($m -notmatch 'package\s*=') { $m = $m -replace '<manifest\b', ('<manifest package="' + $Package + '"') }
$utf8 = New-Object Text.UTF8Encoding $false
[IO.File]::WriteAllText($patched, $m, $utf8)
$baseApk = Join-Path $work "base.apk"
Remove-Item $baseApk -Force -ErrorAction SilentlyContinue
$linkArgs = @("link", "--auto-add-overlay", "--manifest", $patched, "-I", (Join-Path $LIB "android.jar"), "--min-sdk-version", $MinSdk, "--target-sdk-version", $TargetSdk, "--version-code", "1", "--version-name", "1.0", "--java", (Join-Path $work "rgen"), "-o", $baseApk)
foreach ($z in (Get-ChildItem $compiledDir -Filter "*.zip")) { $linkArgs += @("-R", $z.FullName) }
& $AAPT2 @linkArgs
if ($LASTEXITCODE -ne 0) { throw "aapt2 link 失败" }

Write-Host "[3.5/8] 生成库 R 类 (Kotlin)"
$rNeed = @{
  'androidx.activity' = @('id')
  'androidx.appcompat.resources' = @('drawable', 'styleable')
  'androidx.appcompat' = @('attr', 'bool', 'color', 'dimen', 'drawable', 'id', 'layout', 'string', 'style', 'styleable')
  'androidx.cardview' = @('attr', 'color', 'dimen', 'style', 'styleable')
  'androidx.constraintlayout.widget' = @('id', 'styleable')
  'androidx.coordinatorlayout' = @('attr', 'style', 'styleable')
  'androidx.core' = @('attr', 'color', 'dimen', 'drawable', 'id', 'integer', 'layout', 'string', 'styleable')
  'androidx.drawerlayout' = @('attr', 'dimen', 'styleable')
  'androidx.fragment' = @('animator', 'id', 'styleable')
  'androidx.lifecycle.runtime' = @('id')
  'androidx.lifecycle.viewmodel' = @('id')
  'androidx.recyclerview' = @('attr', 'dimen', 'id', 'styleable')
  'androidx.savedstate' = @('id')
  'androidx.startup' = @('string')
  'androidx.transition' = @('id')
  'androidx.viewpager2' = @('styleable')
  'com.google.android.material' = @('anim', 'animator', 'attr', 'color', 'dimen', 'drawable', 'id', 'integer', 'layout', 'plurals', 'string', 'style', 'styleable')
}
$rgenDir = Join-Path $work "rgen"
New-Item -ItemType Directory -Force -Path $rgenDir | Out-Null
$rjava = Get-ChildItem $rgenDir -Recurse -Filter "R.java" | Select-Object -First 1
if ($null -eq $rjava) { throw "aapt2 未生成 R.java（--java 缺失）" }
$typeData = @{}
$cur = ""
$inArr = $false
$arrName = ""
$arrBuf = ""
foreach ($line in (Get-Content $rjava.FullName)) {
  if ($inArr) {
    $arrBuf += $line
    if ($line.Contains('};')) {
      $clean = $arrBuf -replace '[^0-9a-fA-Fx,]',''
      $vals = ($clean -split ',') | Where-Object { $_ -ne '' }
      if (-not $typeData.ContainsKey($cur)) { $typeData[$cur] = @() }
      $typeData[$cur] += [pscustomobject]@{ name = $arrName; value = ($vals -join ','); arr = $true }
      $inArr = $false
    }
    continue
  }
  $tm = [regex]::Match($line, 'public static final class (\w+)')
  if ($tm.Success) { $cur = $tm.Groups[1].Value; continue }
  $sm = [regex]::Match($line, 'public static final int (\w+)=(0x[0-9a-fA-F]+|\d+);')
  if ($sm.Success -and $cur) {
    if (-not $typeData.ContainsKey($cur)) { $typeData[$cur] = @() }
    $typeData[$cur] += [pscustomobject]@{ name = $sm.Groups[1].Value; value = $sm.Groups[2].Value; arr = $false }
    continue
  }
  $am = [regex]::Match($line, 'public static final int\[\] (\w+)=\{')
  if ($am.Success -and $cur) {
    $inArr = $true
    $arrName = $am.Groups[1].Value
    $arrBuf = ""
  }
}
$rsrcDir = Join-Path $work "rsrc"
New-Item -ItemType Directory -Force -Path $rsrcDir | Out-Null
$rFiles = @()
foreach ($pkg in $rNeed.Keys) {
  $parts = $pkg.Split(".")
  $pkgDir = $rsrcDir
  foreach ($p in $parts) { $pkgDir = Join-Path $pkgDir $p }
  New-Item -ItemType Directory -Force -Path $pkgDir | Out-Null
  $sb = New-Object Text.StringBuilder
  [void]$sb.AppendLine("package " + $pkg)
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("class R {")
  foreach ($tp in $rNeed[$pkg]) {
    if (-not $typeData.ContainsKey($tp)) { continue }
    [void]$sb.AppendLine("  class " + $tp + " {")
    [void]$sb.AppendLine("    companion object {")
    foreach ($e in $typeData[$tp]) {
      if ($e.arr) {
        [void]$sb.AppendLine("      @JvmField val " + $e.name + " = intArrayOf(" + $e.value + ")")
      } else {
        [void]$sb.AppendLine("      const val " + $e.name + " = " + $e.value)
      }
    }
    [void]$sb.AppendLine("    }")
    [void]$sb.AppendLine("  }")
  }
  [void]$sb.AppendLine("}")
  $rf = Join-Path $pkgDir "R.kt"
  [IO.File]::WriteAllText($rf, $sb.ToString(), (New-Object Text.UTF8Encoding $false))
  $rFiles += $rf
}
Write-Host ("R-classes=" + $rFiles.Count)

Write-Host "[4/8] 编译 Kotlin (kotlin-compiler.jar)"
$src = Join-Path $Project (Join-Path "src" (Join-Path "main" "java"))
$kts = Get-ChildItem $src -Recurse -Filter "*.kt" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
$classOut = Join-Path $work "appclasses"
New-Item -ItemType Directory -Force -Path $classOut | Out-Null
$cp = (@((Join-Path $LIB "kotlin-stdlib.jar"), (Join-Path $LIB "android.jar")) + $classJars) -join ";"
$compilerCp = (Join-Path $LIB "kotlin-compiler.jar") + ";" + (Join-Path $LIB "kotlin-stdlib.jar") + ";" + (Join-Path $LIB "trove4j.jar")
& java -cp ($compilerCp + ";" + $cp) org.jetbrains.kotlin.cli.jvm.K2JVMCompiler -no-stdlib -cp $cp -d $classOut @kts @rFiles
if ($LASTEXITCODE -ne 0) { throw "Kotlin 编译失败" }

Write-Host "[5/8] 打包应用类 + d8 生成 dex"
$appZip = Join-Path $work "appclasses.jar"
[IO.Compression.ZipFile]::CreateFromDirectory($classOut, $appZip)
$dexDirs = @((Join-Path $work "dex"))
& java -cp (Join-Path $LIB "d8.jar") com.android.tools.r8.D8 --lib (Join-Path $LIB "android.jar") --min-api $MinSdk --output $dexDirs[0] $appZip @classJars
if ($LASTEXITCODE -ne 0) { throw "d8 失败" }

Write-Host "[6/8] 注入 dex 与 assets"
$unaligned = Join-Path $work "app-unaligned.apk"
Copy-Item $baseApk $unaligned -Force
$entries = @()
Get-ChildItem (Join-Path $work "dex") -Filter "*.dex" | ForEach-Object { $entries += , @{file = $_.FullName; name = $_.Name} }
$assetsDir = Join-Path $Project (Join-Path "src" (Join-Path "main" "assets"))
if (Test-Path $assetsDir) {
  Get-ChildItem $assetsDir -Recurse -File | ForEach-Object {
    $rel = "assets/" + ($_.FullName.Substring($assetsDir.Length + 1)) -replace '\\', '/'
    $entries += , @{file = $_.FullName; name = $rel}
  }
}
$z = [IO.Compression.ZipFile]::Open($unaligned, [IO.Compression.ZipArchiveMode]::Update)
try {
  foreach ($e in $entries) {
    $entry = $z.CreateEntry($e.name, [IO.Compression.CompressionLevel]::Optimal)
    $stream = $entry.Open()
    $bytes = [IO.File]::ReadAllBytes($e.file)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Dispose()
  }
} finally { $z.Dispose() }

Write-Host "[7/8] zipalign 对齐"
$aligned = Join-Path $work "app-aligned.apk"
Remove-Item $aligned -Force -ErrorAction SilentlyContinue
& $ZIPALIGN -p -f 4 $unaligned $aligned
if ($LASTEXITCODE -ne 0) { throw "zipalign 失败" }

Write-Host "[8/8] apksigner 签名"
New-Item -ItemType Directory -Force -Path (Split-Path $Out -Parent) | Out-Null
& java -jar (Join-Path $LIB "apksigner.jar") sign --ks $KEY --ks-pass pass:android --ks-key-alias candydebug --key-pass pass:android --min-sdk-version $MinSdk --out $Out $aligned
if ($LASTEXITCODE -ne 0) { throw "apksigner 失败" }
$size = [math]::Round((Get-Item $Out).Length / 1MB, 2)
Write-Host ("完成: " + $Out + " (" + $size + " MB)")
