#!/usr/bin/env python3
# AndroidSDK for CandyIDE —— 从 aapt2 生成的 R.java 派生各库包的 Kotlin R 类。
# 用法: gen-r.py <R.java 路径> <输出目录>
# 背景：无 Gradle 时没有 R 重写；库字节码在运行时 getstatic 自己包的 R$<type>，
# 必须按最终资源表合成这些类（class + companion object，const val / @JvmField）。
import os
import re
import sys

R_NEED = {
    "androidx.activity": ["id"],
    "androidx.appcompat.resources": ["drawable", "styleable"],
    "androidx.appcompat": ["attr", "bool", "color", "dimen", "drawable", "id", "layout",
                           "string", "style", "styleable"],
    "androidx.cardview": ["attr", "color", "dimen", "style", "styleable"],
    "androidx.constraintlayout.widget": ["id", "styleable"],
    "androidx.coordinatorlayout": ["attr", "style", "styleable"],
    "androidx.core": ["attr", "color", "dimen", "drawable", "id", "integer",
                      "layout", "string", "styleable"],
    "androidx.drawerlayout": ["attr", "dimen", "styleable"],
    "androidx.fragment": ["animator", "id", "styleable"],
    "androidx.lifecycle.runtime": ["id"],
    "androidx.lifecycle.viewmodel": ["id"],
    "androidx.recyclerview": ["attr", "dimen", "id", "styleable"],
    "androidx.savedstate": ["id"],
    "androidx.startup": ["string"],
    "androidx.transition": ["id"],
    "androidx.viewpager2": ["styleable"],
    "com.google.android.material": ["anim", "animator", "attr", "color", "dimen",
                                    "drawable", "id", "integer", "layout", "plurals",
                                    "string", "style", "styleable"],
}

SCALAR_RE = re.compile(r"public static final int (\w+)=(0x[0-9a-fA-F]+|\d+);")
ARRAY_HEAD_RE = re.compile(r"public static final int\[\] (\w+)=\{")
CLASS_RE = re.compile(r"public static final class (\w+) \{")


def main():
    rjava, out_dir = sys.argv[1], sys.argv[2]
    with open(rjava, encoding="utf-8") as fh:
        text = fh.read()
    type_data = {}
    cur = [""]  # 当前类型（嵌套类名）

    def add_entry(tp, name, value, is_arr):
        type_data.setdefault(tp, []).append((name, value, is_arr))

    state = {"in_arr": False, "arr_name": "", "arr_buf": ""}
    for line in text.splitlines():
        if state["in_arr"]:
            state["arr_buf"] += line
            if "};" in line:
                clean = re.sub(r"[^0-9a-fA-Fx,]", "", state["arr_buf"])
                vals = [v for v in clean.split(",") if v]
                add_entry(cur[0], state["arr_name"], ",".join(vals), True)
                state["in_arr"] = False
            continue
        m = CLASS_RE.match(line.strip())
        if m:
            cur[0] = m.group(1)
            continue
        m = SCALAR_RE.match(line.strip())
        if m and cur[0]:
            add_entry(cur[0], m.group(1), m.group(2), False)
            continue
        m = ARRAY_HEAD_RE.match(line.strip())
        if m and cur[0]:
            state["in_arr"] = True
            state["arr_name"] = m.group(1)
            state["arr_buf"] = ""

    count = 0
    for pkg, types in R_NEED.items():
        pkg_dir = os.path.join(out_dir, *pkg.split("."))
        os.makedirs(pkg_dir, exist_ok=True)
        lines = ["package " + pkg, "", "class R {"]
        for tp in types:
            entries = type_data.get(tp)
            if not entries:
                continue
            lines.append("  class " + tp + " {")
            lines.append("    companion object {")
            for name, value, is_arr in entries:
                if is_arr:
                    lines.append("      @JvmField val " + name + " = intArrayOf(" + value + ")")
                else:
                    lines.append("      const val " + name + " = " + value)
            lines.append("    }")
            lines.append("  }")
        lines.append("}")
        with open(os.path.join(pkg_dir, "R.kt"), "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n")
        count += 1
    print("R-classes=" + str(count))


if __name__ == "__main__":
    main()
