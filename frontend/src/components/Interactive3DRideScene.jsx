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

export default function Interactive3DRideScene({ activeVehicleType, onBookRideWithRoute }) {
  const mountRef = useRef(null);
  const audioRef = useRef(null);

  // Vehicle & Driving states
  const [vehicleType, setVehicleType] = useState(activeVehicleType || 'bike'); // 'bike' or 'car'

  // Sync external activeVehicleType prop
  useEffect(() => {
    if (activeVehicleType && (activeVehicleType === 'bike' || activeVehicleType === 'car')) {
      setVehicleType(activeVehicleType);
    }
  }, [activeVehicleType]);
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
        e.preventDefault();
        animRef.current.isAccelerating = true;
        animRef.current.isBraking = false;
        setIsBraking(false);
        setIsAccelerating(true);
        setDriveMode('manual');
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        e.preventDefault();
        animRef.current.isBraking = true;
        animRef.current.isAccelerating = false;
        setIsAccelerating(false);
        setIsBraking(true);
        setDriveMode('manual');
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsNitro(prev => {
          const next = !prev;
          animRef.current.isNitro = next;
          return next;
        });
      } else if (e.code === 'KeyH') {
        e.preventDefault();
        triggerHorn();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        animRef.current.isAccelerating = false;
        setIsAccelerating(false);
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        animRef.current.isBraking = false;
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
    let handleTouchStart = null;
    let handleTouchMove = null;
    let handleTouchEnd = null;

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

    // 2. Realistic Environmental & Studio 3-Point Lighting
    const ambientLight = new THREE.AmbientLight(currentEnv.ambient, Math.max(currentEnv.ambientInt, 2.6));
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

    // Rim specular light to accentuate aerodynamic curves & lacquer reflections
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-60, 45, -50);
    scene.add(rimLight);

    // Warm fill light so shaded vehicle side is beautifully visible
    const fillLight = new THREE.DirectionalLight(0xf1f5f9, 1.8);
    fillLight.position.set(-30, 25, 40);
    scene.add(fillLight);

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

    // Soft tracking spotlight directly above vehicle so body is always brilliantly lit
    const vehicleAmbientSpot = new THREE.PointLight(0xffffff, 2.2, 16);
    vehicleAmbientSpot.position.set(0, 4.5, 0);
    vehicleContainer.add(vehicleAmbientSpot);

    // Shared high-grade materials
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x05070e, roughness: 0.9, metalness: 0.1 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.96, roughness: 0.08 });
    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, metalness: 0.5 });
    const brakeDiscMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 });
    const caliperMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.12 });

    // 9A. ULTRA-REALISTIC SUPERBIKE MODEL
    const bikeGroup = new THREE.Group();

    const bikeFairingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(vehicleColor),
      metalness: 0.94,
      roughness: 0.12,
      envMapIntensity: 1.5
    });

    // Wheels with alloy rims, rubber treads, drilled rotors & red calipers
    const wheelGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.34, 24);
    wheelGeo.rotateZ(Math.PI / 2);

    const rearWheel = new THREE.Mesh(wheelGeo, tireMat);
    rearWheel.position.set(0, 0.72, -1.35);
    rearWheel.castShadow = true;
    bikeGroup.add(rearWheel);

    const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
    frontWheel.position.set(0, 0.72, 1.35);
    frontWheel.castShadow = true;
    bikeGroup.add(frontWheel);

    // Wheel rims & drilled wave brake discs
    [rearWheel.position, frontWheel.position].forEach((pos, idx) => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.05, 8, 20), chromeMat);
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

    // Inverted Gold Ohlins-Style Telescopic Front Forks
    [-0.2, 0.2].forEach(fx => {
      const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.35), goldMat);
      fork.position.set(fx, 1.25, 1.15);
      fork.rotation.x = -0.24;
      bikeGroup.add(fork);
    });

    // Single-Sided Aluminum Rear Swingarm & Monoshock Spring
    const swingarm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 1.3), chromeMat);
    swingarm.position.set(-0.16, 0.75, -0.68);
    swingarm.rotation.x = -0.06;
    bikeGroup.add(swingarm);

    const shockSpring = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 12), goldMat);
    shockSpring.position.set(0, 1.05, -0.52);
    shockSpring.rotation.x = 0.35;
    bikeGroup.add(shockSpring);

    // Exposed Aluminum Trellis Frame Tubes
    [-0.22, 0.22].forEach(tx => {
      const frameTube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2), chromeMat);
      frameTube.position.set(tx, 1.2, 0.15);
      frameTube.rotation.x = 0.45;
      bikeGroup.add(frameTube);
    });

    // Electric Powertrain Block with Cooling Ribs & Cyan Energy Conduit
    const motorBlock = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.8), carbonMat);
    motorBlock.position.set(0, 0.85, 0.05);
    bikeGroup.add(motorBlock);

    const energyCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.46, 12),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    energyCore.rotateZ(Math.PI / 2);
    energyCore.position.set(0, 0.85, 0.12);
    bikeGroup.add(energyCore);

    // Sculpted Aerodynamic Main Chassis & Fairing
    const bikeBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 1.9), bikeFairingMat);
    bikeBody.position.set(0, 1.15, 0);
    bikeBody.castShadow = true;
    bikeGroup.add(bikeBody);

    // Sculpted Muscular Fuel Tank / Cowl with Carbon Protector Pad
    const tank = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.35, 12), bikeFairingMat);
    tank.rotateX(Math.PI / 2);
    tank.position.set(0, 1.45, 0.35);
    bikeGroup.add(tank);

    const tankPad = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 0.02), carbonMat);
    tankPad.position.set(0, 1.52, 0.02);
    tankPad.rotation.x = 0.5;
    bikeGroup.add(tankPad);

    // Shark-Nose Front Fairing with Aerodynamic Downforce Winglets
    const frontNose = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.75, 8), bikeFairingMat);
    frontNose.rotateX(-Math.PI / 2);
    frontNose.position.set(0, 1.35, 1.25);
    bikeGroup.add(frontNose);

    [-0.32, 0.32].forEach(wx => {
      const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.35), carbonMat);
      winglet.position.set(wx, 1.28, 1.12);
      winglet.rotation.z = wx > 0 ? -0.2 : 0.2;
      bikeGroup.add(winglet);
    });

    // Aerodynamic Tinted Polycarbonate Windscreen
    const windscreen = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.5, 8, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x082f49, transparent: true, opacity: 0.8, roughness: 0.1 })
    );
    windscreen.rotateX(-Math.PI / 2);
    windscreen.position.set(0, 1.62, 1.05);
    bikeGroup.add(windscreen);

    // Racing Clip-On Handlebars with Digital Dash
    const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.85), chromeMat);
    handlebar.rotateZ(Math.PI / 2);
    handlebar.position.set(0, 1.62, 0.82);
    bikeGroup.add(handlebar);

    const dashScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.14, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    dashScreen.position.set(0, 1.68, 0.78);
    dashScreen.rotation.x = -0.4;
    bikeGroup.add(dashScreen);

    // Sharp Aerodynamic Tail Cowl with Flow-Through Tunnels
    const tailCowl = new THREE.Mesh(new THREE.ConeGeometry(0.36, 1.1, 8), bikeFairingMat);
    tailCowl.rotateX(Math.PI / 2);
    tailCowl.position.set(0, 1.42, -0.85);
    bikeGroup.add(tailCowl);

    // Twin Under-Tail Titanium Exhaust Tips
    [-0.12, 0.12].forEach(ex => {
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.35, 12), chromeMat);
      tip.rotateX(Math.PI / 2);
      tip.position.set(ex, 1.28, -1.35);
      bikeGroup.add(tip);
    });

    // Biker Rider in Sport Racing Leathers
    const riderTorso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.65, 0.35), carbonMat);
    riderTorso.position.set(0, 1.85, -0.12);
    riderTorso.rotation.x = 0.32;
    bikeGroup.add(riderTorso);

    const riderHelmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.92, roughness: 0.12 })
    );
    riderHelmet.position.set(0, 2.3, 0.12);
    bikeGroup.add(riderHelmet);

    const helmetVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.1, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.98, roughness: 0.05 })
    );
    helmetVisor.position.set(0, 2.3, 0.3);
    bikeGroup.add(helmetVisor);

    // Twin Predatory Projector LED Headlights projecting real forward light
    const bikeHeadlight = new THREE.SpotLight(0x38bdf8, 6.0, 36, Math.PI / 5, 0.45, 1);
    bikeHeadlight.position.set(0, 1.35, 1.38);
    bikeHeadlight.target.position.set(0, 0, 16);
    bikeGroup.add(bikeHeadlight);
    bikeGroup.add(bikeHeadlight.target);

    // Rear LED Hazard & Brake Light Blade
    const bikeTailLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.08, 0.06),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    bikeTailLight.position.set(0, 1.38, -1.38);
    bikeGroup.add(bikeTailLight);

    const bikeTailGlow = new THREE.PointLight(0xef4444, 2.5, 8);
    bikeTailGlow.position.set(0, 1.38, -1.5);
    bikeGroup.add(bikeTailGlow);

    const bikeUnderglow = new THREE.PointLight(0x06b6d4, 3.5, 6);
    bikeUnderglow.position.set(0, 0.35, 0);
    bikeGroup.add(bikeUnderglow);


    // 9B. ULTRA-REALISTIC LUXURY EV SHUTTLE CAR MODEL
    const carGroup = new THREE.Group();

    const carBodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(vehicleColor),
      metalness: 0.94,
      roughness: 0.12
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x031828,
      transparent: true,
      opacity: 0.88,
      metalness: 0.95,
      roughness: 0.05
    });

    // 1. Lower Sculpted Chassis
    const carChassis = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.45, 4.3), carBodyMat);
    carChassis.position.set(0, 0.55, 0);
    carChassis.castShadow = true;
    carGroup.add(carChassis);

    // Sloped Front Aerodynamic Hood / Bonnet
    const carHood = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.22, 1.35), carBodyMat);
    carHood.position.set(0, 0.76, 1.38);
    carHood.rotation.x = -0.14;
    carGroup.add(carHood);

    // Front Bumper with Carbon Splitter Lip
    const frontSplitter = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.1, 0.45), carbonMat);
    frontSplitter.position.set(0, 0.32, 2.18);
    carGroup.add(frontSplitter);

    // Front Corner Aero Air Curtain Ducts
    [-0.7, 0.7].forEach(dx => {
      const duct = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.18, 0.15), carbonMat);
      duct.position.set(dx, 0.44, 2.22);
      carGroup.add(duct);
    });

    // Rear Fastback Decklid & Integrated Lip Spoiler
    const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.22, 1.15), carBodyMat);
    rearDeck.position.set(0, 0.82, -1.5);
    rearDeck.rotation.x = 0.12;
    carGroup.add(rearDeck);

    // Rear Carbon Diffuser with Aero Fins
    const rearDiffuser = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.15, 0.5), carbonMat);
    rearDiffuser.position.set(0, 0.32, -2.18);
    carGroup.add(rearDiffuser);

    [-0.6, -0.2, 0.2, 0.6].forEach(fx => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.42), carbonMat);
      fin.position.set(fx, 0.3, -2.2);
      carGroup.add(fin);
    });

    // Side Aerodynamic Rocker Skirts
    [-1.06, 1.06].forEach(sx => {
      const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 2.8), carbonMat);
      skirt.position.set(sx, 0.34, 0);
      carGroup.add(skirt);
    });

    // 2. Panoramic Teardrop Glass Greenhouse & Roof Pillars
    const carGlassDome = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.58, 2.35), glassMat);
    carGlassDome.position.set(0, 1.25, -0.15);
    carGroup.add(carGlassDome);

    const frontWindshield = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.08, 1.15), glassMat);
    frontWindshield.position.set(0, 1.18, 0.85);
    frontWindshield.rotation.x = -0.48;
    carGroup.add(frontWindshield);

    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.08, 1.15), glassMat);
    rearGlass.position.set(0, 1.18, -1.18);
    rearGlass.rotation.x = 0.42;
    carGroup.add(rearGlass);

    // Roof A/B/C Lacquer Support Rails
    [-0.86, 0.86].forEach(px => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 3.2), carBodyMat);
      rail.position.set(px, 1.48, -0.15);
      carGroup.add(rail);
    });

    // Luxury Interior Elements (Visible Through Panoramic Glass)
    const interiorDash = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 0.4), carbonMat);
    interiorDash.position.set(0, 0.95, 0.65);
    carGroup.add(interiorDash);

    const interiorDashScreen = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.04, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    interiorDashScreen.position.set(0, 1.04, 0.62);
    carGroup.add(interiorDashScreen);

    // Steering Yoke
    const yoke = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 8, 16), chromeMat);
    yoke.position.set(-0.45, 1.08, 0.45);
    yoke.rotation.x = -0.3;
    carGroup.add(yoke);

    // Front Twin Bucket Seats
    [-0.45, 0.45].forEach(sx => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.42), carbonMat);
      seat.position.set(sx, 1.02, 0);
      carGroup.add(seat);

      const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 0.15), carbonMat);
      headrest.position.set(sx, 1.38, -0.04);
      carGroup.add(headrest);
    });

    // 3. Four Turbine Alloy Performance Wheels
    const carWheelGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.36, 24);
    carWheelGeo.rotateZ(Math.PI / 2);
    const carWheelPositions = [
      [-1.08, 0.56, 1.38],
      [1.08, 0.56, 1.38],
      [-1.08, 0.56, -1.38],
      [1.08, 0.56, -1.38]
    ];
    const carWheels = [];
    carWheelPositions.forEach(wPos => {
      const w = new THREE.Mesh(carWheelGeo, tireMat);
      w.position.set(...wPos);
      w.castShadow = true;
      carGroup.add(w);
      carWheels.push(w);

      // Chrome rim lip
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 8, 20), chromeMat);
      rim.position.set(...wPos);
      carGroup.add(rim);

      // Brake rotor & red Brembo-style caliper
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 16), brakeDiscMat);
      disc.rotateZ(Math.PI / 2);
      disc.position.set(...wPos);
      carGroup.add(disc);

      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.28), caliperMat);
      caliper.position.set(wPos[0] + (wPos[0] > 0 ? -0.1 : 0.1), wPos[1] + 0.15, wPos[2]);
      carGroup.add(caliper);
    });

    // 4. Signature Front & Rear Cyber Lightbars
    const carFrontLight = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 0.08, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    carFrontLight.position.set(0, 0.74, 2.22);
    carGroup.add(carFrontLight);

    // Multi-Element Jewel Matrix Headlights
    [-0.7, 0.7].forEach(hx => {
      const jewelLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.08, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      jewelLight.position.set(hx, 0.68, 2.21);
      carGroup.add(jewelLight);
    });

    const carHeadlight = new THREE.SpotLight(0x38bdf8, 5.5, 38, Math.PI / 4, 0.45);
    carHeadlight.position.set(0, 0.85, 2.2);
    carHeadlight.target.position.set(0, 0, 18);
    carGroup.add(carHeadlight);
    carGroup.add(carHeadlight.target);

    // Digital Side Mirrors with Amber Turn Strips
    [-1.15, 1.15].forEach(mx => {
      const stalk = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.1), carbonMat);
      stalk.position.set(mx, 1.05, 0.72);
      carGroup.add(stalk);

      const indicator = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.03, 0.04),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      indicator.position.set(mx, 1.06, 0.74);
      carGroup.add(indicator);
    });

    // Full-Width Rear Red OLED Lightblade
    const carTailLight = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 0.09, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    carTailLight.position.set(0, 0.82, -2.22);
    carGroup.add(carTailLight);

    // High-Mount 3rd Brake Light on Rear Glass
    const thirdBrake = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.04, 0.04),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    thirdBrake.position.set(0, 1.46, -1.22);
    carGroup.add(thirdBrake);

    // Rear Taillight Ambient Glow Point Light
    const carTailGlow = new THREE.PointLight(0xef4444, 3.0, 10);
    carTailGlow.position.set(0, 0.85, -2.5);
    carGroup.add(carTailGlow);

    // Chassis Cyber Underglow
    const carUnderglow = new THREE.PointLight(0x06b6d4, 4.0, 8);
    carUnderglow.position.set(0, 0.35, 0);
    carGroup.add(carUnderglow);

    // Realistic Contact Shadow Plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 4.8),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.65 })
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

    // Mouse & Touch Interaction for 360° Drag Orbit
    handleMouseDown = (e) => {
      animRef.current.mouseDrag = true;
      animRef.current.prevMouseX = e.clientX;
      animRef.current.prevMouseY = e.clientY;
      if (animRef.current.cameraMode !== 'orbit') {
        animRef.current.cameraMode = 'orbit';
        setCameraMode('orbit');
      }
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

    handleTouchStart = (e) => {
      if (e.touches && e.touches.length === 1) {
        animRef.current.mouseDrag = true;
        animRef.current.prevMouseX = e.touches[0].clientX;
        animRef.current.prevMouseY = e.touches[0].clientY;
        if (animRef.current.cameraMode !== 'orbit') {
          animRef.current.cameraMode = 'orbit';
          setCameraMode('orbit');
        }
      }
    };

    handleTouchMove = (e) => {
      if (!animRef.current.mouseDrag || !e.touches || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - animRef.current.prevMouseX;
      const dy = e.touches[0].clientY - animRef.current.prevMouseY;

      animRef.current.orbitAngleX += dx * 0.007;
      animRef.current.orbitAngleY = Math.max(0.1, Math.min(Math.PI / 2.2, animRef.current.orbitAngleY - dy * 0.007));

      animRef.current.prevMouseX = e.touches[0].clientX;
      animRef.current.prevMouseY = e.touches[0].clientY;
    };

    handleTouchEnd = () => {
      animRef.current.mouseDrag = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

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

      // Dynamic underglow neon lighting
      if (isNitro) {
        bikeUnderglow.color.setHex(0xf59e0b);
        carUnderglow.color.setHex(0xf59e0b);
        bikeUnderglow.intensity = 5.0;
        carUnderglow.intensity = 6.0;
      } else {
        bikeUnderglow.color.copy(themeCol);
        carUnderglow.color.copy(themeCol);
        bikeUnderglow.intensity = 3.5;
        carUnderglow.intensity = 4.0;
      }

      // Realistic speed physics calculations
      let targetKmh = 68;
      if (isBraking) {
        targetKmh = 0; // FULL STOP when braking!
      } else if (isNitro) {
        targetKmh = 132;
      } else if (isAccelerating) {
        targetKmh = 98;
      } else if (driveMode === 'manual') {
        // Coasting deceleration in manual mode
        targetKmh = 0;
      }

      // Responsive braking & acceleration lerp
      const lerpSpeed = isBraking ? 9.5 : (isAccelerating ? 5.2 : (isNitro ? 6.5 : 3.2));
      animRef.current.speed = THREE.MathUtils.lerp(animRef.current.speed, targetKmh, delta * lerpSpeed);
      if (isBraking && animRef.current.speed < 1.0) {
        animRef.current.speed = 0;
      }
      const currentKmh = Math.max(0, Math.round(animRef.current.speed));

      // Dynamic brake light glow intensity
      bikeTailGlow.intensity = isBraking ? 6.5 : 2.5;
      carTailGlow.intensity = isBraking ? 8.5 : 3.0;

      // Web Audio engine frequency modulation
      if (audioRef.current) {
        audioRef.current.updateEngine(currentKmh, isNitro);
      }

      if (!isPaused) {
        // Curve progress advance: zero movement when vehicle is stopped at 0 km/h
        const speedMultiplier = currentKmh > 0 ? (currentKmh / 68) * 0.00085 : 0;
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

        // Vehicle dynamics & wheel rotation (stops rotating when 0 km/h)
        const wheelRotSpeed = currentKmh > 0 ? delta * (currentKmh * 0.28) : 0;
        if (vehicleType === 'bike') {
          bikeGroup.rotation.z = THREE.MathUtils.lerp(bikeGroup.rotation.z, currentKmh > 0 ? -curvature * 1.6 : 0, delta * 8);
          rearWheel.rotation.x += wheelRotSpeed;
          frontWheel.rotation.x += wheelRotSpeed;
        } else {
          carGroup.rotation.z = THREE.MathUtils.lerp(carGroup.rotation.z, currentKmh > 0 ? -curvature * 0.45 : 0, delta * 6);
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
          // Exhilarating chase camera centered on vehicle with road ahead
          const desiredCamPos = pos.clone()
            .addScaledVector(tangent, -7.2)
            .add(new THREE.Vector3(0, 2.9, 0));
          camera.position.lerp(desiredCamPos, delta * 8);
          camera.lookAt(pos.clone().add(new THREE.Vector3(0, 1.35, 0)).addScaledVector(tangent, 2.2));
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
          camera.position.x = pos.x + Math.sin(time) * 18;
          camera.position.y = pos.y + 8;
          camera.position.z = pos.z + Math.cos(time) * 18;
          camera.lookAt(pos.clone().add(new THREE.Vector3(0, 1.2, 0)));
        } else if (cameraMode === 'orbit') {
          // 360-degree free touch & drag orbit around vehicle
          const dist = 11.5;
          const ox = animRef.current.orbitAngleX;
          const oy = animRef.current.orbitAngleY;
          camera.position.x = pos.x + dist * Math.cos(ox) * Math.cos(oy);
          camera.position.y = pos.y + Math.max(1.4, dist * Math.sin(oy) + 2.4);
          camera.position.z = pos.z + dist * Math.sin(ox) * Math.cos(oy);
          camera.lookAt(pos.clone().add(new THREE.Vector3(0, 1.3, 0)));
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
      if (handleTouchStart) container.removeEventListener('touchstart', handleTouchStart);
      if (handleTouchMove) window.removeEventListener('touchmove', handleTouchMove);
      if (handleTouchEnd) window.removeEventListener('touchend', handleTouchEnd);
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
    <div className={`relative rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50 bg-slate-950/98 flex flex-col' : 'w-full h-[520px] sm:h-[560px]'
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
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-xl">
            <Zap size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white">YatraGo High-Efficiency Route Simulation</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Real-time routes, GPS waypoints, and smart fare splitting remain fully operational with reduced GPU power mode.
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
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 font-bold text-xs hover:scale-105 transition-all"
            >
              Book Express Ride
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. UNIFIED TOP HUD: Telemetry, Speedometer, Weather & Waypoints */}
      {/* ======================================================== */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20 flex flex-col gap-2 pointer-events-none">
        
        {/* Row 1: Left GPS Status & Right Integrated Instruments */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Left GPS Waypoint Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 border border-slate-800 backdrop-blur-xl shadow-lg pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono hidden sm:inline">
                GPS LIVE
              </span>
              <span className="h-3 w-px bg-slate-800 hidden sm:inline" />
              <MapPin size={12} className="text-cyan-400 shrink-0" />
              <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[240px]">
                {currentWaypoint}
              </span>
            </div>
          </div>

          {/* Right Instrument Cluster */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            
            {/* Speedometer Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 border border-slate-800 backdrop-blur-xl shadow-lg">
              <span className={`text-xs font-black font-mono transition-colors ${
                isNitro ? 'text-amber-400 animate-pulse' : 'text-cyan-400'
              }`}>
                {currentSpeed}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">km/h</span>
            </div>

            {/* Weather / Atmosphere Toggle Pill */}
            <div className="flex items-center p-0.5 rounded-full bg-slate-950/85 border border-slate-800 backdrop-blur-xl shadow-lg">
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
                    className={`p-1.5 rounded-full transition-all cursor-pointer ${
                      timeOfDay === env.id
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={env.title}
                  >
                    <Icon size={12} />
                  </button>
                );
              })}
            </div>

            {/* Sound Synthesizer Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-full border backdrop-blur-xl shadow-lg transition-all cursor-pointer ${
                !isAudioMuted
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-950/85 text-slate-400 hover:text-white border-slate-800'
              }`}
              title={isAudioMuted ? 'Turn Sound ON (Engine Audio)' : 'Mute Engine Sound'}
            >
              {isAudioMuted ? <VolumeX size={13} /> : <Volume2 size={13} className="text-cyan-400" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-full bg-slate-950/85 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 shadow-lg transition-all cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D View'}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>

          </div>

        </div>

        {/* Row 2: Route Waypoints Interactive Track */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-xl shadow-lg pointer-events-auto scrollbar-none">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 shrink-0 flex items-center gap-1">
            <Navigation size={11} className="text-cyan-400" />
            <span>Corridor:</span>
          </span>
          {waypoints.map((wp, idx) => {
            const isActive = currentWaypoint.includes(wp.name.split(' ')[0]);
            return (
              <button
                key={idx}
                onClick={() => jumpToWaypoint(wp)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
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

      {/* ======================================================== */}
      {/* 2. UNIFIED BOTTOM COCKPIT HUD (Guaranteed Zero Cutoff)   */}
      {/* ======================================================== */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 z-20 flex flex-col items-center pointer-events-none">
        
        <div className="w-full max-w-2xl bg-slate-950/92 border border-slate-800 backdrop-blur-2xl rounded-2xl p-2 sm:p-2.5 shadow-2xl pointer-events-auto space-y-2">
          
          {/* Row 1: Vehicle Switcher, Paint Swatches & Camera Views */}
          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            
            {/* Vehicle Mode Switcher */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
              <button
                onClick={() => setVehicleType('bike')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  vehicleType === 'bike'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Superbike"
              >
                <Bike size={14} />
                <span>Superbike</span>
              </button>

              <button
                onClick={() => setVehicleType('car')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  vehicleType === 'car'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="EV Shuttle"
              >
                <Car size={14} />
                <span>EV Shuttle</span>
              </button>
            </div>

            {/* Paint Color Swatches */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0" title="Vehicle Paint">
              {colorPresets.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setVehicleColor(c.hex)}
                  className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                    vehicleColor === c.hex ? 'scale-125 ring-2 ring-white shadow-md' : 'hover:scale-110 opacity-70'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Camera View Selector */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
              {[
                { id: 'chase', label: 'Chase' },
                { id: 'cockpit', label: 'POV' },
                { id: 'orbit', label: '360°' },
                { id: 'cinematic', label: 'Drone' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setCameraMode(c.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    cameraMode === c.id
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

          </div>

          {/* Row 2: Driving Controls (Gas, Brake, Nitro, Horn, Pause) & Book CTA */}
          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80">
            
            {/* Driving Buttons Group */}
            <div className="flex items-center gap-1.5 flex-wrap">
              
              {/* Gas */}
              <button
                onMouseDown={() => { animRef.current.isAccelerating = true; animRef.current.isBraking = false; setIsBraking(false); setIsAccelerating(true); setDriveMode('manual'); }}
                onMouseUp={() => { animRef.current.isAccelerating = false; setIsAccelerating(false); }}
                onTouchStart={() => { animRef.current.isAccelerating = true; animRef.current.isBraking = false; setIsBraking(false); setIsAccelerating(true); setDriveMode('manual'); }}
                onTouchEnd={() => { animRef.current.isAccelerating = false; setIsAccelerating(false); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  isAccelerating
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/40 scale-105'
                    : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                }`}
                title="Accelerate [W / Up Arrow]"
              >
                Gas [W]
              </button>

              {/* Brake (Stops vehicle completely to 0 km/h) */}
              <button
                onMouseDown={() => { animRef.current.isBraking = true; animRef.current.isAccelerating = false; setIsAccelerating(false); setIsBraking(true); setDriveMode('manual'); }}
                onMouseUp={() => { animRef.current.isBraking = false; setIsBraking(false); }}
                onTouchStart={() => { animRef.current.isBraking = true; animRef.current.isAccelerating = false; setIsAccelerating(false); setIsBraking(true); setDriveMode('manual'); }}
                onTouchEnd={() => { animRef.current.isBraking = false; setIsBraking(false); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  isBraking
                    ? 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/40 scale-105'
                    : 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30'
                }`}
                title="Brake & Full Stop to 0 km/h [S / Down Arrow]"
              >
                Brake [S]
              </button>

              {/* Nitro */}
              <button
                onClick={() => {
                  setIsNitro(prev => {
                    const next = !prev;
                    animRef.current.isNitro = next;
                    return next;
                  });
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none ${
                  isNitro
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/40 animate-pulse'
                    : 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
                title="Nitro Boost [Spacebar]"
              >
                <Zap size={13} className={isNitro ? 'fill-white' : ''} />
                <span>Nitro</span>
              </button>

              {/* Horn */}
              <button
                onClick={triggerHorn}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer border border-slate-800"
                title="Sound Horn [H]"
              >
                <Radio size={14} className="text-cyan-400" />
              </button>

              {/* Pause / Resume */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer border border-slate-800"
                title={isPaused ? 'Resume Ride' : 'Pause Ride'}
              >
                {isPaused ? <Play size={14} className="text-emerald-400" /> : <Pause size={14} />}
              </button>

            </div>

            {/* Book CTA Button */}
            <button
              onClick={() => {
                if (onBookRideWithRoute) {
                  onBookRideWithRoute({
                    waypoint: currentWaypoint,
                    speed: currentSpeed,
                    vehicleType: vehicleType
                  });
                }
              }}
              className="whitespace-nowrap shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              <span>Book This 3D Ride</span>
              <ArrowRight size={13} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
