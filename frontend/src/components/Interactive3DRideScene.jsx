import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Bike, Car, Zap, Eye, Compass, Gauge, Play, Pause, 
  RotateCcw, Sparkles, MapPin, Shield, ArrowRight, Volume2, VolumeX, Maximize2, Minimize2
} from 'lucide-react';

export default function Interactive3DRideScene({ onBookRideWithRoute }) {
  const mountRef = useRef(null);
  const [vehicleType, setVehicleType] = useState('bike'); // 'bike' or 'car'
  const [cameraMode, setCameraMode] = useState('chase'); // 'chase', 'cockpit', 'cinematic', 'orbit'
  const [isPaused, setIsPaused] = useState(false);
  const [isNitro, setIsNitro] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('neon'); // 'neon', 'sunset', 'daylight'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Telemetry states
  const [currentSpeed, setCurrentSpeed] = useState(64);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentWaypoint, setCurrentWaypoint] = useState('Innovation Tech Park');
  const [tripDistance, setTripDistance] = useState(0.4);
  const [co2Saved, setCo2Saved] = useState(0.18);

  const waypoints = [
    { progress: 0.0, name: 'Pickup Point: Innovation Tech Park' },
    { progress: 0.25, name: 'Checkpoint: Cyber Harbor Bridge' },
    { progress: 0.50, name: 'Midway: Metro Skyway Interchange' },
    { progress: 0.75, name: 'Express: Coastal Highline Overlook' },
    { progress: 0.95, name: 'Destination: YatraGo Downtown Hub' }
  ];

  // Ref to hold dynamic variables for animation loop
  const animStateRef = useRef({
    vehicleType: 'bike',
    cameraMode: 'chase',
    isPaused: false,
    isNitro: false,
    speed: 0.00075,
    progress: 0,
    mouseDrag: false,
    prevMouseX: 0,
    prevMouseY: 0,
    orbitAngleX: 0.4,
    orbitAngleY: 0.25
  });

  // Sync state changes with ref
  useEffect(() => {
    animStateRef.current.vehicleType = vehicleType;
  }, [vehicleType]);

  useEffect(() => {
    animStateRef.current.cameraMode = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    animStateRef.current.isPaused = isPaused;
  }, [isPaused]);

  useEffect(() => {
    animStateRef.current.isNitro = isNitro;
  }, [isNitro]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // 1. Scene & Environment
    const scene = new THREE.Scene();
    const skyColors = {
      neon: { bg: 0x050816, fog: 0x050816, ambient: 0x1e293b, light: 0x06b6d4 },
      sunset: { bg: 0x1f102e, fog: 0x1f102e, ambient: 0x3b1d3f, light: 0xf59e0b },
      daylight: { bg: 0x0c1e3d, fog: 0x0c1e3d, ambient: 0x475569, light: 0x38bdf8 }
    };
    const currentSky = skyColors[timeOfDay] || skyColors.neon;
    scene.background = new THREE.Color(currentSky.bg);
    scene.fog = new THREE.FogExp2(currentSky.fog, 0.009);

    // 2. Camera & Renderer
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 8, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(currentSky.ambient, 2.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(currentSky.light, 2.0);
    mainLight.position.set(40, 80, 50);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    // 4. Procedural High-Speed 3D Highway Spline
    const splinePoints = [
      new THREE.Vector3(-90, 0, -60),
      new THREE.Vector3(-40, 4, -95),
      new THREE.Vector3(35, 12, -80),
      new THREE.Vector3(95, 18, -25),   // Elevated bridge summit
      new THREE.Vector3(90, 10, 45),
      new THREE.Vector3(45, 3, 90),
      new THREE.Vector3(-35, 0, 75),
      new THREE.Vector3(-85, 0, 15)
    ];

    const curve = new THREE.CatmullRomCurve3(splinePoints, true, 'centripetal', 0.5);

    // Generate Ribbon Road Mesh along Spline
    const segments = 360;
    const roadWidth = 5.6;
    const roadPoints = curve.getSpacedPoints(segments);
    const roadNormals = [];

    const roadGeo = new THREE.BufferGeometry();
    const positions = [];
    const uvs = [];
    const indices = [];

    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const pt = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      roadNormals.push(normal);

      // Left vertex
      const leftPt = pt.clone().addScaledVector(normal, -roadWidth / 2);
      positions.push(leftPt.x, leftPt.y, leftPt.z);
      uvs.push(0, t * 40);

      // Right vertex
      const rightPt = pt.clone().addScaledVector(normal, roadWidth / 2);
      positions.push(rightPt.x, rightPt.y, rightPt.z);
      uvs.push(1, t * 40);

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

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.35,
      metalness: 0.65
    });

    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    // Glowing Road Borders & Dashed Lane Stripes
    const borderLeftGeo = new THREE.BufferGeometry();
    const borderRightGeo = new THREE.BufferGeometry();
    const borderLeftPts = [];
    const borderRightPts = [];

    for (let i = 0; i <= segments; i++) {
      const pt = roadPoints[i % segments];
      const norm = roadNormals[i % segments];
      const lp = pt.clone().addScaledVector(norm, -roadWidth / 2).add(new THREE.Vector3(0, 0.1, 0));
      const rp = pt.clone().addScaledVector(norm, roadWidth / 2).add(new THREE.Vector3(0, 0.1, 0));
      borderLeftPts.push(lp);
      borderRightPts.push(rp);
    }

    borderLeftGeo.setFromPoints(borderLeftPts);
    borderRightGeo.setFromPoints(borderRightPts);

    const borderMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 2 });
    const borderRightMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });

    const leftBorderLine = new THREE.Line(borderLeftGeo, borderMat);
    const rightBorderLine = new THREE.Line(borderRightGeo, borderRightMat);
    scene.add(leftBorderLine);
    scene.add(rightBorderLine);

    // Luminous Neon Arches along road waypoints
    const archGroup = new THREE.Group();
    waypoints.forEach((wp) => {
      const pt = curve.getPointAt(wp.progress);
      const tangent = curve.getTangentAt(wp.progress).normalize();
      const norm = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const archCurve = new THREE.EllipseCurve(0, 0, 4.2, 5.0, 0, Math.PI, false, 0);
      const archPoints2D = archCurve.getPoints(24);
      const archPts3D = archPoints2D.map(p => new THREE.Vector3(p.x, p.y, 0));
      const archGeo = new THREE.BufferGeometry().setFromPoints(archPts3D);

      const archMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 });
      const archLine = new THREE.Line(archGeo, archMat);

      archLine.position.copy(pt);
      archLine.lookAt(pt.clone().add(tangent));
      archGroup.add(archLine);

      // Light glow marker
      const markerLight = new THREE.PointLight(0x06b6d4, 1.8, 16);
      markerLight.position.copy(pt).add(new THREE.Vector3(0, 4.5, 0));
      archGroup.add(markerLight);
    });
    scene.add(archGroup);

    // 5. Procedural Cyber City Skyline
    const cityGroup = new THREE.Group();
    const buildingCount = 55;
    const bPalette = [0x0f172a, 0x1e293b, 0x0284c7, 0x047857];

    for (let i = 0; i < buildingCount; i++) {
      const h = Math.random() * 45 + 15;
      const w = Math.random() * 8 + 5;
      const d = Math.random() * 8 + 5;
      const bColor = bPalette[Math.floor(Math.random() * bPalette.length)];

      const bGeo = new THREE.BoxGeometry(w, h, d);
      const bMat = new THREE.MeshStandardMaterial({
        color: bColor,
        roughness: 0.2,
        metalness: 0.8
      });

      const building = new THREE.Mesh(bGeo, bMat);

      // Position scattered around, keeping road clear
      let bx, bz;
      let valid = false;
      let attempts = 0;
      while (!valid && attempts < 15) {
        bx = (Math.random() - 0.5) * 240;
        bz = (Math.random() - 0.5) * 240;
        // Check distance to closest road point
        let tooClose = false;
        for (let k = 0; k < roadPoints.length; k += 8) {
          const dist = new THREE.Vector2(bx, bz).distanceTo(new THREE.Vector2(roadPoints[k].x, roadPoints[k].z));
          if (dist < roadWidth + 8) {
            tooClose = true;
            break;
          }
        }
        if (!tooClose) valid = true;
        attempts++;
      }

      building.position.set(bx, h / 2, bz);
      building.castShadow = true;
      building.receiveShadow = true;
      cityGroup.add(building);

      // Rooftop neon beacons
      if (Math.random() > 0.4) {
        const beaconGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x06b6d4 : 0x10b981 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(bx, h + 0.6, bz);
        cityGroup.add(beacon);
      }
    }
    scene.add(cityGroup);

    // Ground Grid
    const groundGrid = new THREE.GridHelper(280, 70, 0x06b6d4, 0x111827);
    groundGrid.position.y = -0.05;
    scene.add(groundGrid);

    // 6. Detailed 3D Vehicles (Bike & EV Car)
    const vehicleContainer = new THREE.Group();

    // 6A. BUILD CYBER BIKE
    const bikeGroup = new THREE.Group();

    // Wheels (Front & Rear)
    const wheelGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.28, 20);
    wheelGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.8 });
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

    const rearWheel = new THREE.Mesh(wheelGeo, tireMat);
    rearWheel.position.set(0, 0.65, -1.2);
    rearWheel.castShadow = true;
    bikeGroup.add(rearWheel);

    const rearRim = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.05, 8, 16), rimMat);
    rearRim.position.copy(rearWheel.position);
    bikeGroup.add(rearRim);

    const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
    frontWheel.position.set(0, 0.65, 1.2);
    frontWheel.castShadow = true;
    bikeGroup.add(frontWheel);

    const frontRim = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.05, 8, 16), rimMat);
    frontRim.position.copy(frontWheel.position);
    bikeGroup.add(frontRim);

    // Bike Frame & Body
    const frameGeo = new THREE.BoxGeometry(0.42, 0.7, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0891b2,
      metalness: 0.9,
      roughness: 0.2
    });
    const bikeBody = new THREE.Mesh(frameGeo, bodyMat);
    bikeBody.position.set(0, 1.05, 0);
    bikeBody.castShadow = true;
    bikeGroup.add(bikeBody);

    // Fuel Tank / Aerodynamic Top Cowl
    const tankGeo = new THREE.ConeGeometry(0.35, 1.2, 8);
    tankGeo.rotateX(Math.PI / 2);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.9, roughness: 0.1 });
    const bikeTank = new THREE.Mesh(tankGeo, tankMat);
    bikeTank.position.set(0, 1.35, 0.3);
    bikeGroup.add(bikeTank);

    // Rider Figure
    const torsoGeo = new THREE.BoxGeometry(0.36, 0.6, 0.3);
    const riderMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const torso = new THREE.Mesh(torsoGeo, riderMat);
    torso.position.set(0, 1.7, -0.15);
    torso.rotation.x = 0.25; // Leaning forward sport posture
    bikeGroup.add(torso);

    const helmetGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.set(0, 2.15, 0.05);
    bikeGroup.add(helmet);

    // Visor glow
    const visorGeo = new THREE.BoxGeometry(0.28, 0.08, 0.14);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.15, 0.22);
    bikeGroup.add(visor);

    // Headlight with SpotLight projection
    const headlightBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    headlightBulb.position.set(0, 1.15, 1.25);
    bikeGroup.add(headlightBulb);

    const bikeHeadlight = new THREE.SpotLight(0x38bdf8, 4.0, 25, Math.PI / 6, 0.5, 1);
    bikeHeadlight.position.set(0, 1.15, 1.25);
    bikeHeadlight.target.position.set(0, 0, 12);
    bikeGroup.add(bikeHeadlight);
    bikeGroup.add(bikeHeadlight.target);

    // Tail light
    const tailLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.06, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    tailLight.position.set(0, 1.2, -1.1);
    bikeGroup.add(tailLight);

    // 6B. BUILD CYBER EV CAR
    const carGroup = new THREE.Group();

    // Car Body
    const carBodyGeo = new THREE.BoxGeometry(2.0, 0.8, 4.2);
    const carBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      metalness: 0.9,
      roughness: 0.2
    });
    const carBody = new THREE.Mesh(carBodyGeo, carBodyMat);
    carBody.position.set(0, 0.8, 0);
    carBody.castShadow = true;
    carGroup.add(carBody);

    // Car Cabin Glass
    const cabinGeo = new THREE.BoxGeometry(1.65, 0.65, 2.3);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x082f49,
      transparent: true,
      opacity: 0.85,
      metalness: 0.9,
      roughness: 0.1
    });
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.35, -0.2);
    carGroup.add(cabin);

    // Car Wheels
    const carWheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.35, 16);
    carWheelGeo.rotateZ(Math.PI / 2);
    const carWheelPositions = [
      [-1.0, 0.55, 1.3],
      [1.0, 0.55, 1.3],
      [-1.0, 0.55, -1.3],
      [1.0, 0.55, -1.3]
    ];
    const carWheels = [];
    carWheelPositions.forEach(pos => {
      const w = new THREE.Mesh(carWheelGeo, tireMat);
      w.position.set(...pos);
      w.castShadow = true;
      carGroup.add(w);
      carWheels.push(w);
    });

    // Car LED Lightbars
    const carFrontLight = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.08, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    carFrontLight.position.set(0, 0.75, 2.12);
    carGroup.add(carFrontLight);

    const carTailLight = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.08, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    carTailLight.position.set(0, 0.75, -2.12);
    carGroup.add(carTailLight);

    const carSpotLight = new THREE.SpotLight(0x38bdf8, 3.5, 30, Math.PI / 5, 0.5);
    carSpotLight.position.set(0, 0.8, 2.1);
    carSpotLight.target.position.set(0, 0, 15);
    carGroup.add(carSpotLight);
    carGroup.add(carSpotLight.target);

    // Initial vehicle setup
    vehicleContainer.add(bikeGroup);
    vehicleContainer.add(carGroup);
    scene.add(vehicleContainer);

    // 7. Exhaust Particles / Speed Trails
    const trailCount = 80;
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(trailCount * 3);
    const trailColors = new Float32Array(trailCount * 3);

    for (let i = 0; i < trailCount; i++) {
      trailPositions[i * 3] = 0;
      trailPositions[i * 3 + 1] = 0;
      trailPositions[i * 3 + 2] = 0;

      trailColors[i * 3] = 0.02;
      trailColors[i * 3 + 1] = 0.7;
      trailColors[i * 3 + 2] = 0.83;
    }

    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

    const trailMat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const trailPoints = new THREE.Points(trailGeo, trailMat);
    scene.add(trailPoints);

    // Mouse Drag interaction for Orbit mode
    const handleMouseDown = (e) => {
      animStateRef.current.mouseDrag = true;
      animStateRef.current.prevMouseX = e.clientX;
      animStateRef.current.prevMouseY = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (!animStateRef.current.mouseDrag) return;
      const dx = e.clientX - animStateRef.current.prevMouseX;
      const dy = e.clientY - animStateRef.current.prevMouseY;

      animStateRef.current.orbitAngleX += dx * 0.006;
      animStateRef.current.orbitAngleY = Math.max(0.1, Math.min(Math.PI / 2.2, animStateRef.current.orbitAngleY - dy * 0.006));

      animStateRef.current.prevMouseX = e.clientX;
      animStateRef.current.prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      animStateRef.current.mouseDrag = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 8. Main Animation Render Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      const { isPaused, isNitro, cameraMode, vehicleType } = animStateRef.current;

      // Toggle vehicle visibility
      bikeGroup.visible = vehicleType === 'bike';
      carGroup.visible = vehicleType === 'car';

      if (!isPaused) {
        // Speed calculation
        const baseSpeed = isNitro ? 0.0016 : 0.00075;
        animStateRef.current.progress = (animStateRef.current.progress + baseSpeed) % 1.0;

        const currentProg = animStateRef.current.progress;

        // Get Vehicle Position & Direction along 3D Curve
        const pos = curve.getPointAt(currentProg);
        const tangent = curve.getTangentAt(currentProg).normalize();
        const lookTarget = pos.clone().add(tangent);

        // Next point for curvature calculation (leaning effect)
        const nextProg = (currentProg + 0.005) % 1.0;
        const nextTangent = curve.getTangentAt(nextProg).normalize();
        const cross = new THREE.Vector3().crossVectors(tangent, nextTangent);
        const curvature = cross.y * 30; // Positive = turning left, Negative = turning right

        vehicleContainer.position.copy(pos);
        vehicleContainer.lookAt(lookTarget);

        // Bike leaning physics into curves
        if (vehicleType === 'bike') {
          bikeGroup.rotation.z = THREE.MathUtils.lerp(bikeGroup.rotation.z, -curvature * 1.5, 0.1);
          rearWheel.rotation.x += isNitro ? 0.45 : 0.25;
          frontWheel.rotation.x += isNitro ? 0.45 : 0.25;
        } else {
          carWheels.forEach(w => {
            w.rotation.x += isNitro ? 0.45 : 0.25;
          });
          carGroup.rotation.z = THREE.MathUtils.lerp(carGroup.rotation.z, -curvature * 0.4, 0.1);
        }

        // Update trail particles
        const tPositions = trailGeo.attributes.position.array;
        for (let i = trailCount - 1; i > 0; i--) {
          tPositions[i * 3] = tPositions[(i - 1) * 3];
          tPositions[i * 3 + 1] = tPositions[(i - 1) * 3 + 1];
          tPositions[i * 3 + 2] = tPositions[(i - 1) * 3 + 2];
        }
        const exhaustOffset = pos.clone().addScaledVector(tangent, -1.8);
        tPositions[0] = exhaustOffset.x + (Math.random() - 0.5) * 0.3;
        tPositions[1] = exhaustOffset.y + 0.5 + Math.random() * 0.2;
        tPositions[2] = exhaustOffset.z + (Math.random() - 0.5) * 0.3;
        trailGeo.attributes.position.needsUpdate = true;

        // Camera Modes
        if (cameraMode === 'chase') {
          // Dynamic Follow Behind Cam
          const desiredCamPos = pos.clone()
            .addScaledVector(tangent, -9.5)
            .add(new THREE.Vector3(0, 4.2, 0));
          camera.position.lerp(desiredCamPos, 0.08);
          camera.lookAt(pos.clone().add(tangent.clone().multiplyScalar(4)));
        } else if (cameraMode === 'cockpit') {
          // First-person view over handlebars / hood
          const cockpitPos = pos.clone()
            .addScaledVector(tangent, vehicleType === 'bike' ? 0.2 : 0.5)
            .add(new THREE.Vector3(0, vehicleType === 'bike' ? 1.85 : 1.4, 0));
          camera.position.copy(cockpitPos);
          camera.lookAt(pos.clone().add(tangent.clone().multiplyScalar(15)));
        } else if (cameraMode === 'cinematic') {
          // Wide sweeping flyover
          const time = clock.getElapsedTime() * 0.3;
          camera.position.x = pos.x + Math.sin(time) * 22;
          camera.position.y = pos.y + 12;
          camera.position.z = pos.z + Math.cos(time) * 22;
          camera.lookAt(pos);
        } else if (cameraMode === 'orbit') {
          // User manual drag orbit around vehicle
          const dist = 16;
          const ox = animStateRef.current.orbitAngleX;
          const oy = animStateRef.current.orbitAngleY;
          camera.position.x = pos.x + dist * Math.cos(ox) * Math.cos(oy);
          camera.position.y = pos.y + dist * Math.sin(oy) + 2;
          camera.position.z = pos.z + dist * Math.sin(ox) * Math.cos(oy);
          camera.lookAt(pos.clone().add(new THREE.Vector3(0, 1.5, 0)));
        }

        // Telemetry Update calculations
        const speedValue = isNitro ? Math.round(98 + Math.random() * 4) : Math.round(62 + Math.random() * 3);
        setCurrentSpeed(speedValue);
        const percent = Math.round(currentProg * 100);
        setProgressPercent(percent);

        // Find active waypoint
        let closestWp = waypoints[0];
        for (let i = 0; i < waypoints.length; i++) {
          if (currentProg >= waypoints[i].progress) {
            closestWp = waypoints[i];
          }
        }
        setCurrentWaypoint(closestWp.name);
        setTripDistance((currentProg * 8.6).toFixed(1));
        setCo2Saved((currentProg * 1.85).toFixed(2));
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [timeOfDay]);

  return (
    <div className={`relative rounded-3xl overflow-hidden glass-panel border border-cyan-500/40 shadow-2xl transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50 bg-slate-950/95 flex flex-col' : 'w-full h-[540px]'
    }`}>
      
      {/* 3D WebGL Canvas Mount Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        title="Click and drag to orbit camera around 3D ride"
      />

      {/* TOP FLOATING HUD: Live Route Waypoint & Trip Telemetry */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Current Location Waypoint Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-xl shadow-xl pointer-events-auto">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
              Live Transit Highway • 3D Real-time
            </span>
            <strong className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
              <MapPin size={14} className="text-cyan-400 shrink-0" />
              <span>{currentWaypoint}</span>
            </strong>
          </div>
        </div>

        {/* Speedometer & Progress HUD */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Speed Indicator */}
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

          {/* Progress % */}
          <div className="px-4 py-2 rounded-2xl bg-slate-950/85 border border-emerald-500/30 backdrop-blur-xl shadow-xl text-center hidden sm:block">
            <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Route Progress</span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-black font-mono text-emerald-400">{progressPercent}%</span>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D View'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

      </div>

      {/* BOTTOM FLOATING CONTROLS: Vehicle Selector, Camera Angles, Nitro Boost, and Book CTA */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Controls: Vehicle Selector & Camera Views */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-950/85 p-1.5 rounded-2xl border border-slate-800/80 backdrop-blur-xl shadow-xl">
          
          {/* Vehicle Switcher */}
          <div className="flex items-center gap-1 pr-2 border-r border-slate-800">
            <button
              onClick={() => setVehicleType('bike')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                vehicleType === 'bike'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Cyber Sport Bike"
            >
              <Bike size={15} />
              <span>Cyber Bike</span>
            </button>

            <button
              onClick={() => setVehicleType('car')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                vehicleType === 'car'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tesla Model Y"
            >
              <Car size={15} />
              <span>EV Car</span>
            </button>
          </div>

          {/* Camera Angles */}
          <div className="flex items-center gap-1">
            {[
              { id: 'chase', label: 'Chase' },
              { id: 'cockpit', label: 'Rider View' },
              { id: 'orbit', label: '360° Drag' },
              { id: 'cinematic', label: 'Drone Fly' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setCameraMode(c.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  cameraMode === c.id
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

        </div>

        {/* Right Controls: Play/Pause, Nitro Boost, and Book Ride Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          
          {/* Nitro Boost Button */}
          <button
            onClick={() => setIsNitro(!isNitro)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all shadow-xl ${
              isNitro
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-white shadow-amber-500/30 ring-2 ring-amber-400 animate-pulse'
                : 'bg-slate-900/90 text-amber-300 hover:bg-slate-800 border border-amber-500/30'
            }`}
            title="Accelerate with Nitro Boost"
          >
            <Zap size={14} className={isNitro ? 'fill-white' : ''} />
            <span>{isNitro ? 'NITRO ON!' : 'Nitro Boost'}</span>
          </button>

          {/* Pause/Play Ride */}
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
