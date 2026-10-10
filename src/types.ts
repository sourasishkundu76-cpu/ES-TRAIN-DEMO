export type CameraViewMode = 'cab' | 'bumper' | 'side';

export type WarningStage = 'CLEAR' | 'CAUTION' | 'CRITICAL';

export type ObstacleType = 'rock' | 'maintenance_cart' | 'fallen_tree';

export interface SimulationState {
  active: boolean;
  speedKmh: number;
  maxSpeedKmh: number;
  speedMs: number;
  trainZ: number;
  obstacleZ: number;
  braking: boolean;
  brakeDecel: number;
  accelRate: number;
  systemEnabled: boolean;
  cameraMode: CameraViewMode;
  obstacleType: ObstacleType;
  
  // Servo scanning
  servoAngle: number; // 0 to 90 degrees
  servoDir: number;   // 1 or -1
  servoSpeed: number; // deg/sec
  
  // Timing & telemetry
  warningFirstShownTime: number | null;
  driverBrakePressedTime: number | null;
  reactionRecordedSeconds: number | null;
  reactionDistanceTravelled: number;
  brakingInitiatedDist: number;
  
  // Stage
  warningStage: WarningStage;
  
  // Audio state
  soundEnabled: boolean;
}

export interface RunOutcomeData {
  collision: boolean;
  initialSpeedKmh: number;
  reactionTimeSec: number;
  reactionDistanceMeters: number;
  brakingDistanceMeters: number;
  remainingMarginMeters: number;
}
