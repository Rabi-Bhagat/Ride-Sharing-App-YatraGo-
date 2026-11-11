import React, { useRef, useState } from 'react';
import { 
  Car, Users, DollarSign, Box, Compass, AlertTriangle, 
  ShieldCheck, ArrowRight, Sparkles, MapPin, Zap, CheckCircle2, Bike,
  Navigation, Shield, Check, Clock, Radio, ChevronRight
} from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';
import yatraGoLogo from '../logo/yatrago-logo.png';
import Interactive3DRideScene from '../components/Interactive3DRideScene';

export default function HomePage({ onNavigate, user }) {
  const [quickPickup, setQuickPickup] = useState('Innovation Tech Park, SF');
  const [quickDropoff, setQuickDropoff] = useState('Downtown Cyber Hub');
  const [isPoolSelected, setIsPoolSelected] = useState(true);

  const destinationOptions = [
    { name: 'Downtown Cyber Hub', distance: '8.4 km', baseFare: 24.50 },
    { name: 'Oceanfront Bay Pier', distance: '12.1 km', baseFare: 32.00 },
    { name: 'Metro Airport Skyway', distance: '19.5 km', baseFare: 48.00 },
    { name: 'Alpine Ridge Summit', distance: '26.8 km', baseFare: 62.00 }
  ];

  const currentDest = destinationOptions.find(d => d.name === quickDropoff) || destinationOptions[0];
  const standardFare = currentDest.baseFare;
  const poolFare = (standardFare * 0.56).toFixed(2); // 44% savings
  const effectiveFare = isPoolSelected ? poolFare : standardFare.toFixed(2);

  const handleInstantBook = () => {
    onNavigate('book');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 3D INTERACTIVE HERO HEADQUARTERS */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-cyan-500/40 p-6 sm:p-8 lg:p-10 shadow-2xl space-y-6">
        
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/15 via-emerald-600/10 to-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header & Branding Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* Headline & Value Proposition */}
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold font-mono">
                <Sparkles size={13} className="text-emerald-400" />
                <span>YATRA • GO • MOBILITY • 3.0</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-extrabold border border-emerald-500/30 font-mono">
                44% POOL SAVINGS
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30 font-mono">
                60FPS WEBGL ENGINE
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Urban Transit Reimagined in{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Realistic Real-Time 3D
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Experience live interactive highway simulation with Superbikes and Tesla EV Shuttles, AI co-rider pooling, instant fare splitting, and 3D satellite previews.
            </p>
          </div>

          {/* Official Emblem & Live Telemetry Badge */}
          <div className="shrink-0 flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-xl backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl p-1 bg-white flex items-center justify-center border border-cyan-500/40 shadow-md">
              <img
                src={yatraGoLogo}
                alt="YatraGo Roadway Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <strong className="text-white text-sm font-black tracking-tight">YatraGo Pro</strong>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono block">Zero-Carbon Transit Network</span>
            </div>
          </div>

        </div>

        {/* REALISTIC 3D HIGHWAY & VEHICLE SCENE */}
        <div className="relative z-10 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl">
          <Interactive3DRideScene 
            onBookRideWithRoute={handleInstantBook}
          />
        </div>

        {/* QUICK RIDE BOOKING CONSOLE (Interactive Floating Strip) */}
        <div className="relative z-10 glass-card p-4 sm:p-5 rounded-2xl border border-cyan-500/30 space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Origin & Destination Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto flex-1">
              {/* Pickup */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Pickup Point</span>
                  <input
                    type="text"
                    value={quickPickup}
                    onChange={(e) => setQuickPickup(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none truncate"
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <MapPin size={16} className="text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Dropoff Destination</span>
                  <select
                    value={quickDropoff}
                    onChange={(e) => setQuickDropoff(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    {destinationOptions.map(d => (
                      <option key={d.name} value={d.name} className="bg-slate-900 text-white">
                        {d.name} ({d.distance})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Fare Estimate & Booking Action */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
              
              {/* Pool Savings Switcher */}
              <button
                onClick={() => setIsPoolSelected(!isPoolSelected)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isPoolSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
                title="Toggle AI Stranger Carpooling"
              >
                <Users size={14} className={isPoolSelected ? 'text-emerald-400' : ''} />
                <span>Pool & Save 44%</span>
                {isPoolSelected && <Check size={14} className="text-emerald-400" />}
              </button>

              {/* Price Calculation Pill */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Fare</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white font-mono">${effectiveFare}</span>
                  {isPoolSelected && (
                    <span className="text-xs text-slate-500 line-through font-mono">${standardFare.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleInstantBook}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all"
              >
                <Car size={16} />
                <span>Confirm & Book Ride</span>
                <ArrowRight size={16} />
              </button>

            </div>

          </div>
        </div>

      </div>

      {/* QUICK STATS METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Total Rides Pooled</span>
          <span className="text-2xl font-black text-white mt-1 block">14,280+</span>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <Zap size={12} /> 44% Average Savings
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Carbon Offset</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">38.4 Tons</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Zero-Emission Fleet</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Identity Verification</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">99.4%</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Govt ID Checkmark</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Safety Guarantee</span>
          <span className="text-2xl font-black text-rose-400 mt-1 block">Instant SOS</span>
          <span className="text-[11px] text-slate-400 mt-1 block">5km Telemetry Beacon</span>
        </div>
      </div>

      {/* FEATURE PAGES SHOWCASE GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Platform Modules & Features</h2>
            <p className="text-xs text-slate-400 mt-0.5">Explore each dedicated module designed for modern smart urban mobility</p>
          </div>
          <span className="text-xs text-cyan-400 font-mono font-bold hidden sm:block">6 Active Modules ✓</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Ride Pool Matcher */}
          <div
            onClick={() => onNavigate('stranger')}
            className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-emerald-500/50 cursor-pointer group transition-all duration-300 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                <span>Stranger Ride Matcher</span>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                AI route alignment algorithm that pairs you with verified co-riders to save up to 45% on fare.
              </p>
            </div>
          </div>

          {/* Card 2: Cost Splitter */}
          <div
            onClick={() => onNavigate('cost-split')}
            className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-blue-500/50 cursor-pointer group transition-all duration-300 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors flex items-center justify-between">
                <span>Automated Cost Splitter</span>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Fair financial fare calculations with interactive live payment simulator (UPI, Card, Apple Pay).
              </p>
            </div>
          </div>

          {/* Card 3: 3D Preview */}
          <div
            onClick={() => onNavigate('preview-3d')}
            className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-violet-500/50 cursor-pointer group transition-all duration-300 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Box size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors flex items-center justify-between">
                <span>3D Destination Explorer</span>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Three.js WebGL 3D volumetric cityscapes with 360° orbit rotation, atmosphere modes & landmark pins.
              </p>
            </div>
          </div>

          {/* Card 4: Local Guiders */}
          <div
            onClick={() => onNavigate('guiders')}
            className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-amber-500/50 cursor-pointer group transition-all duration-300 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                <span>Local Guider Network</span>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Book licensed travel guiders to join your ride share and guide your urban expedition.
              </p>
            </div>
          </div>

          {/* Card 5: Emergency SOS */}
          <div
            onClick={() => onNavigate('sos')}
            className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-red-500/50 cursor-pointer group transition-all duration-300 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors flex items-center justify-between">
                <span>Localized Emergency SOS</span>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                3-second safety countdown beacon broadcasting emergency GPS telemetry to 5km radius response units.
              </p>
            </div>
          </div>

          {/* Card 6: Real-time Group Chat */}
          <div
            onClick={() => onNavigate('chat')}
            className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-cyan-500/50 cursor-pointer group transition-all duration-300 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                <span>Socket Group Chat</span>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Live multi-participant socket chat connecting co-riders, driver, and assigned local guiders.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
