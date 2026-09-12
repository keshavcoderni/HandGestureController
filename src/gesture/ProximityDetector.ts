import { NormalizedLandmark } from '../types';

export class ProximityDetector {
  private lastProximityTime = 0;
  private readonly SLEEP_THRESHOLD = 3000; // 3 seconds of no hand to sleep
  private isCurrentlyAwake = false;

  constructor(
    private onWakeDetected: () => void,
    private onSleepDetected: () => void
  ) {}

  checkProximity(landmarks: NormalizedLandmark[]): boolean {
    if (!landmarks || landmarks.length === 0) return false;
    const currentTime = Date.now();
    this.lastProximityTime = currentTime;
    if (!this.isCurrentlyAwake) {
      this.isCurrentlyAwake = true;
      this.onWakeDetected();
    }
    return true;
  }

  checkSleep(): void {
    if (this.isCurrentlyAwake && Date.now() - this.lastProximityTime > this.SLEEP_THRESHOLD) {
      this.isCurrentlyAwake = false;
      this.onSleepDetected();
    }
  }

  reset(): void {
    this.lastProximityTime = 0;
    this.isCurrentlyAwake = false;
  }
}
