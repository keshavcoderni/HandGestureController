package com.gesture.controller.gesture

import com.gesture.controller.overlay.CursorSettings
import com.gesture.controller.overlay.PhoneActionExecutor

class HandGestureController {
    private var isAwake = false
    private val gestureAnalyzer = GestureAnalyzer()
    private val actionExecutor = PhoneActionExecutor()
    private val proximityDetector: ProximityDetector
    private var lastExecutedGesture = Gesture.NONE
    private var lastGestureTime = 0L
    private val gestureThrottleMs = 600L

    init {
        proximityDetector = ProximityDetector(
            onWakeDetected = { enterActiveMode() },
            onSleepDetected = { enterSleepMode() }
        )
    }

    fun getActionExecutor(): PhoneActionExecutor = actionExecutor

    fun getGestureAnalyzer(): GestureAnalyzer = gestureAnalyzer

    fun processLandmarks(landmarks: List<NormalizedLandmark>?) {
        if (landmarks == null || landmarks.isEmpty()) {
            proximityDetector.checkSleep()
            return
        }

        proximityDetector.checkProximity(landmarks)

        if (!isAwake) {
            return
        }

        // Steer cursor with index finger tip (landmark index 8)
        if (landmarks.size > 8) {
            val indexFinger = landmarks[8]
            // Invert X because front camera is mirrored (1f - x)
            actionExecutor.updateCursor(1f - indexFinger.x, indexFinger.y)
        }

        val gesture = gestureAnalyzer.analyze(landmarks)
        val now = System.currentTimeMillis()

        if (gesture != Gesture.NONE) {
            val isContinuous = gesture == Gesture.CURSOR_MOVE
            val canExecute = isContinuous || (now - lastGestureTime > gestureThrottleMs) || (gesture != lastExecutedGesture)

            if (canExecute) {
                actionExecutor.execute(gesture)
                lastExecutedGesture = gesture
                lastGestureTime = now
            }
        }
    }

    fun enterActiveMode() {
        isAwake = true
        actionExecutor.showWakeOverlay()
    }

    fun enterSleepMode() {
        isAwake = false
        actionExecutor.hideOverlays()
    }

    fun getIsAwake(): Boolean = isAwake

    fun updateSettings(settings: CursorSettings) {
        actionExecutor.updateSettings(settings)
    }

    fun release() {
        enterSleepMode()
        proximityDetector.reset()
        gestureAnalyzer.reset()
    }
}
