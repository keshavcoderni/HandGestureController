package com.gesture.controller.overlay

import android.content.Context
import android.content.SharedPreferences

class CursorPreferences(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("cursor_settings", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_SIZE = "cursor_size"
        private const val KEY_TRANSPARENCY = "cursor_transparency"
        private const val KEY_COLOR = "cursor_color"
        private const val KEY_STYLE = "cursor_style"
    }

    fun saveSettings(settings: CursorSettings) {
        prefs.edit()
            .putInt(KEY_SIZE, settings.size)
            .putFloat(KEY_TRANSPARENCY, settings.transparency)
            .putString(KEY_COLOR, settings.colorHex)
            .putString(KEY_STYLE, settings.style.name)
            .apply()
    }

    fun loadSettings(): CursorSettings {
        val size = prefs.getInt(KEY_SIZE, 50)
        val transparency = prefs.getFloat(KEY_TRANSPARENCY, 1.0f)
        val color = prefs.getString(KEY_COLOR, "#EF4444") ?: "#EF4444"
        val styleName = prefs.getString(KEY_STYLE, CursorStyle.CIRCLE.name)
        val style = try {
            CursorStyle.valueOf(styleName ?: CursorStyle.CIRCLE.name)
        } catch (e: Exception) {
            CursorStyle.CIRCLE
        }
        return CursorSettings(size, transparency, color, style)
    }
}
