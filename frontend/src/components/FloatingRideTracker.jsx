import React, { useState } from 'react';
import { Bike, Navigation, ChevronUp, ChevronDown, Sparkles, MapPin, Zap } from 'lucide-react';

export default function FloatingRideTracker({ onNavigate, activeRide }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-30 select-none animate-fadeIn">
      <div className="glass-panel border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/10 backdrop-blur-xl overflow-hidden transition-all duration-300">
        
        {/* Header / Toggle Bar */}
        <div 
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800/90 cursor-pointer border-b border-slate-800"
        >
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Bike size={16} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-ping"></span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block leading-none">
                3D Live Tracker
              </span>
              <strong className="text-xs text-white">YatraGo Active Ride</strong>
            </div>
          </div>

          <button className="text-slate-400 hover:text-white p-1">
            {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Expanded Info Body */}
        {!collapsed && (
          <div className="p-3.5 space-y-3 w-64 text-xs">
            {/* Animated Mini Roadway with Cruising Bike */}
            <div className="relative h-10 w-full rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center px-2">
              <div className="absolute inset-x-0 h-0.5 top-1/2 -translate-y-1/2 flex justify-between gap-2 overflow-hidden opacity-50">
                {[...Array(10)].map((_, i) => (
                  <span key={i} className="w-4 h-0.5 bg-yellow-400 rounded-full shrink-0"></span>
                ))}
              </div>

              {/* Cruising bike */}
              <div className="absolute top-1/2 -translate-y-1/2 left-2 animate-[spin_4s_linear_infinite] hidden"></div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Bike size={14} className="animate-pulse" />
                <span className="text-[10px] font-mono font-bold">64 km/h • On Track</span>
              </div>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="text-cyan-400 font-bold truncate max-w-[120px]">
                  {activeRide?.destination?.name || 'Downtown Hub'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Driver / Vehicle:</span>
                <span className="text-emerald-400 font-bold">Marcus V. • EV</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('preview-3d')}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all hover:scale-105"
            >
              <Navigation size={13} />
              <span>Open Full 3D Map</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
