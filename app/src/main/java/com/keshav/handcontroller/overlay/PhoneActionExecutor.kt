package com.keshav.handcontroller.overlay

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.content.Context
import android.graphics.Path
import android.graphics.PixelFormat
import android.util.Log
import android.view.Gravity
import android.view.WindowManager
import com.keshav.handcontroller.gesture.Gesture

class PhoneActionExecutor(
    private val context: Context,
    private val service: AccessibilityService
) {
    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private val gestureOverlay = GestureOverlayView(context)
    private var isOverlayAdded = false

    private val overlayParams = WindowManager.LayoutParams(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
        PixelFormat.TRANSLUCENT
    ).apply {
        gravity = Gravity.TOP
    }

    fun execute(gesture: Gesture) {
        when (gesture) {
            Gesture.HOME_BUTTON -> service.performGlobalAction(AccessibilityService.GLOBAL_ACTION_HOME)
            Gesture.BACK_BUTTON -> service.performGlobalAction(AccessibilityService.GLOBAL_ACTION_BACK)
            Gesture.RECENT_APPS -> service.performGlobalAction(AccessibilityService.GLOBAL_ACTION_RECENTS)
            Gesture.SCROLL_UP -> injectScroll(0, -500)
            Gesture.SCROLL_DOWN -> injectScroll(0, 500)
            Gesture.TAP -> injectTap(gestureOverlay.handX, gestureOverlay.handY)
            else -> {}
        }
        showGestureFeedback(gesture)
    }

    fun updateCursor(x: Float, y: Float) {
        gestureOverlay.post {
            gestureOverlay.updateCursorPosition(x, y)
        }
    }

    fun updateSettings(settings: CursorSettings) {
        gestureOverlay.applySettings(settings)
    }

    private fun injectTap(x: Float, y: Float) {
        val displayMetrics = context.resources.displayMetrics
        val screenX = x * displayMetrics.widthPixels
        val screenY = y * displayMetrics.heightPixels

        val path = Path().apply { moveTo(screenX, screenY) }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 100))
            .build()
        service.dispatchGesture(gesture, null, null)
    }

    private fun injectScroll(deltaX: Int, deltaY: Int) {
        val displayMetrics = context.resources.displayMetrics
        val centerX = displayMetrics.widthPixels / 2f
        val centerY = displayMetrics.heightPixels / 2f
        
        val path = Path().apply {
            moveTo(centerX, centerY)
            lineTo(centerX + deltaX, centerY + deltaY)
        }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 300))
            .build()
        service.dispatchGesture(gesture, null, null)
    }

    fun showWakeOverlay() {
        gestureOverlay.post {
            try {
                if (!isOverlayAdded) {
                    windowManager.addView(gestureOverlay, overlayParams)
                    isOverlayAdded = true
                }
                gestureOverlay.showWakeAnimation()
            } catch (e: Exception) {
                Log.e("PhoneActionExecutor", "Failed to add overlay", e)
            }
        }
    }

    fun hideOverlays() {
        gestureOverlay.post {
            if (isOverlayAdded) {
                windowManager.removeView(gestureOverlay)
                isOverlayAdded = false
            }
        }
    }

    private fun showGestureFeedback(gesture: Gesture) {
        gestureOverlay.post {
            if (isOverlayAdded) {
                gestureOverlay.showFeedback(gesture.name)
            }
        }
    }
}
