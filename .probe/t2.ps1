
$d = 'F:\SublimationProject\sublimation for android\.probe\p4'
cd 'F:\SublimationProject\sublimation for android\.probe\'
$jars = 'F:\SublimationProject\sublimation for android\.probe\cp;F:\SublimationProject\sublimation for android\.probe\cp\kotlin-stdlib-2.1.20.jar;F:\SublimationProject\sublimation for android\.probe\cp\annotations-13.0.jar'
function W($f,$c){ [System.IO.File]::WriteAllText("$d\$f", $c, (New-Object System.Text.UTF8Encoding($false))) }
function Run($label){ $o = java -cp "$jars" sugared.functor.MainKt compile p4 -o p4/out.js 2>&1; "$label EXIT=$LASTEXITCODE : " + (($o | Select-String -Pattern '\[错误\]' | Select-Object -First 3 | ForEach-Object { $_.Line }) -join ' || ') }
$nl = [char]13 + [char]10
$decl = (Get-Content 'F:\SublimationProject\sublimation for android\app\Modifier.subl' -Raw)
$decl = $decl.Substring(0, $decl.IndexOf('fun Plain()'))
W 'Modifier.subl' $decl
# W1: Text 无字段、Box 带 Text 子视图
W 'Text.subl' '@view struct Text()'
W 'Box.subl' '@view struct Box(modifier: Modifier = Modifier(), contentAlignment: Alignment = Center(), body: () => Null = fun(): Null { null })'
W 'main.subl' ('fun root(): Box = Box() {' + $nl + '    Text()' + $nl + '}' + $nl + 'fun main(): Null { unchecked layout(root) }')
Run 'W1-Text 无字段'
# W2: Text(text) 无 modifier
W 'Text.subl' '@view struct Text(text: Str = "")'
Run 'W2-Text(text)'
# W3: Box 无 Alignment 但带子视图
W 'Box.subl' '@view struct Box(modifier: Modifier = Modifier(), body: () => Null = fun(): Null { null })'
Run 'W3-Box无Alignment'
# W4: Box 无 modifier 字段
W 'Box.subl' '@view struct Box(contentAlignment: Alignment = Center(), body: () => Null = fun(): Null { null })'
Run 'W4-Box无modifier'
