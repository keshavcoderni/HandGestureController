package com.keshav.handcontroller.gesture

import android.content.Context
import android.graphics.SurfaceTexture
import com.google.mediapipe.formats.proto.LandmarkProto.NormalizedLandmarkList
import com.google.mediapipe.solutions.hands.Hands
import com.google.mediapipe.solutions.hands.HandsOptions
import com.google.mediapipe.solutions.hands.HandsResult
import com.keshav.handcontroller.overlay.PhoneActionExecutor
import com.keshav.handcontroller.service.GestureAccessibilityService

class HandGestureController(
    private val context: Context,
    private val accessibilityService: GestureAccessibilityService
) {
    private lateinit var hands: Hands
    private var isAwake = false
    private val gestureAnalyzer = GestureAnalyzer()
    private val actionExecutor = PhoneActionExecutor(context, accessibilityService)

    private val proximityDetector = ProximityDetector(
        onWakeDetected = { enterActiveMode() },
        onSleepDetected = { enterSleepMode() }
    )

    fun initialize() {
        try {
            val options = HandsOptions.builder()
                .setStaticImageMode(false)
                .setMaxNumHands(1)
                .setRunOnGpu(false) // Changed to false for better compatibility
                .setMinDetectionConfidence(0.7f)
                .setMinTrackingConfidence(0.5f)
                .build()

            hands = Hands(context, options)
            hands.setResultListener { result: HandsResult ->
                if (result.multiHandLandmarks().isNotEmpty()) {
                    processHandLandmarks(result.multiHandLandmarks()[0])
                } else {
                    proximityDetector.checkSleep()
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("HandGestureController", "Initialization failed", e)
        }
    }

    private fun processHandLandmarks(landmarks: NormalizedLandmarkList) {
        if (!isAwake) {
            if (proximityDetector.checkProximity(landmarks)) {
                enterActiveMode()
            }
            return
        }

        // Always update cursor position if index finger is detected
        val indexFinger = landmarks.landmarkList[8]
        // Invert X because the front camera is mirrored
        actionExecutor.updateCursor(1f - indexFinger.x, indexFinger.y)

        val gesture = gestureAnalyzer.analyze(landmarks)
        if (gesture != Gesture.NONE) {
            actionExecutor.execute(gesture)
        }
    }

    private fun enterActiveMode() {
        isAwake = true
        actionExecutor.showWakeOverlay()
    }

    private fun enterSleepMode() {
        isAwake = false
        actionExecutor.hideOverlays()
    }

    fun startProcessing(surfaceTexture: SurfaceTexture) {
        // In a real implementation, you'd connect the camera to MediaPipe via the surface
        // For the Solution API, it often handles its own camera or takes bitmaps/textures
    }

    fun processBitmap(bitmap: android.graphics.Bitmap) {
        hands.send(bitmap, System.currentTimeMillis())
    }

    fun updateSettings(settings: com.keshav.handcontroller.overlay.CursorSettings) {
        actionExecutor.updateSettings(settings)
    }

    fun release() {
        hands.close()
    }
}
