
cd 'F:\SublimationProject\sublimation for android\.probe\'
$jars = 'F:\SublimationProject\sublimation for android\.probe\cp;F:\SublimationProject\sublimation for android\.probe\cp\kotlin-stdlib-2.1.20.jar;F:\SublimationProject\sublimation for android\.probe\cp\annotations-13.0.jar'
$d = 'F:\SublimationProject\sublimation for android\.probe\p4'
Remove-Item -Recurse -Force $d -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $d | Out-Null
Copy-Item -Recurse -Force 'F:\SublimationProject\sublimation for android\.probe\p\core' "$d\core"
Copy-Item -Force 'F:\SublimationProject\sublimation for android\.probe\p\layout.subl','F:\SublimationProject\sublimation for android\.probe\p\log.subl','F:\SublimationProject\sublimation for android\app\Modifier.subl','F:\SublimationProject\sublimation for android\app\Alignment.subl' $d
Set-Content -Path "$d\Box.subl" -Encoding UTF8 -Value @'
@view struct Box(modifier: Modifier = Plain(), contentAlignment: Alignment = Center(), body: () => Null = fun(): Null { null })
'@
Set-Content -Path "$d\Text.subl" -Encoding UTF8 -Value @'
@view struct Text(text: Str = "", modifier: Modifier = Plain())
'@
Set-Content -Path "$d\main.subl" -Encoding UTF8 -Value @'
fun root(): Box = Box() {
    Text(text = "hi")
}

fun main(): Null {
    unchecked layout(root)
}
'@
$full = Get-Content 'F:\SublimationProject\sublimation for android\app\Modifier.subl'
$funcLines = @()
for($i=0; $i -lt $full.Count; $i++){ if($full[$i] -match '^fun '){ $funcLines += $i } }
"func count=" + $funcLines.Count
$start = $funcLines[0]
$decl = $full[0..($start-1)] -join "`r`n"
$groups = @()
for($k=0; $k -lt $funcLines.Count; $k++){
  $s = $funcLines[$k]
  $e = if($k+1 -lt $funcLines.Count){ $funcLines[$k+1]-1 } else { $full.Count-1 }
  $groups += ,(($full[$s..$e]) -join "`r`n")
}
Set-Content -Path "$d\Modifier.subl" -Encoding UTF8 -Value $decl
$o = java -cp "$jars" sugared.functor.MainKt compile p4 -o p4/out.js 2>&1
"decl-only EXIT=$LASTEXITCODE bad=" + (($o | Select-String -Pattern '默认值 MKind' | Measure-Object).Count)
for($k=0; $k -lt $groups.Count; $k++){
  Set-Content -Path "$d\Modifier.subl" -Encoding UTF8 -Value ($decl + "`r`n" + $groups[$k])
  $o = java -cp "$jars" sugared.functor.MainKt compile p4 -o p4/out.js 2>&1
  $bad = ($o | Select-String -Pattern '默认值 MKind' | Measure-Object).Count
  $first = ($groups[$k] -split "`r?`n")[0]
  if($bad -gt 0){ "OFFENDER $k : $first"; break }
}
"scan done"

