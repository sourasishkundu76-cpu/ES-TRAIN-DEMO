/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CameraViewMode, WarningStage, RunOutcomeData } from './types';
import { soundFX } from './utils/audio';
import { Header } from './components/Header';
import { ThreeCanvas } from './components/ThreeCanvas';
import { DriverConsole } from './components/DriverConsole';
import {
  PhysicsModal,
  HardwareModal,
  SafetyModal,
  SplitComparisonModal,
} from './components/Modals';

export default function App() {
  // Primary simulation states
  const [active, setActive] = useState<boolean>(false);
  const [speedKmh, setSpeedKmh] = useState<number>(80.0);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState<number>(80.0);
  const [speedMs, setSpeedMs] = useState<number>(22.22);
  const [trainZ, setTrainZ] = useState<number>(0);
  const [obstacleZ] = useState<number>(145);
  const [braking, setBraking] = useState<boolean>(false);
  const [systemEnabled, setSystemEnabled] = useState<boolean>(true);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('cab');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Servo sweep state
  const [servoAngle, setServoAngle] = useState<number>(45);

  // Warning stage & telemetry
  const [warningStage, setWarningStage] = useState<WarningStage>('CLEAR');
  const [reactionTimeElapsed, setReactionTimeElapsed] = useState<number>(0);
  const [outcomeData, setOutcomeData] = useState<RunOutcomeData | null>(null);

  // Modals
  const [isPhysicsOpen, setIsPhysicsOpen] = useState<boolean>(false);
  const [isHardwareOpen, setIsHardwareOpen] = useState<boolean>(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState<boolean>(false);
  const [isSplitOpen, setIsSplitOpen] = useState<boolean>(false);

  // Mutable refs for accurate 60fps simulation loop
  const simRef = useRef({
    active: false,
    speedKmh: 80.0,
    maxSpeedKmh: 80.0,
    speedMs: 22.22,
    trainZ: 0,
    obstacleZ: 145,
    braking: false,
    brakeDecel: 3.8,
    accelRate: 1.6,
    systemEnabled: true,
    servoAngle: 45,
    servoDir: 1,
    servoSpeed: 52, // deg/s
    servoMin: 15,
    servoMax: 75,
    warningStage: 'CLEAR' as WarningStage,
    warningFirstShownTime: null as number | null,
    driverBrakePressedTime: null as number | null,
    reactionRecordedSeconds: null as number | null,
    reactionDistanceTravelled: 0,
  });

  // Keep sound mute state synced
  useEffect(() => {
    soundFX.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Keep system enabled synced to ref
  useEffect(() => {
    simRef.current.systemEnabled = systemEnabled;
  }, [systemEnabled]);

  // Handle speed preset change
  const handleSelectMaxSpeed = (targetSpeed: number) => {
    setMaxSpeedKmh(targetSpeed);
    simRef.current.maxSpeedKmh = targetSpeed;
    if (!simRef.current.active && !simRef.current.braking) {
      setSpeedKmh(targetSpeed);
      const vMs = (targetSpeed * 1000) / 3600;
      setSpeedMs(vMs);
      simRef.current.speedKmh = targetSpeed;
      simRef.current.speedMs = vMs;
    }
  };

  // Start journey
  const handleStartJourney = useCallback(() => {
    if (outcomeData) {
      setOutcomeData(null);
    }
    setActive((prev) => {
      const next = !prev;
      simRef.current.active = next;
      if (next) {
        simRef.current.braking = false;
        setBraking(false);
      }
      return next;
    });
  }, [outcomeData]);

  // Apply brake action
  const handleApplyBrake = useCallback(() => {
    if (!simRef.current.active && simRef.current.speedMs <= 0.1) return;
    simRef.current.braking = true;
    setBraking(true);
    soundFX.playBrakeAirHiss();

    const now = performance.now();
    if (!simRef.current.driverBrakePressedTime) {
      simRef.current.driverBrakePressedTime = now;
      if (simRef.current.warningFirstShownTime) {
        const sec = (now - simRef.current.warningFirstShownTime) / 1000;
        simRef.current.reactionRecordedSeconds = sec;
        setReactionTimeElapsed(sec);
      }
    }
  }, []);

  // Reset simulation
  const handleResetTrack = useCallback(() => {
    simRef.current.active = false;
    simRef.current.braking = false;
    simRef.current.speedKmh = maxSpeedKmh;
    simRef.current.speedMs = (maxSpeedKmh * 1000) / 3600;
    simRef.current.trainZ = 0;
    simRef.current.warningFirstShownTime = null;
    simRef.current.driverBrakePressedTime = null;
    simRef.current.reactionRecordedSeconds = null;
    simRef.current.reactionDistanceTravelled = 0;
    simRef.current.warningStage = 'CLEAR';

    setActive(false);
    setBraking(false);
    setSpeedKmh(maxSpeedKmh);
    setSpeedMs((maxSpeedKmh * 1000) / 3600);
    setTrainZ(0);
    setWarningStage('CLEAR');
    setReactionTimeElapsed(0);
    setOutcomeData(null);
  }, [maxSpeedKmh]);

  // Coast
  const handleCoast = useCallback(() => {
    simRef.current.braking = false;
    setBraking(false);
  }, []);

  // Accelerate
  const handleAccelerate = useCallback(() => {
    simRef.current.braking = false;
    setBraking(false);
    simRef.current.speedMs = Math.min(
      simRef.current.maxSpeedKmh / 3.6,
      simRef.current.speedMs + 3.0
    );
    simRef.current.speedKmh = simRef.current.speedMs * 3.6;
    setSpeedMs(simRef.current.speedMs);
    setSpeedKmh(simRef.current.speedKmh);
  }, []);

  // Toggle system
  const handleToggleSystem = useCallback((enabled: boolean) => {
    setSystemEnabled(enabled);
    simRef.current.systemEnabled = enabled;
  }, []);

  // Keyboard shortcut listeners (Spacebar for brake, etc.)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when modal or typing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleApplyBrake();
      } else if (e.code === 'KeyR') {
        handleResetTrack();
      } else if (e.code === 'KeyP') {
        handleStartJourney();
      } else if (e.code === 'Digit1') {
        setCameraMode('cab');
      } else if (e.code === 'Digit2') {
        setCameraMode('bumper');
      } else if (e.code === 'Digit3') {
        setCameraMode('side');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleApplyBrake, handleResetTrack, handleStartJourney]);

  // Main simulation tick loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let sonarSoundTimer = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.08, (now - lastTime) / 1000);
      lastTime = now;
      const s = simRef.current;

      // 1. Train Movement
      if (s.active) {
        if (s.braking) {
          s.speedMs = Math.max(0, s.speedMs - s.brakeDecel * dt);
          s.speedKmh = s.speedMs * 3.6;
        } else {
          const targetMs = s.maxSpeedKmh / 3.6;
          if (s.speedMs < targetMs) {
            s.speedMs = Math.min(targetMs, s.speedMs + s.accelRate * dt);
            s.speedKmh = s.speedMs * 3.6;
          }
        }

        s.trainZ += s.speedMs * dt;

        // Stopping check
        if (s.braking && s.speedMs <= 0.05) {
          s.speedMs = 0;
          s.speedKmh = 0;
          s.active = false;
          setActive(false);

          // Compute outcome
          const remainingMargin = Math.max(0, s.obstacleZ - s.trainZ - 1.5);
          const reactionSec =
            s.reactionRecordedSeconds ??
            (s.driverBrakePressedTime && s.warningFirstShownTime
              ? (s.driverBrakePressedTime - s.warningFirstShownTime) / 1000
              : 0.85);
          const reactDist = s.reactionDistanceTravelled || (s.maxSpeedKmh / 3.6) * reactionSec;
          const brakeDist = Math.max(0, s.trainZ - reactDist);

          setOutcomeData({
            collision: false,
            initialSpeedKmh: s.maxSpeedKmh,
            reactionTimeSec: reactionSec,
            reactionDistanceMeters: reactDist,
            brakingDistanceMeters: brakeDist,
            remainingMarginMeters: remainingMargin,
          });
        }

        // Collision boundary check
        if (s.trainZ >= s.obstacleZ - 1.5) {
          s.speedMs = 0;
          s.speedKmh = 0;
          s.active = false;
          setActive(false);

          const reactionSec =
            s.reactionRecordedSeconds ??
            (s.driverBrakePressedTime && s.warningFirstShownTime
              ? (s.driverBrakePressedTime - s.warningFirstShownTime) / 1000
              : 1.45);
          const reactDist = (s.maxSpeedKmh / 3.6) * reactionSec;
          const brakeDist = Math.max(0, s.trainZ - reactDist);

          setOutcomeData({
            collision: true,
            initialSpeedKmh: s.maxSpeedKmh,
            reactionTimeSec: reactionSec,
            reactionDistanceMeters: reactDist,
            brakingDistanceMeters: brakeDist,
            remainingMarginMeters: 0,
          });
        }

        setSpeedKmh(s.speedKmh);
        setSpeedMs(s.speedMs);
        setTrainZ(s.trainZ);
      }

      // 2. Servo Sweep
      s.servoAngle += s.servoDir * s.servoSpeed * dt;
      if (s.servoAngle >= s.servoMax) {
        s.servoAngle = s.servoMax;
        s.servoDir = -1;
      } else if (s.servoAngle <= s.servoMin) {
        s.servoAngle = s.servoMin;
        s.servoDir = 1;
      }
      setServoAngle(s.servoAngle);

      // 3. Distance & Stage
      const dist = Math.max(0, s.obstacleZ - s.trainZ - 1.5);
      let stage: WarningStage = 'CLEAR';

      if (s.systemEnabled) {
        if (dist <= 38) {
          stage = 'CRITICAL';
        } else if (dist <= 95) {
          stage = 'CAUTION';
        } else {
          stage = 'CLEAR';
        }
      } else {
        // Disabled system: late visual cue
        if (dist <= 40) {
          stage = 'CAUTION';
        }
      }

      // Sound notifications on stage transitions
      if (stage !== s.warningStage) {
        s.warningStage = stage;
        setWarningStage(stage);

        if (stage === 'CAUTION') {
          soundFX.playCautionAlert();
        } else if (stage === 'CRITICAL') {
          soundFX.playCriticalAlarm();
        }
      }

      // Driver reaction tracking
      if (stage !== 'CLEAR' && !s.warningFirstShownTime && s.active) {
        s.warningFirstShownTime = now;
      }

      if (s.warningFirstShownTime && !s.driverBrakePressedTime && s.active) {
        const sec = (now - s.warningFirstShownTime) / 1000;
        setReactionTimeElapsed(sec);
        s.reactionDistanceTravelled = s.speedMs * sec;
      }

      // Occasional sonar ping
      sonarSoundTimer += dt;
      if (sonarSoundTimer > 1.2 && s.systemEnabled && s.active) {
        sonarSoundTimer = 0;
        soundFX.playSonarPing();
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Computed values
  const currentDistance = Math.max(0, obstacleZ - trainZ - 1.5);
  const timeOfFlightMs = (2 * currentDistance / 343) * 1000;
  const timeToImpactSec = speedMs > 0.5 ? currentDistance / speedMs : null;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <Header
        cameraMode={cameraMode}
        onCameraChange={setCameraMode}
        onOpenPhysics={() => setIsPhysicsOpen(true)}
        onOpenHardware={() => setIsHardwareOpen(true)}
        onOpenSafety={() => setIsSafetyOpen(true)}
        onOpenSplitComparison={() => setIsSplitOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Main Viewport & Console */}
      <main className="flex-1 flex flex-col xl:flex-row relative overflow-hidden">
        {/* Left / 3D Simulation Canvas */}
        <ThreeCanvas
          speedKmh={speedKmh}
          speedMs={speedMs}
          trainZ={trainZ}
          obstacleZ={obstacleZ}
          distance={currentDistance}
          timeOfFlightMs={timeOfFlightMs}
          servoAngle={servoAngle}
          warningStage={warningStage}
          systemEnabled={systemEnabled}
          cameraMode={cameraMode}
          onCameraChange={setCameraMode}
          outcomeData={outcomeData}
          onRestart={handleResetTrack}
          onOpenSplitComparison={() => {
            setOutcomeData(null);
            setIsSplitOpen(true);
          }}
        />

        {/* Right / Driver Control Desk & Sensor Instrumentation Panel */}
        <DriverConsole
          active={active}
          speedKmh={speedKmh}
          speedMs={speedMs}
          distance={currentDistance}
          timeOfFlightMs={timeOfFlightMs}
          timeToImpactSec={timeToImpactSec}
          reactionTimeElapsed={reactionTimeElapsed}
          servoAngle={servoAngle}
          warningStage={warningStage}
          systemEnabled={systemEnabled}
          braking={braking}
          onStartJourney={handleStartJourney}
          onApplyBrake={handleApplyBrake}
          onResetTrack={handleResetTrack}
          onCoast={handleCoast}
          onAccelerate={handleAccelerate}
          onToggleSystem={handleToggleSystem}
          targetMaxSpeed={maxSpeedKmh}
          onSelectMaxSpeed={handleSelectMaxSpeed}
        />
      </main>

      {/* Modals */}
      <PhysicsModal
        isOpen={isPhysicsOpen}
        onClose={() => setIsPhysicsOpen(false)}
      />
      <HardwareModal
        isOpen={isHardwareOpen}
        onClose={() => setIsHardwareOpen(false)}
      />
      <SafetyModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
      />
      <SplitComparisonModal
        isOpen={isSplitOpen}
        onClose={() => setIsSplitOpen(false)}
      />
    </div>
  );
}
