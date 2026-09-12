package com.keshav.handcontroller.service

import android.accessibilityservice.AccessibilityService
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import com.keshav.handcontroller.gesture.HandGestureController
import com.keshav.handcontroller.overlay.CursorPreferences
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class GestureAccessibilityService : AccessibilityService(), LifecycleOwner {
    private lateinit var handGestureController: HandGestureController
    private lateinit var cameraExecutor: ExecutorService
    private val lifecycleRegistry = LifecycleRegistry(this)
    private val CHANNEL_ID = "GestureServiceChannel"
    private val NOTIFICATION_ID = 1
    private lateinit var prefs: CursorPreferences
    private val prefListener = SharedPreferences.OnSharedPreferenceChangeListener { _, _ ->
        updateCursorFromPrefs()
    }

    override val lifecycle: Lifecycle
        get() = lifecycleRegistry

    override fun onCreate() {
        super.onCreate()
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Gesture Controller Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    private fun startForeground() {
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Hand Gesture Controller")
            .setContentText("Hand tracking is active in the background")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA)
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_RESUME)
        
        startForeground()
        Log.d("GestureService", "Service Connected and Foreground Started")
        
        prefs = CursorPreferences(this)
        // Correctly get the underlying SharedPreferences to register listener
        this.getSharedPreferences("cursor_settings", Context.MODE_PRIVATE)
            .registerOnSharedPreferenceChangeListener(prefListener)

        handGestureController = HandGestureController(this, this)
        handGestureController.initialize()
        
        // Apply initial settings
        updateCursorFromPrefs()

        cameraExecutor = Executors.newSingleThreadExecutor()
        
        if (Settings.canDrawOverlays(this)) {
            startCamera()
        } else {
            Log.e("GestureService", "Overlay permission missing")
        }
    }

    private fun updateCursorFromPrefs() {
        if (::handGestureController.isInitialized) {
            val settings = prefs.loadSettings()
            handGestureController.updateSettings(settings)
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            
            val imageAnalysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
                .build()

            imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
                try {
                    val bitmap = imageProxy.toBitmap()
                    val rotationDegrees = imageProxy.imageInfo.rotationDegrees
                    val rotatedBitmap = if (rotationDegrees != 0) {
                        val matrix = Matrix().apply { postRotate(rotationDegrees.toFloat()) }
                        Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
                    } else {
                        bitmap
                    }
                    
                    handGestureController.processBitmap(rotatedBitmap)
                } catch (e: Exception) {
                    Log.e("GestureService", "Error analyzing image", e)
                } finally {
                    imageProxy.close()
                }
            }

            val cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(this, cameraSelector, imageAnalysis)
            } catch (exc: Exception) {
                Log.e("GestureService", "Use case binding failed", exc)
            }
        }, ContextCompat.getMainExecutor(this))
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() {}

    override fun onDestroy() {
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        super.onDestroy()
        handGestureController.release()
        cameraExecutor.shutdown()
    }
}
