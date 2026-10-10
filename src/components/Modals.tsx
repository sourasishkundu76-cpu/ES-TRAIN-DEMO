import React from 'react';
import {
  Calculator,
  Cpu,
  ShieldCheck,
  Split,
  X,
  Zap,
  AlertTriangle,
  Radio,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhysicsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                The Physics Behind Ultrasonic Rail Detection
              </h3>
              <p className="text-xs text-slate-400">
                Principles of Time-of-Flight (ToF) &amp; Train Kinematics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Formula Box */}
        <div className="bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 rounded-xl p-4 text-center">
          <div className="text-xs uppercase font-mono tracking-widest text-cyan-400 mb-1">
            Time of Flight Distance Formula
          </div>
          <div className="text-3xl font-mono font-extrabold text-white my-2 tracking-wide">
            d = (v<sub className="text-xs text-cyan-300">sound</sub> × t) / 2
          </div>
          <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
            The 40 kHz ultrasonic burst travels from the train transmitter (HC-SR04 Trigger) to the track obstacle and reflects back to the receiver (Echo). Because the sound wave travels two ways (round trip), the total sound propagation distance is divided by 2.
          </p>
        </div>

        {/* Step-by-Step Chain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">1. TRIGGER</span>
            <span className="text-slate-300 text-[11px]">Arduino sends 10µs pulse to Trigger Pin</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-blue-400 font-bold block mb-1">2. TRANSMIT</span>
            <span className="text-slate-300 text-[11px]">8 bursts of 40 kHz ultrasound emitted</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-indigo-400 font-bold block mb-1">3. REFLECT</span>
            <span className="text-slate-300 text-[11px]">Wave bounces off obstacle surface</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">4. ECHO PIN</span>
            <span className="text-slate-300 text-[11px]">Echo HIGH duration = Travel time (t)</span>
          </div>
        </div>

        {/* Train Reaction Physics */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Why Reaction Distance Matters in Rail Safety: d = v × t
          </h4>
          <p className="text-slate-300 leading-relaxed">
            Trains have massive momentum and cannot steer or stop instantly like road vehicles. If a train is travelling at <strong>80 km/h (22.22 m/s)</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-300 font-mono text-[11px]">
            <li>
              At 1.0 second driver reaction delay:{' '}
              <strong className="text-amber-400">d = 22.22 m travelled</strong> before brakes even engage.
            </li>
            <li>
              At 1.5 second delayed reaction:{' '}
              <strong className="text-red-400">d = 33.33 m travelled</strong> without deceleration.
            </li>
          </ul>
          <p className="text-slate-400 text-[11px] pt-1">
            By continuously scanning and alerting the driver hundreds of meters in advance,{' '}
            <strong className="text-cyan-300">ECHO-SHIELD</strong> grants the driver vital seconds to begin braking early, preserving the life-saving stopping buffer.
          </p>
        </div>
      </div>
    </div>
  );
};

export const HardwareModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Physical Arduino Kit Architecture</h3>
              <p className="text-xs text-slate-400">Exact component mapping from the educational prototype</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Component breakdown cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-cyan-400 font-bold font-mono">
              <span>1. HC-SR04 Ultrasonic Sensor</span>
              <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40">Front Bumper</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Mounted at the train bumper. Emits 40 kHz high-frequency ultrasound pulses and listens for reflected echoes off debris on the rails.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-blue-400 font-bold font-mono">
              <span>2. SG90 Micro Servo Motor</span>
              <span className="text-[10px] bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800/40">Turret Mount</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Rotates the HC-SR04 across a 0°–90° scanning sector ahead of the locomotive, allowing dynamic track alignment detection on curved sections.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-indigo-400 font-bold font-mono">
              <span>3. Arduino Uno Controller</span>
              <span className="text-[10px] bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800/40">Processing Unit</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Measures trigger/echo pulse width in microseconds (<code className="text-indigo-300">pulseIn()</code>), computes metric distance, and drives warning logic.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-emerald-400 font-bold font-mono">
              <span>4. Tri-Color Indicator LEDs</span>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/40">Cab Warnings</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Green (Clear &gt; 95m), Yellow (Caution 38m–95m), and Red (Critical &lt; 38m). Directly mirrors driver cockpit warning stages.
            </p>
          </div>
        </div>

        {/* Scope note */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
          <strong className="text-slate-200">Hardware Fidelity:</strong> Built strictly with the kit components demonstrated in the reference setup (Arduino Uno + HC-SR04 + Servo + LEDs + Breadboard + Jumpers) with no expensive radars, LiDARs, or cameras added.
        </div>
      </div>
    </div>
  );
};

