import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CameraViewMode, WarningStage, RunOutcomeData } from '../types';
import { Crosshair, Disc, Train, Check, AlertOctagon, RotateCcw, Columns2 } from 'lucide-react';

interface ThreeCanvasProps {
  speedKmh: number;
  speedMs: number;
  trainZ: number;
  obstacleZ: number;
  distance: number;
  timeOfFlightMs: number;
  servoAngle: number;
  warningStage: WarningStage;
  systemEnabled: boolean;
  cameraMode: CameraViewMode;
  onCameraChange: (mode: CameraViewMode) => void;
  outcomeData: RunOutcomeData | null;
  onRestart: () => void;
  onOpenSplitComparison: () => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  speedKmh,
  trainZ,
  obstacleZ,
  distance,
  timeOfFlightMs,
  servoAngle,
  warningStage,
  systemEnabled,
  cameraMode,
  onCameraChange,
  outcomeData,
  onRestart,
  onOpenSplitComparison,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const trainGroupRef = useRef<THREE.Group | null>(null);
  const sensorPivotRef = useRef<THREE.Group | null>(null);
  const waveRingRef = useRef<THREE.Mesh | null>(null);
  const headLightRef = useRef<THREE.SpotLight | null>(null);
  const obstacleGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x0a1020, 0.0055);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      800
    );
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x2a3b5c, 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xa5c9eb, 1.5);
    dirLight.position.set(40, 80, 50);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Locomotive Headlight
    const headLight = new THREE.SpotLight(0xdbeafe, 4.2, 180, Math.PI / 6, 0.45, 1.0);
    headLight.position.set(0, 1.5, 0);
    headLight.target.position.set(0, 1.0, 100);
    scene.add(headLight);
    scene.add(headLight.target);
    headLightRef.current = headLight;

    // Ground terrain
    const groundGeo = new THREE.PlaneGeometry(320, 800, 16, 16);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x09111e,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.05, 300);
    scene.add(ground);

    // Ballast Gravel Bed
    const ballastGeo = new THREE.BoxGeometry(4.4, 0.3, 800);
    const ballastMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.95 });
    const ballast = new THREE.Mesh(ballastGeo, ballastMat);
    ballast.position.set(0, 0.05, 300);
    scene.add(ballast);

    // Steel Rails (Standard Gauge 1435mm)
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });
    const railGeo = new THREE.BoxGeometry(0.12, 0.22, 800);

    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-0.95, 0.25, 300);
    scene.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(0.95, 0.25, 300);
    scene.add(rightRail);

    // Sleepers (Ties)
    const sleeperGeo = new THREE.BoxGeometry(2.6, 0.14, 0.35);
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const sleeperGroup = new THREE.Group();
    for (let z = -20; z < 700; z += 1.2) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(0, 0.15, z);
      sleeperGroup.add(sleeper);
    }
    scene.add(sleeperGroup);

    // Overhead Catenary Poles
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 7.2, 8);
    const armGeo = new THREE.BoxGeometry(4.5, 0.08, 0.08);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
    for (let z = 0; z < 700; z += 40) {
      const pole = new THREE.Mesh(poleGeo, metalMat);
      pole.position.set(-3.2, 3.6, z);
      scene.add(pole);

      const arm = new THREE.Mesh(armGeo, metalMat);
      arm.position.set(-1.0, 7.0, z);
      scene.add(arm);
    }

    // Scenery Trees
    const treeTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2.5, 6);
    const treeFoliageGeo = new THREE.ConeGeometry(1.6, 4.5, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3f2e21 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x143423, roughness: 0.9 });

    for (let i = 0; i < 90; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (7 + ((i * 13) % 18));
      const z = (i * 7.5) % 700;

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(treeTrunkGeo, trunkMat);
      trunk.position.y = 1.25;
      const foliage = new THREE.Mesh(treeFoliageGeo, foliageMat);
      foliage.position.y = 3.8;
      tree.add(trunk);
      tree.add(foliage);
      tree.position.set(x, 0, z);
      scene.add(tree);
    }

    // Locomotive Train Group
    const trainGroup = new THREE.Group();
    trainGroupRef.current = trainGroup;

    // Train Body
    const trainBodyGeo = new THREE.BoxGeometry(3.0, 3.2, 12);
    const trainBodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 });
    const trainBody = new THREE.Mesh(trainBodyGeo, trainBodyMat);
    trainBody.position.set(0, 2.0, -6);
    trainGroup.add(trainBody);

    // Cab Nose
    const cabNoseGeo = new THREE.BoxGeometry(2.9, 2.4, 2.5);
    const cabNoseMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
    const cabNose = new THREE.Mesh(cabNoseGeo, cabNoseMat);
    cabNose.position.set(0, 1.6, 0.2);
    trainGroup.add(cabNose);

    // Windshield Glass
    const windshieldGeo = new THREE.BoxGeometry(2.6, 1.2, 0.1);
    const windshieldMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      transmission: 0.8,
    });
    const windshield = new THREE.Mesh(windshieldGeo, windshieldMat);
    windshield.position.set(0, 2.2, 1.4);
    trainGroup.add(windshield);

    // Bumper / Cowcatcher
    const bumperGeo = new THREE.BoxGeometry(2.8, 0.5, 0.4);
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const bumper = new THREE.Mesh(bumperGeo, bumperMat);
    bumper.position.set(0, 0.45, 1.45);
    trainGroup.add(bumper);

    // Physical HC-SR04 Sensor + Servo Rig on bumper
    const sensorRig = new THREE.Group();
    sensorRig.position.set(0, 0.8, 1.55);

    // Micro Servo Body
    const servoBaseGeo = new THREE.BoxGeometry(0.35, 0.25, 0.3);
    const servoBaseMat = new THREE.MeshStandardMaterial({ color: 0x2563eb });
    const servoBase = new THREE.Mesh(servoBaseGeo, servoBaseMat);
    sensorRig.add(servoBase);

    // Pivoting Turret
    const sensorPivot = new THREE.Group();
    sensorPivot.position.set(0, 0.16, 0);
    sensorPivotRef.current = sensorPivot;

    // HC-SR04 Blue PCB
    const pcbGeo = new THREE.BoxGeometry(0.7, 0.3, 0.05);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    sensorPivot.add(pcb);

    // Transducers (Transmitter & Receiver metallic cans)
    const transducerGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16);
    transducerGeo.rotateX(Math.PI / 2);
    const transducerMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });

    const txMesh = new THREE.Mesh(transducerGeo, transducerMat);
    txMesh.position.set(-0.2, 0, 0.1);
    sensorPivot.add(txMesh);

    const rxMesh = new THREE.Mesh(transducerGeo, transducerMat);
    rxMesh.position.set(0.2, 0, 0.1);
    sensorPivot.add(rxMesh);

    // Ultrasonic Wave Indicator Ring in 3D
    const waveRingGeo = new THREE.RingGeometry(0.1, 0.25, 16);
    const waveRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const waveRing = new THREE.Mesh(waveRingGeo, waveRingMat);
    waveRing.position.set(0, 0, 0.4);
    sensorPivot.add(waveRing);
    waveRingRef.current = waveRing;

    sensorRig.add(sensorPivot);
    trainGroup.add(sensorRig);
    scene.add(trainGroup);

    // Obstacle Mesh on Track
    const obstacleGroup = new THREE.Group();
    obstacleGroupRef.current = obstacleGroup;

    // Rocky Debris
    const rockGeo = new THREE.DodecahedronGeometry(0.85, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.85, metalness: 0.15 });
    const rock1 = new THREE.Mesh(rockGeo, rockMat);
    rock1.position.set(-0.2, 0.65, 0);
    obstacleGroup.add(rock1);

    const rock2 = new THREE.Mesh(rockGeo, rockMat);
    rock2.scale.set(0.65, 0.65, 0.65);
    rock2.position.set(0.5, 0.45, -0.3);
    obstacleGroup.add(rock2);

    // Barrier with Hazard stripes
    const barrierGeo = new THREE.BoxGeometry(2.2, 0.6, 0.5);
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
    const barrier = new THREE.Mesh(barrierGeo, barrierMat);
    barrier.position.set(0, 0.3, 0.2);
    obstacleGroup.add(barrier);

    obstacleGroup.position.set(0, 0, 145);
    scene.add(obstacleGroup);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Render loop
    let lastTime = performance.now();
    const renderLoop = (time: number) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      // Pulse ultrasonic wave in 3D
      if (waveRingRef.current) {
        const pulse = 1 + ((time * 0.003) % 2.5);
        waveRingRef.current.scale.set(pulse, pulse, 1);
        (waveRingRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.8 - pulse * 0.3);
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Update positions & camera whenever simulation state updates
  useEffect(() => {
    if (!trainGroupRef.current || !obstacleGroupRef.current || !cameraRef.current) return;

    // Train position
    trainGroupRef.current.position.z = trainZ;
    obstacleGroupRef.current.position.z = obstacleZ;

    // Servo rotation
    if (sensorPivotRef.current) {
      const servoRad = ((servoAngle - 45) * Math.PI) / 180;
      sensorPivotRef.current.rotation.y = -servoRad;
    }

    // Camera positioning
    const camera = cameraRef.current;
    if (cameraMode === 'cab') {
      camera.position.set(
        trainGroupRef.current.position.x,
        trainGroupRef.current.position.y + 2.3,
        trainGroupRef.current.position.z + 0.8
      );
      camera.lookAt(
        trainGroupRef.current.position.x,
        trainGroupRef.current.position.y + 2.1,
        trainGroupRef.current.position.z + 120
      );
    } else if (cameraMode === 'bumper') {
      camera.position.set(
        trainGroupRef.current.position.x + 1.2,
        trainGroupRef.current.position.y + 1.2,
        trainGroupRef.current.position.z + 3.2
      );
      camera.lookAt(
        trainGroupRef.current.position.x,
        trainGroupRef.current.position.y + 0.8,
        trainGroupRef.current.position.z + 20
      );
    } else {
      // Side track view
      camera.position.set(
        trainGroupRef.current.position.x + 6.5,
        trainGroupRef.current.position.y + 5.0,
        trainGroupRef.current.position.z - 8.0
      );
      camera.lookAt(
        trainGroupRef.current.position.x,
        trainGroupRef.current.position.y + 1.5,
        trainGroupRef.current.position.z + 45
      );
    }

    // Headlight tracking
    if (headLightRef.current) {
      headLightRef.current.position.set(
        trainGroupRef.current.position.x,
        trainGroupRef.current.position.y + 1.4,
        trainGroupRef.current.position.z + 1.5
      );
      headLightRef.current.target.position.set(
        trainGroupRef.current.position.x,
        trainGroupRef.current.position.y + 0.8,
        trainGroupRef.current.position.z + 80
      );
    }
  }, [trainZ, obstacleZ, servoAngle, cameraMode]);

  return (
    <div className="relative flex-1 bg-black min-h-[500px] lg:min-h-[580px] xl:min-h-[640px] flex items-center justify-center overflow-hidden">
      {/* Three.js Canvas Element */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* CAB COCKPIT WINDSHIELD OVERLAY (Visible in Driver Cab View) */}
      <div
        className={`absolute inset-0 pointer-events-none z-10 flex flex-col justify-between cab-glass transition-opacity duration-300 ${
          cameraMode === 'cab' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Cab Structure & Sun Visors */}
        <div className="w-full h-14 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent flex items-center justify-between px-6 sm:px-8 border-b border-slate-800/30">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            CAB 01 • FORWARD TRACK WINDSHIELD HUD
          </div>
          <div className="text-[11px] font-mono text-cyan-400 bg-slate-900/90 px-2.5 py-1 rounded border border-cyan-500/20 shadow-sm">
            SONIC FOV: 30° SCAN HORIZON
          </div>
        </div>

        {/* Center Crosshair & Target Reticle on Rails */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 border border-cyan-500/15 rounded-full flex items-center justify-center relative">
            <div className="w-2 h-2 bg-cyan-400/40 rounded-full" />
            {/* Horizon lines */}
            <div className="absolute w-24 h-px bg-cyan-500/20 -left-12" />
            <div className="absolute w-24 h-px bg-cyan-500/20 -right-12" />
            {/* Dynamic scanning beam indicator matching servo angle */}
            <div
              className="absolute top-1/2 left-1/2 w-40 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent origin-left opacity-75 transition-transform duration-75"
              style={{
                transform: `translateY(-50%) rotate(${servoAngle - 45}deg)`,
              }}
            />
          </div>
        </div>

        {/* Windshield Wiper & Dashboard Frame Border */}
        <div className="w-full h-12 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent border-t border-slate-800/40 flex items-center justify-between px-6 sm:px-8">
          <span className="text-[10px] font-mono text-slate-500 tracking-wider hidden sm:inline">
            RAIL-GAUGE: 1435mm STANDARD • DUAL CONTINUOUS TRACK
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            HC-SR04 ULTRASONIC TRANSCEIVER MOUNTED AT BUMPER LEVEL (0.4m)
          </span>
        </div>
      </div>

      {/* ULTRASONIC WAVEFRONT RAY OVERLAY (Shown when detecting) */}
      <div
        className={`absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-15 flex flex-col items-center transition-opacity duration-300 ${
          warningStage !== 'CLEAR' && systemEnabled ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="relative w-44 h-20 flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border-2 border-cyan-400/80 wave-pulse" />
          <div
            className="absolute w-24 h-24 rounded-full border-2 border-cyan-400/60 wave-pulse"
            style={{ animationDelay: '0.4s' }}
          />
          <div
            className="absolute w-24 h-24 rounded-full border-2 border-cyan-400/40 wave-pulse"
            style={{ animationDelay: '0.8s' }}
          />
        </div>
        <div className="bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 px-3 py-1 rounded-lg text-[11px] font-mono shadow-xl flex items-center gap-2 backdrop-blur-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            40 kHz Ultrasonic Pulse • Time of Flight:{' '}
            <strong className="text-white">{timeOfFlightMs.toFixed(1)} ms</strong>
          </span>
        </div>
      </div>

      {/* IN-VIEW HUD NOTIFICATION POPUP (CAUTION / CRITICAL) */}
      <div
        className={`absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-300 ${
          warningStage !== 'CLEAR'
            ? 'opacity-100 transform translate-y-0'
            : 'opacity-0 transform -translate-y-4'
        }`}
      >
        {warningStage === 'CAUTION' && (
          <div className="px-6 py-3 rounded-xl border border-amber-500/80 bg-amber-950/85 backdrop-blur-xl shadow-2xl flex items-center gap-4 text-center">
            <div className="w-9 h-9 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400 flex items-center justify-center font-bold text-lg">
              !
            </div>
            <div className="text-left">
              <h4 className="font-extrabold text-sm tracking-wider uppercase text-amber-400">
                CAUTION: OBSTACLE DETECTED AHEAD
              </h4>
              <p className="text-xs text-slate-300">
                HC-SR04 scanning confirms echo at ~{distance.toFixed(0)}m. Prepare driver braking.
              </p>
            </div>
          </div>
        )}
        {warningStage === 'CRITICAL' && (
          <div className="px-6 py-3 rounded-xl border border-red-500 bg-red-950/90 backdrop-blur-xl shadow-2xl flex items-center gap-4 text-center animate-bounce">
            <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
              !
            </div>
            <div className="text-left">
              <h4 className="font-extrabold text-sm tracking-wider uppercase text-red-400">
                CRITICAL WARNING: STOP TRAIN
              </h4>
              <p className="text-xs text-slate-300">
                Immediate collision danger! Available distance &lt; 38m! Apply full brakes!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TOP FLOATING TELEMETRY MINI-BAR (On-Canvas) */}
      <div className="absolute top-4 left-6 z-20 pointer-events-auto flex items-center gap-2">
        <div className="glass-panel px-3.5 py-2 rounded-xl flex items-center gap-3 text-xs font-mono shadow-xl border border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                systemEnabled ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span className="text-slate-400">ECHO-SHIELD:</span>
            <span
              className={`font-bold ${
                systemEnabled ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {systemEnabled ? 'ACTIVE' : 'DISABLED (MODE A)'}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div>
            <span className="text-slate-400">SPEED:</span>
            <span className="font-bold text-white ml-1">
              {speedKmh.toFixed(0)} km/h
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div>
            <span className="text-slate-400">OBSTACLE DIST:</span>
            <span className="font-bold text-cyan-400 ml-1">
              {systemEnabled || distance <= 50 ? `${distance.toFixed(0)} m` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* CAMERA ANGLE SWITCHER BUTTONS (Floating bottom-left) */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
        <button
          onClick={() => onCameraChange('cab')}
          className={`glass-panel px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
            cameraMode === 'cab'
              ? 'text-cyan-300 border border-cyan-500/50 bg-slate-800/90'
              : 'text-slate-300 hover:bg-slate-800/70 border border-slate-700/40'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> Cab POV
        </button>
        <button
          onClick={() => onCameraChange('bumper')}
          className={`glass-panel px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
            cameraMode === 'bumper'
              ? 'text-cyan-300 border border-cyan-500/50 bg-slate-800/90'
              : 'text-slate-300 hover:bg-slate-800/70 border border-slate-700/40'
          }`}
        >
          <Disc className="w-3.5 h-3.5 text-amber-400" /> HC-SR04 Bumper Cam
        </button>
        <button
          onClick={() => onCameraChange('side')}
          className={`glass-panel px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
            cameraMode === 'side'
              ? 'text-cyan-300 border border-cyan-500/50 bg-slate-800/90'
              : 'text-slate-300 hover:bg-slate-800/70 border border-slate-700/40'
          }`}
        >
          <Train className="w-3.5 h-3.5 text-indigo-400" /> Side Rail View
        </button>
      </div>

      {/* LIVE RUN OUTCOME OVERLAY (Appears after stopping / overrun) */}
      {outcomeData && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-slate-700/80 shadow-2xl text-center space-y-4">
            <div
              className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg ${
                !outcomeData.collision && outcomeData.remainingMarginMeters > 0.5
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {!outcomeData.collision && outcomeData.remainingMarginMeters > 0.5 ? (
                <Check className="w-8 h-8" />
              ) : (
                <AlertOctagon className="w-8 h-8" />
              )}
            </div>

            <div>
              <h3
                className={`text-xl font-extrabold tracking-wide uppercase ${
                  !outcomeData.collision && outcomeData.remainingMarginMeters > 0.5
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {!outcomeData.collision && outcomeData.remainingMarginMeters > 0.5
                  ? 'OBSTACLE AVOIDED — SAFE STOP'
                  : 'COLLISION OVERRUN — LATE REACTION'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {!outcomeData.collision && outcomeData.remainingMarginMeters > 0.5
                  ? 'Obstacle detected early by HC-SR04 ultrasonic sensor. Timely brake initiation preserved safety margin.'
                  : 'The train could not stop within the available distance. Demonstrates why early sensor warning and rapid driver response are essential!'}
              </p>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-3.5 font-mono text-xs text-left space-y-1.5 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Initial Speed:</span>
                <span className="text-white font-bold">{outcomeData.initialSpeedKmh.toFixed(1)} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reaction Time:</span>
                <span className="text-amber-400 font-bold">{outcomeData.reactionTimeSec.toFixed(2)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reaction Distance (d = vt):</span>
                <span className="text-amber-300 font-bold">{outcomeData.reactionDistanceMeters.toFixed(1)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Braking Distance:</span>
                <span className="text-cyan-300 font-bold">{outcomeData.brakingDistanceMeters.toFixed(1)} m</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-300 font-semibold">Remaining Safe Margin:</span>
                <span
                  className={`font-extrabold text-sm ${
                    outcomeData.remainingMarginMeters > 0.5 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {outcomeData.remainingMarginMeters > 0.5
                    ? `+${outcomeData.remainingMarginMeters.toFixed(1)} m`
                    : '0.0 m (Impact)'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onRestart}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart Demo
              </button>
              <button
                onClick={onOpenSplitComparison}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Columns2 className="w-3.5 h-3.5" /> Mode Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
