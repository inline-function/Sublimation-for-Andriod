"use strict";
(() => {
  const None = () => ({ tag: "None" });
  const Some = (a0) => ({ tag: "Some", 0: a0 });
  const __dshtoStr = (v) => {
    if (v === null || v === undefined) return String(v);
    if (Array.isArray(v)) return "[" + v.map(__dshtoStr).join(",") + "]";
    if (typeof v === "object" && Object.keys(v).length === 1 && "tag" in v) return String(v.tag);
    return String(v);
  };
  const __isa = (v, t) => {
    if (t === "Nat" || t === "Int" || t === "Rat") return typeof v === "number";
    if (t === "Str") return typeof v === "string";
    if (t === "Bool") return typeof v === "boolean";
    if (t === "Null") return v === null || (v && v.tag === "Null");
    if (t === "(fn)") return typeof v === "function";
    if (t === "List") return Array.isArray(v);
    return v !== null && typeof v === "object" && v.tag === t;
  };
  const __eq = (a, b) => {
    if (a === b) return true;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
    if (a.tag !== undefined && a.tag !== b.tag) return false;
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every(k => __eq(a[k], b[k]));
  };
  const __dshAndroid = (typeof globalThis.__dshAndroid === 'function')
    ? globalThis.__dshAndroid
    : (kind, args) => {
        if (kind === "log") console.log(...args);
        return null;
      };
  function __dshViewTree(x){
    if (Array.isArray(x)) return x.map(__dshViewTree);
    if (x && typeof x === "object") {
      var o = {}; for (var k in x) o[k] = __dshViewTree(x[k]);
      var m = o["modifier"];
      if (Array.isArray(m)) { o["modifiers"] = m; delete o["modifier"]; }
      return o;
    }
    return x;
  }
  function __dshCb(base, fn){
    __dshCb.n = (__dshCb.n || 0) + 1;
    var k = base + "_" + __dshCb.n;
    globalThis["__dshFn_" + k] = fn;
    return k;
  }
  const __dc = (v) => {
    if (v === null || typeof v !== "object") return v;
    if (Array.isArray(v)) return v.map(__dc);
    const o = {};
    for (const k in v) o[k] = __dc(v[k]);
    return o;
  };
  const AlertDialog = (visible = false, title = "", confirmText = "确定", dismissText = "取消", onConfirm = (_) => {
  return null;
}, onDismiss = (_) => {
  return null;
}, body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "AlertDialog", visible: visible, title: title, confirmText: confirmText, dismissText: dismissText, onConfirm: onConfirm, onDismiss: onDismiss, body: body, children: children, recomposion: recomposion, __ord: __ord });
  function Alignment__Center() { return { tag: "Center" }; }
  const Center = Alignment__Center;
  function Alignment__TopStart() { return { tag: "TopStart" }; }
  const TopStart = Alignment__TopStart;
  function Alignment__BottomEnd() { return { tag: "BottomEnd" }; }
  const BottomEnd = Alignment__BottomEnd;
  function Alignment__CenterStart() { return { tag: "CenterStart" }; }
  const CenterStart = Alignment__CenterStart;
  function Alignment__CenterEnd() { return { tag: "CenterEnd" }; }
  const CenterEnd = Alignment__CenterEnd;
  function Alignment__Top() { return { tag: "Top" }; }
  const Top = Alignment__Top;
  function Alignment__Bottom() { return { tag: "Bottom" }; }
  const Bottom = Alignment__Bottom;
  const BottomSheet = (visible = false, onDismiss = (_) => {
  return null;
}, body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "BottomSheet", visible: visible, onDismiss: onDismiss, body: body, children: children, recomposion: recomposion, __ord: __ord });
  const Box = (modifier = core_collection__emptyList(), contentAlignment = Center(), orientation = "vertical", backgroundColor = "", scrollable = false, spacing = 0, arrangement = "Start", wrap = false, onClick = (_) => {
  return null;
}, body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "Box", modifier: modifier, contentAlignment: contentAlignment, orientation: orientation, backgroundColor: backgroundColor, scrollable: scrollable, spacing: spacing, arrangement: arrangement, wrap: wrap, onClick: onClick, body: body, children: children, recomposion: recomposion, __ord: __ord });
  const Button = (modifier = core_collection__emptyList(), label = "", style = "filled", enabled = true, onClick = (_) => {
  return null;
}, body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "Button", modifier: modifier, label: label, style: style, enabled: enabled, onClick: onClick, body: body, children: children, recomposion: recomposion, __ord: __ord });
  const Card = (modifier = core_collection__emptyList(), cornerRadius = 12, elevation = 1, backgroundColor = "", onClick = (_) => {
  return null;
}, body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "Card", modifier: modifier, cornerRadius: cornerRadius, elevation: elevation, backgroundColor: backgroundColor, onClick: onClick, body: body, children: children, recomposion: recomposion, __ord: __ord });
  const Series = (label, color, points) => ({ tag: "Series", label: label, color: color, points: points });
  const Chart = (kind = "line", series = core_collection__emptyList(), points = core_collection__emptyList(), labels = core_collection__emptyList(), color = "", legend = true, badge = "估算", modifier = core_collection__emptyList(), body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "Chart", kind: kind, series: series, points: points, labels: labels, color: color, legend: legend, badge: badge, modifier: modifier, body: body, children: children, recomposion: recomposion, __ord: __ord });
  const Checkbox = (checked = false, text = "", onToggle = (b) => {
  return null;
}, modifier = core_collection__emptyList(), body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "Checkbox", checked: checked, text: text, onToggle: onToggle, modifier: modifier, body: body, children: children, recomposion: recomposion, __ord: __ord });
  const FloatingButton = (label = "", color = "#6750A4", cornerRadius = 28, icon = "", text = "", onClick = (_) => {
  return null;
}, modifier = core_collection__emptyList(), body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "FloatingButton", label: label, color: color, cornerRadius: cornerRadius, icon: icon, text: text, onClick: onClick, modifier: modifier, body: body, children: children, recomposion: recomposion, __ord: __ord });
  const Icon = (name = "add", size = 24, tint = "", modifier = core_collection__emptyList(), children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "Icon", name: name, size: size, tint: tint, modifier: modifier, children: children, recomposion: recomposion, __ord: __ord });
  const Image = (name = "", modifier = core_collection__emptyList(), body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "Image", name: name, modifier: modifier, body: body, children: children, recomposion: recomposion, __ord: __ord });
  function MKind__Plain() { return { tag: "Plain" }; }
  const Plain = MKind__Plain;
  function MKind__FillMaxSize() { return { tag: "FillMaxSize" }; }
  const FillMaxSize = MKind__FillMaxSize;
  function MKind__WrapContent() { return { tag: "WrapContent" }; }
  const WrapContent = MKind__WrapContent;
  function MKind__Padding(a0) { return { tag: "Padding", 0: a0 }; }
  const Padding = MKind__Padding;
  function MKind__Width(a0) { return { tag: "Width", 0: a0 }; }
  const Width = MKind__Width;
  function MKind__Height(a0) { return { tag: "Height", 0: a0 }; }
  const Height = MKind__Height;
  function MKind__FillWidth() { return { tag: "FillWidth" }; }
  const FillWidth = MKind__FillWidth;
  function MKind__FractionWidth(a0) { return { tag: "FractionWidth", 0: a0 }; }
  const FractionWidth = MKind__FractionWidth;
  function MKind__FillHeight() { return { tag: "FillHeight" }; }
  const FillHeight = MKind__FillHeight;
  function MKind__FractionHeight(a0) { return { tag: "FractionHeight", 0: a0 }; }
  const FractionHeight = MKind__FractionHeight;
  function MKind__Padding4(a0, a1, a2, a3) { return { tag: "Padding4", 0: a0, 1: a1, 2: a2, 3: a3 }; }
  const Padding4 = MKind__Padding4;
  function MKind__PaddingH(a0) { return { tag: "PaddingH", 0: a0 }; }
  const PaddingH = MKind__PaddingH;
  function MKind__PaddingV(a0) { return { tag: "PaddingV", 0: a0 }; }
  const PaddingV = MKind__PaddingV;
  function MKind__Weight(a0) { return { tag: "Weight", 0: a0 }; }
  const Weight = MKind__Weight;
  function MKind__Background(a0) { return { tag: "Background", 0: a0 }; }
  const Background = MKind__Background;
  function MKind__Clip(a0) { return { tag: "Clip", 0: a0 }; }
  const Clip = MKind__Clip;
  function MKind__Alpha(a0) { return { tag: "Alpha", 0: a0 }; }
  const Alpha = MKind__Alpha;
  function MKind__Flash() { return { tag: "Flash" }; }
  const Flash = MKind__Flash;
  function one(x) {
    return [x, ...([])];
  }
  function chain(a, b) {
    return (() => {
  const __s0 = a;
  if (((Array.isArray(__s0) && __s0.length === 0))) {  return b; }
  if (((Array.isArray(__s0) && __s0.length >= 1))) { const h = __s0[0]; const t = __s0.slice(1);  return [h, ...(chain(t, b))]; }
   return b;
})();
  }
  function width$Nat(n) {
    return one(Width(n));
  }
  function width$List(m, n) {
    return chain(m, one(Width(n)));
  }
  function height$Nat(n) {
    return one(Height(n));
  }
  function height$List(m, n) {
    return chain(m, one(Height(n)));
  }
  function fillMaxSize$v0() {
    return one(FillMaxSize());
  }
  function fillMaxSize$List(m) {
    return chain(m, one(FillMaxSize()));
  }
  function wrapContent$v0() {
    return one(WrapContent());
  }
  function wrapContent$List(m) {
    return chain(m, one(WrapContent()));
  }
  function fillWidth$v0() {
    return one(FillWidth());
  }
  function fillWidth$List(m) {
    return chain(m, one(FillWidth()));
  }
  function fillHeight$v0() {
    return one(FillHeight());
  }
  function fillHeight$List(m) {
    return chain(m, one(FillHeight()));
  }
  function fractionWidth$Rat(f) {
    return one(FractionWidth(f));
  }
  function fractionWidth$List(m, f) {
    return chain(m, one(FractionWidth(f)));
  }
  function fractionHeight$Rat(f) {
    return one(FractionHeight(f));
  }
  function fractionHeight$List(m, f) {
    return chain(m, one(FractionHeight(f)));
  }
  function weight$Rat(w) {
    return one(Weight(w));
  }
  function weight$List(m, w) {
    return chain(m, one(Weight(w)));
  }
  function padding$Nat(n) {
    return one(Padding(n));
  }
  function padding$List(m, n) {
    return chain(m, one(Padding(n)));
  }
  function padding4$Nat(l, t, r, b) {
    return one(Padding4(l, t, r, b));
  }
  function padding4$List(m, l, t, r, b) {
    return chain(m, one(Padding4(l, t, r, b)));
  }
  function paddingHV$Nat(h, v) {
    return chain(one(PaddingH(h)), one(PaddingV(v)));
  }
  function paddingHV$List(m, h, v) {
    return chain(m, chain(one(PaddingH(h)), one(PaddingV(v))));
  }
  function paddingH$Nat(h) {
    return one(PaddingH(h));
  }
  function paddingH$List(m, h) {
    return chain(m, one(PaddingH(h)));
  }
  function paddingV$Nat(v) {
    return one(PaddingV(v));
  }
  function paddingV$List(m, v) {
    return chain(m, one(PaddingV(v)));
  }
  function background$Str(c) {
    return one(Background(c));
  }
  function background$List(m, c) {
    return chain(m, one(Background(c)));
  }
  function clip$Nat(n) {
    return one(Clip(n));
  }
  function clip$List(m, n) {
    return chain(m, one(Clip(n)));
  }
  function alpha$Rat(a) {
    return one(Alpha(a));
  }
  function alpha$List(m, a) {
    return chain(m, one(Alpha(a)));
  }
  function flash$v0() {
    return one(Flash());
  }
  function flash$List(m) {
    return chain(m, one(Flash()));
  }
  const Progress = (value = 0, indeterminate = false, modifier = core_collection__emptyList(), body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "Progress", value: value, indeterminate: indeterminate, modifier: modifier, body: body, children: children, recomposion: recomposion, __ord: __ord });
  const Slider = (value = 0.0, from = 0.0, to = 1.0, enabled = true, onChange = (v) => {
  return null;
}, modifier = core_collection__emptyList(), body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "Slider", value: value, from: from, to: to, enabled: enabled, onChange: onChange, modifier: modifier, body: body, children: children, recomposion: recomposion, __ord: __ord });
  const Switch = (checked = false, enabled = true, onToggle = (b) => {
  return null;
}, modifier = core_collection__emptyList(), body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "Switch", checked: checked, enabled: enabled, onToggle: onToggle, modifier: modifier, body: body, children: children, recomposion: recomposion, __ord: __ord });
  const Text = (text = "", color = "", size = 0.0, bold = false, italic = false, maxLines = 0, flash = false, modifier = core_collection__emptyList(), children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "Text", text: text, color: color, size: size, bold: bold, italic: italic, maxLines: maxLines, flash: flash, modifier: modifier, children: children, recomposion: recomposion, __ord: __ord });
  const TextButton = (modifier = core_collection__emptyList(), label = "", enabled = true, onClick = (_) => {
  return null;
}, body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "TextButton", modifier: modifier, label: label, enabled: enabled, onClick: onClick, body: body, children: children, recomposion: recomposion, __ord: __ord });
  const TextField = (placeholder = "", text = "", keyboard = "text", onChange = (t) => {
  return null;
}, modifier = core_collection__emptyList(), body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "TextField", placeholder: placeholder, text: text, keyboard: keyboard, onChange: onChange, modifier: modifier, body: body, children: children, recomposion: recomposion, __ord: __ord });
  function primary() {
    return "primary";
  }
  function onPrimary() {
    return "onPrimary";
  }
  function primaryContainer() {
    return "primaryContainer";
  }
  function onPrimaryContainer() {
    return "onPrimaryContainer";
  }
  function secondary() {
    return "secondary";
  }
  function onSecondary() {
    return "onSecondary";
  }
  function secondaryContainer() {
    return "secondaryContainer";
  }
  function onSecondaryContainer() {
    return "onSecondaryContainer";
  }
  function surface() {
    return "surface";
  }
  function onSurface() {
    return "onSurface";
  }
  function surfaceVariant() {
    return "surfaceVariant";
  }
  function onSurfaceVariant() {
    return "onSurfaceVariant";
  }
  function outline() {
    return "outline";
  }
  function outlineVariant() {
    return "outlineVariant";
  }
  function error() {
    return "error";
  }
  function onError() {
    return "onError";
  }
  function errorContainer() {
    return "errorContainer";
  }
  function warning() {
    return "warning";
  }
  function warningContainer() {
    return "warningContainer";
  }
  function info() {
    return "info";
  }
  function infoContainer() {
    return "infoContainer";
  }
  const TimelineView = (times = core_collection__emptyList(), labels = core_collection__emptyList(), orientation = "vertical", color = "", modifier = core_collection__emptyList(), body = () => {
  return null;
}, children = "", recomposion = (_) => {}, __ord = 0) => ({ tag: "TimelineView", times: times, labels: labels, orientation: orientation, color: color, modifier: modifier, body: body, children: children, recomposion: recomposion, __ord: __ord });
  async function main() {
    (globalThis.__dshLifecycle_onCreate = ((_) => {
  __dshAndroid("log", ["med app started", 2]);
}), __dshAndroid("registerLifecycle", ["onCreate"]));
    (globalThis.__dshLifecycle_onStart = ((_) => (function(f){ return __dshAndroid("layout", [JSON.stringify(__dshViewTree(f(null)))]); })(content)), __dshAndroid("registerLifecycle", ["onStart"]));
    return null;
  }
  function content() {
    let nameField = TextField("药名", undefined, undefined, undefined, undefined, undefined, [], recomposion$TextField$1, 1);
    let amountField = TextField("剂量，如 1 片", undefined, undefined, undefined, undefined, undefined, [], recomposion$TextField$2, 2);
    // unchecked
    let meds = loadMeds();
    let curTime = "";
    let status = Text((("共 " + __dshtoStr((meds).length)) + " 条"), undefined, undefined, undefined, undefined, undefined, undefined, undefined, [], recomposion$Text$1, 1);
    let rows = rowsView(meds);
    let timeline = TimelineView(medTimes(meds), medLabels(meds), undefined, undefined, undefined, undefined, [], recomposion$TimelineView$1, 1);
    return Box(fillMaxSize$v0(), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, [Box(paddingHV$List(fillWidth$v0(), 16, 10), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, [Text("用药记录", undefined, 22, true, undefined, undefined, undefined, undefined, [], recomposion$Text$2, 2)], recomposion$Box$2, 2), Box(paddingH$List(fillWidth$v0(), 12), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, [nameField], recomposion$Box$3, 3), Box(paddingH$List(fillWidth$v0(), 12), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, [amountField], recomposion$Box$4, 4), Box(paddingHV$List(fillWidth$v0(), 12, 6), undefined, "horizontal", undefined, undefined, undefined, undefined, undefined, undefined, undefined, [Button(weight$Rat(1.0), undefined, undefined, undefined, __dshCb("Button_onClick_1", ((_) => {
  curTime = nowStr();
  meds = makeDose(meds, nameField.text, amountField.text, curTime);
  saveMeds(meds);
  (() => { const __c = __dc(status); __c.text = (("共 " + __dshtoStr((meds).length)) + " 条"); __c.recomposion(__c); })();
  rows = rowsView(meds);
  timeline = TimelineView(medTimes(meds), medLabels(meds), undefined, undefined, undefined, undefined, [], recomposion$TimelineView$1, 1);
  (() => { const __c = __dc(nameField); __c.text = ""; __c.recomposion(__c); })();
  (() => { const __c = __dc(amountField); __c.text = ""; __c.recomposion(__c); })();
})), undefined, [Text("＋ 添加", undefined, undefined, undefined, undefined, undefined, undefined, undefined, [], recomposion$Text$3, 3)], recomposion$Button$1, 1), Button(weight$Rat(1.0), undefined, undefined, undefined, __dshCb("Button_onClick_2", ((_) => {
  meds = core_collection__emptyList();
  saveMeds(meds);
  (() => { const __c = __dc(status); __c.text = "共 0 条"; __c.recomposion(__c); })();
  rows = rowsView(core_collection__emptyList());
  timeline = TimelineView();
})), undefined, [Text("清空", undefined, undefined, undefined, undefined, undefined, undefined, undefined, [], recomposion$Text$4, 4)], recomposion$Button$2, 2)], recomposion$Box$5, 5), Box(paddingH$List(fillWidth$v0(), 12), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, [status], recomposion$Box$6, 6), Box(paddingH$List(fillWidth$v0(), 12), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, [rows], recomposion$Box$7, 7), Box(paddingH$List(fillWidth$v0(), 12), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, [timeline], recomposion$Box$8, 8)], recomposion$Box$1, 1);
  }
  function rowsView(meds) {
    return Box(fillWidth$v0(), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, [rowsBody((meds).slice().reverse())], recomposion$Box$9, 9);
  }
  function rowsBody(xs) {
    return (() => {
  const __s1 = xs;
  if (((Array.isArray(__s1) && __s1.length === 0))) {  return Box(core_collection__emptyList(), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, recomposion$Box$10, 10); }
  if (((Array.isArray(__s1) && __s1.length >= 1))) { const m = __s1[0]; const rest = __s1.slice(1);  return Box(padding4$List(fillWidth$v0(), 0, 0, 0, 6), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, [Button(fillWidth$v0(), undefined, undefined, undefined, __dshCb("Button_onClick_3", ((_) => {
  __dshAndroid("log", [("picked row: " + m), 2]);
  return null;
})), undefined, [Text(m, undefined, 15, undefined, undefined, undefined, undefined, undefined, [], recomposion$Text$5, 5)], recomposion$Button$3, 3), rowsBody(rest)], recomposion$Box$11, 11); }
   return Box(core_collection__emptyList(), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, recomposion$Box$12, 12);
})();
  }
  function doseEntry(name, amount, t) {
    return (((name + " | ") + amount) + (" | " + t));
  }
  function makeDose(cur, name, amount, t) {
    return core_collection__cons(doseEntry(name, amount, t), cur);
  }
  function doseName(entry) {
    return entryPart(entry, 0);
  }
  function doseAmount(entry) {
    return entryPart(entry, 1);
  }
  function doseTime(entry) {
    return entryPart(entry, 2);
  }
  function entryPart(entry, i) {
    return core_collection__getOrElse((() => { const a = (entry).split(" | "); const i = i; return i >= 0 && i < a.length ? Some(a[i]) : None(); })(), "");
  }
  function medTimes(meds) {
    return dict_core_collection_Functor_List.map(dict_core_collection_Functor_List, meds, (m) => doseTime(m));
  }
  function medLabels(meds) {
    return dict_core_collection_Functor_List.map(dict_core_collection_Functor_List, meds, (m) => (doseName(m) + (" · " + doseAmount(m))));
  }
  function joinMeds(xs) {
    return dict_core_collection_Foldable_List.fold(dict_core_collection_Foldable_List, xs, "", (acc, x) => (__eq(acc, "") ? (() => {
  return x;
})() : (() => {
  return (acc + (";" + x));
})()));
  }
  function loadMeds() {
    const s = __dshAndroid("storageGet", ["meds"]);
    return (__eq(s, "") ? (() => {
  return core_collection__emptyList();
})() : (() => {
  return (s).split(";");
})());
  }
  function saveMeds(xs) {
    __dshAndroid("storagePut", ["meds", joinMeds(xs)]);
    null;
    return null;
  }
  function nowStr() {
    return __dshAndroid("fmtTime", [Date.now()]);
  }
  function recomposion$TextField$1(v) {
    return __dshAndroid("androidRecompose", ["TextField", 1, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$TextField$2(v) {
    return __dshAndroid("androidRecompose", ["TextField", 2, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Text$1(v) {
    return __dshAndroid("androidRecompose", ["Text", 1, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$TimelineView$1(v) {
    return __dshAndroid("androidRecompose", ["TimelineView", 1, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Box$1(v) {
    return __dshAndroid("androidRecompose", ["Box", 1, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Box$2(v) {
    return __dshAndroid("androidRecompose", ["Box", 2, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Text$2(v) {
    return __dshAndroid("androidRecompose", ["Text", 2, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Box$3(v) {
    return __dshAndroid("androidRecompose", ["Box", 3, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Box$4(v) {
    return __dshAndroid("androidRecompose", ["Box", 4, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Box$5(v) {
    return __dshAndroid("androidRecompose", ["Box", 5, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Button$1(v) {
    return __dshAndroid("androidRecompose", ["Button", 1, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Text$3(v) {
    return __dshAndroid("androidRecompose", ["Text", 3, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Button$2(v) {
    return __dshAndroid("androidRecompose", ["Button", 2, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Text$4(v) {
    return __dshAndroid("androidRecompose", ["Text", 4, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Box$6(v) {
    return __dshAndroid("androidRecompose", ["Box", 6, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Box$7(v) {
    return __dshAndroid("androidRecompose", ["Box", 7, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Box$8(v) {
    return __dshAndroid("androidRecompose", ["Box", 8, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Box$9(v) {
    return __dshAndroid("androidRecompose", ["Box", 9, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Box$10(v) {
    return __dshAndroid("androidRecompose", ["Box", 10, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Box$11(v) {
    return __dshAndroid("androidRecompose", ["Box", 11, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Button$3(v) {
    return __dshAndroid("androidRecompose", ["Button", 3, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Text$5(v) {
    return __dshAndroid("androidRecompose", ["Text", 5, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$Box$12(v) {
    return __dshAndroid("androidRecompose", ["Box", 12, JSON.stringify(__dshViewTree(v))]);
  }
  function recomposion$TimelineView$2(v) {
    return __dshAndroid("androidRecompose", ["TimelineView", 2, JSON.stringify(__dshViewTree(v))]);
  }
  const dict_core_collection_Functor_List = {
    map: (d, fa, f) => (() => {
  const __s2 = fa;
  if (((Array.isArray(__s2) && __s2.length === 0))) {  return []; }
  if (((Array.isArray(__s2) && __s2.length >= 1))) { const h = __s2[0]; const t = __s2.slice(1);  return [f(h), ...(dict_core_collection_Functor_List.map(dict_core_collection_Functor_List, t, f))]; }
  return null;
})()
  };
  const dict_core_collection_Foldable_List = {
    fold: (d, fa, init, f) => (() => {
  const __s3 = fa;
  if (((Array.isArray(__s3) && __s3.length === 0))) {  return init; }
  if (((Array.isArray(__s3) && __s3.length >= 1))) { const h = __s3[0]; const t = __s3.slice(1);  return dict_core_collection_Foldable_List.fold(dict_core_collection_Foldable_List, t, f(init, h), f); }
  return null;
})()
  };
  const dict_core_collection_Monad_List = {
    pure: (d, x) => [x, ...([])],
    flatMap: (d, fa, f) => (() => {
  const __s4 = fa;
  if (((Array.isArray(__s4) && __s4.length === 0))) {  return []; }
  if (((Array.isArray(__s4) && __s4.length >= 1))) { const h = __s4[0]; const t = __s4.slice(1);  return (f(h)).concat(dict_core_collection_Monad_List.flatMap(dict_core_collection_Monad_List, t, f)); }
  return null;
})()
  };
  function core_collection__emptyList() {
    return [];
  }
  function core_collection__cons(x, xs) {
    return [x, ...(xs)];
  }
  function core_collection__listOf(items) {
    return items;
  }
  function core_collection__range(a, b) {
    if ((a < b)) {
      // unchecked
      const rest = core_collection__range((a + 1), b);
      return [a, ...(rest)];
    }
    return [];
  }
  function core_collection__size$List(xs) {
    return (() => {
  const __s5 = xs;
  if (((Array.isArray(__s5) && __s5.length === 0))) {  return 0; }
  if (((Array.isArray(__s5) && __s5.length >= 1))) { const t = __s5.slice(1);  return ((t).length + 1); }
  return null;
})();
  }
  function core_collection__isEmpty$List(xs) {
    return (() => {
  const __s6 = xs;
  if (((Array.isArray(__s6) && __s6.length === 0))) {  return true; }
  if (((Array.isArray(__s6) && __s6.length >= 1))) {  return false; }
  return null;
})();
  }
  function core_collection__head(xs) {
    return (() => {
  const __s7 = xs;
  if (((Array.isArray(__s7) && __s7.length === 0))) {  return None(); }
  if (((Array.isArray(__s7) && __s7.length >= 1))) { const h = __s7[0];  return Some(h); }
  return null;
})();
  }
  function core_collection__last(xs) {
    return (() => {
  const __s8 = xs;
  if (((Array.isArray(__s8) && __s8.length === 0))) {  return None(); }
  if (((Array.isArray(__s8) && __s8.length >= 1)) && ((Array.isArray(__s8.slice(1)) && __s8.slice(1).length === 0))) { const h = __s8[0];  return Some(h); }
  if (((Array.isArray(__s8) && __s8.length >= 1))) { const t = __s8.slice(1);  return (() => { const a = t; return a.length ? Some(a[a.length - 1]) : None(); })(); }
  return null;
})();
  }
  function core_collection__elementAt(xs, i) {
    return (() => {
  const __s9 = xs;
  if (((Array.isArray(__s9) && __s9.length === 0))) {  return None(); }
  if (((Array.isArray(__s9) && __s9.length >= 1))) { const h = __s9[0]; const t = __s9.slice(1);  return (__eq(i, 0) ? (() => {
  return Some(h);
})() : (() => {
  return (() => { const a = t; const i = (i - 1); return i >= 0 && i < a.length ? Some(a[i]) : None(); })();
})()); }
  return null;
})();
  }
  function core_collection__get$List(xs, i) {
    return (() => {
  const __s10 = (() => { const a = xs; const i = i; return i >= 0 && i < a.length ? Some(a[i]) : None(); })();
  if ((__s10.tag === "Some")) { const v = __s10[0];  return v; }
  if ((__s10.tag === "None")) {  return (() => { throw new Error('panic: unreachable') })(); }
  return null;
})();
  }
  function core_collection__firstOr(xs, d) {
    return core_collection__getOrElse((() => { const a = xs; return a.length ? Some(a[0]) : None(); })(), d);
  }
  function core_collection__contains$List(xs, x) {
    return (() => {
  const __s11 = xs;
  if (((Array.isArray(__s11) && __s11.length === 0))) {  return false; }
  if (((Array.isArray(__s11) && __s11.length >= 1))) { const h = __s11[0]; const t = __s11.slice(1);  return (__eq(h, x) ? (() => {
  return true;
})() : (() => {
  return (t).includes(x);
})()); }
  return null;
})();
  }
  function core_collection__indexOf(xs, x) {
    return (() => {
  const __s12 = xs;
  if (((Array.isArray(__s12) && __s12.length === 0))) {  return None(); }
  if (((Array.isArray(__s12) && __s12.length >= 1))) { const h = __s12[0]; const t = __s12.slice(1);  return (__eq(h, x) ? (() => {
  return Some(0);
})() : (() => {
  return (() => {
  const __s13 = (() => { const i = (t).indexOf(x); return i === -1 ? None() : Some(i); })();
  if ((__s13.tag === "Some")) { const n = __s13[0];  return Some((n + 1)); }
  if ((__s13.tag === "None")) {  return None(); }
  return null;
})();
})()); }
  return null;
})();
  }
  function core_collection__count$List(xs, p) {
    return dict_core_collection_Foldable_List.fold(dict_core_collection_Foldable_List, xs, 0, (acc, x) => (p(x) ? (() => {
  return (acc + 1);
})() : (() => {
  return acc;
})()));
  }
  function core_collection__any(xs, p) {
    return dict_core_collection_Foldable_List.fold(dict_core_collection_Foldable_List, xs, false, (acc, x) => (acc || p(x)));
  }
  function core_collection__all(xs, p) {
    return dict_core_collection_Foldable_List.fold(dict_core_collection_Foldable_List, xs, true, (acc, x) => (acc && p(x)));
  }
  function core_collection__find(xs, p) {
    return (() => {
  const __s14 = xs;
  if (((Array.isArray(__s14) && __s14.length === 0))) {  return None(); }
  if (((Array.isArray(__s14) && __s14.length >= 1))) { const h = __s14[0]; const t = __s14.slice(1);  return (p(h) ? (() => {
  return Some(h);
})() : (() => {
  return core_collection__find(t, p);
})()); }
  return null;
})();
  }
  function core_collection__forEach$List(xs, f) {
    return (() => {
  const __s15 = xs;
  if (((Array.isArray(__s15) && __s15.length === 0))) {  return null; }
  if (((Array.isArray(__s15) && __s15.length >= 1))) { const h = __s15[0]; const t = __s15.slice(1);  return (() => {
  f(h);
  return (t).forEach(x => (f)(x));
})(); }
  return null;
})();
  }
  function core_collection__append(xs, ys) {
    return (() => {
  const __s16 = xs;
  if (((Array.isArray(__s16) && __s16.length === 0))) {  return ys; }
  if (((Array.isArray(__s16) && __s16.length >= 1))) { const h = __s16[0]; const t = __s16.slice(1);  return [h, ...((t).concat(ys))]; }
  return null;
})();
  }
  function core_collection__take(xs, n) {
    return (() => {
  const __s17 = xs;
  if (((Array.isArray(__s17) && __s17.length === 0))) {  return []; }
  if (((Array.isArray(__s17) && __s17.length >= 1))) { const h = __s17[0]; const t = __s17.slice(1);  return (__eq(n, 0) ? (() => {
  return [];
})() : (() => {
  const r = (t).slice(0, (n - 1));
  return [h, ...(r)];
})()); }
  return null;
})();
  }
  function core_collection__drop(xs, n) {
    return (() => {
  const __s18 = xs;
  if (((Array.isArray(__s18) && __s18.length === 0))) {  return []; }
  if (((Array.isArray(__s18) && __s18.length >= 1))) { const t = __s18.slice(1);  return (__eq(n, 0) ? (() => {
  return xs;
})() : (() => {
  const r = (t).slice((n - 1));
  return r;
})()); }
  return null;
})();
  }
  function core_collection__slice(xs, from, to) {
    return (() => {
  const __s19 = xs;
  if (((Array.isArray(__s19) && __s19.length === 0))) {  return []; }
  if (((Array.isArray(__s19) && __s19.length >= 1))) { const h = __s19[0]; const t = __s19.slice(1);  return ((to <= from) ? (() => {
  return [];
})() : (() => {
  return (__eq(from, 0) ? (() => {
  const r = (t).slice(0, (to - 1));
  return [h, ...(r)];
})() : (() => {
  return (t).slice((from - 1), (to - 1));
})());
})()); }
  return null;
})();
  }
  function core_collection__filter$List(xs, p) {
    return (() => {
  const __s20 = xs;
  if (((Array.isArray(__s20) && __s20.length === 0))) {  return []; }
  if (((Array.isArray(__s20) && __s20.length >= 1))) { const h = __s20[0]; const t = __s20.slice(1);  return (p(h) ? (() => {
  return [h, ...((t).filter(p))];
})() : (() => {
  return (t).filter(p);
})()); }
  return null;
})();
  }
  function core_collection__distinct(xs) {
    return (() => {
  const __s21 = xs;
  if (((Array.isArray(__s21) && __s21.length === 0))) {  return []; }
  if (((Array.isArray(__s21) && __s21.length >= 1))) { const h = __s21[0]; const t = __s21.slice(1);  return ((t).includes(h) ? (() => {
  return core_collection__distinct(t);
})() : (() => {
  return [h, ...(core_collection__distinct(t))];
})()); }
  return null;
})();
  }
  function core_collection__sortBy(xs, f) {
    return (() => {
  const __s22 = xs;
  if (((Array.isArray(__s22) && __s22.length === 0))) {  return []; }
  if (((Array.isArray(__s22) && __s22.length >= 1))) { const h = __s22[0]; const t = __s22.slice(1);  return core_collection__insertSort(h, (t).slice().sort((a, b) => (f)(a, b) ? -1 : 1), f); }
  return null;
})();
  }
  function core_collection__insertSort(x, xs, f) {
    return (() => {
  const __s23 = xs;
  if (((Array.isArray(__s23) && __s23.length === 0))) {  return [x, ...([])]; }
  if (((Array.isArray(__s23) && __s23.length >= 1))) { const h = __s23[0]; const t = __s23.slice(1);  return (f(x, h) ? (() => {
  return [x, ...([h, ...(t)])];
})() : (() => {
  return [h, ...(core_collection__insertSort(x, t, f))];
})()); }
  return null;
})();
  }
  function core_collection__reverse(xs) {
    return (() => {
  const __s24 = xs;
  if (((Array.isArray(__s24) && __s24.length === 0))) {  return []; }
  if (((Array.isArray(__s24) && __s24.length >= 1))) { const h = __s24[0]; const t = __s24.slice(1);  return ((t).slice().reverse()).concat([h, ...([])]); }
  return null;
})();
  }
  function core_collection__clear(xs) {
    return [];
  }
  function core_collection__sum(xs) {
    return dict_core_collection_Foldable_List.fold(dict_core_collection_Foldable_List, xs, 0, (acc, x) => (acc + x));
  }
  function core_collection__maxNat(xs) {
    return (() => {
  const __s25 = xs;
  if (((Array.isArray(__s25) && __s25.length === 0))) {  return None(); }
  if (((Array.isArray(__s25) && __s25.length >= 1))) { const h = __s25[0]; const t = __s25.slice(1);  return (() => {
  const __s26 = t;
  if (((Array.isArray(__s26) && __s26.length === 0))) {  return Some(h); }
  if (((Array.isArray(__s26) && __s26.length >= 1))) {  return (() => {
  const __s27 = core_collection__maxNat(t);
  if ((__s27.tag === "Some")) { const v = __s27[0];  return ((h > v) ? (() => {
  return Some(h);
})() : (() => {
  return Some(v);
})()); }
  if ((__s27.tag === "None")) {  return Some(h); }
  return null;
})(); }
  return null;
})(); }
  return null;
})();
  }
  function core_collection__minNat(xs) {
    return (() => {
  const __s28 = xs;
  if (((Array.isArray(__s28) && __s28.length === 0))) {  return None(); }
  if (((Array.isArray(__s28) && __s28.length >= 1))) { const h = __s28[0]; const t = __s28.slice(1);  return (() => {
  const __s29 = t;
  if (((Array.isArray(__s29) && __s29.length === 0))) {  return Some(h); }
  if (((Array.isArray(__s29) && __s29.length >= 1))) {  return (() => {
  const __s30 = core_collection__minNat(t);
  if ((__s30.tag === "Some")) { const v = __s30[0];  return ((h < v) ? (() => {
  return Some(h);
})() : (() => {
  return Some(v);
})()); }
  if ((__s30.tag === "None")) {  return Some(h); }
  return null;
})(); }
  return null;
})(); }
  return null;
})();
  }
  function core_collection__joinToString(xs, sep) {
    return dict_core_collection_Foldable_List.fold(dict_core_collection_Foldable_List, xs, "", (acc, x) => (__eq(acc, "") ? (() => {
  return __dshtoStr(x);
})() : (() => {
  return (acc + (sep + __dshtoStr(x)));
})()));
  }
  function core_collection__zip(xs, ys) {
    return (() => {
  const __s31 = xs;
  if (((Array.isArray(__s31) && __s31.length === 0))) {  return []; }
  if (((Array.isArray(__s31) && __s31.length >= 1))) { const h = __s31[0]; const t = __s31.slice(1);  return (() => {
  const __s32 = ys;
  if (((Array.isArray(__s32) && __s32.length === 0))) {  return []; }
  if (((Array.isArray(__s32) && __s32.length >= 1))) { const h2 = __s32[0]; const t2 = __s32.slice(1);  return [[h, h2], ...(core_collection__zip(t, t2))]; }
  return null;
})(); }
  return null;
})();
  }
  function core_collection__toSet(xs) {
    return (() => {
  const __s33 = xs;
  if (((Array.isArray(__s33) && __s33.length === 0))) {  return core_collection__SetNil(); }
  if (((Array.isArray(__s33) && __s33.length >= 1))) { const h = __s33[0]; const t = __s33.slice(1);  return core_collection__add(core_collection__toSet(t), h); }
  return null;
})();
  }
  function core_collection__toMap(xs) {
    return (() => {
  const __s34 = xs;
  if (((Array.isArray(__s34) && __s34.length === 0))) {  return core_collection__MapNil(); }
  if (((Array.isArray(__s34) && __s34.length >= 1))) { const pr = __s34[0]; const t = __s34.slice(1);  return (() => {
  const __s35 = pr;
  if (((Array.isArray(__s35) && __s35.length === 2))) { const k = __s35[0]; const v = __s35[1];  return core_collection__put(core_collection__toMap(t), k, v); }
  return null;
})(); }
  return null;
})();
  }
  function core_collection__Map__MapNil() { return { tag: "MapNil" }; }
  const core_collection__MapNil = core_collection__Map__MapNil;
  function core_collection__Map__MapCons(a0, a1, a2) { return { tag: "MapCons", 0: a0, 1: a1, 2: a2 }; }
  const core_collection__MapCons = core_collection__Map__MapCons;
  function core_collection__mapEmpty() {
    return core_collection__MapNil();
  }
  function core_collection__size$Map(m) {
    return (() => {
  const __s36 = m;
  if ((__s36.tag === "MapNil")) {  return 0; }
  if ((__s36.tag === "MapCons")) { const t = __s36[2];  return (core_collection__size$Map(t) + 1); }
  return null;
})();
  }
  function core_collection__isEmpty$Map(m) {
    return (() => {
  const __s37 = m;
  if ((__s37.tag === "MapNil")) {  return true; }
  if ((__s37.tag === "MapCons")) {  return false; }
  return null;
})();
  }
  function core_collection__get$Map(m, k) {
    return (() => {
  const __s38 = m;
  if ((__s38.tag === "MapNil")) {  return None(); }
  if ((__s38.tag === "MapCons")) { const k0 = __s38[0]; const v0 = __s38[1]; const t = __s38[2];  return (__eq(k0, k) ? (() => {
  return Some(v0);
})() : (() => {
  return core_collection__get$Map(t, k);
})()); }
  return null;
})();
  }
  function core_collection__containsKey(m, k) {
    return (() => {
  const __s39 = m;
  if ((__s39.tag === "MapNil")) {  return false; }
  if ((__s39.tag === "MapCons")) { const k0 = __s39[0]; const t = __s39[2];  return (__eq(k0, k) ? (() => {
  return true;
})() : (() => {
  return core_collection__containsKey(t, k);
})()); }
  return null;
})();
  }
  function core_collection__keys(m) {
    return (() => {
  const __s40 = m;
  if ((__s40.tag === "MapNil")) {  return []; }
  if ((__s40.tag === "MapCons")) { const k0 = __s40[0]; const t = __s40[2];  return [k0, ...(core_collection__keys(t))]; }
  return null;
})();
  }
  function core_collection__values(m) {
    return (() => {
  const __s41 = m;
  if ((__s41.tag === "MapNil")) {  return []; }
  if ((__s41.tag === "MapCons")) { const v0 = __s41[1]; const t = __s41[2];  return [v0, ...(core_collection__values(t))]; }
  return null;
})();
  }
  function core_collection__put(m, k, v) {
    return core_collection__MapCons(k, v, core_collection__remove$Map(m, k));
  }
  function core_collection__remove$Map(m, k) {
    return (() => {
  const __s42 = m;
  if ((__s42.tag === "MapNil")) {  return core_collection__MapNil(); }
  if ((__s42.tag === "MapCons")) { const k0 = __s42[0]; const v0 = __s42[1]; const t = __s42[2];  return (__eq(k0, k) ? (() => {
  return t;
})() : (() => {
  return core_collection__MapCons(k0, v0, core_collection__remove$Map(t, k));
})()); }
  return null;
})();
  }
  function core_collection__filter$Map(m, p) {
    return (() => {
  const __s43 = m;
  if ((__s43.tag === "MapNil")) {  return core_collection__MapNil(); }
  if ((__s43.tag === "MapCons")) { const k0 = __s43[0]; const v0 = __s43[1]; const t = __s43[2];  return (p(v0) ? (() => {
  return core_collection__MapCons(k0, v0, core_collection__filter$Map(t, p));
})() : (() => {
  return core_collection__filter$Map(t, p);
})()); }
  return null;
})();
  }
  function core_collection__mapValues(m, f) {
    return (() => {
  const __s44 = m;
  if ((__s44.tag === "MapNil")) {  return core_collection__MapNil(); }
  if ((__s44.tag === "MapCons")) { const k0 = __s44[0]; const v0 = __s44[1]; const t = __s44[2];  return core_collection__MapCons(k0, f(v0), core_collection__mapValues(t, f)); }
  return null;
})();
  }
  function core_collection__mapKeys(m, f) {
    return (() => {
  const __s45 = m;
  if ((__s45.tag === "MapNil")) {  return core_collection__MapNil(); }
  if ((__s45.tag === "MapCons")) { const k0 = __s45[0]; const v0 = __s45[1]; const t = __s45[2];  return core_collection__put(core_collection__mapKeys(t, f), f(k0), v0); }
  return null;
})();
  }
  function core_collection__merge(m1, m2) {
    return (() => {
  const __s46 = m2;
  if ((__s46.tag === "MapNil")) {  return m1; }
  if ((__s46.tag === "MapCons")) { const k0 = __s46[0]; const v0 = __s46[1]; const t = __s46[2];  return core_collection__merge(core_collection__put(m1, k0, v0), t); }
  return null;
})();
  }
  function core_collection__toList$Map(m) {
    return core_collection__values(m);
  }
  function core_collection__Optional__Some(a0) { return { tag: "Some", 0: a0 }; }
  const core_collection__Some = core_collection__Optional__Some;
  function core_collection__Optional__None() { return { tag: "None" }; }
  const core_collection__None = core_collection__Optional__None;
  const dict_core_collection_Functor_Optional = {
    map: (d, fa, f) => (() => {
  const __s47 = fa;
  if ((__s47.tag === "Some")) { const v = __s47[0];  return Some(f(v)); }
  if ((__s47.tag === "None")) {  return None(); }
  return null;
})()
  };
  const dict_core_collection_Foldable_Optional = {
    fold: (d, fa, init, f) => (() => {
  const __s48 = fa;
  if ((__s48.tag === "Some")) { const v = __s48[0];  return f(init, v); }
  if ((__s48.tag === "None")) {  return init; }
  return null;
})()
  };
  const dict_core_collection_Monad_Optional = {
    pure: (d, x) => Some(x),
    flatMap: (d, fa, f) => (() => {
  const __s49 = fa;
  if ((__s49.tag === "Some")) { const v = __s49[0];  return f(v); }
  if ((__s49.tag === "None")) {  return None(); }
  return null;
})()
  };
  function core_collection__isSome(o) {
    return (() => {
  const __s50 = o;
  if ((__s50.tag === "Some")) {  return true; }
  if ((__s50.tag === "None")) {  return false; }
  return null;
})();
  }
  function core_collection__isNone(o) {
    return (() => {
  const __s51 = o;
  if ((__s51.tag === "Some")) {  return false; }
  if ((__s51.tag === "None")) {  return true; }
  return null;
})();
  }
  function core_collection__getOrElse(o, d) {
    return (() => {
  const __s52 = o;
  if ((__s52.tag === "Some")) { const v = __s52[0];  return v; }
  if ((__s52.tag === "None")) {  return d; }
  return null;
})();
  }
  function core_collection__orElse(o, d) {
    return (() => {
  const __s53 = o;
  if ((__s53.tag === "Some")) {  return o; }
  if ((__s53.tag === "None")) {  return d; }
  return null;
})();
  }
  function core_collection__filter$Optional(o, p) {
    return (() => {
  const __s54 = o;
  if ((__s54.tag === "Some")) { const v = __s54[0];  return (p(v) ? (() => {
  return Some(v);
})() : (() => {
  return None();
})()); }
  if ((__s54.tag === "None")) {  return None(); }
  return null;
})();
  }
  function core_collection__toResult(o, e) {
    return (() => {
  const __s55 = o;
  if ((__s55.tag === "Some")) { const v = __s55[0];  return core_collection__Ok(v); }
  if ((__s55.tag === "None")) {  return core_collection__Err(e); }
  return null;
})();
  }
  function core_collection__toList$Optional(o) {
    return (() => {
  const __s56 = o;
  if ((__s56.tag === "Some")) { const v = __s56[0];  return [v, ...([])]; }
  if ((__s56.tag === "None")) {  return []; }
  return null;
})();
  }
  function core_collection__Result__Ok(a0) { return { tag: "Ok", 0: a0 }; }
  const core_collection__Ok = core_collection__Result__Ok;
  function core_collection__Result__Err(a0) { return { tag: "Err", 0: a0 }; }
  const core_collection__Err = core_collection__Result__Err;
  function core_collection__isOk(r) {
    return (() => {
  const __s57 = r;
  if ((__s57.tag === "Ok")) {  return true; }
  if ((__s57.tag === "Err")) {  return false; }
  return null;
})();
  }
  function core_collection__isErr(r) {
    return (() => {
  const __s58 = r;
  if ((__s58.tag === "Ok")) {  return false; }
  if ((__s58.tag === "Err")) {  return true; }
  return null;
})();
  }
  function core_collection__unwrapOr(r, d) {
    return (() => {
  const __s59 = r;
  if ((__s59.tag === "Ok")) { const v = __s59[0];  return v; }
  if ((__s59.tag === "Err")) {  return d; }
  return null;
})();
  }
  function core_collection__mapOk(r, f) {
    return (() => {
  const __s60 = r;
  if ((__s60.tag === "Ok")) { const v = __s60[0];  return core_collection__Ok(f(v)); }
  if ((__s60.tag === "Err")) { const e = __s60[0];  return core_collection__Err(e); }
  return null;
})();
  }
  function core_collection__mapErr(r, f) {
    return (() => {
  const __s61 = r;
  if ((__s61.tag === "Ok")) { const v = __s61[0];  return core_collection__Ok(v); }
  if ((__s61.tag === "Err")) { const e = __s61[0];  return core_collection__Err(f(e)); }
  return null;
})();
  }
  function core_collection__flatMapOk(r, f) {
    return (() => {
  const __s62 = r;
  if ((__s62.tag === "Ok")) { const v = __s62[0];  return f(v); }
  if ((__s62.tag === "Err")) { const e = __s62[0];  return core_collection__Err(e); }
  return null;
})();
  }
  function core_collection__toList$Result(r) {
    return (() => {
  const __s63 = r;
  if ((__s63.tag === "Ok")) { const v = __s63[0];  return [v, ...([])]; }
  if ((__s63.tag === "Err")) {  return []; }
  return null;
})();
  }
  function core_collection__Set__SetNil() { return { tag: "SetNil" }; }
  const core_collection__SetNil = core_collection__Set__SetNil;
  function core_collection__Set__SetCons(a0, a1) { return { tag: "SetCons", 0: a0, 1: a1 }; }
  const core_collection__SetCons = core_collection__Set__SetCons;
  const dict_core_collection_Functor_Set = {
    map: (d, fa, f) => (() => {
  const __s64 = fa;
  if ((__s64.tag === "SetNil")) {  return core_collection__SetNil(); }
  if ((__s64.tag === "SetCons")) { const h = __s64[0]; const t = __s64[1];  return core_collection__add(dict_core_collection_Functor_Set.map(dict_core_collection_Functor_Set, t, f), f(h)); }
  return null;
})()
  };
  const dict_core_collection_Foldable_Set = {
    fold: (d, fa, init, f) => (() => {
  const __s65 = fa;
  if ((__s65.tag === "SetNil")) {  return init; }
  if ((__s65.tag === "SetCons")) { const h = __s65[0]; const t = __s65[1];  return dict_core_collection_Foldable_Set.fold(dict_core_collection_Foldable_Set, t, f(init, h), f); }
  return null;
})()
  };
  function core_collection__setEmpty() {
    return core_collection__SetNil();
  }
  function core_collection__setOf(items) {
    return core_collection__SetNil();
  }
  function core_collection__add(s, x) {
    return (core_collection__contains$Set(s, x) ? (() => {
  return s;
})() : (() => {
  return core_collection__SetCons(x, s);
})());
  }
  function core_collection__remove$Set(s, x) {
    return (() => {
  const __s66 = s;
  if ((__s66.tag === "SetNil")) {  return core_collection__SetNil(); }
  if ((__s66.tag === "SetCons")) { const h = __s66[0]; const t = __s66[1];  return (__eq(h, x) ? (() => {
  return t;
})() : (() => {
  return core_collection__SetCons(h, core_collection__remove$Set(t, x));
})()); }
  return null;
})();
  }
  function core_collection__size$Set(s) {
    return (() => {
  const __s67 = s;
  if ((__s67.tag === "SetNil")) {  return 0; }
  if ((__s67.tag === "SetCons")) { const t = __s67[1];  return (core_collection__size$Set(t) + 1); }
  return null;
})();
  }
  function core_collection__isEmpty$Set(s) {
    return (() => {
  const __s68 = s;
  if ((__s68.tag === "SetNil")) {  return true; }
  if ((__s68.tag === "SetCons")) {  return false; }
  return null;
})();
  }
  function core_collection__contains$Set(s, x) {
    return (() => {
  const __s69 = s;
  if ((__s69.tag === "SetNil")) {  return false; }
  if ((__s69.tag === "SetCons")) { const h = __s69[0]; const t = __s69[1];  return (__eq(h, x) ? (() => {
  return true;
})() : (() => {
  return core_collection__contains$Set(t, x);
})()); }
  return null;
})();
  }
  function core_collection__count$Set(s, p) {
    return dict_core_collection_Foldable_Set.fold(dict_core_collection_Foldable_Set, s, 0, (acc, x) => (p(x) ? (() => {
  return (acc + 1);
})() : (() => {
  return acc;
})()));
  }
  function core_collection__forEach$Set(s, f) {
    return (() => {
  const __s70 = s;
  if ((__s70.tag === "SetNil")) {  return null; }
  if ((__s70.tag === "SetCons")) { const h = __s70[0]; const t = __s70[1];  return (() => {
  f(h);
  return core_collection__forEach$Set(t, f);
})(); }
  return null;
})();
  }
  function core_collection__union(s1, s2) {
    return (() => {
  const __s71 = s1;
  if ((__s71.tag === "SetNil")) {  return s2; }
  if ((__s71.tag === "SetCons")) { const h = __s71[0]; const t = __s71[1];  return (core_collection__contains$Set(s2, h) ? (() => {
  return core_collection__union(t, s2);
})() : (() => {
  return core_collection__SetCons(h, core_collection__union(t, s2));
})()); }
  return null;
})();
  }
  function core_collection__intersect(s1, s2) {
    return (() => {
  const __s72 = s1;
  if ((__s72.tag === "SetNil")) {  return core_collection__SetNil(); }
  if ((__s72.tag === "SetCons")) { const h = __s72[0]; const t = __s72[1];  return (core_collection__contains$Set(s2, h) ? (() => {
  return core_collection__SetCons(h, core_collection__intersect(t, s2));
})() : (() => {
  return core_collection__intersect(t, s2);
})()); }
  return null;
})();
  }
  function core_collection__filter$Set(s, p) {
    return (() => {
  const __s73 = s;
  if ((__s73.tag === "SetNil")) {  return core_collection__SetNil(); }
  if ((__s73.tag === "SetCons")) { const h = __s73[0]; const t = __s73[1];  return (p(h) ? (() => {
  return core_collection__SetCons(h, core_collection__filter$Set(t, p));
})() : (() => {
  return core_collection__filter$Set(t, p);
})()); }
  return null;
})();
  }
  function core_collection__flatMap(s, f) {
    return (() => {
  const __s74 = s;
  if ((__s74.tag === "SetNil")) {  return core_collection__SetNil(); }
  if ((__s74.tag === "SetCons")) { const h = __s74[0]; const t = __s74[1];  return core_collection__union(f(h), core_collection__flatMap(t, f)); }
  return null;
})();
  }
  function core_collection__toList$Set(s) {
    return (() => {
  const __s75 = s;
  if ((__s75.tag === "SetNil")) {  return []; }
  if ((__s75.tag === "SetCons")) { const h = __s75[0]; const t = __s75[1];  return [h, ...(core_collection__toList$Set(t))]; }
  return null;
})();
  }
  const dict_core_collection_Tuple_EmptyTuple = {
    size: (d, __self) => 0,
    isEmpty: (d, __self) => true
  };
  const dict_core_collection_Tuple_SingleTuple = {
    size: (d, __self) => 1,
    isEmpty: (d, __self) => false
  };
  const dict_core_collection_Tuple__a__b_ = {
    size: (d, __self) => 2,
    isEmpty: (d, __self) => false
  };
  const dict_core_collection_Tuple__a__b__c_ = {
    size: (d, __self) => 3,
    isEmpty: (d, __self) => false
  };
  const dict_core_collection_Tuple__a__b__c__d_ = {
    size: (d, __self) => 4,
    isEmpty: (d, __self) => false
  };
  const dict_core_collection_Tuple__a__b__c__d__e_ = {
    size: (d, __self) => 5,
    isEmpty: (d, __self) => false
  };
  const dict_core_collection_Tuple__a__b__c__d__e__f_ = {
    size: (d, __self) => 6,
    isEmpty: (d, __self) => false
  };
  const dict_core_collection_Tuple__a__b__c__d__e__f__g_ = {
    size: (d, __self) => 7,
    isEmpty: (d, __self) => false
  };
  const dict_core_collection_Tuple__a__b__c__d__e__f__g__h_ = {
    size: (d, __self) => 8,
    isEmpty: (d, __self) => false
  };
  const dict_core_collection_Tuple__a__b__c__d__e__f__g__h__i_ = {
    size: (d, __self) => 9,
    isEmpty: (d, __self) => false
  };
  const dict_core_collection_Tuple__a__b__c__d__e__f__g__h__i__j_ = {
    size: (d, __self) => 10,
    isEmpty: (d, __self) => false
  };
  function core_encoding__base64Encode(s) {
    return (() => { throw new Error('panic: unreachable') })();
  }
  function core_encoding__base64Decode(s) {
    return (() => { throw new Error('panic: unreachable') })();
  }
  function core_encoding__hexEncode(s) {
    return (() => { throw new Error('panic: unreachable') })();
  }
  function core_encoding__hexDecode(s) {
    return (() => { throw new Error('panic: unreachable') })();
  }
  function core_math__sqrt(x) {
    return Math.pow(x, 0.5);
  }
  function core_math__gcd(a, b) {
    return (__eq(b, 0) ? (() => {
  return a;
})() : (() => {
  const r = core_math__gcd(b, (a % b));
  return r;
})());
  }
  function core_math__lcm(a, b) {
    return (__eq(b, 0) ? (() => {
  return 0;
})() : (() => {
  const r = core_math__gcd(a, b);
  return (a * (b / r));
})());
  }
  function core_math__isEven(n) {
    return __eq((n % 2), 0);
  }
  function core_math__isOdd(n) {
    return (!__eq((n % 2), 0));
  }
  function core_math__sq(n) {
    return (n * n);
  }
  function core_math__cube(n) {
    return ((n * n) * n);
  }
  function core_math__summation(a, b) {
    return (core_collection__range(a, b)).reduce((a, b) => a + b, 0);
  }
  async function core_net__httpGet(url) {
    return (() => { throw new Error('panic: unreachable') })();
  }
  async function core_net__httpPost(url, body) {
    return (() => { throw new Error('panic: unreachable') })();
  }
  async function core_net__socketConnect(host, port) {
    return (() => { throw new Error('panic: unreachable') })();
  }
  const dict_core_number_Num_Rat = {
  };
  function core_random__randNat(n) {
    return Math.floor((Math.random() * Number(n)));
  }
  function core_real__ratOr(s, fallback) {
    return (() => {
  const __s76 = (() => { const v = Number(String(s)); return Number.isNaN(v) ? None() : Some(v); })();
  if ((__s76.tag === "Some")) { const r = __s76[0];  return r; }
  if ((__s76.tag === "None")) {  return fallback; }
  return null;
})();
  }
  function core_regex__regexMatch(s, pattern) {
    return (() => { throw new Error('panic: unreachable') })();
  }
  function core_regex__regexFind(s, pattern) {
    return (() => { throw new Error('panic: unreachable') })();
  }
  function core_regex__regexSplit(s, pattern) {
    return (() => { throw new Error('panic: unreachable') })();
  }
  function core_regex__regexReplace(s, pattern, repl) {
    return (() => { throw new Error('panic: unreachable') })();
  }
  function core_time__diffMs(a, b) {
    return (b - a);
  }
  main();
})();
