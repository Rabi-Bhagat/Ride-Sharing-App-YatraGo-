import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, Sun, Moon, Eye, RotateCw, Sparkles, MapPin, CheckCircle2, CloudRain, Shield, Navigation, ArrowRight } from 'lucide-react';
import { DESTINATIONS_3D } from '../data/mockData';

export default function ThreeDestinationPreview({ initialDestinationId = 'downtown', onSelectLocationForRide }) {
  const mountRef = useRef(null);
  const [selectedDestId, setSelectedDestId] = useState(initialDestinationId);
  const [skyTheme, setSkyTheme] = useState('neon'); // 'neon', 'sunset', 'daylight', 'cyberfog'
  const [activeLandmark, setActiveLandmark] = useState(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.003);

  const destObj = DESTINATIONS_3D.find(d => d.id === selectedDestId) || DESTINATIONS_3D[0];

  const skyColorMap = {
    neon: '#0b132b',
    sunset: '#2d1537',
    daylight: '#e0f2fe',
    cyberfog: '#051923'
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const currentSkyColor = skyColorMap[skyTheme] || destObj.skyColor;
    scene.background = new THREE.Color(currentSkyColor);
    scene.fog = new THREE.FogExp2(currentSkyColor, skyTheme === 'cyberfog' ? 0.03 : 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(32, 26, 36);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(
      skyTheme === 'daylight' ? 0xffffff : 0x223344, 
      skyTheme === 'daylight' ? 2.8 : 1.6
    );
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(
      skyTheme === 'sunset' ? 0xf59e0b : skyTheme === 'neon' ? 0x06b6d4 : 0xffffff, 
      2.5
    );
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(80, 40, 0x06b6d4, skyTheme === 'daylight' ? 0xcfe2fe : 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const cityGroup = new THREE.Group();
    const buildingCount = destObj.id === 'alpine' ? 12 : 26;
    const themeColor = new THREE.Color(destObj.colorTheme);

    for (let i = 0; i < buildingCount; i++) {
      const isCentralTower = i === 0;
      const bHeight = isCentralTower ? 24 : Math.random() * 14 + 4;
      const bWidth = isCentralTower ? 6.5 : Math.random() * 3.5 + 2;
      const bDepth = isCentralTower ? 6.5 : Math.random() * 3.5 + 2;

      const geometry = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      const material = new THREE.MeshStandardMaterial({
        color: isCentralTower ? themeColor : (skyTheme === 'daylight' ? 0x64748b : 0x0f172a),
        roughness: 0.2,
        metalness: 0.8
      });

      const building = new THREE.Mesh(geometry, material);
      let x = (Math.random() - 0.5) * 52;
      let z = (Math.random() - 0.5) * 52;
      if (isCentralTower) { x = 0; z = 0; }

      building.position.set(x, bHeight / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      cityGroup.add(building);

      if (skyTheme !== 'daylight' && Math.random() > 0.35) {
        const glowGeo = new THREE.BoxGeometry(bWidth * 1.02, 0.4, bDepth * 1.02);
        const glowMat = new THREE.MeshBasicMaterial({ color: themeColor });
        const glowRing = new THREE.Mesh(glowGeo, glowMat);
        glowRing.position.set(x, bHeight * 0.75, z);
        cityGroup.add(glowRing);
      }
    }

    const pinGroup = new THREE.Group();
    destObj.landmarks.forEach((name, idx) => {
      const pinGeo = new THREE.ConeGeometry(1.4, 3.2, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.rotation.x = Math.PI;

      const angle = (idx / destObj.landmarks.length) * Math.PI * 2;
      pin.position.set(Math.cos(angle) * 15, 13, Math.sin(angle) * 15);
      pinGroup.add(pin);
    });

    scene.add(cityGroup);
    scene.add(pinGroup);

    // Particle system
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 250;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 100;
      posArray[i + 1] = Math.random() * 55 + 10;
      posArray[i + 2] = (Math.random() - 0.5) * 100;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.9,
      color: themeColor,
      transparent: true,
      opacity: 0.85
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    let animationFrameId;
    let angle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      angle += rotationSpeed;
      
      camera.position.x = 35 * Math.cos(angle);
      camera.position.z = 35 * Math.sin(angle);
      camera.lookAt(0, 6, 0);

      pinGroup.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [selectedDestId, skyTheme, rotationSpeed]);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 shadow-2xl">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Box className="text-cyan-400" />
              <span>Interactive 3D Destination Preview</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30">
              Three.js WebGL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore 3D volumetric models of your destination before booking your trip.
          </p>
        </div>

        {/* Sky / Atmosphere Modes */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'neon', label: 'Neon' },
            { id: 'sunset', label: 'Sunset' },
            { id: 'daylight', label: 'Day' },
            { id: 'cyberfog', label: 'Fog' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setSkyTheme(m.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                skyTheme === m.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destination Preset Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DESTINATIONS_3D.map(dest => (
          <button
            key={dest.id}
            onClick={() => setSelectedDestId(dest.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedDestId === dest.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-violet-600/20 text-cyan-300 border-cyan-500 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {dest.name}
          </button>
        ))}
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner group">
        
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing"></div>

        {/* Top Info Badge */}
        <div className="absolute top-4 left-4 z-10 glass-panel px-3.5 py-2 rounded-xl border border-slate-700/60 text-xs text-slate-200 flex items-center gap-2.5">
          <RotateCw size={14} className="text-cyan-400 animate-spin" />
          <div>
            <strong className="block text-white font-bold">{destObj.name}</strong>
            <span className="text-[10px] text-cyan-400 font-mono">360° Orbit Camera Active</span>
          </div>
        </div>

        {/* Rotation Speed Controls */}
        <div className="absolute top-4 right-4 z-10 glass-panel px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Orbit Speed:</span>
          <button
            onClick={() => setRotationSpeed(rotationSpeed === 0 ? 0.003 : 0)}
            className="text-[10px] font-mono font-bold text-cyan-400 underline"
          >
            {rotationSpeed === 0 ? 'Paused' : 'Rotating'}
          </button>
        </div>

        {/* Landmark Hotspot Pins */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center gap-2">
          {destObj.landmarks.map(landmark => (
            <button
              key={landmark}
              onClick={() => setActiveLandmark(landmark)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all"
            >
              <MapPin size={13} className="text-cyan-400" />
              <span>{landmark}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Selected Landmark Detail Box */}
      {activeLandmark && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-cyan-400" />
            <span>Landmark Highlight: <strong className="text-white">{activeLandmark}</strong></span>
          </div>
          <button onClick={() => setActiveLandmark(null)} className="text-slate-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Destination Detail Card & Ride Booking Action */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">3D Volumetric Scene</span>
          <strong className="text-sm text-white font-bold">{destObj.name}</strong>
          <p className="text-xs text-slate-300 mt-0.5">{destObj.description}</p>
        </div>
        {onSelectLocationForRide && (
          <button
            onClick={() => onSelectLocationForRide(destObj, 'destination')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 via-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all shrink-0"
          >
            <Navigation size={14} />
            <span>Set as Ride Destination</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

    </div>
  );
}
