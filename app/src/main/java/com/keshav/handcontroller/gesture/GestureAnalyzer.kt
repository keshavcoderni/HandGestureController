package com.keshav.handcontroller.gesture

import android.graphics.RectF
import com.google.mediapipe.formats.proto.LandmarkProto.NormalizedLandmark
import com.google.mediapipe.formats.proto.LandmarkProto.NormalizedLandmarkList
import org.apache.commons.collections4.queue.CircularFifoQueue
import kotlin.math.pow
import kotlin.math.sqrt

class GestureAnalyzer {
    private val history = CircularFifoQueue<HandFrame>(10)

    fun analyze(landmarks: NormalizedLandmarkList): Gesture {
        val frame = HandFrame(
            timestamp = System.currentTimeMillis(),
            landmarks = landmarks.landmarkList,
            boundingBox = calculateBoundingBox(landmarks)
        )
        history.add(frame)

        val list = landmarks.landmarkList
        return when {
            isFist(list) -> Gesture.HOME_BUTTON
            isOpenPalm(list) -> Gesture.BACK_BUTTON
            isSwipeLeft(list) -> Gesture.SWIPE_LEFT
            isSwipeRight(list) -> Gesture.SWIPE_RIGHT

            isScrollUp(list) -> Gesture.SCROLL_UP
            isScrollDown(list) -> Gesture.SCROLL_DOWN

            isPoint(list) -> Gesture.CURSOR_MOVE
            isPinch(list) -> Gesture.TAP

            isVolumeUp(list) -> Gesture.VOLUME_UP
            else -> Gesture.NONE
        }
    }

    private fun calculateBoundingBox(landmarks: NormalizedLandmarkList): RectF {
        var minX = 1f
        var minY = 1f
        var maxX = 0f
        var maxY = 0f
        for (landmark in landmarks.landmarkList) {
            if (landmark.x < minX) minX = landmark.x
            if (landmark.y < minY) minY = landmark.y
            if (landmark.x > maxX) maxX = landmark.x
            if (landmark.y > maxY) maxY = landmark.y
        }
        return RectF(minX, minY, maxX, maxY)
    }

    private fun isFist(landmarks: List<NormalizedLandmark>): Boolean {
        val wrist = landmarks[0]
        val tips = listOf(8, 12, 16, 20)
        return tips.all { tipIndex ->
            val tip = landmarks[tipIndex]
            dist(tip, wrist) < 0.15f
        }
    }

    private fun isOpenPalm(landmarks: List<NormalizedLandmark>): Boolean {
        val wrist = landmarks[0]
        val tips = listOf(8, 12, 16, 20)
        return tips.all { tipIndex ->
            val tip = landmarks[tipIndex]
            dist(tip, wrist) > 0.25f
        }
    }

    private fun isScrollUp(landmarks: List<NormalizedLandmark>): Boolean {
        if (history.size < 5) return false
        val recent = history.toList().takeLast(5)
        val palmY = recent.map { it.landmarks[9].y }
        return palmY.zipWithNext().all { (prev, curr) -> curr < prev - 0.01f }
    }

    private fun isScrollDown(landmarks: List<NormalizedLandmark>): Boolean {
        if (history.size < 5) return false
        val recent = history.toList().takeLast(5)
        val palmY = recent.map { it.landmarks[9].y }
        return palmY.zipWithNext().all { (prev, curr) -> curr > prev + 0.01f }
    }

    private fun isPinch(landmarks: List<NormalizedLandmark>): Boolean {
        val thumbTip = landmarks[4]
        val indexTip = landmarks[8]
        return dist(thumbTip, indexTip) < 0.05f
    }

    private fun isPoint(landmarks: List<NormalizedLandmark>): Boolean {
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

    private fun isVolumeUp(landmarks: List<NormalizedLandmark>): Boolean {
        val thumbTip = landmarks[4]
        val thumbIP = landmarks[3]
        return thumbTip.y < thumbIP.y - 0.05f
    }

    private fun isSwipeLeft(landmarks: List<NormalizedLandmark>): Boolean {
        if (history.size < 5) return false
        val recent = history.toList().takeLast(5)
        val palmX = recent.map { it.landmarks[9].x }
        return palmX.zipWithNext().all { (prev, curr) -> curr < prev - 0.01f }
    }

    private fun isSwipeRight(landmarks: List<NormalizedLandmark>): Boolean {
        if (history.size < 5) return false
        val recent = history.toList().takeLast(5)
        val palmX = recent.map { it.landmarks[9].x }
        return palmX.zipWithNext().all { (prev, curr) -> curr > prev + 0.01f }
    }

    private fun dist(a: NormalizedLandmark, b: NormalizedLandmark): Float {
        return sqrt((a.x - b.x).pow(2) + (a.y - b.y).pow(2))
    }
}
