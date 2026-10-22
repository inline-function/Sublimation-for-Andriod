package functor.sublimation.android

import android.app.Activity
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import com.google.android.material.button.MaterialButton
import org.json.JSONArray
import org.json.JSONObject
/**
 * JS-KT 通信桥（WebView JavascriptInterface 注入为 __dshAndroid）。
 * JS 端调用 __dshAndroid(kind, argsJson)。KT 端原生执行后返回 JSON。
 *
 * 增量重组：layout / androidRecompose 都按「新旧 JSON 树深比较」只更新变化的子树，
 * 相等的视图原样保留（不重建——其状态、监听器、布局参数全部保持）。
 * 频繁重组只改几个小视图时，绝大多数子树在 jsonEquals 处短路，原生重建量 ≈ 变化量。
 */
class DshBridge(private val activity: MainActivity) {
    private val tag = "Sublimation"
    private val lifecycleCallbacks = mutableSetOf<String>()
    private val firedEvents = mutableSetOf<String>()

    @android.webkit.JavascriptInterface
    fun dispatch(kind: String, argsJson: String): String {
        return try { handle(kind, argsJson); "null" } catch (t: Throwable) {
            Log.e(tag, "bridge error [" + kind + "]: " + t.message); "null"
        }
    }

    private fun handle(kind: String, argsJson: String) {
        val args = if (argsJson.isEmpty() || argsJson == "null") emptyList<Any?>()
            else parseJsonArray(argsJson)
        when (kind) {
            "log" -> {
                val msg = args.getOrNull(0)?.toString() ?: ""
                val level = (args.getOrNull(1) as? Number)?.toInt() ?: 2
                when (level) {
                    0 -> Log.v(tag, msg); 1 -> Log.d(tag, msg); 3 -> Log.w(tag, msg)
                    4 -> Log.e(tag, msg); else -> Log.i(tag, msg)
                }
            }
            "toast" -> {
                val msg = args.getOrNull(0)?.toString() ?: ""
                Log.d(tag, "toast " + msg)
                val long = (args.getOrNull(1) as? Boolean) == true
                activity.runOnUiThread {
                    Toast.makeText(activity, msg,
                        if (long) Toast.LENGTH_LONG else Toast.LENGTH_SHORT).show()
                }
            }
            "registerLifecycle" -> {
                val event = args.getOrNull(0)?.toString() ?: return
                lifecycleCallbacks += event
                if (event in firedEvents) dispatchLater(event)
            }
            "layout" -> {
                val viewJson = args.getOrNull(0)?.toString() ?: return
                val root = JSONObject(viewJson)
                val old = rootJson
                rootJson = root
                activity.runOnUiThread {
                    if (old == null) setRootView(buildView(root.toString()))
                    else applyRootDiff(old, root)
                }
            }
            "androidRecompose" -> {
                // 重组：JS 端把修改好的视图副本传来（tag + 序号）。先在 JSON 树里替换，
                // 再对新旧两棵树跑增量 diff——只有变化的子树触发原生重建。
                val viewJson = args.getOrNull(2)?.toString() ?: return
                val kind = args.getOrNull(0)?.toString() ?: return
                val ord = (args.getOrNull(1) as? Number)?.toInt() ?: 1
                val rj = rootJson ?: return
                val old = JSONObject(rj.toString())   // 旧树快照（diff 基准）
                if (!replaceNode(rj, kind, ord, JSONObject(viewJson))) {
                    Log.w(tag, "recompose 定位失败: " + kind + "#" + ord)
                    return
                }
                if (jsonEquals(old, rj)) return   // JS 什么也没改成：原生视图一字不动
                activity.runOnUiThread { applyRootDiff(old, rj) }
            }
            else -> Log.w(tag, "unknown bridge kind: " + kind)
        }
    }

    fun dispatchLifecycle(event: String) {
        if (event in lifecycleCallbacks) dispatchLater(event)
        else firedEvents += event
    }

    private fun dispatchLater(event: String) {
        activity.web.post {
            activity.web.evaluateJavascript(
                "try{ __dshLifecycle_" + event + "(); }catch(e){ console.log(e); }", null)
        }
    }

    // ---------------- 增量重组（diff） ----------------

    /** 当前视图树的 JSON（layout 写入；recompose 在树上原地替换节点）。 */
    private var rootJson: JSONObject? = null
    /** 当前根原生视图（JSON 树的原生镜像）。 */
    private var rootView: View? = null

    private fun setRootView(v: View) {
        rootView = v
        activity.setContentView(v)
    }

