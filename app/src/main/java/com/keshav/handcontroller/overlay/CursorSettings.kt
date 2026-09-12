package com.keshav.handcontroller.overlay

import android.graphics.Color

enum class CursorStyle {
    CIRCLE, SQUARE, RING, DOT
}

data class CursorSettings(
    val size: Int = 50,
    val transparency: Float = 1.0f,
    val color: Int = Color.RED,
    val style: CursorStyle = CursorStyle.CIRCLE
)
