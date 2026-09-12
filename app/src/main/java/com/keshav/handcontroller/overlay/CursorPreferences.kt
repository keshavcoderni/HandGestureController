package com.keshav.handcontroller.overlay

import android.content.Context
import android.graphics.Color

class CursorPreferences(context: Context) {
    private val prefs = context.getSharedPreferences("cursor_settings", Context.MODE_PRIVATE)

    fun saveSettings(settings: CursorSettings) {
        prefs.edit().apply {
            putInt("size", settings.size)
            putFloat("transparency", settings.transparency)
            putInt("color", settings.color)
            putString("style", settings.style.name)
            apply()
        }
    }

    fun loadSettings(): CursorSettings {
        return CursorSettings(
            size = prefs.getInt("size", 50),
            transparency = prefs.getFloat("transparency", 1.0f),
            color = prefs.getInt("color", Color.RED),
            style = CursorStyle.valueOf(prefs.getString("style", CursorStyle.CIRCLE.name)!!)
        )
    }
}
