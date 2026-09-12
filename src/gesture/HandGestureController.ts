import { CursorSettings, Gesture, NormalizedLandmark } from '../types';
import { GestureAnalyzer } from './GestureAnalyzer';
import { ProximityDetector } from './ProximityDetector';
import { PhoneActionExecutor } from '../overlay/PhoneActionExecutor';

export class HandGestureController {
  private isAwake = false;
  private gestureAnalyzer = new GestureAnalyzer();
  private actionExecutor = new PhoneActionExecutor();
  private proximityDetector: ProximityDetector;
  private lastExecutedGesture = Gesture.NONE;
  private lastGestureTime = 0;
  private readonly GESTURE_THROTTLE_MS = 600; // Prevent rapid firing of same gesture

  constructor() {
    this.proximityDetector = new ProximityDetector(
      () => this.enterActiveMode(),
      () => this.enterSleepMode()
    );
  }

  getActionExecutor(): PhoneActionExecutor {
    return this.actionExecutor;
  }

  getGestureAnalyzer(): GestureAnalyzer {
    return this.gestureAnalyzer;
  }

  processLandmarks(landmarks: NormalizedLandmark[] | null): void {
    if (!landmarks || landmarks.length === 0) {
      this.proximityDetector.checkSleep();
      return;
    }

    // Hand proximate check
    this.proximityDetector.checkProximity(landmarks);

    if (!this.isAwake) {
      return;
    }

    // Always update cursor position if index finger (landmark 8) is detected
    if (landmarks.length > 8) {
      const indexFinger = landmarks[8];
      // Invert X because the front camera is mirrored (1 - x), matching Android source code
      this.actionExecutor.updateCursor(1 - indexFinger.x, indexFinger.y);
    }

    const gesture = this.gestureAnalyzer.analyze(landmarks);
    const now = Date.now();

    if (gesture !== Gesture.NONE) {
      // For continuous gestures like CURSOR_MOVE or repeated scroll/volume, or discrete gestures with throttle
      const isContinuous = gesture === Gesture.CURSOR_MOVE;
      const canExecute = isContinuous || (now - this.lastGestureTime > this.GESTURE_THROTTLE_MS) || (gesture !== this.lastExecutedGesture);

      if (canExecute) {
        this.actionExecutor.execute(gesture);
        this.lastExecutedGesture = gesture;
        this.lastGestureTime = now;
      }
    }
  }

  enterActiveMode(): void {
    this.isAwake = true;
    this.actionExecutor.showWakeOverlay();
  }

  enterSleepMode(): void {
    this.isAwake = false;
    this.actionExecutor.hideOverlays();
  }

  getIsAwake(): boolean {
    return this.isAwake;
  }

  updateSettings(settings: CursorSettings): void {
    this.actionExecutor.updateSettings(settings);
  }

  release(): void {
    this.enterSleepMode();
    this.proximityDetector.reset();
    this.gestureAnalyzer.reset();
  }
}
