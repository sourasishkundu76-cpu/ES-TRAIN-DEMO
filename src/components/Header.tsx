import React from 'react';
import { CameraViewMode } from '../types';
import {
  ShieldAlert,
  Eye,
  Video,
  Columns2,
  Calculator,
  Cpu,
  Info,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface HeaderProps {
  cameraMode: CameraViewMode;
  onCameraChange: (mode: CameraViewMode) => void;
  onOpenPhysics: () => void;
  onOpenHardware: () => void;
  onOpenSafety: () => void;
  onOpenSplitComparison: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cameraMode,
  onCameraChange,
  onOpenPhysics,
  onOpenHardware,
  onOpenSafety,
  onOpenSplitComparison,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-3.5 sticky top-0 z-50 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-200 bg-clip-text text-transparent">
              ECHO-SHIELD
            </span>
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              RailSafety Prototype
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Smart Ultrasonic Obstacle Detection &amp; Train Driver Early Warning System
          </p>
        </div>
      </div>

      {/* Active Demo Mode Selector */}
      <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onCameraChange('cab')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            cameraMode === 'cab'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" /> Driver Cab 3D View
        </button>
        <button
          onClick={() => onCameraChange('side')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            cameraMode === 'side'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" /> Third-Person Track View
        </button>
        <button
          onClick={onOpenSplitComparison}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <Columns2 className="w-3.5 h-3.5" /> Side-by-Side Comparison
        </button>
      </div>

      {/* Quick Modal Triggers & Sound */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPhysics}
          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 border border-slate-700/60 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Physics: d = vt/2</span>
          <span className="md:hidden">Physics</span>
        </button>
        <button
          onClick={onOpenHardware}
          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 border border-slate-700/60 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Arduino Hardware Kit</span>
          <span className="md:hidden">Hardware</span>
        </button>
        <button
          onClick={onOpenSafety}
          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 border border-slate-700/60 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden lg:inline">Driver Safety Impact</span>
          <span className="lg:hidden">Safety</span>
        </button>
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Cockpit Audio' : 'Enable Cockpit Audio'}
          className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
            soundEnabled
              ? 'bg-slate-800/90 text-cyan-400 border-cyan-500/40'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
