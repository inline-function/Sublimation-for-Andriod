#!/usr/bin/env pwsh
# LiteASDK（Android/Termux 版）重新打包脚本。用法：pwsh pack-liteasdk.ps1
# 依赖 deb 全部取自 Termux 官方仓库（aapt2/共享库）与 termux-zipalign（zipalign）
param([string]$Out = "$(Split-Path $PSScriptRoot -Parent)/LiteASDK")

$Main = "https://packages.termux.dev/apt/termux-main"
$Rendiix = "https://rendiix.github.io"
$Debs = @(
  # name, url, 提取目标（相对 $Out）
  @{ d = "aapt2";      u = "$Main/pool/main/a/aapt2/aapt2_16.0.0.4-4_aarch64.deb";  t = "bin/aapt2.bin" },
  @{ d = "zipalign";   u = "$Rendiix/dists/android-tools/termux/binary-aarch64/zipalign_34.0.0_aarch64.deb"; t = "bin/zipalign.bin" },
  @{ d = "libc++";     u = "$Main/pool/main/libc/libc++/libc++_30_aarch64.deb";            t = "lib/native" },
  @{ d = "abseil";     u = "$Main/pool/main/a/abseil-cpp/abseil-cpp_20260817.0_aarch64.deb";  t = "lib/native" },
  @{ d = "libprotobuf"; u = "$Main/pool/main/libp/libprotobuf/libprotobuf_2:36.2-1_aarch64.deb"; t = "lib/native" },
  @{ d = "fmt";        u = "$Main/pool/main/f/fmt/fmt_1:12.2.0_aarch64.deb";                t = "lib/native" },
  @{ d = "libexpat";  u = "$Main/pool/main/libe/libexpat/libexpat_2.9.0_aarch64.deb";       t = "lib/native" },
  @{ d = "libpng";    u = "$Main/pool/main/libp/libpng/libpng_1.6.59_aarch64.deb";          t = "lib/native" },
  @{ d = "zlib";      u = "$Main/pool/main/z/zlib/zlib_1.3.2_aarch64.deb";                  t = "lib/native" }
)

# 1) 下载并抽取（deb=ar 包，data.tar.* 里取 bin 或 .so）
$tmp = Join-Path $env:TEMP "pack-liteasdk"
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
$py = @'
import sys, os, io, tarfile
def ar_entries(path):
    data = open(path, 'rb').read(); pos = 8
    while pos < len(data):
        hdr = data[pos:pos+60]
        if len(hdr) < 60: break
        name = hdr[0:16].decode('ascii').rstrip()
        size = int(hdr[48:58].decode('ascii').strip())
        yield name, data[pos+60:pos+60+size]
        pos += 60 + size + (size % 2)
deb, outdir, want = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(outdir, exist_ok=True)
for name, body in ar_entries(deb):
    if name.startswith('data.tar'):
        tf = tarfile.open(fileobj=io.BytesIO(body), mode='r:*')
        for m in tf.getmembers():
            if not m.isfile(): continue
            base = os.path.basename(m.name)
            if want == 'bin' and 'bin/' in m.name and base != 'LICENSE' and '.so' not in base:
                open(os.path.join(outdir, base), 'wb').write(tf.extractfile(m).read())
            if want == 'so' and base.endswith('.so') or (want == 'so' and '.so.' in base):
                open(os.path.join(outdir, base), 'wb').write(tf.extractfile(m).read())
'@
$pyPath = Join-Path $tmp "unpack.py"
Set-Content -Path $pyPath -Value $py -Encoding utf8
foreach ($d in $Debs) {
    $deb = Join-Path $tmp ($d.d + '.deb')
    if (-not (Test-Path $deb)) { Invoke-WebRequest -Uri $d.u -OutFile $deb -TimeoutSec 600 }
    $target = Join-Path $Out $d.t
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    $want = if ($d.t -like 'bin/*') { 'bin' } else { 'so' }
    python $pyPath $deb $target $want
}

Write-Host "bin/ 与 lib/native/ 就绪。其余目录（jar、libs、keystore、build）与 sdk-lite 同源，手动复制即可。"