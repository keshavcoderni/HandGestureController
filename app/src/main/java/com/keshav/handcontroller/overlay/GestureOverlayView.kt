package com.keshav.handcontroller.overlay

import android.content.Context
import android.graphics.Color
import android.view.View
import android.widget.FrameLayout
import android.widget.TextView
import android.graphics.drawable.GradientDrawable

class GestureOverlayView(context: Context) : FrameLayout(context) {
    private val cursorView: View
    private val feedbackText: TextView
    private var currentSettings = CursorSettings()
    var handX: Float = 0f
    var handY: Float = 0f

    init {
        setBackgroundColor(Color.TRANSPARENT)
        
        cursorView = View(context)
        applySettings(currentSettings)
        addView(cursorView)

        feedbackText = TextView(context).apply {
            setTextColor(Color.GREEN)
            textSize = 20f
            visibility = View.GONE
            layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT).apply {
                setMargins(50, 150, 0, 0)
            }
        }
        addView(feedbackText)
    }

    fun applySettings(settings: CursorSettings) {
        currentSettings = settings
        post {
            val sizePx = (settings.size * resources.displayMetrics.density).toInt()
            cursorView.layoutParams = LayoutParams(sizePx, sizePx)
            cursorView.alpha = settings.transparency
            
            cursorView.background = GradientDrawable().apply {
                when (settings.style) {
                    CursorStyle.CIRCLE, CursorStyle.RING -> shape = GradientDrawable.OVAL
                    CursorStyle.SQUARE -> shape = GradientDrawable.RECTANGLE
                    CursorStyle.DOT -> shape = GradientDrawable.OVAL
                }
                
                if (settings.style == CursorStyle.RING) {
                    setColor(Color.TRANSPARENT)
                    setStroke(8, settings.color)
                } else if (settings.style == CursorStyle.DOT) {
                    setColor(settings.color)
                    setStroke(2, Color.WHITE)
                    // Smaller internal dot logic could be complex, keeping it simple
                } else {
                    setColor(settings.color)
                    setStroke(5, Color.WHITE)
                }
            }
        }
    }

    fun updateCursorPosition(x: Float, y: Float) {
        handX = x
        handY = y
        cursorView.translationX = x * width - (cursorView.width / 2)
        cursorView.translationY = y * height - (cursorView.height / 2)
        cursorView.visibility = View.VISIBLE
    }

    fun showFeedback(text: String) {
        feedbackText.text = text
        feedbackText.visibility = View.VISIBLE
        feedbackText.postDelayed({ feedbackText.visibility = View.GONE }, 1500)
    }

    fun showWakeAnimation() {
        showFeedback("SYSTEM ACTIVE")
        cursorView.visibility = View.VISIBLE
    }
}
