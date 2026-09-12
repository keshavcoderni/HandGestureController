package com.gesture.controller

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.gesture.controller.overlay.CursorPreferences
import com.gesture.controller.overlay.CursorSettings
import com.gesture.controller.overlay.CursorStyle
import com.gesture.controller.overlay.GestureOverlayService

class MainActivity : ComponentActivity() {

    private lateinit var cursorPrefs: CursorPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        cursorPrefs = CursorPreferences(this)

        setContent {
            MaterialTheme {
                MainScreen(
                    initialSettings = cursorPrefs.loadSettings(),
                    onSaveSettings = { settings ->
                        cursorPrefs.saveSettings(settings)
                    },
                    onStartOverlay = {
                        val intent = Intent(this, GestureOverlayService::class.java)
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            startForegroundService(intent)
                        } else {
                            startService(intent)
                        }
                    },
                    onStopOverlay = {
                        stopService(Intent(this, GestureOverlayService::class.java))
                    },
                    hasOverlayPermission = {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            Settings.canDrawOverlays(this)
                        } else true
                    },
                    requestOverlayPermission = {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            val intent = Intent(
                                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                                Uri.parse("package:$packageName")
                            )
                            startActivity(intent)
                        }
                    },
                    openAccessibilitySettings = {
                        startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    initialSettings: CursorSettings,
    onSaveSettings: (CursorSettings) -> Unit,
    onStartOverlay: () -> Unit,
    onStopOverlay: () -> Unit,
    hasOverlayPermission: () -> Boolean,
    requestOverlayPermission: () -> Unit,
    openAccessibilitySettings: () -> Unit
) {
    var settings by remember { mutableStateOf(initialSettings) }
    var serviceRunning by remember { mutableStateOf(false) }

    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        // Handle camera permission result
    }

    val presetColors = listOf(
        "#EF4444" to "Red",
        "#3B82F6" to "Blue",
        "#10B981" to "Green",
        "#F59E0B" to "Yellow",
        "#EC4899" to "Magenta",
        "#06B6D4" to "Cyan"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Hand Controller Pro", fontSize = 18.sp) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Live Cursor Preview Box
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Cursor Preview", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(12.dp))
                    Box(
                        modifier = Modifier
                            .size(120.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0xFFE2E8F0)),
                        contentAlignment = Alignment.Center
                    ) {
                        val parsedColor = try {
                            Color(android.graphics.Color.parseColor(settings.colorHex))
                        } catch (e: Exception) {
                            Color.Red
                        }

                        when (settings.style) {
                            CursorStyle.CIRCLE -> {
                                Box(
                                    modifier = Modifier
                                        .size(settings.size.dp)
                                        .clip(CircleShape)
                                        .background(parsedColor)
                                        .alpha(settings.transparency)
                                )
                            }
                            CursorStyle.SQUARE -> {
                                Box(
                                    modifier = Modifier
                                        .size(settings.size.dp)
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(parsedColor)
                                        .alpha(settings.transparency)
                                )
                            }
                            CursorStyle.RING -> {
                                Box(
                                    modifier = Modifier
                                        .size(settings.size.dp)
                                        .border(4.dp, parsedColor, CircleShape)
                                        .alpha(settings.transparency)
                                )
                            }
                            CursorStyle.DOT -> {
                                Box(
                                    modifier = Modifier
                                        .size(12.dp)
                                        .clip(CircleShape)
                                        .background(parsedColor)
                                        .alpha(settings.transparency)
                                )
                            }
                        }
                    }
                }
            }

            // Size Control
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Cursor Size: ${settings.size} dp")
                    Slider(
                        value = settings.size.toFloat(),
                        onValueChange = {
                            settings = settings.copy(size = it.toInt())
                            onSaveSettings(settings)
                        },
                        valueRange = 20f..150f
                    )
                }
            }

            // Transparency Control
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Transparency: ${(settings.transparency * 100).toInt()}%")
                    Slider(
                        value = settings.transparency,
                        onValueChange = {
                            settings = settings.copy(transparency = it)
                            onSaveSettings(settings)
                        },
                        valueRange = 0.1f..1.0f
                    )
                }
            }

            // Style Selector
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Cursor Style", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        CursorStyle.values().forEach { style ->
                            FilterChip(
                                selected = settings.style == style,
                                onClick = {
                                    settings = settings.copy(style = style)
                                    onSaveSettings(settings)
                                },
                                label = { Text(style.name) }
                            )
                        }
                    }
                }
            }

            // Color Selector
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Cursor Color", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        presetColors.forEach { (hex, _) ->
                            val color = try {
                                Color(android.graphics.Color.parseColor(hex))
                            } catch (e: Exception) {
                                Color.Red
                            }
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(color)
                                    .clickable {
                                        settings = settings.copy(colorHex = hex)
                                        onSaveSettings(settings)
                                    }
                                    .then(
                                        if (settings.colorHex == hex) {
                                            Modifier.border(3.dp, Color.Black, CircleShape)
                                        } else Modifier
                                    )
                            )
                        }
                    }
                }
            }

            // Service & Permissions Controls
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text("Permissions & Service Control", style = MaterialTheme.typography.titleMedium)

                    Button(
                        onClick = {
                            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Grant Camera Permission")
                    }

                    Button(
                        onClick = { requestOverlayPermission() },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Grant Overlay (Display Over Apps)")
                    }

                    Button(
                        onClick = { openAccessibilitySettings() },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Enable Accessibility Service")
                    }

                    Divider(modifier = Modifier.padding(vertical = 4.dp))

                    Button(
                        onClick = {
                            if (!serviceRunning) {
                                onStartOverlay()
                                serviceRunning = true
                            } else {
                                onStopOverlay()
                                serviceRunning = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (serviceRunning) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(if (serviceRunning) "Stop Touchless Service" else "Start Touchless Service")
                    }
                }
            }
        }
    }
}
