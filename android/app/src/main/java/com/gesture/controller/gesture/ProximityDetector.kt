package com.gesture.controller.gesture

class ProximityDetector(
    private val onWakeDetected: () -> Unit,
    private val onSleepDetected: () -> Unit
) {
    private var lastProximityTime = 0L
    private val sleepThreshold = 3000L // 3 seconds of no hand to sleep
    private var isCurrentlyAwake = false

    fun checkProximity(landmarks: List<NormalizedLandmark>): Boolean {
        if (landmarks.isEmpty()) return false
        val currentTime = System.currentTimeMillis()
        lastProximityTime = currentTime
        if (!isCurrentlyAwake) {
            isCurrentlyAwake = true
            onWakeDetected()
        }
        return true
    }

    fun checkSleep() {
        if (isCurrentlyAwake && System.currentTimeMillis() - lastProximityTime > sleepThreshold) {
            isCurrentlyAwake = false
            onSleepDetected()
        }
    }

    fun reset() {
        lastProximityTime = 0L
        isCurrentlyAwake = false
    }
}
