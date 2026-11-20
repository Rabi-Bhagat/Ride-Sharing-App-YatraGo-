import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, ArrowRight, Eye, Sparkles, BatteryCharging, Gauge, Users, Check, X, Award, Radio } from 'lucide-react';

export const VEHICLE_FLEET_DATA = [
  {
    id: 'superbike',
    name: 'HyperBike 1200R',
    edition: 'Apex Track Edition',
    category: 'Electric Superbike',
    tagline: 'Hyper-acceleration for swift urban & highway transit',
    image: '/yatrago-superbike-realistic.webp',
    baseFare: 45.00,
    perKm: 12.00,
    acceleration: '2.4s',
    accelerationNum: 2.4,
    topSpeed: '310 km/h',
    range: '320 km',
    battery: '48 kWh',
    seats: 1,
    seatsLabel: '1 Rider (Solo Swift)',
    carbonOffset: '100% Zero Emission',
    badge: 'MOST POPULAR',
    badgeColor: 'from-cyan-500 to-blue-600',
    accentColor: '#06b6d4',
    features: [
      'Bypasses rush-hour traffic jams with ease',
      'Aerodynamic carbon fiber fairing & Brembo calipers',
      'Dual helmet safety & high-vis gear included'
    ]
  },
  {
    id: 'teslacar',
    name: 'Cyber EV Sedan',
    edition: 'Executive Autopilot',
    category: 'Autonomous Electric Sedan',
    tagline: 'Whisper-quiet luxury with panoramic smart glass & FSD',
    image: '/yatrago-car-realistic.webp',
    baseFare: 80.00,
    perKm: 18.00,
    acceleration: '3.1s',
    accelerationNum: 3.1,
    topSpeed: '260 km/h',
    range: '580 km',
    battery: '100 kWh',
    seats: 4,
    seatsLabel: '4 Seats (Executive Pool)',
    carbonOffset: '100% Zero Emission',
    badge: 'AUTOPILOT L4',
    badgeColor: 'from-blue-500 to-cyan-500',
    accentColor: '#38bdf8',
    features: [
      'Full Self-Driving AI with highway lane autopilot',
      'Active noise-cancelling acoustic glass cabin',
      'Dual wireless fast charging & rear climate touchscreens'
    ]
  },
  {
    id: 'ecosuv',
    name: 'EcoSUV Voyager',
    edition: 'Long-Range Grand Tourer',
    category: '7-Seater Electric SUV',
    tagline: 'Spacious group commuting with roof LiDAR & massive luggage capacity',
    image: '/yatrago-suv-realistic.webp',
    baseFare: 140.00,
    perKm: 24.00,
    acceleration: '4.8s',
    accelerationNum: 4.8,
    topSpeed: '220 km/h',
    range: '520 km',
    battery: '120 kWh',
    seats: 7,
    seatsLabel: '6-7 Seats (Group Sharing)',
    carbonOffset: '100% Zero Emission',
    badge: 'MAX SAVINGS / POOL',
    badgeColor: 'from-emerald-500 to-teal-600',
    accentColor: '#10b981',
    features: [
      'Ideal for group ride-sharing (up to 48% fare savings)',
      'Roof-mounted LiDAR sensor pod & 360° cameras',
      'High-capacity luggage trunk (up to 6 travel bags)'
    ]
  },
  {
    id: 'aeroscooter',
    name: 'AeroScooter Neo',
    edition: 'AERO-E 01 Urban Agile',
    category: 'Smart Micro-Transit',
    tagline: 'Ultra-low cost zero-congestion commute for city hops',
    image: '/yatrago-scooter-realistic.webp',
    baseFare: 30.00,
    perKm: 9.00,
    acceleration: '5.2s',
    accelerationNum: 5.2,
    topSpeed: '95 km/h',
    range: '140 km',
    battery: '12 kWh',
    seats: 1,
    seatsLabel: '1 Rider (Urban Micro)',
    carbonOffset: '100% Zero Emission',
    badge: 'ECO BUDGET',
    badgeColor: 'from-amber-500 to-orange-500',
    accentColor: '#f59e0b',
    features: [
      'Lowest base fare in the city (₹30)',
      'Matte satin silver chassis with illuminated neon cyan rims',
      'Instant curbside drop-off anywhere in downtown'
    ]
  }
];

