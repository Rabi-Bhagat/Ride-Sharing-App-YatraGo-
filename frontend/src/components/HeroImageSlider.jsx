import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, MapPin, Zap, Maximize2, Minimize2 } from 'lucide-react';

export const HERO_IMAGES = [
  {
    id: 0,
    src: '/hero-images/hero-main.png',
    title: 'Next-Gen Urban Transit',
    subtitle: 'Connecting Commuters Across Smart City Corridors',
    tag: 'FLAGSHIP MOBILITY',
    stat: '44% Pool Savings',
    color: '#06b6d4',
    location: 'Cyber Harbor Suspension Bridge'
  },
  {
    id: 1,
    src: '/hero-images/hero-slide-1.png',
    title: 'High-Speed Highway Cruiser',
    subtitle: 'Seamless Zero-Emission Long Range Commutes',
    tag: 'ELECTRIC HIGHWAY',
    stat: '100% Zero-Carbon',
    color: '#38bdf8',
    location: 'Alpine Ridge Highway Summit'
  },
  {
    id: 2,
    src: '/hero-images/hero-slide-2.png',
    title: 'Hyper-Agile City Transit',
    subtitle: 'Bypass Rush-Hour Congestion With Verified Drivers',
    tag: 'RAPID DISPATCH',
    stat: '< 3 Min Pickup',
    color: '#10b981',
    location: 'Downtown Innovation Tech Park'
  },
  {
    id: 3,
    src: '/hero-images/hero-slide-3.png',
    title: 'Real-Time Navigation & Traffic',
    subtitle: 'Dynamic Route Optimization and Fast Commutes',
    tag: 'LIVE NAVIGATION',
    stat: 'Live GPS Sync',
    color: '#f59e0b',
    location: 'Oceanfront Bay Highline Viaduct'
  },
  {
    id: 4,
    src: '/hero-images/hero-slide-4.png',
    title: 'Zero-Emission Urban Rides',
    subtitle: 'Clean Sustainable Mobility for Modern Commuters',
    tag: 'ECO FLEET',
    stat: '100% Electric',
    color: '#06b6d4',
    location: 'Metro Cyber Interchange 101'
  },
  {
    id: 5,
    src: '/hero-images/hero-slide-5.png',
    title: 'Safety First on Every Trip',
    subtitle: 'Government ID Verified Riders & 24/7 Safety Support',
    tag: 'VERIFIED SAFETY',
    stat: 'Verified Drivers',
    color: '#ef4444',
    location: 'Central Safety Operations Hub'
  },
  {
    id: 6,
    src: '/hero-images/hero-slide-6.png',
    title: 'Carpool & Shared Rides',
    subtitle: 'Share rides along identical routes & slash fare prices',
    tag: 'SHARED TRANSIT',
    stat: 'Save Up to 45%',
    color: '#8b5cf6',
    location: 'West End Terminal Corridor'
  },
  {
    id: 7,
    src: '/hero-images/hero-slide-7.png',
    title: 'Metro Skyway Network',
    subtitle: 'Express Inter-City Highway Transit Hubs',
    tag: 'METRO EXPRESS',
    stat: '24/7 Availability',
    color: '#14b8a6',
    location: 'Metro Airport Skyway Express'
  }
];

export default function HeroImageSlider({ onBookRideWithRoute, onSelectSlide }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [fitMode, setFitMode] = useState('contain'); // 'contain' (small, fit full picture in frame) or 'cover' (bleed)
  const autoPlayDuration = 2600; // Fast & dynamic auto-transition every 2.6 seconds

  // Pre-load images for seamless, instant transitions
  useEffect(() => {
    HERO_IMAGES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });
  }, []);

  // Automatic transition loop (pauses gently on mouse hover)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, autoPlayDuration);
    return () => clearInterval(interval);
  }, [isHovered]);

  const activeImage = HERO_IMAGES[currentIndex];

  const handleBook = () => {
    if (onBookRideWithRoute) {
      onBookRideWithRoute({
        waypoint: activeImage.location,
        slideTitle: activeImage.title
      });
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[520px] sm:h-[560px] rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl select-none"
    >
      {/* ======================================================== */}
      {/* CINEMATIC IMAGE AUTO-TRANSITION STACK                    */}
      {/* ======================================================== */}
      <div className="relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center">
        {HERO_IMAGES.map((img, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={img.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {fitMode === 'contain' ? (
                <>
                  {/* 1. Ambient Blurred Glow in Background to Fill Outer Frame */}
                  <img
                    src={img.src}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-35 scale-110 pointer-events-none"
                  />

                  {/* Soft Cinematic Vignette */}
                  <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-slate-950/50 pointer-events-none" />

                  {/* 2. Sharp Contained Picture (Scaled Small So Entire Image Fits Full Frame) */}
                  <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-5 pt-14 pb-24 sm:pb-28">
                    <img
                      src={img.src}
                      alt={img.title}
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-slate-800 transition-transform duration-500 ease-out"
                      loading={index < 2 ? 'eager' : 'lazy'}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Full Bleed Mode */}
                  <img
                    src={img.src}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-[3000ms] ease-out scale-100"
                    loading={index < 2 ? 'eager' : 'lazy'}
                  />

                  {/* Cinematic Vignette & Lighting Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-transparent to-slate-950/35 pointer-events-none" />
                </>
              )}
            </div>
          );
        })}

        {/* Ambient Subtle Cyber Glow Sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent pointer-events-none animate-pulse" />
      </div>

      {/* ======================================================== */}
      {/* TOP HEADER: LIVE LOCATION CORRIDOR BADGE                 */}
      {/* ======================================================== */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 border border-slate-800 backdrop-blur-xl shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono">
            {activeImage.tag}
          </span>
          <span className="h-3 w-px bg-slate-800" />
          <span className="flex items-center gap-1 text-white text-xs font-bold truncate max-w-[180px] sm:max-w-[280px]">
            <MapPin size={12} className="text-cyan-400 shrink-0" />
            <span className="truncate">{activeImage.location}</span>
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TOP-RIGHT MINIMALIST SLIDE INDICATORS & FIT TOGGLE       */}
      {/* ======================================================== */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 p-1.5 rounded-full bg-slate-950/85 border border-slate-800/80 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-1.5 px-1">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentIndex
                  ? 'w-6 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                  : 'w-1.5 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Slide ${i + 1} of ${HERO_IMAGES.length}`}
            />
          ))}
        </div>

        <span className="w-px h-3 bg-slate-700/60" />

        <button
          onClick={() => setFitMode(prev => prev === 'contain' ? 'cover' : 'contain')}
          className="p-1 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-all cursor-pointer"
          title={fitMode === 'contain' ? "Switch to Full Bleed Fill" : "Fit Full Picture in Frame"}
        >
          {fitMode === 'contain' ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
        </button>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM OVERLAY: STREAMLINED CAPTION & ACTION CTA         */}
      {/* ======================================================== */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 pointer-events-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
          
          <div className="space-y-0.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-300 font-mono font-bold bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded-full">
                {activeImage.stat}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                ✓ Available Now
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
              {activeImage.title}
            </h3>

            <p className="text-xs text-slate-300 line-clamp-1 leading-relaxed">
              {activeImage.subtitle}
            </p>
          </div>

          {/* Quick Action CTA Button */}
          <button
            onClick={handleBook}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Book This Route</span>
            <ArrowRight size={14} />
          </button>

        </div>
      </div>

    </div>
  );
}
