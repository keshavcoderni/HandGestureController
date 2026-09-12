import { CursorSettings, Gesture } from '../types';

export interface ActionExecutorListener {
  onCursorMoved?: (x: number, y: number) => void;
  onGestureExecuted?: (gesture: Gesture) => void;
  onWakeStateChanged?: (isAwake: boolean) => void;
  onFeedbackMessage?: (msg: string) => void;
  onSettingsChanged?: (settings: CursorSettings) => void;
}

export class PhoneActionExecutor {
  private listeners = new Set<ActionExecutorListener>();
  private handX = 0.5;
  private handY = 0.5;
  private isAwake = false;

  addListener(listener: ActionExecutorListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  updateCursor(x: number, y: number): void {
    // Clamp to 0..1
    this.handX = Math.max(0, Math.min(1, x));
    this.handY = Math.max(0, Math.min(1, y));

    this.listeners.forEach((l) => l.onCursorMoved?.(this.handX, this.handY));
  }

  getCursorPosition(): { x: number; y: number } {
    return { x: this.handX, y: this.handY };
  }

  execute(gesture: Gesture): void {
    if (gesture === Gesture.NONE) return;

    this.listeners.forEach((l) => {
      l.onGestureExecuted?.(gesture);
      l.onFeedbackMessage?.(gesture);
    });
  }

  updateSettings(settings: CursorSettings): void {
    this.listeners.forEach((l) => l.onSettingsChanged?.(settings));
  }

  showWakeOverlay(): void {
    this.isAwake = true;
    this.listeners.forEach((l) => {
      l.onWakeStateChanged?.(true);
      l.onFeedbackMessage?.('SYSTEM ACTIVE');
    });
  }

  hideOverlays(): void {
    this.isAwake = false;
    this.listeners.forEach((l) => {
      l.onWakeStateChanged?.(false);
    });
  }

  getWakeState(): boolean {
    return this.isAwake;
  }
}
