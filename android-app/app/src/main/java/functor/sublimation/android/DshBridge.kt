package functor.sublimation.android

import android.app.Activity
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
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
 */
class DshBridge(private val activity: MainActivity) {
    private val tag = "Sublimation"
    private val lifecycleCallbacks = mutableSetOf<String>()
    private val firedEvents = mutableSetOf<String>()

    @android.webkit.JavascriptInterface
    fun dispatch(kind: String, argsJson: String): String {
        return try { handle(kind, argsJson) } catch (t: Throwable) {
            Log.e(tag, "bridge error [" + kind + "]: " + t.message); "null"
        }
    }

    private fun handle(kind: String, argsJson: String): String {
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
                val event = args.getOrNull(0)?.toString() ?: return "null"
                lifecycleCallbacks += event
                if (event in firedEvents) dispatchLater(event)
            }
            "layout" -> {
                val viewJson = args.getOrNull(0)?.toString() ?: return "null"
                activity.runOnUiThread { activity.setContentView(buildView(viewJson)) }
            }
            "androidRecompose" -> {
                val viewJson = args.getOrNull(2)?.toString() ?: return "null"
                activity.runOnUiThread { activity.setContentView(buildView(viewJson)) }
            }
            else -> Log.w(tag, "unknown bridge kind: " + kind)
        }
        return "null"
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

    private fun buildBox(node: JSONObject, children: org.json.JSONArray?): View {
        val ctx = LinearLayout(activity).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT)
        }
        val align = node.optJSONObject("contentAlignment")?.optInt("value", 0) ?: 0
        val gravity = when (align) {
            0 -> Gravity.CENTER; 1 -> Gravity.TOP or Gravity.START; 2 -> Gravity.BOTTOM or Gravity.END
            3 -> Gravity.CENTER_VERTICAL or Gravity.START; 4 -> Gravity.CENTER_VERTICAL or Gravity.END
            5 -> Gravity.TOP; 6 -> Gravity.BOTTOM; else -> Gravity.CENTER
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

    private fun buildButton(node: JSONObject, children: org.json.JSONArray?): View {
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

    private fun extractText(children: org.json.JSONArray?): String? {
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

    private fun setModifier(view: View, modifier: Any?) {
        val m = (modifier as? org.json.JSONObject)?.optString("modifier", "") ?: ""
        if (m.isEmpty()) return
        val lp = view.layoutParams ?: ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        if (m.contains("fillMaxSize")) {
            lp.width = ViewGroup.LayoutParams.MATCH_PARENT
            lp.height = ViewGroup.LayoutParams.MATCH_PARENT
        }
        view.layoutParams = lp
    }
}
