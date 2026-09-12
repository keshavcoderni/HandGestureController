package com.gesture.controller.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.view.accessibility.AccessibilityEvent
import com.gesture.controller.gesture.Gesture

class GestureAccessibilityService : AccessibilityService() {

    companion object {
        var instance: GestureAccessibilityService? = null
            private set
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Accessibility event processing if needed
    }

    override fun onInterrupt() {
        // Called when the service is interrupted
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    fun performGlobal(gesture: Gesture): Boolean {
        return when (gesture) {
            Gesture.HOME_BUTTON -> performGlobalAction(GLOBAL_ACTION_HOME)
            Gesture.BACK_BUTTON -> performGlobalAction(GLOBAL_ACTION_BACK)
            Gesture.RECENT_APPS -> performGlobalAction(GLOBAL_ACTION_RECENTS)
            else -> false
        }
    }

    fun dispatchClick(screenX: Float, screenY: Float) {
        val clickPath = Path().apply {
            moveTo(screenX, screenY)
        }
        val stroke = GestureDescription.StrokeDescription(clickPath, 0, 50)
        val gestureDesc = GestureDescription.Builder().addStroke(stroke).build()
        dispatchGesture(gestureDesc, null, null)
    }

    fun dispatchScroll(startX: Float, startY: Float, endX: Float, endY: Float) {
        val scrollPath = Path().apply {
            moveTo(startX, startY)
            lineTo(endX, endY)
        }
        val stroke = GestureDescription.StrokeDescription(scrollPath, 0, 250)
        val gestureDesc = GestureDescription.Builder().addStroke(stroke).build()
        dispatchGesture(gestureDesc, null, null)
    }
}
