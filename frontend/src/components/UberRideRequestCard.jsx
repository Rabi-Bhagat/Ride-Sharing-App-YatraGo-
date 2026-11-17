import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, Users, Clock, Calendar, MapPin, Navigation, ArrowRight, 
  Sparkles, ShieldCheck, LocateFixed, Check, Bike, Package, 
  ChevronDown, Search, X, DollarSign, Award, Info, Zap
} from 'lucide-react';

const POPULAR_PRESETS = [
  { name: 'Downtown Cyber Hub', distance: '8.4 km', distKm: 8.4, type: 'hub' },
  { name: 'Delhi Airport (DEL)', distance: '16.2 km', distKm: 16.2, type: 'airport' },
  { name: 'Metro Airport Skyway', distance: '19.5 km', distKm: 19.5, type: 'airport' },
  { name: 'Oceanfront Bay Pier', distance: '12.1 km', distKm: 12.1, type: 'attraction' },
  { name: 'Tech Park Central', distance: '6.8 km', distKm: 6.8, type: 'office' },
  { name: 'Mumbai Airport (BOM)', distance: '22.0 km', distKm: 22.0, type: 'airport' }
];

export default function UberRideRequestCard({ 
  onBookRide, 
  initialPickup = 'Innovation Tech Park, SF',
  initialDropoff = 'Downtown Cyber Hub',
  onSelectRoute
}) {
  const [activeService, setActiveService] = useState('ride'); // 'ride', 'pool', 'reserve', 'courier', 'moto'
  const [pickup, setPickup] = useState(initialPickup);
  const [dropoff, setDropoff] = useState(initialDropoff);
  const [pickupTimeMode, setPickupTimeMode] = useState('now'); // 'now' or 'later'
  const [timingDropdownOpen, setTimingDropdownOpen] = useState(false);
  const timingRef = useRef(null);
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  // Quick date presets in ISO format YYYY-MM-DD
  const todayObj = new Date();
  const todayISO = todayObj.toISOString().split('T')[0];

  const tmrwObj = new Date();
  tmrwObj.setDate(tmrwObj.getDate() + 1);
  const tmrwISO = tmrwObj.toISOString().split('T')[0];

  const dayAfterObj = new Date();
  dayAfterObj.setDate(dayAfterObj.getDate() + 2);
  const dayAfterISO = dayAfterObj.toISOString().split('T')[0];

  const satObj = new Date();
  const satDiff = (6 - satObj.getDay() + 7) % 7 || 7;
  satObj.setDate(satObj.getDate() + satDiff);
  const satISO = satObj.toISOString().split('T')[0];

  const [reserveDate, setReserveDate] = useState(tmrwISO);
  const [reserveTime, setReserveTime] = useState('09:30');
  const [locating, setLocating] = useState(false);
  const [selectedVehicleTier, setSelectedVehicleTier] = useState('go'); // 'moto', 'auto', 'go', 'xl'

  // Format date nicely for display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Close timing dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (timingRef.current && !timingRef.current.contains(e.target)) {
        setTimingDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Distance calculation based on destination
  const activeDest = POPULAR_PRESETS.find(p => p.name === dropoff) || { distKm: 9.5, distance: '9.5 km' };
  const dist = activeDest.distKm;

  // Tier base pricing (Indian Rupee ₹)
  const TIER_PRICING = {
    moto: { name: 'YatraGo Moto', eta: '2 mins away', base: 25.00, perKm: 9.00, capacity: 1, icon: Bike, desc: 'Affordable, fast motorcycle rides' },
    auto: { name: 'YatraGo Auto', eta: '3 mins away', base: 35.00, perKm: 11.00, capacity: 3, icon: Car, desc: 'Zero-congestion city transit' },
    go: { name: 'YatraGo Premier', eta: '4 mins away', base: 60.00, perKm: 16.50, capacity: 4, icon: Car, desc: 'Comfortable, top-rated electric sedans' },
    xl: { name: 'YatraGo XL Pool', eta: '6 mins away', base: 100.00, perKm: 21.00, capacity: 6, icon: Users, desc: 'Spacious SUVs with extra legroom & luggage' }
  };

  const currentTier = TIER_PRICING[selectedVehicleTier] || TIER_PRICING.go;
  const standardCost = (currentTier.base + dist * currentTier.perKm);
  const poolCost = (standardCost * 0.56); // 44% savings with stranger pooling
  const displayCost = activeService === 'pool' ? poolCost.toFixed(2) : standardCost.toFixed(2);

  // Auto locate user
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          if (data && data.display_name) {
            const shortName = data.display_name.split(',').slice(0, 3).join(', ').trim();
            setPickup(shortName);
          }
        } catch (e) {
          setPickup('Current GPS Location');
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { timeout: 7000 }
    );
  };

  const handleConfirmRequest = () => {
    if (onBookRide) {
      onBookRide({
        pickup,
        dropoff,
        service: activeService,
        tier: selectedVehicleTier,
        fare: displayCost,
        reserveDate: pickupTimeMode === 'later' ? reserveDate : null,
        reserveTime: pickupTimeMode === 'later' ? reserveTime : null
      });
    }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-2xl flex flex-col justify-between space-y-5 text-white">
      
      {/* 1. UBER-STYLE SERVICE MODE TABS */}
      <div className="flex items-center gap-1 p-1 bg-slate-950/90 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveService('ride')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeService === 'ride'
              ? 'bg-white text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Car size={15} />
          <span>Ride</span>
        </button>

        <button
          onClick={() => setActiveService('pool')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeService === 'pool'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users size={15} />
          <span>Pool</span>
          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded-full font-mono font-black">
            -44%
          </span>
        </button>

        <button
          onClick={() => {
            setActiveService('reserve');
            setPickupTimeMode('later');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeService === 'reserve'
              ? 'bg-white text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar size={15} />
          <span>Reserve</span>
        </button>

        <button
          onClick={() => {
            setActiveService('moto');
            setSelectedVehicleTier('moto');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeService === 'moto'
              ? 'bg-cyan-400 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bike size={15} />
          <span>Moto</span>
        </button>
      </div>

      {/* 2. HEADING & TIMING SELECTOR */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {activeService === 'reserve' ? 'Plan your ride' : 'Request a ride'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Doorstep pickup and dropoff with verified drivers
          </p>
        </div>

        {/* Pickup Timing Selector Pill with Dropdown */}
        <div ref={timingRef} className="relative">
          <button
            onClick={() => setTimingDropdownOpen(!timingDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <Clock size={13} className="text-cyan-400" />
            <span>{pickupTimeMode === 'now' ? 'Pickup now' : 'Schedule later'}</span>
            <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${timingDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Timing Mode Dropdown Popover */}
          {timingDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-40 animate-fadeIn space-y-1">
              <button
                onClick={() => {
                  setPickupTimeMode('now');
                  setTimingDropdownOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  pickupTimeMode === 'now' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-cyan-400" />
                  <div>
                    <strong className="block text-white text-xs">Pickup now</strong>
                    <span className="text-[10px] text-slate-400 font-normal">Drivers 2-4 mins away</span>
                  </div>
                </div>
                {pickupTimeMode === 'now' && <Check size={14} className="text-cyan-400" />}
              </button>

              <button
                onClick={() => {
                  setPickupTimeMode('later');
                  setTimingDropdownOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  pickupTimeMode === 'later' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-cyan-400" />
                  <div>
                    <strong className="block text-white text-xs">Schedule later</strong>
                    <span className="text-[10px] text-slate-400 font-normal">Choose date & time</span>
                  </div>
                </div>
                {pickupTimeMode === 'later' && <Check size={14} className="text-cyan-400" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Schedule Date & Time Picker Bar */}
      {pickupTimeMode === 'later' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 space-y-3 animate-slideDown shadow-xl shadow-cyan-500/10">
          
          {/* Header & Guaranteed Cancellation Notice */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <Calendar size={13} className="text-cyan-400" />
              <span>RESERVE RIDE SCHEDULE</span>
            </span>
            <span className="text-[10px] text-cyan-300 font-mono font-bold bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
              Free Cancellation 60m Prior
            </span>
          </div>

          {/* Primary Date & Time Selector Interactive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* Clickable Date Card with Native Picker Integration */}
            <div 
              onClick={() => {
                try {
                  dateInputRef.current?.showPicker();
                } catch (e) {
                  dateInputRef.current?.focus();
                }
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 focus-within:border-cyan-400 cursor-pointer transition-all group flex items-center gap-2.5 shadow-sm"
            >
              <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform shrink-0">
                <Calendar size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">
                  Select Date (Click Calendar)
                </span>
                <input
                  ref={dateInputRef}
                  type="date"
                  min={todayISO}
                  value={reserveDate}
                  onChange={(e) => setReserveDate(e.target.value)}
                  className="w-full bg-transparent text-white font-black text-xs sm:text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Clickable Time Card with Native Picker Integration */}
            <div 
              onClick={() => {
                try {
                  timeInputRef.current?.showPicker();
                } catch (e) {
                  timeInputRef.current?.focus();
                }
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-400 focus-within:border-emerald-400 cursor-pointer transition-all group flex items-center gap-2.5 shadow-sm"
            >
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
                <Clock size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">
                  Pickup Time (Click Clock)
                </span>
                <input
                  ref={timeInputRef}
                  type="time"
                  value={reserveTime}
                  onChange={(e) => setReserveTime(e.target.value)}
                  className="w-full bg-transparent text-white font-black text-xs sm:text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>

          </div>

          {/* 1-Click Quick Date Presets */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Quick Date Options:</span>
              <strong className="text-cyan-300 font-bold">{formatDateDisplay(reserveDate)}</strong>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {[
                { label: 'Today', date: todayISO },
                { label: 'Tomorrow', date: tmrwISO },
                { label: 'Day After', date: dayAfterISO },
                { label: 'Saturday', date: satISO }
              ].map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => setReserveDate(pill.date)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all shrink-0 border cursor-pointer ${
                    reserveDate === pill.date
                      ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 ring-1 ring-cyan-400/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker();
                  } catch (e) {
                    dateInputRef.current?.focus();
                  }
                }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Calendar size={11} />
                <span>Open Calendar 📅</span>
              </button>
            </div>
          </div>

          {/* 1-Click Quick Time Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] text-slate-400 font-mono shrink-0">Popular Hours:</span>
            {[
              { label: '08:00 AM', time: '08:00' },
              { label: '09:30 AM', time: '09:30' },
              { label: '01:00 PM', time: '13:00' },
              { label: '05:30 PM', time: '17:30' },
              { label: '08:00 PM', time: '20:00' }
            ].map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setReserveTime(t.time)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition-all shrink-0 border cursor-pointer ${
                  reserveTime === t.time
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400 ring-1 ring-emerald-400/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* 3. UBER'S ICONIC CONNECTED LOCATION INPUTS */}
      <div className="relative space-y-2">
        
        {/* Connecting Vertical Track Line */}
        <div className="absolute left-[19px] top-[26px] bottom-[26px] w-[2px] bg-slate-750 flex flex-col items-center justify-between pointer-events-none z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
        </div>

        {/* Pickup Input */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 focus-within:border-cyan-400 transition-all relative z-20">
          {/* Black circle icon */}
          <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
          </div>

          <div className="flex-1 min-w-0">
            <label className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              Pickup location
            </label>
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Enter pickup address"
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-white focus:outline-none truncate"
            />
          </div>

          {/* Locate Me GPS Button */}
          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 text-xs transition-all shrink-0"
            title="Use current GPS location"
          >
            <LocateFixed size={15} className={locating ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Dropoff Input */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 focus-within:border-emerald-400 transition-all relative z-20">
          {/* Black square icon */}
          <div className="w-4 h-4 bg-emerald-400 rounded-sm flex items-center justify-center shrink-0">
            <div className="w-1.5 h-1.5 bg-slate-950 rounded-xs"></div>
          </div>

          <div className="flex-1 min-w-0">
            <label className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              Where to? (Destination)
            </label>
            <select
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer truncate"
            >
              {POPULAR_PRESETS.map((p) => (
                <option key={p.name} value={p.name} className="bg-slate-900 text-white">
                  {p.name} ({p.distance})
                </option>
              ))}
            </select>
          </div>

          <MapPin size={16} className="text-emerald-400 shrink-0" />
        </div>

      </div>

      {/* 4. POPULAR CORRIDORS QUICK CHIPS */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
          Frequent destinations:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {POPULAR_PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset.name}
              onClick={() => setDropoff(preset.name)}
              className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 ${
                dropoff === preset.name
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                  : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>{preset.type === 'airport' ? '✈️' : '📍'}</span>
              <span className="truncate max-w-[120px]">{preset.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. UBER VEHICLE TIER SELECTOR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
            Select Ride Tier:
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">
            {activeService === 'pool' ? '44% Discount Active' : 'Transparent Upfront Pricing'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(TIER_PRICING).map(([key, t]) => {
            const isSelected = selectedVehicleTier === key;
            const Icon = t.icon;
            const cost = activeService === 'pool' ? (t.base + dist * t.perKm) * 0.56 : (t.base + dist * t.perKm);

            return (
              <div
                key={key}
                onClick={() => setSelectedVehicleTier(key)}
                className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                      <Icon size={14} />
                    </div>
                    <div>
                      <strong className="text-xs font-black text-white block leading-tight">{t.name.split(' ')[1] || t.name}</strong>
                      <span className="text-[10px] text-slate-400 font-mono block">{t.eta}</span>
                    </div>
                  </div>
                  <strong className="text-sm font-black text-white font-mono shrink-0">₹{cost.toFixed(2)}</strong>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2 pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Users size={10} /> {t.capacity} {t.capacity === 1 ? 'seat' : 'seats'}
                  </span>
                  {activeService === 'pool' && (
                    <span className="text-emerald-400 font-bold">Pool Save</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. PROMO CODE / POOL CALLOUT */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-400 shrink-0" />
          <div>
            <strong className="text-white text-xs block font-bold">First ride discount applied</strong>
            <span className="text-[10px] text-slate-400 font-mono">Valid on Cab, Auto, or Moto • Max savings</span>
          </div>
        </div>
        <span className="text-emerald-400 font-mono font-black text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
          PROMO ₹100 OFF
        </span>
      </div>

      {/* 7. PRIMARY ACTION CTA BUTTON (UBER-STYLE FULL WIDTH) */}
      <button
        onClick={handleConfirmRequest}
        className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm sm:text-base transition-all duration-200 shadow-xl shadow-white/10 hover:shadow-white/20 active:scale-[0.99] flex items-center justify-between group cursor-pointer"
      >
        <span className="text-slate-950 font-black tracking-tight">
          {activeService === 'reserve' || pickupTimeMode === 'later'
            ? `Reserve for ${formatDateDisplay(reserveDate)} • ${reserveTime}`
            : `Request ${currentTier.name}`}
        </span>
        
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-black text-slate-950">₹{displayCost}</span>
          <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRight size={15} />
          </div>
        </div>
      </button>

    </div>
  );
}

