package com.gesture.controller.gesture

import kotlin.math.pow
import kotlin.math.sqrt

class GestureAnalyzer {
    private val history = mutableListOf<HandFrame>()
    private val maxHistory = 10

    fun analyze(landmarks: List<NormalizedLandmark>): Gesture {
        if (landmarks.size < 21) {
            return Gesture.NONE
        }

        val frame = HandFrame(
            timestamp = System.currentTimeMillis(),
            landmarks = landmarks,
            boundingBox = calculateBoundingBox(landmarks)
        )

        history.add(frame)
        if (history.size > maxHistory) {
            history.removeAt(0)
        }

        if (isFist(landmarks)) return Gesture.HOME_BUTTON
        if (isOpenPalm(landmarks)) return Gesture.BACK_BUTTON
        if (isSwipeLeft()) return Gesture.SWIPE_LEFT
        if (isSwipeRight()) return Gesture.SWIPE_RIGHT

        if (isScrollUp()) return Gesture.SCROLL_UP
        if (isScrollDown()) return Gesture.SCROLL_DOWN

        if (isPoint(landmarks)) return Gesture.CURSOR_MOVE
        if (isPinch(landmarks)) return Gesture.TAP

        if (isVolumeUp(landmarks)) return Gesture.VOLUME_UP

        return Gesture.NONE
    }

    fun reset() {
        history.clear()
    }

    private fun calculateBoundingBox(landmarks: List<NormalizedLandmark>): RectF {
        var minX = 1f
        var minY = 1f
        var maxX = 0f
        var maxY = 0f

        for (lm in landmarks) {
            if (lm.x < minX) minX = lm.x
            if (lm.y < minY) minY = lm.y
            if (lm.x > maxX) maxX = lm.x
            if (lm.y > maxY) maxY = lm.y
        }

        return RectF(minX, minY, maxX, maxY)
    }

    fun isFist(landmarks: List<NormalizedLandmark>): Boolean {
        val wrist = landmarks[0]
        val tips = listOf(8, 12, 16, 20)
        return tips.all { tipIdx -> dist(landmarks[tipIdx], wrist) < 0.15f }
    }

    fun isOpenPalm(landmarks: List<NormalizedLandmark>): boolean {
        val wrist = landmarks[0]
        val tips = listOf(8, 12, 16, 20)
        return tips.all { tipIdx -> dist(landmarks[tipIdx], wrist) > 0.25f }
    }

    private fun isScrollUp(): Boolean {
        if (history.size < 5) return false
        val recent = history.takeLast(5)
        val palmY = recent.map { it.landmarks.getOrNull(9)?.y ?: 0f }
        for (i in 1 until palmY.size) {
            if (palmY[i] >= palmY[i - 1] - 0.01f) return false
        }
        return true
    }

    private fun isScrollDown(): Boolean {
        if (history.size < 5) return false
        val recent = history.takeLast(5)
        val palmY = recent.map { it.landmarks.getOrNull(9)?.y ?: 0f }
        for (i in 1 until palmY.size) {
            if (palmY[i] <= palmY[i - 1] + 0.01f) return false
        }
        return true
    }

    fun isPinch(landmarks: List<NormalizedLandmark>): Boolean {
        val thumbTip = landmarks[4]
        val indexTip = landmarks[8]
        return dist(thumbTip, indexTip) < 0.05f
    }

    fun isPoint(landmarks: List<NormalizedLandmark>): Boolean {
        val indexExtended = isFingerExtended(landmarks, 8)
        val middleCurled = !isFingerExtended(landmarks, 12)
        val ringCurled = !isFingerExtended(landmarks, 16)
        val pinkyCurled = !isFingerExtended(landmarks, 20)
        return indexExtended && middleCurled && ringCurled && pinkyCurled
    }

    private fun isFingerExtended(landmarks: List<NormalizedLandmark>, tipIndex: Int): Boolean {
        val wrist = landmarks[0]
        val tip = landmarks[tipIndex]
        return dist(tip, wrist) > 0.2f
    }

    fun isVolumeUp(landmarks: List<NormalizedLandmark>): Boolean {
        val thumbTip = landmarks[4]
        val thumbIP = landmarks[3]
        return thumbTip.y < thumbIP.y - 0.05f
    }

    private fun isSwipeLeft(): Boolean {
        if (history.size < 5) return false
        val recent = history.takeLast(5)
        val palmX = recent.map { it.landmarks.getOrNull(9)?.x ?: 0f }
        for (i in 1 until palmX.size) {
            if (palmX[i] >= palmX[i - 1] - 0.01f) return false
        }
        return true
    }

    private fun isSwipeRight(): Boolean {
        if (history.size < 5) return false
        val recent = history.takeLast(5)
        val palmX = recent.map { it.landmarks.getOrNull(9)?.x ?: 0f }
        for (i in 1 until palmX.size) {
            if (palmX[i] <= palmX[i - 1] + 0.01f) return false
        }
        return true
    }

    private fun dist(a: NormalizedLandmark, b: NormalizedLandmark): Float {
        return sqrt((a.x - b.x).pow(2) + (a.y - b.y).pow(2))
    }
}
