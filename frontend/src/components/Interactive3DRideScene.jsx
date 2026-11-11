import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Bike, Car, Zap, Eye, Compass, Gauge, Play, Pause, 
  RotateCcw, Sparkles, MapPin, Shield, ArrowRight, Volume2, VolumeX, 
  Maximize2, Minimize2, Sun, Moon, CloudRain, Sunset, Palette, Navigation,
  Activity, Radio, FastForward
} from 'lucide-react';

// Sound Synthesizer using Native Web Audio API
class RideAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.osc = null;
    this.gain = null;
    this.filter = null;
    this.isMuted = true;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      
      this.osc = this.ctx.createOscillator();
      this.osc.type = 'sawtooth';
      this.osc.frequency.setValueAtTime(65, this.ctx.currentTime);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(350, this.ctx.currentTime);

      this.gain = this.ctx.createGain();
      this.gain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.osc.connect(this.filter);
      this.filter.connect(this.gain);
      this.gain.connect(this.ctx.destination);
      this.osc.start();
    } catch (e) {
      console.warn('Web Audio not available', e);
    }
  }

  updateEngine(speed, isNitro) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const targetFreq = 55 + (speed / 130) * 140;
    const filterFreq = isNitro ? 1200 : 320 + (speed / 130) * 450;
    const targetGain = isNitro ? 0.06 : 0.025;

    this.osc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.filter.frequency.setTargetAtTime(filterFreq, now, 0.08);
    this.gain.gain.setTargetAtTime(targetGain, now, 0.08);
  }

  playHorn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const hornOsc = this.ctx.createOscillator();
    const hornGain = this.ctx.createGain();
    hornOsc.type = 'triangle';
    hornOsc.frequency.setValueAtTime(440, now);
    hornGain.gain.setValueAtTime(0.08, now);
    hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    hornOsc.connect(hornGain);
    hornGain.connect(this.ctx.destination);
    hornOsc.start();
    hornOsc.stop(now + 0.35);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } else if (this.gain && this.ctx) {
      this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return !this.isMuted;
  }
}

// Procedural texture generators for realistic buildings, asphalt, and road markings
function createProceduralBuildingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, 0, 256, 512);

  // Vertical architectural mullions
  ctx.fillStyle = '#0f172a';
  for (let x = 0; x < 256; x += 32) {
    ctx.fillRect(x, 0, 4, 512);
  }

  // Windows grid with realistic glowing variations
  for (let y = 14; y < 500; y += 20) {
    for (let x = 8; x < 248; x += 16) {
      const rand = Math.random();
      if (rand > 0.42) {
        if (rand > 0.88) {
          ctx.fillStyle = '#38bdf8'; // bright cyan office
        } else if (rand > 0.72) {
          ctx.fillStyle = '#06b6d4'; // teal office
        } else if (rand > 0.58) {
          ctx.fillStyle = '#fef08a'; // warm warm light
        } else {
          ctx.fillStyle = '#1e293b'; // dim/unlit
        }
        ctx.fillRect(x, y, 10, 12);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createAsphaltRoadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Dark asphalt base
  ctx.fillStyle = '#0f141f';
  ctx.fillRect(0, 0, 512, 512);

  // Micro surface grain
  const imgData = ctx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 16;
    imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + grain));
    imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + grain));
    imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + grain + 2));
  }
  ctx.putImageData(imgData, 0, 0);

  // Road markings:
  // Center double yellow line
  ctx.fillStyle = '#facc15';
  ctx.fillRect(253, 0, 3, 512);
  ctx.fillRect(259, 0, 3, 512);

  // White lane dashes
  ctx.fillStyle = '#e2e8f0';
  for (let y = 0; y < 512; y += 64) {
    ctx.fillRect(128, y, 4, 32);
    ctx.fillRect(384, y, 4, 32);
  }

  // Outer solid edge lines
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(16, 0, 4, 512);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(492, 0, 4, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 30);
  return texture;
}

