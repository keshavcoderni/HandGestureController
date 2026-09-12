import { Gesture, HandFrame, NormalizedLandmark, RectF } from '../types';

export class GestureAnalyzer {
  private history: HandFrame[] = [];
  private readonly MAX_HISTORY = 10;

  analyze(landmarks: NormalizedLandmark[]): Gesture {
    if (!landmarks || landmarks.length < 21) {
      return Gesture.NONE;
    }

    const frame: HandFrame = {
      timestamp: Date.now(),
      landmarks: [...landmarks],
      boundingBox: this.calculateBoundingBox(landmarks),
    };

    this.history.push(frame);
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
    }

    if (this.isFist(landmarks)) return Gesture.HOME_BUTTON;
    if (this.isOpenPalm(landmarks)) return Gesture.BACK_BUTTON;
    if (this.isSwipeLeft(landmarks)) return Gesture.SWIPE_LEFT;
    if (this.isSwipeRight(landmarks)) return Gesture.SWIPE_RIGHT;

    if (this.isScrollUp(landmarks)) return Gesture.SCROLL_UP;
    if (this.isScrollDown(landmarks)) return Gesture.SCROLL_DOWN;

    if (this.isPoint(landmarks)) return Gesture.CURSOR_MOVE;
    if (this.isPinch(landmarks)) return Gesture.TAP;

    if (this.isVolumeUp(landmarks)) return Gesture.VOLUME_UP;

    return Gesture.NONE;
  }

  reset(): void {
    this.history = [];
  }

  private calculateBoundingBox(landmarks: NormalizedLandmark[]): RectF {
    let minX = 1;
    let minY = 1;
    let maxX = 0;
    let maxY = 0;

    for (const lm of landmarks) {
      if (lm.x < minX) minX = lm.x;
      if (lm.y < minY) minY = lm.y;
      if (lm.x > maxX) maxX = lm.x;
      if (lm.y > maxY) maxY = lm.y;
    }

    return { left: minX, top: minY, right: maxX, bottom: maxY };
  }

  isFist(landmarks: NormalizedLandmark[]): boolean {
    const wrist = landmarks[0];
    const tips = [8, 12, 16, 20];
    return tips.every((tipIdx) => this.dist(landmarks[tipIdx], wrist) < 0.15);
  }

  isOpenPalm(landmarks: NormalizedLandmark[]): boolean {
    const wrist = landmarks[0];
    const tips = [8, 12, 16, 20];
    return tips.every((tipIdx) => this.dist(landmarks[tipIdx], wrist) > 0.25);
  }

  private isScrollUp(landmarks: NormalizedLandmark[]): boolean {
    if (this.history.length < 5) return false;
    const recent = this.history.slice(-5);
    const palmY = recent.map((h) => h.landmarks[9]?.y ?? 0);
    return palmY.every((curr, idx, arr) => {
      if (idx === 0) return true;
      const prev = arr[idx - 1];
      return curr < prev - 0.01;
    });
  }

  private isScrollDown(landmarks: NormalizedLandmark[]): boolean {
    if (this.history.length < 5) return false;
    const recent = this.history.slice(-5);
    const palmY = recent.map((h) => h.landmarks[9]?.y ?? 0);
    return palmY.every((curr, idx, arr) => {
      if (idx === 0) return true;
      const prev = arr[idx - 1];
      return curr > prev + 0.01;
    });
  }

  isPinch(landmarks: NormalizedLandmark[]): boolean {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    return this.dist(thumbTip, indexTip) < 0.05;
  }

  isPoint(landmarks: NormalizedLandmark[]): boolean {
    const indexExtended = this.isFingerExtended(landmarks, 8);
    const middleCurled = !this.isFingerExtended(landmarks, 12);
    const ringCurled = !this.isFingerExtended(landmarks, 16);
    const pinkyCurled = !this.isFingerExtended(landmarks, 20);
    return indexExtended && middleCurled && ringCurled && pinkyCurled;
  }

  private isFingerExtended(landmarks: NormalizedLandmark[], tipIndex: number): boolean {
    const wrist = landmarks[0];
    const tip = landmarks[tipIndex];
    return this.dist(tip, wrist) > 0.2;
  }

  isVolumeUp(landmarks: NormalizedLandmark[]): boolean {
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    return thumbTip.y < thumbIP.y - 0.05;
  }

  private isSwipeLeft(landmarks: NormalizedLandmark[]): boolean {
    if (this.history.length < 5) return false;
    const recent = this.history.slice(-5);
    const palmX = recent.map((h) => h.landmarks[9]?.x ?? 0);
    return palmX.every((curr, idx, arr) => {
      if (idx === 0) return true;
      const prev = arr[idx - 1];
      return curr < prev - 0.01;
    });
  }

  private isSwipeRight(landmarks: NormalizedLandmark[]): boolean {
    if (this.history.length < 5) return false;
    const recent = this.history.slice(-5);
    const palmX = recent.map((h) => h.landmarks[9]?.x ?? 0);
    return palmX.every((curr, idx, arr) => {
      if (idx === 0) return true;
      const prev = arr[idx - 1];
      return curr > prev + 0.01;
    });
  }

  dist(a: NormalizedLandmark, b: NormalizedLandmark): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }
}
