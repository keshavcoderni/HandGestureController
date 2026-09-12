import { CursorSettings, CursorStyle } from '../types';

const STORAGE_KEY = 'cursor_settings';

export const DEFAULT_CURSOR_SETTINGS: CursorSettings = {
  size: 50,
  transparency: 1.0,
  color: '#EF4444', // Color.RED equivalent
  style: CursorStyle.CIRCLE,
};

export class CursorPreferences {
  saveSettings(settings: CursorSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save cursor preferences', e);
    }
  }

  loadSettings(): CursorSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          size: typeof parsed.size === 'number' ? parsed.size : DEFAULT_CURSOR_SETTINGS.size,
          transparency: typeof parsed.transparency === 'number' ? parsed.transparency : DEFAULT_CURSOR_SETTINGS.transparency,
          color: typeof parsed.color === 'string' ? parsed.color : DEFAULT_CURSOR_SETTINGS.color,
          style: Object.values(CursorStyle).includes(parsed.style) ? parsed.style : DEFAULT_CURSOR_SETTINGS.style,
        };
      }
    } catch (e) {
      console.error('Failed to load cursor preferences', e);
    }
    return DEFAULT_CURSOR_SETTINGS;
  }
}
