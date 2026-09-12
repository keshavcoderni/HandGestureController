import React, { useState, useEffect, useRef } from 'react';
import { Gesture, CursorSettings } from '../types';
import { PhoneActionExecutor } from '../overlay/PhoneActionExecutor';
import { GestureOverlayView } from './GestureOverlayView';
import {
  Home,
  ArrowLeft,
  Square,
  Volume2,
  VolumeX,
  Wifi,
  Battery,
  Clock,
  Compass,
  FileText,
  Music,
  Camera,
  Settings as SettingsIcon,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface DeviceSimulatorProps {
  executor: PhoneActionExecutor;
  cursorSettings: CursorSettings;
}

type AppScreen = 'home' | 'browser' | 'notes' | 'music' | 'recents';

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  executor,
  cursorSettings,
}) => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [screenHistory, setScreenHistory] = useState<AppScreen[]>(['home']);
  const [volume, setVolume] = useState(65);
  const [showVolumeHud, setShowVolumeHud] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const phoneScreenRef = useRef<HTMLDivElement | null>(null);
  const scrollableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let volTimer: NodeJS.Timeout | null = null;
    let actionTimer: NodeJS.Timeout | null = null;

    const cleanup = executor.addListener({
      onGestureExecuted: (gesture) => {
        setLastAction(gesture);
        if (actionTimer) clearTimeout(actionTimer);
        actionTimer = setTimeout(() => setLastAction(null), 2000);

        switch (gesture) {
          case Gesture.HOME_BUTTON:
            setCurrentScreen('home');
            setScreenHistory(['home']);
            break;

          case Gesture.BACK_BUTTON:
            setScreenHistory((prev) => {
              if (prev.length > 1) {
                const next = prev.slice(0, -1);
                setCurrentScreen(next[next.length - 1]);
                return next;
              } else {
                setCurrentScreen('home');
                return ['home'];
              }
            });
            break;

          case Gesture.RECENT_APPS:
            setCurrentScreen((prev) => (prev === 'recents' ? 'home' : 'recents'));
            break;

          case Gesture.SCROLL_UP:
            if (scrollableRef.current) {
              scrollableRef.current.scrollBy({ top: -180, behavior: 'smooth' });
            }
            break;

          case Gesture.SCROLL_DOWN:
            if (scrollableRef.current) {
              scrollableRef.current.scrollBy({ top: 180, behavior: 'smooth' });
            }
            break;

          case Gesture.VOLUME_UP:
            setVolume((v) => Math.min(100, v + 10));
            setShowVolumeHud(true);
            if (volTimer) clearTimeout(volTimer);
            volTimer = setTimeout(() => setShowVolumeHud(false), 2000);
            break;

          case Gesture.VOLUME_DOWN:
            setVolume((v) => Math.max(0, v - 10));
            setShowVolumeHud(true);
            if (volTimer) clearTimeout(volTimer);
            volTimer = setTimeout(() => setShowVolumeHud(false), 2000);
            break;

          case Gesture.TAP:
            // Simulate tap at current hand cursor position
            if (phoneScreenRef.current) {
              const { x, y } = executor.getCursorPosition();
              const rect = phoneScreenRef.current.getBoundingClientRect();
              const clickX = rect.left + x * rect.width;
              const clickY = rect.top + y * rect.height;

              const targetElement = document.elementFromPoint(clickX, clickY);
              if (targetElement && targetElement instanceof HTMLElement) {
                targetElement.click();
              }
            }
            break;

          case Gesture.SWIPE_LEFT:
            if (currentScreen === 'recents') {
              setCurrentScreen('home');
            }
            break;

          case Gesture.SWIPE_RIGHT:
            if (currentScreen === 'home') {
              setCurrentScreen('browser');
            }
            break;
        }
      },
    });

    return () => {
      cleanup();
      if (volTimer) clearTimeout(volTimer);
      if (actionTimer) clearTimeout(actionTimer);
    };
  }, [executor, currentScreen]);

  const openApp = (app: AppScreen) => {
    setCurrentScreen(app);
    setScreenHistory((prev) => [...prev, app]);
  };

  return (
    <div id="device-simulator-wrapper" className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Phone Hardware Bezel */}
      <div
        id="phone-hardware-frame"
        className="relative w-full aspect-[9/18.5] max-h-[640px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800 flex flex-col select-none overflow-hidden"
      >
        {/* Top Speaker / Dynamic Island Pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2" />
          <div className="w-10 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Screen Area */}
        <div
          ref={phoneScreenRef}
          id="phone-screen-display"
          className="relative w-full h-full bg-slate-950 rounded-[34px] overflow-hidden flex flex-col text-slate-100"
        >
          {/* Status Bar */}
          <div className="h-9 px-6 pt-2 flex items-center justify-between text-[11px] font-medium text-slate-300 z-30 shrink-0">
            <span className="font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" /> 09:41
            </span>
            <div className="flex items-center gap-2">
              <Wifi className="w-3 h-3" />
              <div className="flex items-center gap-0.5">
                <span>{volume}%</span>
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Volume HUD (appears when volume gesture executed) */}
          {showVolumeHud && (
            <div
              id="volume-indicator-hud"
              className="absolute top-12 left-4 right-4 bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-slate-700 shadow-xl flex items-center gap-3 z-50 animate-fade-in"
            >
              {volume > 0 ? (
                <Volume2 className="w-4 h-4 text-indigo-400 shrink-0" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-150"
                  style={{ width: `${volume}%` }}
                />
              </div>
              <span className="text-xs font-mono text-slate-300 w-7 text-right">{volume}</span>
            </div>
          )}

          {/* Screen Content */}
          <div ref={scrollableRef} className="flex-1 overflow-y-auto relative z-10">
            {currentScreen === 'home' && (
              <div id="screen-home" className="p-5 flex flex-col gap-6">
                {/* Search Bar Widget */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center justify-between shadow-sm">
                  <span>Search apps or web...</span>
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>

                {/* App Grid */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <button
                    id="app-browser"
                    onClick={() => openApp('browser')}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-13 h-13 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shadow-sm">
                      <Compass className="w-7 h-7" />
                    </div>
                    <span className="text-xs text-slate-300 font-medium">Browser</span>
                  </button>

                  <button
                    id="app-notes"
                    onClick={() => openApp('notes')}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-13 h-13 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shadow-sm">
                      <FileText className="w-7 h-7" />
                    </div>
                    <span className="text-xs text-slate-300 font-medium">Notes</span>
                  </button>

                  <button
                    id="app-music"
                    onClick={() => openApp('music')}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-13 h-13 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shadow-sm">
                      <Music className="w-7 h-7" />
                    </div>
                    <span className="text-xs text-slate-300 font-medium">Player</span>
                  </button>
                </div>

                {/* Status card inside phone */}
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 text-xs flex flex-col gap-2">
                  <span className="font-semibold text-slate-300">Accessibility Service</span>
                  <p className="text-slate-400 leading-relaxed">
                    Gesture controller is actively monitoring gestures and translating them to touchless taps, scrolls, and navigation.
                  </p>
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-[11px] pt-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    Tracking Ready
                  </div>
                </div>
              </div>
            )}

            {currentScreen === 'browser' && (
              <div id="screen-browser" className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <button onClick={() => setCurrentScreen('home')} className="text-slate-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex-1 bg-slate-900 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono truncate">
                    https://news.touchless.org/tech
                  </div>
                </div>

                <h4 className="font-bold text-sm text-slate-100">Hand Gestures in Modern UI</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Touchless gesture recognition allows natural device control via cameras. Try scrolling this page using your palm sliding up or down!
                </p>

                <div className="space-y-2 pt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-indigo-300">Tech Article #{i}</span>
                      <p className="text-[11px] text-slate-400">
                        Pinch thumb and index finger together to TAP and click on any interactive item.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentScreen === 'notes' && (
              <div id="screen-notes" className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <button onClick={() => setCurrentScreen('home')} className="text-slate-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-200">Gesture Action Log</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                    <span className="text-emerald-400 font-mono">FIST</span>: Dispatches Home Button
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                    <span className="text-emerald-400 font-mono">OPEN PALM</span>: Dispatches Back Button
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                    <span className="text-emerald-400 font-mono">POINT INDEX</span>: Directs Touchless Cursor
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                    <span className="text-emerald-400 font-mono">PINCH</span>: Dispatches Click / Tap
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                    <span className="text-emerald-400 font-mono">SWIPE</span>: App Switching / Carousel
                  </div>
                </div>
              </div>
            )}

            {currentScreen === 'music' && (
              <div id="screen-music" className="p-4 flex flex-col items-center gap-4 text-center">
                <div className="w-24 h-24 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
                  <Music className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Ambient Flow</h4>
                  <p className="text-xs text-slate-400">Touchless Audio Experience</p>
                </div>
                <div className="w-full bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span>Volume: {volume}%</span>
                  <span className="text-indigo-400">Thumb-Up: Vol+</span>
                </div>
              </div>
            )}

            {currentScreen === 'recents' && (
              <div id="screen-recents" className="p-4 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400">Recent Applications</span>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {['Browser', 'Notes', 'Music'].map((app) => (
                    <div
                      key={app}
                      onClick={() => openApp(app.toLowerCase() as AppScreen)}
                      className="w-36 h-48 bg-slate-900 rounded-xl border border-slate-800 p-3 flex flex-col justify-between shrink-0 cursor-pointer hover:border-indigo-500 transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-200">{app}</span>
                      <span className="text-[10px] text-indigo-400">Tap to switch</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Android Navigation Bar (Home, Back, Recents) */}
          <div
            id="android-nav-bar"
            className="h-10 px-8 flex items-center justify-between border-t border-slate-800/80 bg-slate-950 text-slate-400 z-30 shrink-0"
          >
            <button
              id="nav-back-button"
              onClick={() => {
                executor.execute(Gesture.BACK_BUTTON);
              }}
              className="p-1.5 hover:text-white transition-colors"
              title="Back Button (Open Palm)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              id="nav-home-button"
              onClick={() => {
                executor.execute(Gesture.HOME_BUTTON);
              }}
              className="p-1.5 hover:text-white transition-colors"
              title="Home Button (Fist)"
            >
              <Home className="w-4 h-4" />
            </button>

            <button
              id="nav-recents-button"
              onClick={() => {
                executor.execute(Gesture.RECENT_APPS);
              }}
              className="p-1.5 hover:text-white transition-colors"
              title="Recents Button"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Gesture Overlay View rendered directly over the simulated screen */}
          <GestureOverlayView
            settings={cursorSettings}
            executor={executor}
            containerRef={phoneScreenRef}
          />
        </div>
      </div>

      <div className="mt-2 text-center text-xs text-slate-500">
        Simulated target device receiving touchless gestures
      </div>
    </div>
  );
};
