# sync-deps.ps1 —— SfA 运行环境依赖同步（真源 = 主仓 Sublimation）
#
# 处理器脚本与标准库由编译器按 CWD 相对路径装载（BuiltinProcessors.DEFAULT_DIR =
# File("annotation processer")、脚本 stdlibDir = File("core")），因此「从 SfA 仓根
# 运行 compile」要求仓根同时可见这两者。本脚本从主仓把它们同步到本地：
#
#   <主仓>/core                  -> ./core/      处理器脚本的标准库（CWD 可见；本地副本，不入库）
#                                 -> ./app/core/ 编译输入目录的 core 副本（入库；随主仓更新）
#   <主仓>/annotation processer  -> ./annotation processer/        编译器默认处理器目录（入库）
#                                 -> ./sdk-lite/annotation processer/  CWD=sdk-lite 时的本地快照（不入库）
#
# 用法：
#   pwsh scripts/sync-deps.ps1                                   # 自动探测主仓
#   pwsh scripts/sync-deps.ps1 -MainRepo D:\path\to\Sublimation   # 显式指定主仓
#   $env:SUBLIMATION_REPO = "D:\path\to\Sublimation"; pwsh scripts/sync-deps.ps1
#
# 选项：-SkipCore / -SkipProcs / -SkipSdkLite 分别跳过 core、处理器、sdk-lite 快照。
# 约定：.subs 处理器统一写 LF（见 android doc/运行环境.md）；core 按主仓原样复制。

param(
    [string] $MainRepo = "",
    [switch] $SkipCore,
    [switch] $SkipProcs,
    [switch] $SkipSdkLite
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

# ---------- 定位主仓（真源） ----------
function Find-MainRepo {
    param([string] $Hint)
    $candidates = @()
    if ($Hint) { $candidates += $Hint }
    if ($env:SUBLIMATION_REPO) { $candidates += $env:SUBLIMATION_REPO }
    # 常见布局：主仓与 SfA 同机分置（KotlinProject/Sublimation 与 SublimationProject/...）
    $candidates += @(
        "F:\KotlinProject\Sublimation",
        "F:\KotlinProject\sublimation",
        (Join-Path (Split-Path -Parent (Split-Path -Parent $repoRoot)) "KotlinProject\Sublimation")
    )
    foreach ($c in $candidates) {
        if ($c -and
            (Test-Path (Join-Path $c "annotation processer\android.subs")) -and
            (Test-Path (Join-Path $c "core\logic\logic.subl"))) {
            return $c
        }
    }
    return $null
}

$main = Find-MainRepo -Hint $MainRepo
if (-not $main) {
    Write-Error "找不到主仓 Sublimation（需同时含 annotation processer\android.subs 与 core\logic\logic.subl）。用法：pwsh scripts\sync-deps.ps1 -MainRepo <主仓路径>；或设环境变量 SUBLIMATION_REPO=<主仓路径>"
    exit 1
}
Write-Host "[sync-deps] 主仓（真源）：$main"

# ---------- 目录镜像（先清后拷，保证删除也传播） ----------
function Sync-Dir {
    param([string] $Src, [string] $Dst, [string] $Label)
    if (-not (Test-Path $Src)) { Write-Warning "[sync-deps] 源不存在，跳过 $Label : $Src"; return }
    if (Test-Path $Dst) { Remove-Item $Dst -Recurse -Force }
    New-Item -ItemType Directory -Path $Dst -Force | Out-Null
    Copy-Item -Path (Join-Path $Src "*") -Destination $Dst -Recurse -Force
    $n = (Get-ChildItem $Dst -Recurse -File | Measure-Object).Count
    Write-Host "[sync-deps] $Label : $n 个文件 -> $Dst"
}

# ---------- .subs 写 LF（t11 约定；UTF-8 无 BOM） ----------
function Sync-Procs {
    param([string] $Src, [string] $Dst, [string] $Label)
    if (-not (Test-Path $Src)) { Write-Warning "[sync-deps] 源不存在，跳过 $Label : $Src"; return }
    New-Item -ItemType Directory -Path $Dst -Force | Out-Null
    $enc = New-Object System.Text.UTF8Encoding $false
    Get-ChildItem $Src -Filter "*.subs" | ForEach-Object {
        # CRLF -> LF（-replace 走正则；两个实参都按字符串解析，避免 String.Replace 重载歧义）
        $content = [System.IO.File]::ReadAllText($_.FullName) -replace "\r\n", "\n"
        [System.IO.File]::WriteAllText((Join-Path $Dst $_.Name), $content, $enc)
    }
    $names = (Get-ChildItem $Dst -Filter "*.subs" | Select-Object -ExpandProperty Name) -join ", "
    Write-Host "[sync-deps] $Label : $names -> $Dst"
}

# ---------- 执行 ----------
if (-not $SkipCore) {
    Sync-Dir -Src (Join-Path $main "core") -Dst (Join-Path $repoRoot "core") -Label "core（仓根，CWD 可见）"
    Sync-Dir -Src (Join-Path $main "core") -Dst (Join-Path $repoRoot "app\core") -Label "core（app 编译输入副本）"
} else {
    Write-Host "[sync-deps] 已跳过 core（-SkipCore）"
}

if (-not $SkipProcs) {
    Sync-Procs -Src (Join-Path $main "annotation processer") -Dst (Join-Path $repoRoot "annotation processer") -Label "处理器（仓根，编译器默认目录）"
    if (-not $SkipSdkLite) {
        Sync-Procs -Src (Join-Path $main "annotation processer") -Dst (Join-Path $repoRoot "sdk-lite\annotation processer") -Label "处理器（sdk-lite 本地快照）"
    }
} else {
    Write-Host "[sync-deps] 已跳过处理器（-SkipProcs）"
}

Write-Host "[sync-deps] 完成。运行约定详见 android doc/运行环境.md。"