export const SafetyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">How ECHO-SHIELD Assists the Train Driver</h3>
              <p className="text-xs text-slate-400">Enhancing situational awareness and cognitive reaction time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex gap-3">
            <span className="w-6 h-6 rounded bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <h4 className="font-bold text-white">Early Non-Visual Detection</h4>
              <p className="text-slate-300 text-[11px]">
                Detects obstacles in low visibility (fog, heavy rain, night, blind corners) well before human eyes can spot them through the cab windshield.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex gap-3">
            <span className="w-6 h-6 rounded bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <h4 className="font-bold text-white">Continuous Quantitative Distance</h4>
              <p className="text-slate-300 text-[11px]">
                Replaces guesswork with real-time distance measurements, allowing the driver to calculate appropriate service vs emergency brake pressure.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex gap-3">
            <span className="w-6 h-6 rounded bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <h4 className="font-bold text-white">Graduated Warning Spectrum</h4>
              <p className="text-slate-300 text-[11px]">
                Multi-stage alerts (Clear → Caution → Critical) prepare driver reflexes progressively rather than forcing sudden startled reactions.
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Safety Disclaimer */}
        <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3.5 text-[11px] text-amber-200 leading-relaxed">
          <strong className="text-amber-100 flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> IMPORTANT EDUCATIONAL PROTOTYPE DISCLAIMER
          </strong>
          ECHO-SHIELD is a small-scale educational prototype that demonstrates the principle of ultrasonic obstacle detection and driver warning. It is <strong>NOT</strong> a certified railway safety system and must <strong>NOT</strong> be used to control or operate real trains. Real railway safety systems require specialized sensors, redundant fail-safe architecture, certified signalling systems, train-control systems, and extensive safety validation.
        </div>
      </div>
    </div>
  );
};

export const SplitComparisonModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Split className="w-4 h-4 text-cyan-400" /> Side-by-Side Impact Analysis: With vs Without ECHO-SHIELD
            </h3>
            <p className="text-xs text-slate-400">
              Visualizing the critical difference early ultrasonic warning makes to stopping distance
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT: WITHOUT ECHO-SHIELD */}
          <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" /> MODE A: SYSTEM DISABLED
              </span>
              <span className="text-[10px] font-mono text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-900/40">
                Unassisted Human Eye
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded border border-red-900/30">
                <span className="text-slate-400">Detection Point:</span>
                <span className="text-red-300 font-bold">~40m (Late visual spotting)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded border border-red-900/30">
                <span className="text-slate-400">Driver Reaction Time:</span>
                <span className="text-red-400 font-bold">1.50 s (Startled surprise)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded border border-red-900/30">
                <span className="text-slate-400">Distance at Delay (d=vt):</span>
                <span className="text-red-300 font-bold">33.3 m</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded border border-red-900/30">
                <span className="text-slate-400">Braking Distance Left:</span>
                <span className="text-red-400 font-bold">Only 6.7 m</span>
              </div>
            </div>

            <div className="p-3 bg-red-950/50 rounded-lg text-[11px] text-red-200 border border-red-800/40 font-semibold">
              ⚠ OUTCOME: INEVITABLE OVERRUN OR IMPACT. Driver lacks the physical stopping distance required at 80 km/h.
            </div>
          </div>

          {/* RIGHT: WITH ECHO-SHIELD ACTIVE */}
          <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> MODE B: ECHO-SHIELD ACTIVE
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900/40">
                HC-SR04 Active Scanning
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded border border-cyan-900/30">
                <span className="text-slate-400">Detection Point:</span>
                <span className="text-cyan-300 font-bold">120m+ (Ultrasonic echo)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded border border-cyan-900/30">
                <span className="text-slate-400">Early Warning Prompt:</span>
                <span className="text-amber-400 font-bold">Prompt Caution Alert</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded border border-cyan-900/30">
                <span className="text-slate-400">Driver Reaction Time:</span>
                <span className="text-emerald-300 font-bold">0.75 s (Prepared reflex)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded border border-cyan-900/30">
                <span className="text-slate-400">Safe Stopping Buffer:</span>
                <span className="text-emerald-400 font-bold">+35.0 m ahead of obstacle</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 rounded-lg text-[11px] text-emerald-200 border border-emerald-800/40 font-semibold">
              ✓ OUTCOME: CONTROLLED SAFE STOP. Train brings full inertia to halt well clear of track obstruction.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