    /**
     * 新旧两棵树的根级 diff。相等 → 什么都不做；
     * 根类型/自身字段变化 → 整树重建；根字段相同且同是 Box（含 children）→ 逐子树增量。
     */
    private fun applyRootDiff(old: JSONObject, nw: JSONObject) {
        val rv = rootView ?: run { setRootView(buildView(nw.toString())); return }
        if (jsonEquals(old, nw)) {
            Log.d(tag, "diff: 无变化，跳过")
            return
        }
        if (old.optString("tag", "") != nw.optString("tag", "") || !fieldsEqual(old, nw)) {
            setRootView(buildView(nw.toString()))
            return
        }
        // 根为 Box 且自身字段相同：children 逐个增量。
        val oldCh = old.optJSONArray("children")
        val newCh = nw.optJSONArray("children")
        val group = rv as? ViewGroup
        if (oldCh == null || newCh == null || group == null ||
            oldCh.length() != newCh.length() || oldCh.length() != group.childCount) {
            setRootView(buildView(nw.toString()))
            return
        }
        for (i in 0 until newCh.length()) {
            val o = oldCh.optJSONObject(i) ?: continue
            val n = newCh.optJSONObject(i) ?: continue
            applyChildDiff(o, n, group, i)
        }
    }

    /**
     * 单个子树的增量：
     * - jsonEquals → 跳过（该视图完全保留——状态/监听器不重建）
     * - tag 变了 / 非 Box 节点有变化 / 结构改变 → 该子树重建（remove + add 同位置）
     * - Box 且自身字段相同 → 继续向下逐子树增量
     */
    private fun applyChildDiff(old: JSONObject, nw: JSONObject, host: ViewGroup, i: Int) {
        if (jsonEquals(old, nw)) return
        val oldTag = old.optString("tag", "")
        val newTag = nw.optString("tag", "")
        val oldV = if (i < host.childCount) host.getChildAt(i) else null
        if (newTag != oldTag || oldV == null) {
            rebuild(host, i, nw)
            return
        }
        if (newTag == "Box" && fieldsEqual(old, nw)) {
            val oldCh = old.optJSONArray("children")
            val newCh = nw.optJSONArray("children")
            val group = oldV as? ViewGroup
            if (oldCh != null && newCh != null && group != null &&
                oldCh.length() == newCh.length() && newCh.length() == group.childCount) {
                for (k in 0 until newCh.length()) {
                    val o = oldCh.optJSONObject(k) ?: continue
                    val n = newCh.optJSONObject(k) ?: continue
                    applyChildDiff(o, n, group, k)
                }
                return
            }
        }
        // 非容器或自身字段变化：重建此子树（子树内部一起重建——Button 的文本子视图不是原生子视图，无法更细)
        rebuild(host, i, nw)
    }

    /** 原位重建第 i 个子树（同位置）。 */
    private fun rebuild(host: ViewGroup, i: Int, nw: JSONObject) {
        host.removeViewAt(i)
        host.addView(buildView(nw.toString()), i)
        Log.d(tag, "diff: 重建 " + nw.optString("tag", "?") + " 子树")
    }

    /**
     * 在树中找到 tag 与 __ord 相符的节点并替换。
     * ord 是视图构造点编号（与 JS 端 recomposion$X$N 的 N 同源、按源码序分配），
     * 与树 DFS 序不一定一致——必须按节点自带的 __ord 精确定位，不能按出现次序推断。
     */
    private fun replaceNode(node: JSONObject, tag: String, ord: Int, replacement: JSONObject): Boolean {
        val children = node.optJSONArray("children") ?: return false
        for (i in 0 until children.length()) {
            val c = children.optJSONObject(i) ?: continue
            if (c.optString("tag") == tag && c.optInt("__ord", -1) == ord) {
                children.put(i, replacement); return true
            }
            if (replaceNode(c, tag, ord, replacement)) return true
        }
        return false
    }

    /** JSON 深相等（String/Int/Bool/Double + 嵌套对象/数组）。 */
    private fun jsonEquals(a: Any?, b: Any?): Boolean = when {
        a is JSONObject && b is JSONObject ->
            a.length() == b.length() && a.keys().asSequence().all { k -> b.has(k) && jsonEquals(a.opt(k), b.opt(k)) }
        a is JSONArray && b is JSONArray ->
            a.length() == b.length() && (0 until a.length()).all { i -> jsonEquals(a.opt(i), b.opt(i)) }
        else -> a == b
    }

