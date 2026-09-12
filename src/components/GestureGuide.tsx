import React from 'react';
import { Gesture } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface GestureGuideProps {
  activeGesture: Gesture;
}

interface GestureItem {
  gesture: Gesture;
  title: string;
  action: string;
  handPose: string;
  rule: string;
}

const GESTURE_ITEMS: GestureItem[] = [
  {
    gesture: Gesture.HOME_BUTTON,
    title: 'Closed Fist',
    action: 'Home Button',
    handPose: '✊',
    rule: 'Curl all 4 fingers (dist < 0.15)',
  },
  {
    gesture: Gesture.BACK_BUTTON,
    title: 'Open Palm',
    action: 'Back Button',
    handPose: '✋',
    rule: 'Extend all 4 fingers (dist > 0.25)',
  },
  {
    gesture: Gesture.CURSOR_MOVE,
    title: 'Point Index',
    action: 'Move Cursor',
    handPose: '☝️',
    rule: 'Index finger out, middle/ring/pinky curled',
  },
  {
    gesture: Gesture.TAP,
    title: 'Pinch Fingers',
    action: 'Tap / Click',
    handPose: '👌',
    rule: 'Thumb and index tips touch (dist < 0.05)',
  },
  {
    gesture: Gesture.SCROLL_UP,
    title: 'Slide Up',
    action: 'Scroll Content Up',
    handPose: '👆',
    rule: 'Palm shifts upwards across 5 frames',
  },
  {
    gesture: Gesture.SCROLL_DOWN,
    title: 'Slide Down',
    action: 'Scroll Content Down',
    handPose: '👇',
    rule: 'Palm shifts downwards across 5 frames',
  },
  {
    gesture: Gesture.SWIPE_LEFT,
    title: 'Wave Left',
    action: 'Swipe Left',
    handPose: '👈',
    rule: 'Palm moves left across 5 frames',
  },
  {
    gesture: Gesture.SWIPE_RIGHT,
    title: 'Wave Right',
    action: 'Swipe Right',
    handPose: '👉',
    rule: 'Palm moves right across 5 frames',
  },
  {
    gesture: Gesture.VOLUME_UP,
    title: 'Thumbs Up',
    action: 'Volume Up',
    handPose: '👍',
    rule: 'Thumb tip extended above knuckle',
  },
];

export const GestureGuide: React.FC<GestureGuideProps> = ({ activeGesture }) => {
  return (
    <div id="gesture-guide-card" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 text-base">Gesture Dictionary</h3>
        <span className="text-xs text-slate-500 font-mono">GestureAnalyzer.kt</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {GESTURE_ITEMS.map((item) => {
          const isActive = activeGesture === item.gesture;
          return (
            <div
              key={item.gesture}
              id={`gesture-guide-${item.gesture.toLowerCase()}`}
              className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                isActive
                  ? 'bg-emerald-50 border-emerald-400 shadow-md ring-1 ring-emerald-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-2xl shrink-0 select-none">{item.handPose}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-slate-800 truncate">{item.title}</span>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </div>
                <div className="text-[11px] font-semibold text-indigo-600 truncate">{item.action}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.rule}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
