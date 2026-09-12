package com.gesture.controller.gesture

enum class Gesture {
    NONE,
    HOME_BUTTON,
    BACK_BUTTON,
    RECENT_APPS,
    APP_SWITCH,
    SCROLL_UP,
    SCROLL_DOWN,
    CURSOR_MOVE,
    TAP,
    DOUBLE_TAP,
    LONG_PRESS,
    VOLUME_UP,
    VOLUME_DOWN,
    BRIGHTNESS_UP,
    BRIGHTNESS_DOWN,
    WAKE_LOCK,
    SCREENSHOT,
    SWIPE_LEFT,
    SWIPE_RIGHT
}

data class NormalizedLandmark(
    val x: Float,
    val y: Float,
    val z: Float = 0f
)

data class RectF(
    val left: Float,
    val top: Float,
    val right: Float,
    val bottom: Float
)

data class HandFrame(
    val timestamp: Long,
    val landmarks: List<NormalizedLandmark>,
    val boundingBox: RectF
)
