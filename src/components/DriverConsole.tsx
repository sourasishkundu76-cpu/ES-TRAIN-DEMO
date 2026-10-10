import React from 'react';
import { WarningStage } from '../types';
import {
  Gauge,
  Ruler,
  Activity,
  Clock,
  Timer,
  Radar,
  Play,
  Pause,
  RotateCcw,
  AlertOctagon,
  Wind,
  ChevronsUp,
} from 'lucide-react';

interface DriverConsoleProps {
  active: boolean;
  speedKmh: number;
  speedMs: number;
  distance: number;
  timeOfFlightMs: number;
  timeToImpactSec: number | null;
  reactionTimeElapsed: number;
  servoAngle: number;
  warningStage: WarningStage;
  systemEnabled: boolean;
  braking: boolean;
  onStartJourney: () => void;
  onApplyBrake: () => void;
  onResetTrack: () => void;
  onCoast: () => void;
  onAccelerate: () => void;
  onToggleSystem: (enabled: boolean) => void;
  targetMaxSpeed: number;
  onSelectMaxSpeed: (speed: number) => void;
}

export const DriverConsole: React.FC<DriverConsoleProps> = ({
  active,
  speedKmh,
  speedMs,
  distance,
  timeOfFlightMs,
  timeToImpactSec,
  reactionTimeElapsed,
  servoAngle,
  warningStage,
  systemEnabled,
  braking,
  onStartJourney,
  onApplyBrake,
  onResetTrack,
  onCoast,
  onAccelerate,
  onToggleSystem,
  targetMaxSpeed,
  onSelectMaxSpeed,
}) => {
  const distPercent = Math.min(100, Math.max(0, (distance / 150) * 100));

  // Determine radar blip position based on distance & servo angle
  const showBlip = warningStage !== 'CLEAR' && systemEnabled;
  const blipRadiusRatio = Math.max(0.15, Math.min(0.9, distance / 150));
  const blipAngleRad = ((servoAngle - 90) * Math.PI) / 180;
  // Radar center is bottom center: x = 50% + r*cos(angle), y = 100% - r*sin(angle)
  const blipX = 50 + blipRadiusRatio * 42 * Math.cos(blipAngleRad);
  const blipY = 92 - blipRadiusRatio * 75 * Math.sin(blipAngleRad);

  return (
    <div className="w-full xl:w-[460px] bg-slate-900/95 border-l border-slate-800/90 flex flex-col justify-between overflow-y-auto max-h-[92vh] xl:max-h-none p-5 space-y-4">
      {/* 1. DRIVER CONSOLE HEADER & MAIN STATUS BLOCK */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs uppercase tracking-wider font-extrabold text-slate-300 font-mono">
              Driver Console &amp; HUD
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
            40kHz • 20Hz Loop
          </span>
        </div>

        {/* STAGE STATUS BANNER (STAGE 1: CLEAR, STAGE 2: CAUTION, STAGE 3: CRITICAL) */}
        <div
          className={`rounded-2xl p-4 transition-all duration-300 relative overflow-hidden ${
            warningStage === 'CLEAR'
              ? 'bg-slate-800/80 border border-slate-700/80'
              : warningStage === 'CAUTION'
              ? 'bg-amber-950/40 border border-amber-500/70 shadow-lg shadow-amber-950/50'
              : 'bg-red-950/50 border border-red-500/80 shadow-lg shadow-red-950/50 animate-pulse'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Warning Stage
              </div>
              <h3
                className={`text-xl font-black tracking-wide mt-0.5 flex items-center gap-2 ${
                  warningStage === 'CLEAR'
                    ? 'text-emerald-400'
                    : warningStage === 'CAUTION'
                    ? 'text-amber-400'
                    : 'text-red-500'
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    warningStage === 'CLEAR'
                      ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                      : warningStage === 'CAUTION'
                      ? 'bg-amber-400 shadow-lg shadow-amber-400/80 animate-ping'
                      : 'bg-red-500 shadow-lg shadow-red-500 animate-ping'
                  }`}
                />
                {warningStage === 'CLEAR' && 'TRACK CLEAR'}
                {warningStage === 'CAUTION' && 'CAUTION: DETECTED'}
                {warningStage === 'CRITICAL' && 'CRITICAL: BRAKE / STOP'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {warningStage === 'CLEAR' &&
                  'No immediate obstacle detected ahead. Line clear to authorized speed.'}
                {warningStage === 'CAUTION' &&
                  'Ultrasonic echo detected within caution threshold. Prepare service brake.'}
                {warningStage === 'CRITICAL' &&
                  'Danger threshold crossed! Apply full emergency braking immediately!'}
              </p>
            </div>

            {/* Physical Indicator LED Simulation (From Video Prototype) */}
            <div className="flex flex-col items-center gap-1 bg-slate-950/80 p-2 rounded-xl border border-slate-800 shrink-0">
              <span className="text-[9px] font-mono text-slate-400">KIT LEDS</span>
              <div className="flex items-center gap-1.5">
                {/* Green LED */}
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    warningStage === 'CLEAR'
                      ? 'bg-emerald-400 shadow-md shadow-emerald-400/80'
                      : 'bg-emerald-950 border border-emerald-900 opacity-60'
                  }`}
                />
                {/* Yellow LED */}
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    warningStage === 'CAUTION'
                      ? 'bg-amber-400 shadow-md shadow-amber-400/80 animate-pulse'
                      : 'bg-amber-950 border border-amber-900 opacity-60'
                  }`}
                />
                {/* Red LED */}
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    warningStage === 'CRITICAL'
                      ? 'bg-red-500 shadow-md shadow-red-500 animate-ping'
                      : 'bg-red-950 border border-red-900 opacity-60'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY METRICS TILES */}
        <div className="grid grid-cols-2 gap-3">
          {/* Distance Tile */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
              <span>Obstacle Distance</span>
              <Ruler className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-extrabold text-cyan-400 font-mono tracking-tight">
                {systemEnabled || distance <= 50 ? distance.toFixed(0) : '--'}
              </span>
              <span className="text-xs font-mono text-slate-400">meters</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  warningStage === 'CRITICAL'
                    ? 'bg-red-500'
                    : warningStage === 'CAUTION'
                    ? 'bg-amber-400'
                    : 'bg-cyan-500'
                }`}
                style={{
                  width: `${systemEnabled || distance <= 50 ? distPercent : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Speed Tile */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
              <span>Train Speed</span>
              <Activity className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {speedKmh.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400">km/h</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1 flex justify-between">
              <span>Velocity:</span>
              <span className="text-slate-300 font-bold">{speedMs.toFixed(1)} m/s</span>
            </div>
          </div>
        </div>

        {/* ESTIMATED TIME TO OBSTACLE & REACTION DISTANCE */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs font-mono space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Est. Time to Obstacle (t ≈ d/v):
            </span>
            <span className="text-indigo-300 font-bold">
              {timeToImpactSec !== null
                ? `≈ ${timeToImpactSec.toFixed(1)} s`
                : speedMs <= 0.2
                ? 'STOPPED'
                : '-- s'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-amber-400" /> Driver Reaction Timer:
            </span>
            <span className="text-amber-400 font-bold">
              {reactionTimeElapsed.toFixed(2)} s
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>Distance at 1s reaction (d=v×1s):</span>
            <span className="text-slate-200 font-semibold">{speedMs.toFixed(1)} m</span>
          </div>
        </div>
      </div>

      {/* 2. SERVO SCANNING & HC-SR04 BEAM MINI-RADAR (Matching Video Prototype) */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider font-mono text-slate-300">
              Servo Motor Scan (0° – 90°)
            </span>
          </div>
          <div className="text-[10px] font-mono text-cyan-400">
            Servo: {servoAngle.toFixed(0)}° ({servoAngle < 35 ? 'Left' : servoAngle > 55 ? 'Right' : 'Centered'})
          </div>
        </div>

        {/* Polar Semi-Circle Radar Scan Display */}
        <div className="relative w-full h-28 bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden flex items-end justify-center pb-2">
          {/* Background arc grids */}
          <div className="absolute w-52 h-52 rounded-full border border-slate-800/80 bottom-0 pointer-events-none" />
          <div className="absolute w-36 h-36 rounded-full border border-slate-800/60 bottom-0 pointer-events-none" />
          <div className="absolute w-20 h-20 rounded-full border border-slate-800/40 bottom-0 pointer-events-none" />

          {/* Radar sweep wedge */}
          <div
            className={`absolute w-44 h-44 rounded-full bottom-0 origin-bottom transform transition-transform duration-75 ${
              warningStage === 'CRITICAL'
                ? 'radar-sweep-critical'
                : warningStage === 'CAUTION'
                ? 'radar-sweep-caution'
                : 'radar-sweep'
            }`}
            style={{
              transform: `rotate(${servoAngle - 45}deg)`,
            }}
          />

          {/* Obstacle blip on radar */}
          {showBlip && (
            <div
              className="absolute w-3 h-3 rounded-full bg-red-500 shadow-md shadow-red-500 animate-ping transition-all pointer-events-none"
              style={{
                left: `${blipX}%`,
                top: `${blipY}%`,
              }}
            />
          )}

          {/* Sensor Base Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className="w-1.5 h-16 bg-gradient-to-t from-cyan-400 to-transparent rounded-full origin-bottom transform transition-transform duration-75"
              style={{
                transform: `rotate(${servoAngle - 45}deg)`,
              }}
            />
            <div className="w-6 h-3 bg-cyan-500 rounded-t-md flex items-center justify-center text-[7px] font-mono text-slate-950 font-bold">
              SONIC
            </div>
          </div>

          {/* Sector labels */}
          <div className="absolute bottom-1 left-3 text-[9px] font-mono text-slate-500">0° (Left)</div>
          <div className="absolute top-2 text-[9px] font-mono text-slate-500">45° (Center Track)</div>
          <div className="absolute bottom-1 right-3 text-[9px] font-mono text-slate-500">90° (Right)</div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>
            Target Direction:{' '}
            <strong className="text-slate-200">
              Center Track ({servoAngle.toFixed(0)}°)
            </strong>
          </span>
          <span>
            Time of Flight:{' '}
            <strong className="text-cyan-400">
              {systemEnabled ? timeOfFlightMs.toFixed(2) : '0.00'} ms
            </strong>
          </span>
        </div>
      </div>

      {/* 3. DRIVER INTERACTIVE CONTROLS (BRAKE / ACCEL / START) */}
      <div className="space-y-3 pt-1">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Driver Response Controls</span>
          <span className="text-cyan-400 font-bold">INTERACTIVE SIMULATION</span>
        </div>

        {/* Primary Start / Pause / Reset Journey Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onStartJourney}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {active ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" /> Pause Run
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" /> Start Journey
              </>
            )}
          </button>
          <button
            onClick={onResetTrack}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" /> Reset Position
          </button>
        </div>

        {/* EMERGENCY / SERVICE BRAKE BUTTON (HERO DRIVER ACTION) */}
        <button
          onClick={onApplyBrake}
          className={`w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 border border-red-400/40 cursor-pointer ${
            braking ? 'ring-4 ring-red-500 bg-red-700' : ''
          }`}
        >
          <AlertOctagon className="w-5 h-5 animate-pulse" />
          <span>APPLY BRAKE (SPACEBAR)</span>
        </button>

        {/* Speed & Coast Auxiliary Controls */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCoast}
            className="py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer"
          >
            <Wind className="w-3.5 h-3.5 text-blue-400" /> Coast / Neutral
          </button>
          <button
            onClick={onAccelerate}
            className="py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer"
          >
            <ChevronsUp className="w-3.5 h-3.5 text-emerald-400" /> Accelerate
          </button>
        </div>

        {/* Speed Preset Selector */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
          <span>Max Speed Preset:</span>
          <div className="flex items-center gap-1">
            {[60, 80, 100, 120].map((s) => (
              <button
                key={s}
                onClick={() => onSelectMaxSpeed(s)}
                className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition ${
                  targetMaxSpeed === s
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s} km/h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SYSTEM ACTIVATION TOGGLE: WITH vs WITHOUT ECHO-SHIELD (Mode A / Mode B) */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-200">
            ECHO-SHIELD Warning System
          </div>
          <div className="text-[10px] text-slate-400">
            Toggle between Mode A (Off) &amp; Mode B (On)
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={systemEnabled}
            onChange={(e) => onToggleSystem(e.target.checked)}
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
        </label>
      </div>
    </div>
  );
};
