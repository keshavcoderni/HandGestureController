import React, { useEffect, useRef, useState, useCallback } from 'react';
import { HandGestureController } from '../gesture/HandGestureController';
import { Gesture, NormalizedLandmark } from '../types';
import { Camera, CameraOff, Sparkles, RefreshCw, Hand, AlertCircle } from 'lucide-react';

interface CameraTrackerProps {
  controller: HandGestureController;
  hasCameraPermission: boolean;
  onRequestCamera: () => void;
  activeGesture: Gesture;
}

// Landmark connections for rendering hand skeleton
const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [5, 9], [9, 13], [13, 17],
];

export const CameraTracker: React.FC<CameraTrackerProps> = ({
  controller,
  hasCameraPermission,
  onRequestCamera,
  activeGesture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useVirtualSimulator, setUseVirtualSimulator] = useState(false);
  const [fps, setFps] = useState(0);

  const mediapipeHandsRef = useRef<any>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const framesCountRef = useRef<number>(0);

  // Draw hand landmarks on canvas
  const drawLandmarks = useCallback((landmarks: NormalizedLandmark[], canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Draw connections
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;

    HAND_CONNECTIONS.forEach(([start, end]) => {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      if (p1 && p2) {
        ctx.beginPath();
        // Video is mirrored so render mirrored to match user intuition
        ctx.moveTo((1 - p1.x) * w, p1.y * h);
        ctx.lineTo((1 - p2.x) * w, p2.y * h);
        ctx.stroke();
      }
    });

    // Draw landmark joints
    landmarks.forEach((lm, idx) => {
      ctx.beginPath();
      // Tips (4, 8, 12, 16, 20) in distinct colors
      const isTip = [4, 8, 12, 16, 20].includes(idx);
      const isIndexTip = idx === 8;

      ctx.arc((1 - lm.x) * w, lm.y * h, isIndexTip ? 6 : isTip ? 4.5 : 3, 0, 2 * Math.PI);
      ctx.fillStyle = isIndexTip ? '#ef4444' : isTip ? '#10b981' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, []);

  // Initialize camera stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraError(err.message || 'Unable to access front camera.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Attempt to initialize MediaPipe Hands from global window or dynamic script
  useEffect(() => {
    let isMounted = true;

    const initMediaPipe = async () => {
      try {
        let HandsClass = (window as any).Hands;

        if (!HandsClass) {
          // Wait a moment if script tag is still resolving
          await new Promise((resolve) => setTimeout(resolve, 500));
          HandsClass = (window as any).Hands;
        }

        if (!HandsClass) {
          console.info('MediaPipe Hands script will initialize when ready or simulator mode can be used.');
          return;
        }

        if (!isMounted) return;

        const hands = new HandsClass({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          if (!isMounted) return;

          // FPS counter
          framesCountRef.current++;
          const now = Date.now();
          if (now - lastTimeRef.current >= 1000) {
            setFps(framesCountRef.current);
            framesCountRef.current = 0;
            lastTimeRef.current = now;
          }

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const rawLandmarks: NormalizedLandmark[] = results.multiHandLandmarks[0];
            controller.processLandmarks(rawLandmarks);

            if (canvasRef.current) {
              drawLandmarks(rawLandmarks, canvasRef.current);
            }
          } else {
            controller.processLandmarks(null);
            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }
        });

        mediapipeHandsRef.current = hands;
        setIsModelLoaded(true);
      } catch (e) {
        console.warn('MediaPipe Hands initialization note:', e);
        setIsModelLoaded(false);
      }
    };

    initMediaPipe();

    return () => {
      isMounted = false;
      stopCamera();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      try {
        mediapipeHandsRef.current?.close();
      } catch (err) {}
    };
  }, [controller, drawLandmarks]);

  // Video frame processing loop
  useEffect(() => {
    let active = true;

    const processVideoFrame = async () => {
      if (
        active &&
        isCameraActive &&
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        mediapipeHandsRef.current
      ) {
        try {
          await mediapipeHandsRef.current.send({ image: videoRef.current });
        } catch (err) {
          // Frame skip or busy
        }
      }

      if (active && isCameraActive) {
        animFrameIdRef.current = requestAnimationFrame(processVideoFrame);
      }
    };

    if (isCameraActive && isModelLoaded) {
      animFrameIdRef.current = requestAnimationFrame(processVideoFrame);
    }

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isCameraActive, isModelLoaded]);

  // Hand simulation helper for testing without camera
  const triggerSimulatedGesture = (gestureType: 'point' | 'fist' | 'palm' | 'pinch' | 'swipeLeft' | 'swipeRight' | 'scrollUp' | 'scrollDown' | 'thumbsUp', x = 0.5, y = 0.5) => {
    // Generate synthetic 21 landmarks according to standard MediaPipe Hand hierarchy
    // Coordinates normalized (0..1)
    const baseWrist: NormalizedLandmark = { x, y: y + 0.25 };
    const landmarks: NormalizedLandmark[] = [];

    // 0: Wrist
    landmarks[0] = baseWrist;

    // Thumb 1..4
    landmarks[1] = { x: x - 0.04, y: y + 0.18 };
    landmarks[2] = { x: x - 0.08, y: y + 0.12 };
    landmarks[3] = { x: x - 0.10, y: y + 0.06 };
    landmarks[4] = gestureType === 'thumbsUp'
      ? { x: x - 0.10, y: y - 0.02 } // Upward thumb
      : gestureType === 'pinch'
      ? { x: x - 0.01, y: y - 0.05 } // Pinched to index
      : gestureType === 'fist'
      ? { x: x - 0.03, y: y + 0.15 } // Tucked
      : { x: x - 0.12, y: y + 0.01 };

    // Index 5..8
    landmarks[5] = { x: x - 0.02, y: y + 0.1 };
    landmarks[6] = { x: x - 0.02, y: y + 0.05 };
    landmarks[7] = { x: x - 0.02, y: y };
    landmarks[8] = gestureType === 'fist'
      ? { x: x - 0.02, y: y + 0.16 } // Curled
      : { x: x - 0.02, y: y - 0.06 }; // Extended

    // Middle 9..12
    landmarks[9] = { x: x, y: y + 0.09 };
    landmarks[10] = { x: x, y: y + 0.04 };
    landmarks[11] = { x: x, y: y };
    landmarks[12] = gestureType === 'point' || gestureType === 'fist' || gestureType === 'pinch'
      ? { x: x, y: y + 0.16 } // Curled
      : { x: x, y: y - 0.08 }; // Extended

    // Ring 13..16
    landmarks[13] = { x: x + 0.03, y: y + 0.1 };
    landmarks[14] = { x: x + 0.03, y: y + 0.05 };
    landmarks[15] = { x: x + 0.03, y: y + 0.01 };
    landmarks[16] = gestureType === 'point' || gestureType === 'fist' || gestureType === 'pinch'
      ? { x: x + 0.03, y: y + 0.17 } // Curled
      : { x: x + 0.03, y: y - 0.07 }; // Extended

    // Pinky 17..20
    landmarks[17] = { x: x + 0.06, y: y + 0.12 };
    landmarks[18] = { x: x + 0.06, y: y + 0.08 };
    landmarks[19] = { x: x + 0.06, y: y + 0.04 };
    landmarks[20] = gestureType === 'point' || gestureType === 'fist' || gestureType === 'pinch'
      ? { x: x + 0.06, y: y + 0.18 } // Curled
      : { x: x + 0.06, y: y - 0.05 }; // Extended

    // Feed multiple frames for swipe/scroll gestures if needed
    if (gestureType === 'swipeLeft') {
      for (let i = 0; i < 5; i++) {
        const offsetLm = landmarks.map(l => ({ ...l, x: l.x - (i * 0.02) }));
        controller.processLandmarks(offsetLm);
      }
    } else if (gestureType === 'swipeRight') {
      for (let i = 0; i < 5; i++) {
        const offsetLm = landmarks.map(l => ({ ...l, x: l.x + (i * 0.02) }));
        controller.processLandmarks(offsetLm);
      }
    } else if (gestureType === 'scrollUp') {
      for (let i = 0; i < 5; i++) {
        const offsetLm = landmarks.map(l => ({ ...l, y: l.y - (i * 0.02) }));
        controller.processLandmarks(offsetLm);
      }
    } else if (gestureType === 'scrollDown') {
      for (let i = 0; i < 5; i++) {
        const offsetLm = landmarks.map(l => ({ ...l, y: l.y + (i * 0.02) }));
        controller.processLandmarks(offsetLm);
      }
    } else {
      controller.processLandmarks(landmarks);
    }

    if (canvasRef.current) {
      drawLandmarks(landmarks, canvasRef.current);
    }
  };

  return (
    <div id="camera-tracker-container" className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-base">Hand Vision Pipeline</h3>
        </div>
        <div className="flex items-center gap-2">
          {isCameraActive && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {fps} FPS
            </span>
          )}
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              controller.getIsAwake()
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {controller.getIsAwake() ? '● System Active' : '○ Standby (No Hand)'}
          </span>
        </div>
      </div>

      {/* Video & Landmark Canvas Viewport */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center">
        {/* Hidden video stream element */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-80"
          playsInline
          muted
        />

        {/* Real-time skeleton canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {!isCameraActive && (
          <div className="flex flex-col items-center justify-center p-6 text-center z-20 gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <CameraOff className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-200">Camera Feed Paused</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Start the front camera to detect hand gestures in real-time using MediaPipe Hands.
              </p>
            </div>
            <button
              id="btn-start-camera-feed"
              onClick={startCamera}
              className="mt-2 py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
            >
              <Camera className="w-4 h-4" />
              Start Live Camera
            </button>
          </div>
        )}

        {cameraError && (
          <div className="absolute bottom-3 inset-x-3 bg-red-950/90 border border-red-500/50 text-red-200 text-xs p-2.5 rounded-lg flex items-center gap-2 z-30">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Live Active Gesture Indicator */}
        {activeGesture !== Gesture.NONE && (
          <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/60 text-emerald-400 text-xs font-mono font-bold uppercase shadow-lg z-20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            {activeGesture}
          </div>
        )}
      </div>

      {/* Camera Controls & Simulator Tabs */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {isCameraActive ? (
          <button
            id="btn-stop-camera-feed"
            onClick={stopCamera}
            className="py-1.5 px-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <CameraOff className="w-3.5 h-3.5" />
            Pause Camera
          </button>
        ) : (
          <button
            id="btn-start-camera-feed-alt"
            onClick={startCamera}
            className="py-1.5 px-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            Resume Camera
          </button>
        )}

        <button
          id="btn-toggle-simulator-mode"
          onClick={() => setUseVirtualSimulator(!useVirtualSimulator)}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border ${
            useVirtualSimulator
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Hand className="w-3.5 h-3.5" />
          {useVirtualSimulator ? 'Hide Test Trigger Panel' : 'Show Test Trigger Panel'}
        </button>
      </div>

      {/* Virtual Hand Gesture Trigger Panel for instant testing without camera */}
      {useVirtualSimulator && (
        <div id="gesture-simulation-panel" className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Simulate Hand Gestures (Instant Testbed)
            </span>
            <span className="text-[11px] text-slate-500">
              Dispatches directly into GestureAnalyzer
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              id="sim-fist-home"
              onClick={() => triggerSimulatedGesture('fist')}
              className="p-2.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-800">✊ Closed Fist</div>
              <div className="text-[10px] text-indigo-600 font-medium">HOME BUTTON</div>
            </button>

            <button
              id="sim-open-palm-back"
              onClick={() => triggerSimulatedGesture('palm')}
              className="p-2.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-800">✋ Open Palm</div>
              <div className="text-[10px] text-indigo-600 font-medium">BACK BUTTON</div>
            </button>

            <button
              id="sim-point-cursor"
              onClick={() => triggerSimulatedGesture('point', 0.5, 0.4)}
              className="p-2.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-800">☝️ Pointing Index</div>
              <div className="text-[10px] text-indigo-600 font-medium">MOVE CURSOR</div>
            </button>

            <button
              id="sim-pinch-tap"
              onClick={() => triggerSimulatedGesture('pinch')}
              className="p-2.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-800">👌 Pinch Fingers</div>
              <div className="text-[10px] text-indigo-600 font-medium">TAP / CLICK</div>
            </button>

            <button
              id="sim-swipe-left"
              onClick={() => triggerSimulatedGesture('swipeLeft')}
              className="p-2.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-800">👈 Wave Left</div>
              <div className="text-[10px] text-indigo-600 font-medium">SWIPE LEFT</div>
            </button>

            <button
              id="sim-swipe-right"
              onClick={() => triggerSimulatedGesture('swipeRight')}
              className="p-2.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-800">👉 Wave Right</div>
              <div className="text-[10px] text-indigo-600 font-medium">SWIPE RIGHT</div>
            </button>

            <button
              id="sim-scroll-up"
              onClick={() => triggerSimulatedGesture('scrollUp')}
              className="p-2.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-800">👆 Slide Up</div>
              <div className="text-[10px] text-indigo-600 font-medium">SCROLL UP</div>
            </button>

            <button
              id="sim-thumbs-up-volume"
              onClick={() => triggerSimulatedGesture('thumbsUp')}
              className="p-2.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-800">👍 Thumbs Up</div>
              <div className="text-[10px] text-indigo-600 font-medium">VOLUME UP</div>
            </button>
          </div>

          {/* Interactive cursor pad */}
          <div
            id="cursor-tracking-pad"
            className="w-full h-24 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center cursor-crosshair relative select-none"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = (e.clientX - rect.left) / rect.width;
              const relY = (e.clientY - rect.top) / rect.height;
              triggerSimulatedGesture('point', relX, relY);
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = (e.clientX - rect.left) / rect.width;
              const relY = (e.clientY - rect.top) / rect.height;
              triggerSimulatedGesture('pinch', relX, relY);
            }}
          >
            <span className="text-xs text-slate-400 font-medium pointer-events-none">
              Hover here to steer cursor • Click to dispatch TAP pinch
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
