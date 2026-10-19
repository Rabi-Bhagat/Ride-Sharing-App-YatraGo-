import React from 'react';
import { 
  Car, Users, DollarSign, Box, Compass, AlertTriangle, 
  ShieldCheck, ArrowRight, Sparkles, MapPin, Zap, CheckCircle2 
} from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';
import yatraGoLogo from '../logo/YatraGo Travel Logo Presentation.png';

export default function HomePage({ onNavigate, user }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-cyan-500/30 p-6 sm:p-10 lg:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-emerald-600/10 to-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <Sparkles size={14} className="text-emerald-400" />
              <span>YatraGo — Smart Urban Ride Sharing & 3D Mobility</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Ride Smarter. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Share Costs. Explore 3D.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              YatraGo blends AI stranger pooling, automated multi-passenger fare splitting, interactive 3D satellite previews, certified travel guiders, and verified passenger SOS safety into one cohesive mobility experience.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('book')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all"
              >
                <Car size={18} />
                <span>Book Ride Now</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => onNavigate('preview-3d')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 text-slate-200 border border-slate-700 font-extrabold text-sm hover:bg-slate-800 hover:border-cyan-500 transition-all"
              >
                <Box size={18} className="text-cyan-400" />
                <span>Explore 3D Destinations</span>
              </button>
            </div>
          </div>

          {/* Hero Branding Showcase */}
          <div className="shrink-0 flex flex-col items-center p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 shadow-2xl backdrop-blur-xl relative group">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl p-3 bg-gradient-to-b from-slate-950/80 to-slate-900 flex items-center justify-center border border-slate-700/80 group-hover:border-cyan-400/50 transition-all shadow-inner">
              <img
                src={yatraGoLogo}
                alt="YatraGo Roadway Brand"
                className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="text-xs font-black text-cyan-300 uppercase tracking-widest mt-3">
              Official Platform Emblem
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Rides Pooled</span>
          <span className="text-2xl font-black text-white mt-1 block">14,280+</span>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <Zap size={12} /> 44% Average Savings
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Carbon Offset</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">38.4 Tons</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Zero-Emission Fleet</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Identity Verification</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">99.4%</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Govt ID Checkmark</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Safety Guarantee</span>
          <span className="text-2xl font-black text-rose-400 mt-1 block">Instant SOS</span>
          <span className="text-[11px] text-slate-400 mt-1 block">5km Telemetry Beacon</span>
        </div>
      </div>

      {/* Feature Pages Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Platform Modules & Features</h2>
          <span className="text-xs text-slate-400">Click any card to open dedicated module page</span>
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
