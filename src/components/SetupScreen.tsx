import React from 'react';
import { CursorSettings, CursorStyle, SystemPermissions } from '../types';
import { CursorPreview } from './CursorPreview';
import { Check, ShieldCheck, Camera, Layers, BatteryCharging, Power } from 'lucide-react';

interface SetupScreenProps {
  cursorSettings: CursorSettings;
  onUpdateSettings: (settings: CursorSettings) => void;
  permissions: SystemPermissions;
  onRequestPermission: (perm: keyof SystemPermissions) => void;
  onOpenAccessibility: () => void;
  activeService: boolean;
}

const PRESET_COLORS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Magenta', hex: '#EC4899' },
  { name: 'Cyan', hex: '#06B6D4' },
];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  cursorSettings,
  onUpdateSettings,
  permissions,
  onRequestPermission,
  onOpenAccessibility,
  activeService,
}) => {
  return (
    <div id="setup-screen-container" className="flex flex-col gap-6 max-w-xl mx-auto w-full pb-12">
      {/* System Permissions Card (matching PermissionCard in MainActivity.kt) */}
      <div
        id="permissions-card"
        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800">System Permissions</h2>
        </div>

        <div className="divide-y divide-slate-100">
          <PermissionRow
            id="perm-camera"
            icon={<Camera className="w-4 h-4 text-slate-500" />}
            label="Camera Access"
            isGranted={permissions.camera}
            onGrant={() => onRequestPermission('camera')}
          />
          <PermissionRow
            id="perm-overlay"
            icon={<Layers className="w-4 h-4 text-slate-500" />}
            label="Overlay Permission"
            isGranted={permissions.overlay}
            onGrant={() => onRequestPermission('overlay')}
          />
          <PermissionRow
            id="perm-battery"
            icon={<BatteryCharging className="w-4 h-4 text-slate-500" />}
            label="Battery Optimization"
            isGranted={permissions.batteryIgnored}
            onGrant={() => onRequestPermission('batteryIgnored')}
          />
        </div>

        <div className="mt-4 pt-2 border-t border-slate-100 flex flex-col gap-2">
          <button
            id="btn-accessibility-settings"
            onClick={onOpenAccessibility}
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm ${
              activeService
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            {activeService ? 'Accessibility Service: Active (Tap to pause)' : 'Open Accessibility Settings'}
          </button>
          <p className="text-[11px] text-center text-slate-500">
            Enables background gesture dispatching and touchless cursor injection.
          </p>
        </div>
      </div>

      {/* Cursor Preview Section (matching Preview Section in MainActivity.kt) */}
      <div id="cursor-preview-section" className="flex flex-col items-center">
        <span className="text-sm font-semibold text-slate-700 mb-3">Cursor Preview</span>
        <div
          id="cursor-preview-box"
          className="w-32 h-32 rounded-2xl bg-slate-100/80 border border-slate-300 flex items-center justify-center shadow-inner relative overflow-hidden"
        >
          {/* Subtle grid background for optical clarity */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
          <div className="relative z-10">
            <CursorPreview settings={cursorSettings} />
          </div>
        </div>
      </div>

      {/* Customize Appearance Card (matching Card in MainActivity.kt) */}
      <div
        id="appearance-card"
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-6"
      >
        <h2 className="text-lg font-bold text-slate-800">Customize Appearance</h2>

        {/* Size Slider */}
        <div id="size-slider-control" className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-medium text-slate-700">
            <span>Size:</span>
            <span className="font-mono font-semibold text-indigo-600">{cursorSettings.size}px</span>
          </div>
          <input
            id="input-cursor-size"
            type="range"
            min="20"
            max="150"
            value={cursorSettings.size}
            onChange={(e) =>
              onUpdateSettings({
                ...cursorSettings,
                size: parseInt(e.target.value, 10),
              })
            }
            className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>20px (Fine)</span>
            <span>150px (Large)</span>
          </div>
        </div>

        {/* Transparency Slider */}
        <div id="transparency-slider-control" className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-medium text-slate-700">
            <span>Transparency:</span>
            <span className="font-mono font-semibold text-indigo-600">
              {Math.round(cursorSettings.transparency * 100)}%
            </span>
          </div>
          <input
            id="input-cursor-transparency"
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={cursorSettings.transparency}
            onChange={(e) =>
              onUpdateSettings({
                ...cursorSettings,
                transparency: parseFloat(e.target.value),
              })
            }
            className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>10% (Ghost)</span>
            <span>100% (Solid)</span>
          </div>
        </div>

        {/* Style Selector */}
        <div id="cursor-style-selector" className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Cursor Style</span>
          <div className="grid grid-cols-4 gap-3">
            {Object.values(CursorStyle).map((style) => {
              const isSelected = cursorSettings.style === style;
              return (
                <button
                  key={style}
                  id={`btn-style-${style.toLowerCase()}`}
                  onClick={() =>
                    onUpdateSettings({
                      ...cursorSettings,
                      style: style,
                    })
                  }
                  className={`h-14 rounded-xl flex flex-col items-center justify-center transition-all border font-semibold text-xs ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-base font-bold">{style.charAt(0)}</span>
                  <span className="text-[10px] tracking-wide opacity-90">{style}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Theme Picker */}
        <div id="color-theme-picker" className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Color Theme</span>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {PRESET_COLORS.map((col) => {
              const isSelected = cursorSettings.color.toUpperCase() === col.hex.toUpperCase();
              return (
                <button
                  key={col.hex}
                  id={`btn-color-${col.name.toLowerCase()}`}
                  onClick={() =>
                    onUpdateSettings({
                      ...cursorSettings,
                      color: col.hex,
                    })
                  }
                  style={{ backgroundColor: col.hex }}
                  className={`w-10 h-10 rounded-full transition-transform flex items-center justify-center shadow-sm ${
                    isSelected
                      ? 'ring-4 ring-slate-800 scale-110 shadow-md'
                      : 'hover:scale-105 border-2 border-white'
                  }`}
                  title={col.name}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tip Banner */}
      <div
        id="setup-tip-banner"
        className="text-center text-xs text-slate-500 bg-slate-100/70 py-2.5 px-4 rounded-xl border border-slate-200"
      >
        💡 Tip: Calibration works best in good lighting.
      </div>
    </div>
  );
};

interface PermissionRowProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  isGranted: boolean;
  onGrant: () => void;
}

const PermissionRow: React.FC<PermissionRowProps> = ({ id, icon, label, isGranted, onGrant }) => {
  return (
    <div id={id} className="py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      {isGranted ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          Granted
        </span>
      ) : (
        <button
          onClick={onGrant}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-colors"
        >
          Grant
        </button>
      )}
    </div>
  );
};
