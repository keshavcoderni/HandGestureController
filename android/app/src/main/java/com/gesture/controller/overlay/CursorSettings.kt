package com.gesture.controller.overlay

enum class CursorStyle {
    CIRCLE,
    SQUARE,
    RING,
    DOT
}

data class CursorSettings(
    val size: Int = 50, // 20 to 150
    val transparency: Float = 1.0f, // 0.1 to 1.0
    val colorHex: String = "#EF4444", // Default Red
    val style: CursorStyle = CursorStyle.CIRCLE
)
