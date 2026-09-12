package com.keshav.handcontroller.gesture

import com.google.mediapipe.formats.proto.LandmarkProto.NormalizedLandmarkList

class ProximityDetector(
    private val onWakeDetected: () -> Unit,
    private val onSleepDetected: () -> Unit
) {
    private var lastProximityTime = 0L
    private val SLEEP_THRESHOLD = 3000L // 3 seconds of no hand to sleep

    fun checkProximity(landmarks: NormalizedLandmarkList): Boolean {
        // Simple heuristic: if hand is detected, it's proximate enough to wake
        // Real implementation could check the size of the bounding box or Z-coordinate
        val currentTime = System.currentTimeMillis()
        lastProximityTime = currentTime
        return true
    }

    fun checkSleep() {
        if (System.currentTimeMillis() - lastProximityTime > SLEEP_THRESHOLD) {
            onSleepDetected()
        }
    }
}
