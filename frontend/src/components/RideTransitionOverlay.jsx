import React, { useEffect, useState } from 'react';
import { Bike, Car, Sparkles, MapPin, ArrowRight, Zap } from 'lucide-react';

const PAGE_NAMES = {
  home: 'Home Hub',
  book: 'Book Ride',
  stranger: 'Pool & Save',
  'cost-split': 'Split Fare',
  'preview-3d': '3D Map Explorer',
  guiders: 'Local Guiders',
  sos: 'Emergency SOS',
  chat: 'Group Chat'
};

export default function RideTransitionOverlay({ isTransitioning, fromTab, toTab, onTransitionComplete }) {
  const [vehicleX, setVehicleX] = useState(0);

  useEffect(() => {
    if (!isTransitioning) {
      setVehicleX(0);
      return;
    }

    // Animate vehicle across road
    setVehicleX(100);

    const timer = setTimeout(() => {
      if (onTransitionComplete) {
        onTransitionComplete();
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [isTransitioning]);

  if (!isTransitioning) return null;

  const fromName = PAGE_NAMES[fromTab] || 'YatraGo';
  const toName = PAGE_NAMES[toTab] || 'Destination';

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-md animate-fadeIn transition-all duration-300">
      
      {/* Central Transit Capsule Card */}
      <div className="w-11/12 max-w-xl p-6 rounded-3xl bg-slate-900/95 border border-cyan-500/50 shadow-2xl shadow-cyan-500/20 space-y-5 text-center relative overflow-hidden backdrop-blur-2xl">
        
        {/* Glow Ambient behind card */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header telemetry badge */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <Zap size={13} className="text-emerald-400 animate-pulse" />
            <span>YATRAGO KINETIC TRANSIT</span>
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Speed: 88 km/h
          </span>
        </div>

        {/* Waypoints Header */}
        <div className="flex items-center justify-between text-sm font-black text-white px-2">
          <div className="flex items-center gap-1.5 text-left">
            <MapPin size={15} className="text-cyan-400 shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-[180px]">{fromName}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold px-2">
            <span>Riding</span>
            <ArrowRight size={14} className="text-cyan-400 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 text-right">
            <span className="truncate max-w-[140px] sm:max-w-[180px] text-emerald-400">{toName}</span>
            <MapPin size={15} className="text-emerald-400 shrink-0" />
          </div>
        </div>

        {/* 3D-styled Illuminated Road Track with Moving Bike */}
        <div className="relative h-20 w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center px-4 shadow-inner">
          
          {/* Animated Road Lane Markings */}
          <div className="absolute inset-x-0 h-1 top-1/2 -translate-y-1/2 flex justify-between gap-3 overflow-hidden opacity-60">
            {[...Array(20)].map((_, i) => (
              <span key={i} className="w-8 h-1 bg-yellow-400/80 rounded-full shrink-0 animate-pulse"></span>
            ))}
          </div>

          {/* Road Borders */}
          <div className="absolute inset-x-0 top-1 h-0.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 shadow-sm shadow-cyan-400"></div>
          <div className="absolute inset-x-0 bottom-1 h-0.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 shadow-sm shadow-cyan-400"></div>

          {/* Moving Bike with Light Trail */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out flex items-center"
            style={{ 
              left: `${vehicleX}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Speed Light Trail */}
            <div className="w-16 h-4 -mr-2 bg-gradient-to-r from-transparent to-cyan-500/40 rounded-full blur-sm"></div>

            {/* Glowing Bike Capsule */}
            <div className="relative p-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-lg shadow-cyan-500/50 flex items-center justify-center animate-bounce">
              <Bike size={22} className="stroke-[2.5]" />
              
              {/* Headlight beam */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 w-12 h-6 bg-gradient-to-r from-cyan-300/80 to-transparent clip-triangle pointer-events-none blur-[1px]"></div>
            </div>
          </div>

        </div>

        {/* Route status bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Switching Platform Dimension...</span>
          </span>
          <span className="text-cyan-400 font-bold">100% Zero-Carbon Transit</span>
        </div>

      </div>

    </div>
  );
}
