
$d = 'F:\SublimationProject\sublimation for android\.probe\p4'
cd 'F:\SublimationProject\sublimation for android\.probe\'
$jars = 'F:\SublimationProject\sublimation for android\.probe\cp;F:\SublimationProject\sublimation for android\.probe\cp\kotlin-stdlib-2.1.20.jar;F:\SublimationProject\sublimation for android\.probe\cp\annotations-13.0.jar'
function W($f,$c){ [System.IO.File]::WriteAllText("$d\$f", $c, (New-Object System.Text.UTF8Encoding($false))) }
function Run($label){ $o = java -cp "$jars" sugared.functor.MainKt compile p4 -o p4/out.js 2>&1; "$label EXIT=$LASTEXITCODE : " + (($o | Select-String -Pattern '\[错误\]' | Select-Object -First 3 | ForEach-Object { $_.Line }) -join ' || ') }
$decl = (Get-Content 'F:\SublimationProject\sublimation for android\app\Modifier.subl' -Raw)
$decl = $decl.Substring(0, $decl.IndexOf('fun Plain()'))
$decl2 = $decl -replace '@view struct Modifier\(parts: List\[MKind\] = Nil\(\)\)', '@view struct Modifier()'
W 'Modifier.subl' $decl2
W 'Box.subl' '@view struct Box(modifier: Modifier = Modifier(), contentAlignment: Alignment = Center(), body: () => Null = fun(): Null { null })'
W 'Text.subl' '@view struct Text(text: Str = "", modifier: Modifier = Modifier())'
$nl = [char]13 + [char]10
W 'main.subl' ('fun root(): Box = Box() {' + $nl + '    Text(text = "hi")' + $nl + '}' + $nl + 'fun main(): Null { unchecked layout(root) }')
Run 'Z1-空 Modifier 结构体'
# Z2: 恢复 parts 结构体但嵌套构造点用具名字段
W 'Modifier.subl' $decl
Run 'Z2-还原后（应仍错）'
