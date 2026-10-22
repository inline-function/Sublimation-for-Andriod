package functor.sublimation.android

import android.app.Activity
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import com.google.android.material.button.MaterialButton
import org.json.JSONObject

/**
 * Sublimation 安卓壳：应用仅由一个活动构成。
 *
 * JS 端（编译产物 out.js）跑在 WebView 里，经 [DshBridge]（注入为全局 __dshAndroid）
 * 与 KT 端通信：log/toast/layout/生命周期回调、recomposion 视图更新通知。
 * 布局由 JS 端的 @view 结构体树描述——KT 端用普通 MD 视图（MaterialButton/TextView/
 * LinearLayout）动态构建，不使用 Compose。
 */
class MainActivity : Activity() {
    private val tag = "Sublimation"
    internal lateinit var web: WebView
    internal val bridge = DshBridge(this)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // WebView 先准备好，JS 端的 onCreate 回调注册要立刻可用
        web = WebView(this)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.webChromeClient = WebChromeClient()
        // 桥注入：JS 端调用 __dshAndroid(kind, args) → KT 端原生执行
        web.addJavascriptInterface(bridge, "__dshAndroid")
        setContentView(web)

        web.loadUrl("file:///android_asset/app.js.html")

        // 载入编译器产物（assets/app.js —— 由注解处理器 postCompile 阶段拷入）
        // 通知 JS：活动创建（JS 端 onCreate 注册的回调此时触发）
        bridge.dispatchLifecycle("onCreate")
    }

    override fun onStart() { super.onStart(); bridge.dispatchLifecycle("onStart") }
    override fun onResume() { super.onResume(); bridge.dispatchLifecycle("onResume") }
    override fun onPause() { super.onPause(); bridge.dispatchLifecycle("onPause") }
    override fun onStop() { super.onStop(); bridge.dispatchLifecycle("onStop") }
    override fun onDestroy() { super.onDestroy(); bridge.dispatchLifecycle("onDestroy") }
    override fun onRestart() { super.onRestart(); bridge.dispatchLifecycle("onRestart") }
}
