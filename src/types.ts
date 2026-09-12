export enum Gesture {
  NONE = 'NONE',
  HOME_BUTTON = 'HOME_BUTTON',
  BACK_BUTTON = 'BACK_BUTTON',
  RECENT_APPS = 'RECENT_APPS',
  APP_SWITCH = 'APP_SWITCH',
  SCROLL_UP = 'SCROLL_UP',
  SCROLL_DOWN = 'SCROLL_DOWN',
  CURSOR_MOVE = 'CURSOR_MOVE',
  TAP = 'TAP',
  DOUBLE_TAP = 'DOUBLE_TAP',
  LONG_PRESS = 'LONG_PRESS',
  VOLUME_UP = 'VOLUME_UP',
  VOLUME_DOWN = 'VOLUME_DOWN',
  BRIGHTNESS_UP = 'BRIGHTNESS_UP',
  BRIGHTNESS_DOWN = 'BRIGHTNESS_DOWN',
  WAKE_LOCK = 'WAKE_LOCK',
  SCREENSHOT = 'SCREENSHOT',
  SWIPE_LEFT = 'SWIPE_LEFT',
  SWIPE_RIGHT = 'SWIPE_RIGHT',
}

export enum CursorStyle {
  CIRCLE = 'CIRCLE',
  SQUARE = 'SQUARE',
  RING = 'RING',
  DOT = 'DOT',
}

export interface CursorSettings {
  size: number; // 20 to 150
  transparency: number; // 0.1 to 1.0
  color: string; // Hex color string
  style: CursorStyle;
}

export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface RectF {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface HandFrame {
  timestamp: number;
  landmarks: NormalizedLandmark[];
  boundingBox: RectF;
}

export interface SystemPermissions {
  camera: boolean;
  overlay: boolean;
  batteryIgnored: boolean;
  accessibilityService: boolean;
}
