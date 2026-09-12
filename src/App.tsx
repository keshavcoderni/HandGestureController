import React, { useState, useEffect, useMemo } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { CameraTracker } from './components/CameraTracker';
import { DeviceSimulator } from './components/DeviceSimulator';
import { GestureGuide } from './components/GestureGuide';
import { GestureOverlayView } from './components/GestureOverlayView';
import { CursorPreferences } from './overlay/CursorPreferences';
import { HandGestureController } from './gesture/HandGestureController';
import { CursorSettings, Gesture, SystemPermissions } from './types';
import { Sliders, Monitor, Smartphone, BookOpen, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const prefs = useMemo(() => new CursorPreferences(), []);
  const [cursorSettings, setCursorSettings] = useState<CursorSettings>(() => prefs.loadSettings());
  const [activeGesture, setActiveGesture] = useState<Gesture>(Gesture.NONE);
  const [activeTab, setActiveTab] = useState<'setup' | 'live' | 'simulator' | 'guide'>('setup');
  const [fullscreenOverlay, setFullscreenOverlay] = useState(false);

  const [permissions, setPermissions] = useState<SystemPermissions>({
    camera: false,
    overlay: true,
    batteryIgnored: true,
    accessibilityService: true,
  });

  const controller = useMemo(() => new HandGestureController(), []);
  const executor = controller.getActionExecutor();

  // Initialize and listen to actions
  useEffect(() => {
    controller.updateSettings(cursorSettings);
  }, [controller, cursorSettings]);

  useEffect(() => {
    const cleanup = executor.addListener({
      onGestureExecuted: (gesture) => {
        setActiveGesture(gesture);
      },
    });
    return cleanup;
  }, [executor]);

  // Request system permissions simulation
  const handleRequestPermission = async (perm: keyof SystemPermissions) => {
    if (perm === 'camera') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        setPermissions((p) => ({ ...p, camera: true }));
      } catch (err) {
        // Fallback simulate grant if in sandboxed iframe without device
        setPermissions((p) => ({ ...p, camera: true }));
      }
    } else {
      setPermissions((p) => ({ ...p, [perm]: !p[perm] }));
    }
  };

  const handleUpdateSettings = (newSettings: CursorSettings) => {
    setCursorSettings(newSettings);
    prefs.saveSettings(newSettings);
    controller.updateSettings(newSettings);
  };

  const toggleAccessibilityService = () => {
    setPermissions((p) => {
      const next = !p.accessibilityService;
      if (next) {
        controller.enterActiveMode();
      } else {
        controller.enterSleepMode();
      }
      return { ...p, accessibilityService: next };
    });
  };

  return (
    <div id="hand-controller-app" className="min-h-screen bg-[#f3f4f6] text-slate-900 flex flex-col relative">
      {/* TopAppBar: matching Material 3 TopAppBar in MainActivity.kt */}
      <header
        id="top-app-bar"
        className="sticky top-0 z-30 bg-indigo-900 text-white shadow-md px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-700/80 flex items-center justify-center font-bold text-sm shadow-inner">
            👋
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">Hand Controller Pro</h1>
            <p className="text-[11px] text-indigo-200">Touchless Accessibility Service</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Fullscreen Overlay Toggle */}
          <button
            id="btn-toggle-fullscreen-overlay"
            onClick={() => setFullscreenOverlay(!fullscreenOverlay)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              fullscreenOverlay
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100'
            }`}
            title="Render touchless cursor over entire browser window"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Overlay Mode</span>
          </button>

          {/* Service Status Pill */}
          <div className="flex items-center gap-1.5 bg-indigo-950/60 px-2.5 py-1 rounded-full text-xs font-medium text-indigo-200 border border-indigo-700/40">
            <span
              className={`w-2 h-2 rounded-full ${
                permissions.accessibilityService ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden sm:inline">
              {permissions.accessibilityService ? 'Service Active' : 'Service Paused'}
            </span>
          </div>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div className="bg-white border-b border-slate-200 sticky top-[57px] z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 py-2 overflow-x-auto">
          <button
            id="tab-setup"
            onClick={() => setActiveTab('setup')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'setup'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Setup & Customization
          </button>

          <button
            id="tab-live"
            onClick={() => setActiveTab('live')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'live'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Live Vision Pipeline
          </button>

          <button
            id="tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'simulator'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Device Simulator
          </button>

          <button
            id="tab-guide"
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'guide'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Gesture Dictionary
          </button>
        </div>
      </div>

      {/* Main Body Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6">
        {activeTab === 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <SetupScreen
                cursorSettings={cursorSettings}
                onUpdateSettings={handleUpdateSettings}
                permissions={permissions}
                onRequestPermission={handleRequestPermission}
                onOpenAccessibility={toggleAccessibilityService}
                activeService={permissions.accessibilityService}
              />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-6">
              <CameraTracker
                controller={controller}
                hasCameraPermission={permissions.camera}
                onRequestCamera={() => handleRequestPermission('camera')}
                activeGesture={activeGesture}
              />
              <GestureGuide activeGesture={activeGesture} />
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <CameraTracker
                controller={controller}
                hasCameraPermission={permissions.camera}
                onRequestCamera={() => handleRequestPermission('camera')}
                activeGesture={activeGesture}
              />
              <GestureGuide activeGesture={activeGesture} />
            </div>
            <div className="lg:col-span-5">
              <DeviceSimulator executor={executor} cursorSettings={cursorSettings} />
            </div>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 flex justify-center">
              <DeviceSimulator executor={executor} cursorSettings={cursorSettings} />
            </div>
            <div className="lg:col-span-6 flex flex-col gap-6">
              <CameraTracker
                controller={controller}
                hasCameraPermission={permissions.camera}
                onRequestCamera={() => handleRequestPermission('camera')}
                activeGesture={activeGesture}
              />
              <GestureGuide activeGesture={activeGesture} />
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <GestureGuide activeGesture={activeGesture} />
            <CameraTracker
              controller={controller}
              hasCameraPermission={permissions.camera}
              onRequestCamera={() => handleRequestPermission('camera')}
              activeGesture={activeGesture}
            />
          </div>
        )}
      </main>

      {/* Optional Fullscreen Overlay View if user enabled full viewport overlay */}
      {fullscreenOverlay && (
        <GestureOverlayView settings={cursorSettings} executor={executor} />
      )}
    </div>
  );
};

export default App;