export default function VehicleFleetShowcase({ 
  selectedVehicleId, 
  onSelectVehicle, 
  onBookVehicle,
  onInspectImage 
}) {
  const [activeVehicle, setActiveVehicle] = useState(selectedVehicleId || 'superbike');
  const [lightboxImage, setLightboxImage] = useState(null);

  const current = VEHICLE_FLEET_DATA.find(v => v.id === activeVehicle) || VEHICLE_FLEET_DATA[0];

  const handleSelect = (veh) => {
    setActiveVehicle(veh.id);
    if (onSelectVehicle) {
      onSelectVehicle(veh);
    }
  };

  const handleBook = (veh) => {
    if (onBookVehicle) {
      onBookVehicle(veh);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <Sparkles size={12} className="text-emerald-400" />
              <span>YATRAGO REALISTIC FLEET SHOWCASE</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              4 PRODUCTION CLASSES
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Select Your Vehicle &{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Ride in Real-Time
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Choose any realistic electric model below. Selected models immediately sync with the 3D simulator, instant booking, and dynamic fare savings.
          </p>
        </div>

        {/* Fleet Verification Badge */}
        <div className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>All Vehicles GPS-Tracked & Govt Verified</span>
        </div>
      </div>

      {/* 4-Column Interactive Vehicle Fleet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {VEHICLE_FLEET_DATA.map((veh) => {
          const isSelected = activeVehicle === veh.id;

          return (
            <div
              key={veh.id}
              onClick={() => handleSelect(veh)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border ${
                isSelected
                  ? 'border-cyan-400 bg-slate-900/95 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                  : 'border-slate-800/90 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              
              {/* Badge & Category Pill */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                <span className={`text-[10px] font-black uppercase font-mono px-2.5 py-0.5 rounded-full text-white shadow-md bg-gradient-to-r ${veh.badgeColor}`}>
                  {veh.badge}
                </span>
                {isSelected && (
                  <span className="flex items-center gap-1 text-[10px] font-black font-mono text-cyan-300 bg-cyan-950/90 border border-cyan-400 px-2 py-0.5 rounded-full shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    ACTIVE FEED
                  </span>
                )}
              </div>

              {/* High-Resolution Automotive Photo Preview */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                <img
                  src={veh.image}
                  alt={veh.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList?.add('img-fallback'); }} />

                {/* Subtle dark gradient overlay on photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 pointer-events-none"></div>

                {/* View 8K Lightbox Icon Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage(veh);
                  }}
                  className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-cyan-500/30 hover:border-cyan-400 transition-all shadow-md z-10"
                  title="View Photorealistic 8K Photo"
                >
                  <Eye size={13} />
                </button>

                {/* Acceleration Callout */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/85 border border-slate-800 backdrop-blur-md">
                  <Gauge size={11} className="text-cyan-400" />
                  <span className="text-[10px] font-bold font-mono text-white">0-100: {veh.acceleration}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                        {veh.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 block -mt-0.5 font-medium">
                        {veh.edition}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 font-mono block">Base</span>
                      <strong className="text-base font-black text-white font-mono">₹{veh.baseFare.toFixed(2)}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {veh.tagline}
                  </p>
                </div>

                {/* Key Specs Pills */}
                <div className="grid grid-cols-3 gap-1 sm:gap-1.5 py-2 border-y border-slate-800/80 text-center font-mono">
                  <div className="bg-slate-950/60 p-1 rounded-lg border border-slate-800/50">
                    <span className="text-[9px] text-slate-400 block uppercase">Max Spd</span>
                    <strong className="text-[11px] text-white font-bold">{veh.topSpeed}</strong>
                  </div>
                  <div className="bg-slate-950/60 p-1 rounded-lg border border-slate-800/50">
                    <span className="text-[9px] text-slate-400 block uppercase">Range</span>
                    <strong className="text-[11px] text-emerald-400 font-bold">{veh.range}</strong>
                  </div>
                  <div className="bg-slate-950/60 p-1 rounded-lg border border-slate-800/50">
                    <span className="text-[9px] text-slate-400 block uppercase">Seats</span>
                    <strong className="text-[11px] text-cyan-400 font-bold">{veh.seats}</strong>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(veh);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-sm'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <Radio size={13} className={isSelected ? 'text-cyan-400 animate-pulse' : ''} />
                    <span>{isSelected ? 'Active Fleet Selection' : 'Select Fleet Class'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBook(veh);
                    }}
                    className="w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 text-white shadow-md hover:shadow-cyan-500/25 hover:brightness-110 active:scale-98"
                  >
                    <span>Book This Fleet</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Vehicle In-Depth Specifications */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card border border-slate-800 bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-slate-900/90 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Vehicle Highlights & Badges */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-800 shadow-lg shrink-0">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList?.add('img-fallback'); }} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-black text-white">{current.name}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  {current.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {current.tagline}
              </p>
            </div>
          </div>

          {/* Quick Stat Indicators */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <BatteryCharging size={16} className="text-emerald-400" />
              <div>
                <span className="text-[9px] text-slate-400 uppercase block">Battery Pack</span>
                <strong className="text-white font-bold">{current.battery} • {current.range}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <Users size={16} className="text-cyan-400" />
              <div>
                <span className="text-[9px] text-slate-400 uppercase block">Capacity</span>
                <strong className="text-white font-bold">{current.seatsLabel}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <Award size={16} className="text-amber-400" />
              <div>
                <span className="text-[9px] text-slate-400 uppercase block">Base Fare</span>
                <strong className="text-emerald-400 font-bold">₹{current.baseFare.toFixed(2)} + ₹{current.perKm.toFixed(2)}/km</strong>
              </div>
            </div>

            <button
              onClick={() => handleBook(current)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/25 flex items-center gap-1.5"
            >
              <span>Instant Dispatch {current.name.split(' ')[0]}</span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>

        {/* Feature List Bullets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
          {current.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Photorealistic 8K Lightbox Inspection Modal */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold">
                    Photorealistic 8K Production Asset
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  {lightboxImage.name} • {lightboxImage.edition}
                </h3>
              </div>

              <button
                onClick={() => setLightboxImage(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Full-Res Render */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 max-h-[520px] bg-black flex items-center justify-center">
              <img
                src={lightboxImage.image}
                alt={lightboxImage.name}
                className="w-full h-full object-contain max-h-[520px]" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList?.add('img-fallback'); }} />
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
                8K Photorealistic Render • 60 FPS Engine
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-300 max-w-md">
                {lightboxImage.tagline}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleSelect(lightboxImage);
                    setLightboxImage(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Select This Fleet
                </button>
                <button
                  onClick={() => {
                    handleBook(lightboxImage);
                    setLightboxImage(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs hover:scale-105 transition-transform"
                >
                  Book This Ride
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

