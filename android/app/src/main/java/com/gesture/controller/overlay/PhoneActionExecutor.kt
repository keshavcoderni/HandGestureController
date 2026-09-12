package com.gesture.controller.overlay

import com.gesture.controller.gesture.Gesture

interface ActionExecutorListener {
    fun onCursorMoved(x: Float, y: Float) {}
    fun onGestureExecuted(gesture: Gesture) {}
    fun onWakeStateChanged(isAwake: Boolean) {}
    fun onFeedbackMessage(msg: String) {}
    fun onSettingsChanged(settings: CursorSettings) {}
}

class PhoneActionExecutor {
    private val listeners = mutableSetOf<ActionExecutorListener>()
    private var handX = 0.5f
    private var handY = 0.5f
    private var isAwake = false

    fun addListener(listener: ActionExecutorListener) {
        listeners.add(listener)
    }

    fun removeListener(listener: ActionExecutorListener) {
        listeners.remove(listener)
    }

    fun updateCursor(x: Float, y: Float) {
        handX = x.coerceIn(0f, 1f)
        handY = y.coerceIn(0f, 1f)
        listeners.forEach { it.onCursorMoved(handX, handY) }
    }

    fun getCursorPosition(): Pair<Float, Float> = Pair(handX, handY)

    fun execute(gesture: Gesture) {
        if (gesture == Gesture.NONE) return
        listeners.forEach {
            it.onGestureExecuted(gesture)
            it.onFeedbackMessage(gesture.name.replace("_", " "))
        }
    }

    fun updateSettings(settings: CursorSettings) {
        listeners.forEach { it.onSettingsChanged(settings) }
    }

    fun showWakeOverlay() {
        isAwake = true
        listeners.forEach {
            it.onWakeStateChanged(true)
            it.onFeedbackMessage("SYSTEM ACTIVE")
        }
    }

    fun hideOverlays() {
        isAwake = false
        listeners.forEach {
            it.onWakeStateChanged(false)
        }
    }

    fun getWakeState(): Boolean = isAwake
}
