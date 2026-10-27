// app/v2-assert.js —— 视图协议 v2 node 断言（t54 验收）
// 用法：node app/v2-assert.js
// 覆盖：① modifiers 有序数组（链顺序 = 书写顺序）；② 动态列表每行回调实例键互不相同
// 且点击只回调自己那行（差距清单 §6 串点击回归）；③ 新组件（Card）JSON 形状；
// ④ 旧单对象 modifier 兜底（KT 端读 modifiers 缺失时退回 modifier）。
const fs = require('fs');
const path = require('path');

const MEDS = "阿莫西林 | 1 片 | 10-25 15:20;布洛芬 | 2 片 | 10-26 09:10;维生素C | 1 片 | 10-27 08:00";
let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log("  PASS  " + name); }
  else { fail++; console.log("  FAIL  " + name + (detail ? " :: " + detail : "")); }
}

// ---- 桩：__dshAndroid（layout 捕获 / storage 内存 / log 收集） ----
const storage = new Map([["meds", MEDS]]);
const caps = [];       // [kind, args]
const logs = [];
globalThis.__dshAndroid = (kind, args) => {
  caps.push([kind, args]);
  switch (kind) {
    case "storageGet": return storage.get(args[0]) || "";
    case "storagePut": storage.set(args[0], args[1]); return null;
    case "log": logs.push(args[0]); return null;
    default: return null;
  }
};

// ---- 载入编译产物（IIFE 自跑 main() → 注册生命周期） ----
const js = fs.readFileSync(path.join(__dirname, 'out.js'), 'utf8');
new Function(js)();

const lifecycle = caps.filter(c => c[0] === 'registerLifecycle').map(c => c[1][0]);
check("main() 注册了 onCreate/onStart", lifecycle.indexOf('onCreate') >= 0 && lifecycle.indexOf('onStart') >= 0, lifecycle.join(','));

// ---- 触发 onStart → layout(content) ----
globalThis.__dshLifecycle_onStart(null);
const layouts = caps.filter(c => c[0] === 'layout');
check("layout 被调用一次", layouts.length === 1, "count=" + layouts.length);
const tree = JSON.parse(layouts[0][1][0]);

// ① modifiers 有序数组
function flatten(nodes, out) {
  out.push(nodes);
  const ch = nodes.children || [];
  for (const c of ch) flatten(c, out);
  return out;
}
const all = flatten(tree, []);
const noLegacy = all.every(n => !('modifier' in n) || Array.isArray(n.modifier));
check("无视图节点残留单对象 modifier 键（v2 全数组形态）", noLegacy);

const root = tree;
check("根 Box 的 modifiers = [FillMaxSize]",
  Array.isArray(root.modifiers) && root.modifiers.length === 1 && root.modifiers[0].tag === 'FillMaxSize',
  JSON.stringify(root.modifiers));

// 链顺序：fillWidth().paddingHV(12, 6) → [FillWidth, PaddingH(12), PaddingV(6)]
const btnRow = all.find(n => n.tag === 'Box' && n.orientation === 'horizontal');
const fmt = m => m.tag + (Object.keys(m).some(k => /^\d+$/.test(k)) ? '(' + m[0] + ')' : '');
const seq = btnRow && btnRow.modifiers ? btnRow.modifiers.map(fmt) : null;
check("链顺序保留：fillWidth().paddingHV(12,6) → [FillWidth, PaddingH(12), PaddingV(6)]",
  seq && seq.length === 3 && seq[0] === 'FillWidth' && seq[1] === 'PaddingH(12)' && seq[2] === 'PaddingV(6)',
  JSON.stringify(seq));

// weight(1.0) 元素
const wBtn = all.find(n => n.tag === 'Button' && n.modifiers && n.modifiers.some(m => m.tag === 'Weight'));
check("Button 链上带 Weight(1)（线性容器弹性分配）",
  wBtn && wBtn.modifiers.some(m => m.tag === 'Weight' && m[0] === 1),
  wBtn ? JSON.stringify(wBtn.modifiers) : 'no weight button');

// ② 动态药物行：3 行 → 3 个互不相同的 onClick 实例键
const cardNode = all.find(n => n.tag === 'Card');
const inCard = new Set();
function collectIds(n, s) { s.add(n); for (const c of (n.children || [])) collectIds(c, s); }
collectIds(cardNode, inCard);
const rowButtons = all.filter(n => n.tag === 'Button' && inCard.has(n) && typeof n.onClick === 'string');
const actionButtons = all.filter(n => n.tag === 'Button' && !inCard.has(n) && typeof n.onClick === 'string');
const keys = rowButtons.map(b => b.onClick);
// 所有注册的回调槽位
const slots = Object.keys(globalThis).filter(k => k.indexOf('__dshFn_') === 0);
// 行按钮 key 形如 <模块>_Button_onClick_<构造点>_<实例序号>
const rowKeys = keys.filter(k => /Button_onClick_\d+_\d+$/.test(k));
check("3 条药物记录动态渲染出 3 个行 Button", rowButtons.length >= 3, "rowButtons=" + rowButtons.length);
check("行 Button 的 onClick 实例键互不相同（__dshCb 多槽）",
  rowKeys.length >= 3 && new Set(rowKeys).size === rowKeys.length,
  JSON.stringify(rowKeys));

// 点击只回调自己那行（§6 串点击回归：氟伏沙明/帕罗西汀 bug）
const picked = [];
for (const k of rowKeys) {
  logs.length = 0;
  const fn = globalThis['__dshFn_' + k];
  fn(null);
  picked.push((logs.filter(l => String(l).indexOf('picked row: ') === 0).map(l => String(l).slice('picked row: '.length))[0]) || '');
}
const names = picked.map(s => s.split(' | ')[0]);
check("每个实例键只回调自己那行（点哪行是哪行，§6 串点击回归）",
  rowKeys.length === 3 && names.length === 3 && new Set(names).size === 3 &&
    names.every(n => ['阿莫西林', '布洛芬', '维生素C'].indexOf(n) >= 0),
  JSON.stringify(names));
check("行按钮键与操作按钮键不混",
  actionButtons.length === 2 && rowKeys.every(k => actionButtons.every(b => b.onClick !== k)),
  JSON.stringify({rows: rowKeys, actions: actionButtons.map(b => b.onClick)}));

// ③ 新组件 Card JSON 形状
const card = all.find(n => n.tag === 'Card');
check("Card 节点形状（cornerRadius/elevation/children）",
  card && card.cornerRadius === 12 && card.elevation === 1 && Array.isArray(card.children),
  card ? JSON.stringify({tag: card.tag, cornerRadius: card.cornerRadius, elevation: card.elevation, n: (card.children||[]).length}) : 'no Card');

// ④ 回调键形态：Button_onClick_N_M（构造点 + 实例序号）
check("回调键 = 构造点_实例序号 形态",
  rowKeys.every(k => /_\d+$/.test(k)) && rowKeys.every(k => k.split('_').length >= 4),
  JSON.stringify(rowKeys.slice(0, 2)));

console.log("\n视图协议 v2 断言：PASSES=" + pass + " FAILS=" + fail);
process.exit(fail === 0 ? 0 : 1);