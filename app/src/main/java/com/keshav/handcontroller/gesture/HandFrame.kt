package com.keshav.handcontroller.gesture

import android.graphics.RectF
import com.google.mediapipe.formats.proto.LandmarkProto.NormalizedLandmark

data class HandFrame(
    val timestamp: Long,
    val landmarks: List<NormalizedLandmark>,
    val boundingBox: RectF
)
