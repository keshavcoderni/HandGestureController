package com.keshav.handcontroller

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.keshav.handcontroller.overlay.CursorPreferences
import com.keshav.handcontroller.overlay.CursorSettings
import com.keshav.handcontroller.overlay.CursorStyle
import com.keshav.handcontroller.ui.theme.HandGestureControllerTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            HandGestureControllerTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    SetupScreen()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SetupScreen() {
    val context = LocalContext.current
    val prefs = remember { CursorPreferences(context) }
    var cursorSettings by remember { mutableStateOf(prefs.loadSettings()) }
    
    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Hand Controller Pro", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Permission Section
            PermissionCard(context)

            Spacer(modifier = Modifier.height(24.dp))

            // Preview Section
            Text("Cursor Preview", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(16.dp))
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center
            ) {
                CursorPreview(cursorSettings)
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Customization Controls
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Customize Appearance", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Spacer(modifier = Modifier.height(16.dp))

                    // Size Slider
                    Text("Size: ${cursorSettings.size}")
                    Slider(
                        value = cursorSettings.size.toFloat(),
                        onValueChange = { 
                            cursorSettings = cursorSettings.copy(size = it.toInt())
                            prefs.saveSettings(cursorSettings)
                        },
                        valueRange = 20f..150f
                    )

                    // Transparency Slider
                    Text("Transparency: ${(cursorSettings.transparency * 100).toInt()}%")
                    Slider(
                        value = cursorSettings.transparency,
                        onValueChange = { 
                            cursorSettings = cursorSettings.copy(transparency = it)
                            prefs.saveSettings(cursorSettings)
                        },
                        valueRange = 0.1f..1.0f
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Style Selector
                    Text("Cursor Style")
                    Spacer(modifier = Modifier.height(8.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        items(CursorStyle.values()) { style ->
                            val isSelected = cursorSettings.style == style
                            Box(
                                modifier = Modifier
                                    .size(60.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondaryContainer)
                                    .clickable {
                                        cursorSettings = cursorSettings.copy(style = style)
                                        prefs.saveSettings(cursorSettings)
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    style.name.take(1), 
                                    color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSecondaryContainer
                                )
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Color Picker (Simplified)
                    Text("Color Theme")
                    Spacer(modifier = Modifier.height(8.dp))
                    val colors = listOf(androidx.compose.ui.graphics.Color.Red, androidx.compose.ui.graphics.Color.Blue, androidx.compose.ui.graphics.Color.Green, androidx.compose.ui.graphics.Color.Yellow, androidx.compose.ui.graphics.Color.Magenta, androidx.compose.ui.graphics.Color.Cyan)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        items(colors) { color ->
                            ColorCircle(
                                color = color,
                                isSelected = cursorSettings.color == color.toArgb(),
                                onClick = {
                                    cursorSettings = cursorSettings.copy(color = color.toArgb())
                                    prefs.saveSettings(cursorSettings)
                                }
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                "Tip: Calibration works best in good lighting.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.outline
            )
        }
    }
}

@Composable
fun CursorPreview(settings: CursorSettings) {
    val color = androidx.compose.ui.graphics.Color(settings.color)
    Box(
        modifier = Modifier
            .size(settings.size.dp / 2) // Scaled for preview
            .alpha(settings.transparency)
            .then(
                when (settings.style) {
                    CursorStyle.CIRCLE -> Modifier.background(color, androidx.compose.foundation.shape.CircleShape).border(2.dp, androidx.compose.ui.graphics.Color.White, androidx.compose.foundation.shape.CircleShape)
                    CursorStyle.SQUARE -> Modifier.background(color, RoundedCornerShape(4.dp)).border(2.dp, androidx.compose.ui.graphics.Color.White, RoundedCornerShape(4.dp))
                    CursorStyle.RING -> Modifier.border(4.dp, color, androidx.compose.foundation.shape.CircleShape)
                    CursorStyle.DOT -> Modifier.size(settings.size.dp / 4).background(color, androidx.compose.foundation.shape.CircleShape).border(1.dp, androidx.compose.ui.graphics.Color.White, androidx.compose.foundation.shape.CircleShape)
                }
            )
    )
}

@Composable
fun PermissionCard(context: android.content.Context) {
    val powerManager = context.getSystemService(android.content.Context.POWER_SERVICE) as android.os.PowerManager
    
    var hasCamera by remember { mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) }
    var hasOverlay by remember { mutableStateOf(Settings.canDrawOverlays(context)) }
    var isBatteryIgnored by remember { mutableStateOf(powerManager.isIgnoringBatteryOptimizations(context.packageName)) }

    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { hasCamera = it }

    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("System Permissions", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Spacer(modifier = Modifier.height(12.dp))
            
            PermissionRow("Camera Access", hasCamera) { launcher.launch(Manifest.permission.CAMERA) }
            PermissionRow("Overlay Permission", hasOverlay) { context.startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)) }
            PermissionRow("Battery Optimization", isBatteryIgnored) { 
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = android.net.Uri.parse("package:${context.packageName}")
                }
                context.startActivity(intent)
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = { context.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Open Accessibility Settings")
            }
        }
    }
}

@Composable
fun PermissionRow(label: String, isGranted: Boolean, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, style = MaterialTheme.typography.bodyLarge)
        if (isGranted) {
            Text("✅", color = androidx.compose.ui.graphics.Color.Green)
        } else {
            TextButton(onClick = onClick) { Text("Grant") }
        }
    }
}

@Composable
fun ColorCircle(color: androidx.compose.ui.graphics.Color, isSelected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(40.dp)
            .clip(androidx.compose.foundation.shape.CircleShape)
            .background(color)
            .border(
                width = if (isSelected) 3.dp else 0.dp,
                color = MaterialTheme.colorScheme.outline,
                shape = androidx.compose.foundation.shape.CircleShape
            )
            .clickable(onClick = onClick)
    )
}