    /** 视图自身字段是否相同（排除 children——children 由增量路径处理）。 */
    private fun fieldsEqual(a: JSONObject, b: JSONObject): Boolean {
        val ka = mutableListOf<String>()
        a.keys().forEach { if (it != "children") ka += it }
        val kb = mutableListOf<String>()
        b.keys().forEach { if (it != "children") kb += it }
        if (ka.size != kb.size || !ka.containsAll(kb)) return false
        return ka.all { jsonEquals(a.opt(it), b.opt(it)) }
    }

    // ---------------- 视图构建 ----------------

    private fun buildView(json: String): View {
        val node = JSONObject(json)
        val type = node.optString("tag", "")
        val children = node.optJSONArray("children")
        return when (type) {
            "Box" -> buildBox(node, children)
            "Button" -> buildButton(node, children)
            else -> buildText(node)
        }
    }

    private fun buildBox(node: JSONObject, children: JSONArray?): View {
        val ctx = LinearLayout(activity).apply {
            orientation = LinearLayout.VERTICAL
            // Plain（默认）= 无约束 → WRAP_CONTENT；FillMaxSize() 等枚举由 setModifier 覆盖。
            // 注意：根 Box 经 setContentView 安装时由内容框架赋予 MATCH/MATCH，不受此默认值影响。
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        val align = node.optJSONObject("contentAlignment")?.optString("tag", "Center") ?: "Center"
        val gravity = when (align) {
            "Center" -> Gravity.CENTER
            "TopStart" -> Gravity.TOP or Gravity.START
            "BottomEnd" -> Gravity.BOTTOM or Gravity.END
            "CenterStart" -> Gravity.CENTER_VERTICAL or Gravity.START
            "CenterEnd" -> Gravity.CENTER_VERTICAL or Gravity.END
            "Top" -> Gravity.TOP
            "Bottom" -> Gravity.BOTTOM
            else -> Gravity.CENTER
        }
        ctx.gravity = gravity
        setModifier(ctx, node.opt("modifier"))
        if (children != null) {
            for (i in 0 until children.length()) {
                val child = children.optJSONObject(i) ?: continue
                ctx.addView(buildView(child.toString()))
            }
        }
        return ctx
    }

    private fun buildButton(node: JSONObject, children: JSONArray?): View {
        val btn = MaterialButton(activity)
        btn.text = extractText(children) ?: node.optString("label", "")
        btn.isEnabled = node.optBoolean("enabled", true)
        val onClickId = node.optString("onClick", "")
        if (onClickId.isNotEmpty()) {
            btn.setOnClickListener {
                activity.web.evaluateJavascript(
                    "try{ globalThis.__dshFn_" + onClickId + "(); }catch(e){ console.log(e); }", null)
            }
        }
        setModifier(btn, node.opt("modifier"))
        return btn
    }

    private fun buildText(node: JSONObject): View {
        val tv = TextView(activity)
        tv.text = node.optString("text", "")
        setModifier(tv, node.opt("modifier"))
        return tv
    }

    private fun extractText(children: JSONArray?): String? {
        if (children == null) return null
        for (i in 0 until children.length()) {
            val c = children.optJSONObject(i) ?: continue
            if (c.optString("tag") == "Text") return c.optString("text", "")
        }
        return null
    }

    /** JSONArray 按下标转 List（API 24 兼容：无 toList()）。 */
    private fun parseJsonArray(json: String): List<Any?> {
        val arr = JSONArray(json)
        val out = ArrayList<Any?>(arr.length())
        for (i in 0 until arr.length()) out += arr.opt(i)
        return out
    }

    /** Modifier 枚举（JS 侧 {tag, 0}）→ 原生视图参数。 */
    private fun setModifier(view: View, modifier: Any?) {
        val m = (modifier as? JSONObject) ?: return
        val tag = m.optString("tag", "Plain")
        if (tag.isEmpty() || tag == "Plain") return
        val lp = view.layoutParams ?: ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        when (tag) {
            "FillMaxSize" -> {
                lp.width = ViewGroup.LayoutParams.MATCH_PARENT
                lp.height = ViewGroup.LayoutParams.MATCH_PARENT
            }
            "WrapContent" -> {
                lp.width = ViewGroup.LayoutParams.WRAP_CONTENT
                lp.height = ViewGroup.LayoutParams.WRAP_CONTENT
            }
            "Width" -> lp.width = m.optInt("0")
            "Height" -> lp.height = m.optInt("0")
            "Padding" -> {
                val p = m.optInt("0")
                view.setPadding(p, p, p, p)
            }
            "Center" -> if (view is LinearLayout) view.gravity = Gravity.CENTER
        }
        view.layoutParams = lp
    }
}
