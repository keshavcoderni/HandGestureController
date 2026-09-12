import React, { useEffect, useState } from 'react';
import { CursorSettings, CursorStyle } from '../types';
import { PhoneActionExecutor } from '../overlay/PhoneActionExecutor';

interface GestureOverlayViewProps {
  settings: CursorSettings;
  executor: PhoneActionExecutor;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const GestureOverlayView: React.FC<GestureOverlayViewProps> = ({
  settings,
  executor,
  containerRef,
}) => {
  const [cursorPos, setCursorPos] = useState({ x: 0.5, y: 0.5 });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAwake, setIsAwake] = useState(false);

  useEffect(() => {
    let feedbackTimer: NodeJS.Timeout | null = null;

    const cleanup = executor.addListener({
      onCursorMoved: (x, y) => {
        setCursorPos({ x, y });
      },
      onWakeStateChanged: (awake) => {
        setIsAwake(awake);
      },
      onFeedbackMessage: (msg) => {
        setFeedback(msg);
        if (feedbackTimer) clearTimeout(feedbackTimer);
        feedbackTimer = setTimeout(() => {
          setFeedback(null);
        }, 1500); // 1500ms matching Android's postDelayed in GestureOverlayView
      },
    });

    return () => {
      cleanup();
      if (feedbackTimer) clearTimeout(feedbackTimer);
    };
  }, [executor]);

  const cursorSize = settings.size;
  const color = settings.color;
  const opacity = settings.transparency;

  // Position relative to container
  const leftPercent = `${cursorPos.x * 100}%`;
  const topPercent = `${cursorPos.y * 100}%`;

  const renderCursorGraphic = () => {
    switch (settings.style) {
      case CursorStyle.CIRCLE:
        return (
          <div
            id="active-cursor-circle"
            style={{
              width: `${cursorSize}px`,
              height: `${cursorSize}px`,
              backgroundColor: color,
              opacity: opacity,
            }}
            className="rounded-full border-[3px] border-white shadow-xl pointer-events-none transition-transform duration-75 ease-out"
          />
        );

      case CursorStyle.SQUARE:
        return (
          <div
            id="active-cursor-square"
            style={{
              width: `${cursorSize}px`,
              height: `${cursorSize}px`,
              backgroundColor: color,
              opacity: opacity,
            }}
            className="rounded-[6px] border-[3px] border-white shadow-xl pointer-events-none transition-transform duration-75 ease-out"
          />
        );

      case CursorStyle.RING:
        return (
          <div
            id="active-cursor-ring"
            style={{
              width: `${cursorSize}px`,
              height: `${cursorSize}px`,
              borderColor: color,
              opacity: opacity,
            }}
            className="rounded-full border-[5px] bg-transparent shadow-lg pointer-events-none transition-transform duration-75 ease-out"
          />
        );

      case CursorStyle.DOT:
        return (
          <div
            id="active-cursor-dot"
            style={{
              width: `${Math.max(12, cursorSize / 3)}px`,
              height: `${Math.max(12, cursorSize / 3)}px`,
              backgroundColor: color,
              opacity: opacity,
            }}
            className="rounded-full border-[2px] border-white shadow-md pointer-events-none transition-transform duration-75 ease-out"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      id="gesture-overlay-root"
      className="absolute inset-0 pointer-events-none overflow-hidden z-40 select-none"
    >
      {/* Feedback HUD (matches TextView in GestureOverlayView.kt: green text, margins 50, 150) */}
      {feedback && (
        <div
          id="gesture-feedback-badge"
          className="absolute top-6 left-6 px-4 py-2 bg-black/80 backdrop-blur-md rounded-lg border border-emerald-500/50 shadow-2xl flex items-center gap-2 animate-bounce pointer-events-none"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-mono font-bold tracking-wider text-sm uppercase">
            {feedback}
          </span>
        </div>
      )}

      {/* Floating Hand Cursor */}
      <div
        id="active-hand-cursor"
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
        style={{
          left: leftPercent,
          top: topPercent,
        }}
      >
        {renderCursorGraphic()}

        {/* Small target indicator pin */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full opacity-70" />
      </div>
    </div>
  );
};
