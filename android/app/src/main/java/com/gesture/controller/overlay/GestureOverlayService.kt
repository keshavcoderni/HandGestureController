package com.gesture.controller.overlay

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import com.gesture.controller.gesture.Gesture
import com.gesture.controller.service.GestureAccessibilityService

class GestureOverlayService : Service(), ActionExecutorListener {

    private var windowManager: WindowManager? = null
    private var overlayView: CursorOverlayView? = null
    private var currentSettings = CursorSettings()

    override fun onCreate() {
        super.onCreate()
        startForegroundServiceNotification()
        setupOverlay()
    }

    private fun startForegroundServiceNotification() {
        val channelId = "gesture_overlay_service"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Hand Gesture Overlay",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val notification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, channelId)
                .setContentTitle("Hand Gesture Controller Active")
                .setContentText("Touchless cursor and gesture tracking are running")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .build()
        } else {
            Notification.Builder(this)
                .setContentTitle("Hand Gesture Controller Active")
                .setContentText("Touchless cursor and gesture tracking are running")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .build()
        }

        startForeground(101, notification)
    }

    private fun setupOverlay() {
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
        }

        overlayView = CursorOverlayView(this)
        windowManager?.addView(overlayView, params)
    }

    override fun onCursorMoved(x: Float, y: Float) {
        overlayView?.updateCursorPosition(x, y)
    }

    override fun onGestureExecuted(gesture: Gesture) {
        val screenPos = overlayView?.getScreenCoordinates() ?: Pair(0f, 0f)
        val accessibilityService = GestureAccessibilityService.instance

        when (gesture) {
            Gesture.HOME_BUTTON, Gesture.BACK_BUTTON, Gesture.RECENT_APPS -> {
                accessibilityService?.performGlobal(gesture)
            }
            Gesture.TAP -> {
                accessibilityService?.dispatchClick(screenPos.first, screenPos.second)
            }
            Gesture.SCROLL_UP -> {
                accessibilityService?.dispatchScroll(
                    screenPos.first, screenPos.second + 300f,
                    screenPos.first, screenPos.second - 300f
                )
            }
            Gesture.SCROLL_DOWN -> {
                accessibilityService?.dispatchScroll(
                    screenPos.first, screenPos.second - 300f,
                    screenPos.first, screenPos.second + 300f
                )
            }
            else -> Unit
        }
    }

    override fun onSettingsChanged(settings: CursorSettings) {
        currentSettings = settings
        overlayView?.updateSettings(settings)
    }

    override fun onWakeStateChanged(isAwake: Boolean) {
        overlayView?.setWakeState(isAwake)
    }

    override fun onFeedbackMessage(msg: String) {
        overlayView?.showFeedback(msg)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (overlayView != null) {
            windowManager?.removeView(overlayView)
            overlayView = null
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // Inner Canvas view for drawing cursor
    private class CursorOverlayView(context: Context) : View(context) {
        private var cursorX = 0.5f
        private var cursorY = 0.5f
        private var isAwake = true
        private var feedbackText = ""
        private var feedbackTime = 0L
        private var settings = CursorSettings()

        private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            textSize = 40f
            textAlign = Paint.Align.CENTER
        }

        fun updateCursorPosition(x: Float, y: Float) {
            cursorX = x
            cursorY = y
            postInvalidate()
        }

        fun getScreenCoordinates(): Pair<Float, Float> {
            return Pair(cursorX * width, cursorY * height)
        }

        fun updateSettings(newSettings: CursorSettings) {
            settings = newSettings
            postInvalidate()
        }

        fun setWakeState(awake: Boolean) {
            isAwake = awake
            postInvalidate()
        }

        fun showFeedback(msg: String) {
            feedbackText = msg
            feedbackTime = System.currentTimeMillis()
            postInvalidate()
        }

        override fun onDraw(canvas: Canvas) {
            super.onDraw(canvas)
            if (!isAwake) return

            val cx = cursorX * width
            val cy = cursorY * height
            val radius = settings.size.toFloat()
            val parsedColor = try {
                Color.parseColor(settings.colorHex)
            } catch (e: Exception) {
                Color.RED
            }
            val alphaInt = (settings.transparency * 255).toInt().coerceIn(0, 255)

            paint.color = parsedColor
            paint.alpha = alphaInt

            when (settings.style) {
                CursorStyle.CIRCLE -> {
                    paint.style = Paint.Style.FILL
                    canvas.drawCircle(cx, cy, radius, paint)
                }
                CursorStyle.RING -> {
                    paint.style = Paint.Style.STROKE
                    paint.strokeWidth = 6f
                    canvas.drawCircle(cx, cy, radius, paint)
                }
                CursorStyle.SQUARE -> {
                    paint.style = Paint.Style.FILL
                    canvas.drawRect(cx - radius, cy - radius, cx + radius, cy + radius, paint)
                }
                CursorStyle.DOT -> {
                    paint.style = Paint.Style.FILL
                    canvas.drawCircle(cx, cy, 12f, paint)
                }
            }

            // Draw HUD feedback if recent
            if (System.currentTimeMillis() - feedbackTime < 1500 && feedbackText.isNotEmpty()) {
                val bgPaint = Paint().apply {
                    color = Color.argb(180, 0, 0, 0)
                }
                canvas.drawRoundRect(
                    width / 2f - 200f, 100f,
                    width / 2f + 200f, 200f,
                    20f, 20f, bgPaint
                )
                canvas.drawText(feedbackText, width / 2f, 160f, textPaint)
            }
        }
    }
}