export default function Interactive3DRideScene({ onBookRideWithRoute }) {
  const mountRef = useRef(null);
  const audioRef = useRef(null);

  // Vehicle & Driving states
  const [vehicleType, setVehicleType] = useState('bike'); // 'bike' or 'car'
  const [cameraMode, setCameraMode] = useState('chase'); // 'chase', 'cockpit', 'cinematic', 'orbit'
  const [vehicleColor, setVehicleColor] = useState('#06b6d4'); // Cyan, Black, Red, Gold, Emerald
  const [driveMode, setDriveMode] = useState('auto'); // 'auto' or 'manual'
  const [isPaused, setIsPaused] = useState(false);
  const [isNitro, setIsNitro] = useState(false);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isBraking, setIsBraking] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState('neon'); // 'neon', 'sunset', 'daylight', 'rain'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  // Live Telemetry states
  const [currentSpeed, setCurrentSpeed] = useState(68);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentWaypoint, setCurrentWaypoint] = useState('Innovation Tech Park');
  const [tripDistance, setTripDistance] = useState(1.2);
  const [co2Saved, setCo2Saved] = useState(0.42);

  const waypoints = [
    { progress: 0.0, name: 'Innovation Tech Park (Pickup)', distance: '0.0 km', eta: 'Now' },
    { progress: 0.25, name: 'Cyber Harbor Cable Bridge', distance: '2.4 km', eta: '4 min' },
    { progress: 0.50, name: 'Metro Skyway Interchange', distance: '4.8 km', eta: '8 min' },
    { progress: 0.75, name: 'Coastal Highline Overlook', distance: '7.1 km', eta: '11 min' },
    { progress: 0.96, name: 'YatraGo Downtown Hub (Dropoff)', distance: '9.4 km', eta: '14 min' }
  ];

  const colorPresets = [
    { name: 'Cyber Cyan', hex: '#06b6d4' },
    { name: 'Phantom Black', hex: '#111827' },
    { name: 'Hyper Crimson', hex: '#ef4444' },
    { name: 'Solar Gold', hex: '#f59e0b' },
    { name: 'Emerald Pulse', hex: '#10b981' }
  ];

  // Ref holding mutable states accessed inside requestAnimationFrame loop
  const animRef = useRef({
    vehicleType: 'bike',
    cameraMode: 'chase',
    vehicleColor: '#06b6d4',
    driveMode: 'auto',
    isPaused: false,
    isNitro: false,
    isAccelerating: false,
    isBraking: false,
    progress: 0,
    speed: 68,
    targetSpeed: 68,
    leanAngle: 0,
    mouseDrag: false,
    prevMouseX: 0,
    prevMouseY: 0,
    orbitAngleX: 0.35,
    orbitAngleY: 0.22,
    timeOfDay: 'neon'
  });

  // Sync state changes with ref
  useEffect(() => { animRef.current.vehicleType = vehicleType; }, [vehicleType]);
  useEffect(() => { animRef.current.cameraMode = cameraMode; }, [cameraMode]);
  useEffect(() => { animRef.current.vehicleColor = vehicleColor; }, [vehicleColor]);
  useEffect(() => { animRef.current.driveMode = driveMode; }, [driveMode]);
  useEffect(() => { animRef.current.isPaused = isPaused; }, [isPaused]);
  useEffect(() => { animRef.current.isNitro = isNitro; }, [isNitro]);
  useEffect(() => { animRef.current.isAccelerating = isAccelerating; }, [isAccelerating]);
  useEffect(() => { animRef.current.isBraking = isBraking; }, [isBraking]);
  useEffect(() => { animRef.current.timeOfDay = timeOfDay; }, [timeOfDay]);

  // Audio setup
  useEffect(() => {
    audioRef.current = new RideAudioSynthesizer();
    return () => {
      if (audioRef.current && audioRef.current.ctx) {
        audioRef.current.ctx.close();
      }
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;
    const active = audioRef.current.toggleMute();
    setIsAudioMuted(!active);
  };

  const triggerHorn = () => {
    if (audioRef.current) {
      audioRef.current.playHorn();
    }
  };

  // Keyboard controls for realistic interactive driving
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setIsAccelerating(true);
        setDriveMode('manual');
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        setIsBraking(true);
        setDriveMode('manual');
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsNitro(prev => !prev);
      } else if (e.code === 'KeyH') {
        triggerHorn();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setIsAccelerating(false);
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        setIsBraking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 3D WebGL Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer = null;
    let animationFrameId = null;
    let handleResize = null;
    let handleMouseDown = null;
    let handleMouseMove = null;
    let handleMouseUp = null;

    try {
      const width = Math.max(container.clientWidth || 800, 320);
      const height = Math.max(container.clientHeight || 560, 360);

      // 1. Scene, Renderer, Camera
      const scene = new THREE.Scene();

    const envConfigs = {
      neon: {
        bg: 0x050814,
        fog: 0x050814,
        ambient: 0x1e293b,
        ambientInt: 2.2,
        sun: 0x06b6d4,
        sunInt: 2.5,
        roadLight: 0x38bdf8
      },
      sunset: {
        bg: 0x1e1026,
        fog: 0x1e1026,
        ambient: 0x4a1d36,
        ambientInt: 2.4,
        sun: 0xf59e0b,
        sunInt: 3.2,
        roadLight: 0xfbbf24
      },
      daylight: {
        bg: 0x0a192f,
        fog: 0x0a192f,
        ambient: 0x475569,
        ambientInt: 2.8,
        sun: 0xffffff,
        sunInt: 3.0,
        roadLight: 0xffffff
      },
      rain: {
        bg: 0x030712,
        fog: 0x030712,
        ambient: 0x0f172a,
        ambientInt: 1.8,
        sun: 0x0284c7,
        sunInt: 2.0,
        roadLight: 0x06b6d4
      }
    };

    const currentEnv = envConfigs[timeOfDay] || envConfigs.neon;
    scene.background = new THREE.Color(currentEnv.bg);
    scene.fog = new THREE.FogExp2(currentEnv.fog, timeOfDay === 'rain' ? 0.012 : 0.008);

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1000);
    camera.position.set(0, 10, 24);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Realistic Environmental Lighting
    const ambientLight = new THREE.AmbientLight(currentEnv.ambient, currentEnv.ambientInt);
    scene.add(ambientLight);

    const mainSunLight = new THREE.DirectionalLight(currentEnv.sun, currentEnv.sunInt);
    mainSunLight.position.set(50, 90, 60);
    mainSunLight.castShadow = true;
    mainSunLight.shadow.mapSize.width = 1024;
    mainSunLight.shadow.mapSize.height = 1024;
    mainSunLight.shadow.camera.near = 0.5;
    mainSunLight.shadow.camera.far = 250;
    mainSunLight.shadow.camera.left = -50;
    mainSunLight.shadow.camera.right = 50;
    mainSunLight.shadow.camera.top = 50;
    mainSunLight.shadow.camera.bottom = -50;
    scene.add(mainSunLight);

    // 3. Procedural Starfield & Sky Ambience
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 400;
      starPos[i + 1] = Math.random() * 140 + 20;
      starPos[i + 2] = (Math.random() - 0.5) * 400;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 1.2,
      transparent: true,
      opacity: timeOfDay === 'daylight' ? 0.2 : 0.85
    });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // 4. Multi-Elevation Winding 3D Highway Spline
    const splinePoints = [
      new THREE.Vector3(-105, 0, -65),
      new THREE.Vector3(-45, 5, -110),
      new THREE.Vector3(40, 16, -95),  // Elevated suspension bridge entrance
      new THREE.Vector3(110, 22, -30),  // High summit bridge apex
      new THREE.Vector3(100, 12, 50),
      new THREE.Vector3(45, 4, 105),
      new THREE.Vector3(-40, 0, 85),
      new THREE.Vector3(-95, 0, 20)
    ];

    const curve = new THREE.CatmullRomCurve3(splinePoints, true, 'centripetal', 0.5);

    // Generate Asphalt Highway Ribbon Mesh
    const segments = 400;
    const roadWidth = 6.4;
    const roadPoints = curve.getSpacedPoints(segments);
    const roadNormals = [];

    const roadGeo = new THREE.BufferGeometry();
    const positions = [];
    const uvs = [];
    const indices = [];
    const upVector = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const pt = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const normal = new THREE.Vector3().crossVectors(tangent, upVector).normalize();
      roadNormals.push(normal);

      // Left vertex
      const leftPt = pt.clone().addScaledVector(normal, -roadWidth / 2);
      positions.push(leftPt.x, leftPt.y, leftPt.z);
      uvs.push(0, t * 30);

      // Right vertex
      const rightPt = pt.clone().addScaledVector(normal, roadWidth / 2);
      positions.push(rightPt.x, rightPt.y, rightPt.z);
      uvs.push(1, t * 30);

      if (i < segments) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setIndex(indices);
    roadGeo.computeVertexNormals();

    const roadTexture = createAsphaltRoadTexture();
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: timeOfDay === 'rain' ? 0.15 : 0.45,
      metalness: timeOfDay === 'rain' ? 0.7 : 0.25
    });

    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    // Guard rails & road safety barriers with glowing reflectors
    const railGroup = new THREE.Group();
    for (let i = 0; i < segments; i += 4) {
      const pt = roadPoints[i];
      const norm = roadNormals[i];

      const leftPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
      );
      leftPost.position.copy(pt).addScaledVector(norm, -roadWidth / 2 - 0.2).add(new THREE.Vector3(0, 0.4, 0));
      railGroup.add(leftPost);

      // Reflector stud
      const stud = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.06),
        new THREE.MeshBasicMaterial({ color: i % 8 === 0 ? 0xef4444 : 0xffffff })
      );
      stud.position.copy(leftPost.position).add(new THREE.Vector3(0, 0.25, 0));
      railGroup.add(stud);

      const rightPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
      );
      rightPost.position.copy(pt).addScaledVector(norm, roadWidth / 2 + 0.2).add(new THREE.Vector3(0, 0.4, 0));
      railGroup.add(rightPost);
    }
    scene.add(railGroup);

    // 5. Cable-Stayed Suspension Bridge Pylons & Cables (at Summit)
    const bridgeGroup = new THREE.Group();
    const bridgeApexPt = curve.getPointAt(0.35);
    const bridgeTangent = curve.getTangentAt(0.35).normalize();
    const bridgeNorm = new THREE.Vector3().crossVectors(bridgeTangent, upVector).normalize();

    // Tower Pylons
    const towerGeo = new THREE.BoxGeometry(1.6, 36, 1.6);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2
    });

    const leftTower = new THREE.Mesh(towerGeo, towerMat);
    leftTower.position.copy(bridgeApexPt).addScaledVector(bridgeNorm, -roadWidth / 2 - 2).add(new THREE.Vector3(0, 14, 0));
    bridgeGroup.add(leftTower);

    const rightTower = new THREE.Mesh(towerGeo, towerMat);
    rightTower.position.copy(bridgeApexPt).addScaledVector(bridgeNorm, roadWidth / 2 + 2).add(new THREE.Vector3(0, 14, 0));
    bridgeGroup.add(rightTower);

    // Cross brace atop towers
    const crossBrace = new THREE.Mesh(
      new THREE.BoxGeometry(roadWidth + 4, 1.2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 })
    );
    crossBrace.position.copy(bridgeApexPt).add(new THREE.Vector3(0, 31, 0));
    bridgeGroup.add(crossBrace);

    // Suspension cables
    const cableMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    [-18, -12, -6, 6, 12, 18].forEach(offset => {
      const deckPt = bridgeApexPt.clone().addScaledVector(bridgeTangent, offset);
      const cableGeoL = new THREE.BufferGeometry().setFromPoints([
        leftTower.position.clone().add(new THREE.Vector3(0, 16, 0)),
        deckPt.clone().addScaledVector(bridgeNorm, -roadWidth / 2)
      ]);
      bridgeGroup.add(new THREE.Line(cableGeoL, cableMat));

      const cableGeoR = new THREE.BufferGeometry().setFromPoints([
        rightTower.position.clone().add(new THREE.Vector3(0, 16, 0)),
        deckPt.clone().addScaledVector(bridgeNorm, roadWidth / 2)
      ]);
      bridgeGroup.add(new THREE.Line(cableGeoR, cableMat));
    });

    scene.add(bridgeGroup);

    // 6. Modern Curved Highway Streetlights with Light Pools
    const streetlightGroup = new THREE.Group();
    for (let i = 0; i < segments; i += 28) {
      const pt = roadPoints[i];
      const norm = roadNormals[i];

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 6, 12),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
      );
      pole.position.copy(pt).addScaledVector(norm, roadWidth / 2 + 1.2).add(new THREE.Vector3(0, 3, 0));
      streetlightGroup.add(pole);

      // Light head
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.15, 0.4),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      head.position.copy(pole.position).addScaledVector(norm, -0.6).add(new THREE.Vector3(0, 3, 0));
      streetlightGroup.add(head);

      // Downward additive pool light on highway asphalt (zero uniform overhead)
      const poolGeo = new THREE.PlaneGeometry(5.4, 5.4);
      const poolMat = new THREE.MeshBasicMaterial({
        color: currentEnv.roadLight,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const lightPool = new THREE.Mesh(poolGeo, poolMat);
      lightPool.rotation.x = -Math.PI / 2;
      lightPool.position.copy(pt).add(new THREE.Vector3(0, 0.04, 0));
      streetlightGroup.add(lightPool);
    }
    scene.add(streetlightGroup);

    // 7. Overhead Digital Highway Gantry Signs
    const gantryGroup = new THREE.Group();
    [0.18, 0.62].forEach((tPos, idx) => {
      const gPt = curve.getPointAt(tPos);
      const gTan = curve.getTangentAt(tPos).normalize();
      const gNorm = new THREE.Vector3().crossVectors(gTan, upVector).normalize();

      const gantryMesh = new THREE.Mesh(
        new THREE.BoxGeometry(roadWidth + 3, 1.4, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
      );
      gantryMesh.position.copy(gPt).add(new THREE.Vector3(0, 5.2, 0));
      gantryMesh.lookAt(gPt.clone().add(gTan));

      // Glowing LED Message Plate
      const ledSign = new THREE.Mesh(
        new THREE.PlaneGeometry(roadWidth + 1.5, 0.9),
        new THREE.MeshBasicMaterial({ color: idx === 0 ? 0x06b6d4 : 0x10b981 })
      );
      ledSign.position.set(0, 0, 0.32);
      gantryMesh.add(ledSign);

      gantryGroup.add(gantryMesh);
    });
    scene.add(gantryGroup);

    // 8. Procedural Realistic Skyscrapers with Windows
    const cityGroup = new THREE.Group();
    const buildingTexture = createProceduralBuildingTexture();
    const buildingCount = 65;

    for (let i = 0; i < buildingCount; i++) {
      const bHeight = Math.random() * 55 + 20;
      const bWidth = Math.random() * 10 + 6;
      const bDepth = Math.random() * 10 + 6;

      const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      const bMat = new THREE.MeshStandardMaterial({
        map: buildingTexture,
        roughness: 0.25,
        metalness: 0.85
      });

      const building = new THREE.Mesh(bGeo, bMat);

      // Safe placement away from highway
      let bx, bz;
      let valid = false;
      let attempts = 0;
      while (!valid && attempts < 20) {
        bx = (Math.random() - 0.5) * 260;
        bz = (Math.random() - 0.5) * 260;
        let tooClose = false;
        for (let k = 0; k < roadPoints.length; k += 6) {
          const d = Math.hypot(bx - roadPoints[k].x, bz - roadPoints[k].z);
          if (d < roadWidth + 10) {
            tooClose = true;
            break;
          }
        }
        if (!tooClose) valid = true;
        attempts++;
      }

      building.position.set(bx, bHeight / 2, bz);
      building.castShadow = true;
      building.receiveShadow = true;
      cityGroup.add(building);

      // Rooftop aviation flashing beacon
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xef4444 : 0x38bdf8 })
      );
      beacon.position.set(bx, bHeight + 0.5, bz);
      cityGroup.add(beacon);
    }
    scene.add(cityGroup);

    // Ground Grid Base
    const groundGrid = new THREE.GridHelper(320, 80, 0x06b6d4, 0x090d16);
    groundGrid.position.y = -0.05;
    scene.add(groundGrid);

    // 9. HIGH-FIDELITY DETAILED VEHICLE MODELS (SUPERBIKE & EV SHUTTLE)
    const vehicleContainer = new THREE.Group();

    // 9A. SUPERBIKE MODEL
    const bikeGroup = new THREE.Group();

    // Wheel Geometry with Spokes & Rubber Tread
    const wheelGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.32, 24);
    wheelGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.85 });

    // Front & Rear Spoke Wheels
    const rearWheel = new THREE.Mesh(wheelGeo, tireMat);
    rearWheel.position.set(0, 0.72, -1.35);
    rearWheel.castShadow = true;
    bikeGroup.add(rearWheel);

    const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
    frontWheel.position.set(0, 0.72, 1.35);
    frontWheel.castShadow = true;
    bikeGroup.add(frontWheel);

    // Rims & Perforated Disc Brakes
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1 });
    const brakeDiscMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 });
    const caliperMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    [rearWheel.position, frontWheel.position].forEach(pos => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.05, 8, 20), rimMat);
      rim.position.copy(pos);
      bikeGroup.add(rim);

      const brakeDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 16), brakeDiscMat);
      brakeDisc.rotateZ(Math.PI / 2);
      brakeDisc.position.copy(pos);
      bikeGroup.add(brakeDisc);

      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.12), caliperMat);
      caliper.position.copy(pos).add(new THREE.Vector3(0.14, 0.22, 0));
      bikeGroup.add(caliper);
    });

    // Front Chrome Suspension Forks
    const forkMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    [-0.2, 0.2].forEach(fx => {
      const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3), forkMat);
      fork.position.set(fx, 1.25, 1.15);
      fork.rotation.x = -0.25;
      bikeGroup.add(fork);
    });

    // Aerodynamic Chassis & Fairing (Dynamic Lacquer Paint)
    const bikeFairingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(vehicleColor),
      metalness: 0.9,
      roughness: 0.15
    });

    const bikeBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 1.9), bikeFairingMat);
    bikeBody.position.set(0, 1.15, 0);
    bikeBody.castShadow = true;
    bikeGroup.add(bikeBody);

    // Sculpted Gas Tank / Cowl
    const tank = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.3, 12), bikeFairingMat);
    tank.rotateX(Math.PI / 2);
    tank.position.set(0, 1.45, 0.35);
    bikeGroup.add(tank);

    // Handlebars with digital dashboard screen
    const handlebar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    handlebar.rotateZ(Math.PI / 2);
    handlebar.position.set(0, 1.62, 0.85);
    bikeGroup.add(handlebar);

    const dashScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.14, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    dashScreen.position.set(0, 1.68, 0.78);
    dashScreen.rotation.x = -0.4;
    bikeGroup.add(dashScreen);

    // Biker Rider Model in sport aerodynamic lean
    const riderTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.65, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
    );
    riderTorso.position.set(0, 1.85, -0.12);
    riderTorso.rotation.x = 0.32; // aggressive racing crouch
    bikeGroup.add(riderTorso);

    const riderHelmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.15 })
    );
    riderHelmet.position.set(0, 2.3, 0.12);
    bikeGroup.add(riderHelmet);

    const helmetVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.1, 0.16),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    helmetVisor.position.set(0, 2.3, 0.3);
    bikeGroup.add(helmetVisor);

    // Twin Projector LED Headlights projecting real forward light onto the highway
    const bikeHeadlight = new THREE.SpotLight(0x38bdf8, 5.0, 32, Math.PI / 5, 0.45, 1);
    bikeHeadlight.position.set(0, 1.25, 1.35);
    bikeHeadlight.target.position.set(0, 0, 14);
    bikeGroup.add(bikeHeadlight);
    bikeGroup.add(bikeHeadlight.target);

    // Rear LED Hazard Light Blade
    const bikeTailLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.08, 0.06),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    bikeTailLight.position.set(0, 1.32, -1.25);
    bikeGroup.add(bikeTailLight);

    // 9B. TESLA / CYBER EV SHUTTLE CAR MODEL
    const carGroup = new THREE.Group();

    const carBodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(vehicleColor),
      metalness: 0.92,
      roughness: 0.15
    });

    const carBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.85, 4.4), carBodyMat);
    carBody.position.set(0, 0.85, 0);
    carBody.castShadow = true;
    carGroup.add(carBody);

    // Tinted Panoramic Glass Roof
    const carRoof = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 0.65, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x082f49, transparent: true, opacity: 0.85, roughness: 0.1, metalness: 0.9 })
    );
    carRoof.position.set(0, 1.45, -0.2);
    carGroup.add(carRoof);

    // 4 Alloy Performance Wheels
    const carWheelGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.38, 20);
    carWheelGeo.rotateZ(Math.PI / 2);
    const carWheelPositions = [
      [-1.05, 0.58, 1.4],
      [1.05, 0.58, 1.4],
      [-1.05, 0.58, -1.4],
      [1.05, 0.58, -1.4]
    ];
    const carWheels = [];
    carWheelPositions.forEach(wPos => {
      const w = new THREE.Mesh(carWheelGeo, tireMat);
      w.position.set(...wPos);
      w.castShadow = true;
      carGroup.add(w);
      carWheels.push(w);
    });

    // Front Continuous LED Lightblade
    const carFrontLight = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.1, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    carFrontLight.position.set(0, 0.82, 2.22);
    carGroup.add(carFrontLight);

    const carHeadlight = new THREE.SpotLight(0x38bdf8, 4.5, 35, Math.PI / 4, 0.5);
    carHeadlight.position.set(0, 0.85, 2.2);
    carHeadlight.target.position.set(0, 0, 16);
    carGroup.add(carHeadlight);
    carGroup.add(carHeadlight.target);

    // Rear Red OLED Lightblade
    const carTailLight = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.1, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    carTailLight.position.set(0, 0.82, -2.22);
    carGroup.add(carTailLight);

    // Vehicle Contact Shadow
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 4.6),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.04;
    carGroup.add(shadowPlane);

    vehicleContainer.add(bikeGroup);
    vehicleContainer.add(carGroup);
    scene.add(vehicleContainer);

    // 10. Autonomous Ambient Commute Traffic on Highway
    const trafficCount = 3;
    const trafficCars = [];
    for (let t = 0; t < trafficCount; t++) {
      const tCar = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.8, 3.8),
        new THREE.MeshStandardMaterial({ color: t % 2 === 0 ? 0x0284c7 : 0x059669, metalness: 0.85, roughness: 0.25 })
      );
      // Headlights & taillights for traffic car
      const tHead = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      tHead.position.set(0, 0.4, 1.92);
      tCar.add(tHead);

      const tTail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      tTail.position.set(0, 0.4, -1.92);
      tCar.add(tTail);

      scene.add(tCar);
      trafficCars.push({
        mesh: tCar,
        progress: 0.15 + t * 0.3,
        speed: 0.00045 + t * 0.0001,
        laneOffset: t % 2 === 0 ? -1.8 : 1.8
      });
    }

    // 11. Exhaust Flame & Nitro Warp Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;

      particleColors[i * 3] = 0.02;
      particleColors[i * 3 + 1] = 0.72;
      particleColors[i * 3 + 2] = 0.95;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const exhaustParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(exhaustParticles);

    // 12. Rain Precipitation System (Active in Cyber Rain mode)
    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPos[i] = (Math.random() - 0.5) * 160;
      rainPos[i + 1] = Math.random() * 60;
      rainPos[i + 2] = (Math.random() - 0.5) * 160;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.75,
      transparent: true,
      opacity: timeOfDay === 'rain' ? 0.7 : 0.0
    });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    scene.add(rainSystem);

    // Mouse Interaction for 360° Drag Orbit
    handleMouseDown = (e) => {
      animRef.current.mouseDrag = true;
      animRef.current.prevMouseX = e.clientX;
      animRef.current.prevMouseY = e.clientY;
    };

    handleMouseMove = (e) => {
      if (!animRef.current.mouseDrag) return;
      const dx = e.clientX - animRef.current.prevMouseX;
      const dy = e.clientY - animRef.current.prevMouseY;

      animRef.current.orbitAngleX += dx * 0.007;
      animRef.current.orbitAngleY = Math.max(0.1, Math.min(Math.PI / 2.2, animRef.current.orbitAngleY - dy * 0.007));

      animRef.current.prevMouseX = e.clientX;
      animRef.current.prevMouseY = e.clientY;
    };

    handleMouseUp = () => {
      animRef.current.mouseDrag = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 13. Main 60-FPS Realistic Physics & Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      const {
        isPaused, isNitro, isAccelerating, isBraking, cameraMode,
        vehicleType, vehicleColor, driveMode
      } = animRef.current;

      // Update vehicle visibility and dynamic lacquer color
      bikeGroup.visible = vehicleType === 'bike';
      carGroup.visible = vehicleType === 'car';
      bikeHeadlight.visible = vehicleType === 'bike';
      carHeadlight.visible = vehicleType === 'car';

      const themeCol = new THREE.Color(vehicleColor);
      bikeFairingMat.color.copy(themeCol);
      carBodyMat.color.copy(themeCol);

      // Realistic speed physics calculations
      let targetKmh = 68;
      if (isNitro) {
        targetKmh = 124;
      } else if (isBraking) {
        targetKmh = 24;
      } else if (isAccelerating) {
        targetKmh = 98;
      }

      // Smooth acceleration lerp
      animRef.current.speed = THREE.MathUtils.lerp(animRef.current.speed, targetKmh, delta * 4);
      const currentKmh = Math.round(animRef.current.speed);

      // Web Audio engine frequency modulation
      if (audioRef.current) {
        audioRef.current.updateEngine(currentKmh, isNitro);
      }

      if (!isPaused) {
        // Curve progress advance based on realistic speed
        const speedMultiplier = (currentKmh / 68) * 0.00085;
        animRef.current.progress = (animRef.current.progress + speedMultiplier) % 1.0;
        const prog = animRef.current.progress;

        // Position & tangent along 3D highway spline
        const pos = curve.getPointAt(prog);
        const tangent = curve.getTangentAt(prog).normalize();
        const lookTarget = pos.clone().add(tangent);

        // Curvature calculation for realistic bike lean
        const nextProg = (prog + 0.006) % 1.0;
        const nextTangent = curve.getTangentAt(nextProg).normalize();
        const cross = new THREE.Vector3().crossVectors(tangent, nextTangent);
        const curvature = cross.y * 38; // Lean angle into apex

        vehicleContainer.position.copy(pos);
        vehicleContainer.lookAt(lookTarget);

        // Vehicle dynamics & wheel rotation
        const wheelRotSpeed = delta * (currentKmh * 0.28);
        if (vehicleType === 'bike') {
          bikeGroup.rotation.z = THREE.MathUtils.lerp(bikeGroup.rotation.z, -curvature * 1.6, delta * 8);
          rearWheel.rotation.x += wheelRotSpeed;
          frontWheel.rotation.x += wheelRotSpeed;
        } else {
          carGroup.rotation.z = THREE.MathUtils.lerp(carGroup.rotation.z, -curvature * 0.45, delta * 6);
          carWheels.forEach(w => {
            w.rotation.x += wheelRotSpeed;
          });
        }

        // Ambient traffic update
        trafficCars.forEach(tc => {
          tc.progress = (tc.progress + tc.speed) % 1.0;
          const tPos = curve.getPointAt(tc.progress);
          const tTan = curve.getTangentAt(tc.progress).normalize();
          const tNorm = new THREE.Vector3().crossVectors(tTan, upVector).normalize();
          tc.mesh.position.copy(tPos).addScaledVector(tNorm, tc.laneOffset).add(new THREE.Vector3(0, 0.4, 0));
          tc.mesh.lookAt(tc.mesh.position.clone().add(tTan));
        });

        // Exhaust flame & Nitro trail particles
        const tPositions = particleGeo.attributes.position.array;
        const tColors = particleGeo.attributes.color.array;
        for (let i = particleCount - 1; i > 0; i--) {
          tPositions[i * 3] = tPositions[(i - 1) * 3];
          tPositions[i * 3 + 1] = tPositions[(i - 1) * 3 + 1];
          tPositions[i * 3 + 2] = tPositions[(i - 1) * 3 + 2];
        }
        const exhaustOffset = pos.clone().addScaledVector(tangent, -1.9);
        tPositions[0] = exhaustOffset.x + (Math.random() - 0.5) * 0.3;
        tPositions[1] = exhaustOffset.y + 0.6 + Math.random() * 0.25;
        tPositions[2] = exhaustOffset.z + (Math.random() - 0.5) * 0.3;

        // Nitro color flare
        if (isNitro) {
          tColors[0] = 0.98; tColors[1] = 0.75; tColors[2] = 0.1; // Gold/orange nitro fire
        } else {
          tColors[0] = 0.02; tColors[1] = 0.72; tColors[2] = 0.95; // Cyan electric plasma
        }
        particleGeo.attributes.position.needsUpdate = true;
        particleGeo.attributes.color.needsUpdate = true;

        // Rain precipitation animation
        if (timeOfDay === 'rain') {
          const rPos = rainGeo.attributes.position.array;
          for (let i = 1; i < rainCount * 3; i += 3) {
            rPos[i] -= delta * 60;
            if (rPos[i] < 0) rPos[i] = 60;
          }
          rainGeo.attributes.position.needsUpdate = true;
        }

        // Camera Modes
        if (cameraMode === 'chase') {
          // Dynamic follow camera with realistic inertia
          const desiredCamPos = pos.clone()
            .addScaledVector(tangent, -10.5)
            .add(new THREE.Vector3(0, 4.4, 0));
          camera.position.lerp(desiredCamPos, delta * 7);
          camera.lookAt(pos.clone().add(tangent.clone().multiplyScalar(5)));
        } else if (cameraMode === 'cockpit') {
          // First-person view right over the handlebars or windshield
          const cockpitOffset = vehicleType === 'bike'
            ? pos.clone().addScaledVector(tangent, 0.4).add(new THREE.Vector3(0, 1.85, 0))
            : pos.clone().addScaledVector(tangent, 0.6).add(new THREE.Vector3(0, 1.45, 0));
          camera.position.copy(cockpitOffset);
          camera.lookAt(pos.clone().add(tangent.clone().multiplyScalar(16)));
        } else if (cameraMode === 'cinematic') {
          // Scenic aerial drone flyover
          const time = clock.getElapsedTime() * 0.35;
          camera.position.x = pos.x + Math.sin(time) * 26;
          camera.position.y = pos.y + 14;
          camera.position.z = pos.z + Math.cos(time) * 26;
          camera.lookAt(pos);
        } else if (cameraMode === 'orbit') {
          // 360-degree free touch & drag orbit around vehicle
          const dist = 16.5;
          const ox = animRef.current.orbitAngleX;
          const oy = animRef.current.orbitAngleY;
          camera.position.x = pos.x + dist * Math.cos(ox) * Math.cos(oy);
          camera.position.y = pos.y + dist * Math.sin(oy) + 2.5;
          camera.position.z = pos.z + dist * Math.sin(ox) * Math.cos(oy);
          camera.lookAt(pos.clone().add(new THREE.Vector3(0, 1.5, 0)));
        }

        // Live Telemetry Updates
        setCurrentSpeed(currentKmh);
        const percent = Math.round(prog * 100);
        setProgressPercent(percent);

        // Active Waypoint
        let closestWp = waypoints[0];
        for (let i = 0; i < waypoints.length; i++) {
          if (prog >= waypoints[i].progress) closestWp = waypoints[i];
        }
        setCurrentWaypoint(closestWp.name);
        setTripDistance((prog * 9.4).toFixed(1));
        setCo2Saved((prog * 2.1).toFixed(2));
      }

      renderer.render(scene, camera);
    };

    animate();

      handleResize = () => {
        if (!container || !renderer) return;
        const w = Math.max(container.clientWidth || 800, 320);
        const h = Math.max(container.clientHeight || 560, 360);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);
    } catch (err) {
      console.warn('WebGL Initialization Error / Fallback triggered:', err);
      setHasWebGLError(true);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (handleResize) window.removeEventListener('resize', handleResize);
      if (handleMouseDown) container.removeEventListener('mousedown', handleMouseDown);
      if (handleMouseMove) window.removeEventListener('mousemove', handleMouseMove);
      if (handleMouseUp) window.removeEventListener('mouseup', handleMouseUp);
      if (renderer) {
        try {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        } catch (e) {}
      }
    };
  }, [timeOfDay]);

  // Jump to specific waypoint on 3D highway
  const jumpToWaypoint = (wp) => {
    animRef.current.progress = wp.progress;
    setProgressPercent(Math.round(wp.progress * 100));
    setCurrentWaypoint(wp.name);
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden glass-panel border border-cyan-500/40 shadow-2xl transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50 bg-slate-950/98 flex flex-col' : 'w-full h-[580px]'
    }`}>
      
      {/* 3D WebGL Canvas Mount Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        title="Click and drag to rotate camera in 360° Orbit mode"
      />

      {/* High-Performance Fallback UI if WebGL is unavailable */}
      {hasWebGLError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/92 backdrop-blur-md p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl">
            <Zap size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white">YatraGo High-Efficiency Route Simulation</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Real-time telemetry, GPS waypoints, and smart fare splitting remain fully operational with reduced GPU power mode.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHasWebGLError(false)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:scale-105 transition-all shadow-lg"
            >
              Re-initialize 3D Engine
            </button>
            <button
              onClick={() => onBookRideWithRoute?.({ waypoint: currentWaypoint, speed: currentSpeed })}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-400 font-bold text-xs hover:scale-105 transition-all"
            >
              Book Express Ride
            </button>
          </div>
        </div>
      )}

      {/* TOP FLOATING HUD: Telemetry, GPS Waypoint, Speedometer & Weather */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Current Location Waypoint Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-xl shadow-xl pointer-events-auto">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono">
                Highway Telemetry • GPS Active
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                0 Commute Delays
              </span>
            </div>
            <strong className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
              <MapPin size={14} className="text-cyan-400 shrink-0" />
              <span>{currentWaypoint}</span>
            </strong>
          </div>
        </div>

        {/* Live Gauges: Speedometer, CO2, Sound & Weather switcher */}
        <div className="flex flex-wrap items-center gap-2.5 pointer-events-auto">
          
          {/* Digital Sports Speedometer */}
          <div className="px-4 py-2 rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-xl shadow-xl text-center">
            <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Speed</span>
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-2xl font-black font-mono transition-colors ${
                isNitro ? 'text-amber-400 animate-pulse' : 'text-cyan-400'
              }`}>
                {currentSpeed}
              </span>
              <span className="text-[10px] font-bold text-slate-400">km/h</span>
            </div>
          </div>

          {/* Route Progress % */}
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950/85 border border-emerald-500/30 backdrop-blur-xl shadow-xl text-center hidden md:block">
            <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Progress</span>
            <span className="text-xl font-black font-mono text-emerald-400">{progressPercent}%</span>
          </div>

          {/* Environmental Atmosphere Modes */}
          <div className="flex items-center gap-1 bg-slate-950/85 p-1 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-xl">
            {[
              { id: 'neon', icon: Moon, title: 'Cyber Neon' },
              { id: 'sunset', icon: Sunset, title: 'Sunset Glow' },
              { id: 'daylight', icon: Sun, title: 'Daylight' },
              { id: 'rain', icon: CloudRain, title: 'Cyber Rain' }
            ].map(env => {
              const Icon = env.icon;
              return (
                <button
                  key={env.id}
                  onClick={() => setTimeOfDay(env.id)}
                  className={`p-2 rounded-xl transition-all ${
                    timeOfDay === env.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={env.title}
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </div>

          {/* Sound Synthesizer Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-xl border backdrop-blur-xl shadow-lg transition-all ${
              !isAudioMuted
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-950/85 text-slate-400 hover:text-white border-slate-800'
            }`}
            title={isAudioMuted ? 'Turn Sound ON (Realistic Engine Audio)' : 'Mute Engine Sound'}
          >
            {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-cyan-400" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shadow-lg transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D View'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

        </div>

      </div>

      {/* QUICK INTERACTIVE WAYPOINT JUMP BAR (Direct Destination Selector) */}
      <div className="absolute top-20 left-4 right-4 flex items-center gap-2 overflow-x-auto pb-1 pointer-events-none scrollbar-none">
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 backdrop-blur-xl shadow-lg">
          <span className="text-[10px] font-mono font-bold text-slate-400 px-2 shrink-0">
            Route Waypoints:
          </span>
          {waypoints.map((wp, idx) => {
            const isActive = currentWaypoint.includes(wp.name.split(' ')[0]);
            return (
              <button
                key={idx}
                onClick={() => jumpToWaypoint(wp)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{wp.name.split(' (')[0]}</span>
                <span className="text-[9px] opacity-75 font-normal">({wp.eta})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM FLOATING CONTROLS: Vehicle Customizer, Cockpit Controls, Nitro, Drive Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Controls: Vehicle Switcher, Paint Color & Camera Angles */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800/80 backdrop-blur-xl shadow-xl">
          
          {/* Vehicle Switcher */}
          <div className="flex items-center gap-1 pr-2 border-r border-slate-800">
            <button
              onClick={() => setVehicleType('bike')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                vehicleType === 'bike'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Superbike"
            >
              <Bike size={15} />
              <span>Superbike</span>
            </button>

            <button
              onClick={() => setVehicleType('car')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                vehicleType === 'car'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="EV Shuttle"
            >
              <Car size={15} />
              <span>EV Shuttle</span>
            </button>
          </div>

          {/* Vehicle Paint Customizer */}
          <div className="flex items-center gap-1.5 px-1.5 pr-2 border-r border-slate-800" title="Vehicle Paint Color">
            {colorPresets.map(c => (
              <button
                key={c.hex}
                onClick={() => setVehicleColor(c.hex)}
                className={`w-4 h-4 rounded-full transition-transform ${
                  vehicleColor === c.hex ? 'scale-125 ring-2 ring-white shadow-md' : 'hover:scale-110 opacity-70'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          {/* Camera Angles */}
          <div className="flex items-center gap-1">
            {[
              { id: 'chase', label: 'Chase' },
              { id: 'cockpit', label: 'Rider View' },
              { id: 'orbit', label: '360° Orbit' },
              { id: 'cinematic', label: 'Drone Fly' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setCameraMode(c.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  cameraMode === c.id
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

        </div>

        {/* Right Controls: Interactive Driving (Throttle / Brake / Nitro / Book CTA) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          
          {/* Interactive Gas Throttle */}
          <button
            onMouseDown={() => { setIsAccelerating(true); setDriveMode('manual'); }}
            onMouseUp={() => setIsAccelerating(false)}
            onTouchStart={() => { setIsAccelerating(true); setDriveMode('manual'); }}
            onTouchEnd={() => setIsAccelerating(false)}
            className={`px-3 py-2 rounded-2xl text-xs font-bold border transition-all ${
              isAccelerating
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/40'
                : 'bg-slate-900/90 text-emerald-400 hover:bg-slate-800 border-emerald-500/30'
            }`}
            title="Press and hold to Accelerate (or press W / Up arrow)"
          >
            <span>Gas [W]</span>
          </button>

          {/* Interactive Brake */}
          <button
            onMouseDown={() => { setIsBraking(true); setDriveMode('manual'); }}
            onMouseUp={() => setIsBraking(false)}
            onTouchStart={() => { setIsBraking(true); setDriveMode('manual'); }}
            onTouchEnd={() => setIsBraking(false)}
            className={`px-3 py-2 rounded-2xl text-xs font-bold border transition-all ${
              isBraking
                ? 'bg-rose-500 text-white font-black shadow-lg shadow-rose-500/40'
                : 'bg-slate-900/90 text-rose-400 hover:bg-slate-800 border-rose-500/30'
            }`}
            title="Press and hold to Brake (or press S / Down arrow)"
          >
            <span>Brake [S]</span>
          </button>

          {/* Nitro Boost Button */}
          <button
            onClick={() => setIsNitro(!isNitro)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all shadow-xl ${
              isNitro
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-white shadow-amber-500/30 ring-2 ring-amber-400 animate-pulse'
                : 'bg-slate-900/90 text-amber-300 hover:bg-slate-800 border border-amber-500/30'
            }`}
            title="Ignite Nitro Boost (or press Spacebar)"
          >
            <Zap size={14} className={isNitro ? 'fill-white' : ''} />
            <span>{isNitro ? 'NITRO ON!' : 'Nitro'}</span>
          </button>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-xl transition-all"
            title={isPaused ? 'Resume Ride' : 'Pause Ride'}
          >
            {isPaused ? <Play size={16} className="text-emerald-400" /> : <Pause size={16} />}
          </button>

          {/* Book this route CTA */}
          <button
            onClick={() => {
              if (onBookRideWithRoute) {
                onBookRideWithRoute();
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Book This 3D Ride</span>
            <ArrowRight size={15} />
          </button>

        </div>

      </div>

    </div>
  );
}
