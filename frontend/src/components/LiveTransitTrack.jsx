import React, { useEffect, useRef, useState } from 'react';
import { Bike, Car, Clock, Gauge, MapPin, Navigation, Radio } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const haversineKm = (a, b) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

const projectOntoRoute = (pickup, destination, lat, lng) => {
  const dLat = destination.lat - pickup.lat;
  const dLng = destination.lng - pickup.lng;
  const lengthSq = dLat * dLat + dLng * dLng;
  if (!lengthSq) return null;
  const ratio = ((lat - pickup.lat) * dLat + (lng - pickup.lng) * dLng) / lengthSq;
  return clamp01(ratio);
};

const formatMinutes = (minutes) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  if (minutes < 1) return '<1 min';
  return `${Math.round(minutes)} min`;
};

export default function LiveTransitTrack({ pickup, destination, ride }) {
  const { socket } = useSocket() || {};

  const isBike =
    ride?.vehicleCategory === 'bike' ||
    ride?.vehicleType?.toLowerCase().includes('bike') ||
    ride?.vehicleType?.toLowerCase().includes('moto');

  const hasRoute =
    Number.isFinite(pickup?.lat) &&
    Number.isFinite(pickup?.lng) &&
    Number.isFinite(destination?.lat) &&
    Number.isFinite(destination?.lng);

  const distanceKm = Number(ride?.distanceKm) || 0;
  const etaMinutes = Number(ride?.etaMinutes) || 20;

  const [progress, setProgress] = useState(0);
  const [speedKph, setSpeedKph] = useState(() =>
    distanceKm > 0 && etaMinutes > 0 ? Math.round((distanceKm / etaMinutes) * 60) : 0
  );
  const [lastFixAt, setLastFixAt] = useState(0);
  const [clock, setClock] = useState(Date.now());

  const previousFixRef = useRef(null);
  const lastFixAtRef = useRef(0);

  useEffect(() => {
    setProgress(0);
    previousFixRef.current = null;
    lastFixAtRef.current = 0;
    setLastFixAt(0);
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng]);

  useEffect(() => {
    if (!socket) return;

    const handleDriverLocation = ({ lat, lng, timestamp } = {}) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const now = Number(timestamp) || Date.now();
      const previous = previousFixRef.current;

      if (previous && now > previous.at) {
        const elapsedHours = (now - previous.at) / 3600000;
        if (elapsedHours > 0) {
          const kph = haversineKm(previous, { lat, lng }) / elapsedHours;
          if (kph >= 2 && kph <= 160) setSpeedKph(Math.round(kph));
        }
      }

      previousFixRef.current = { lat, lng, at: now };
      lastFixAtRef.current = now;
      setLastFixAt(now);

      if (hasRoute) {
        const ratio = projectOntoRoute(pickup, destination, lat, lng);
        if (ratio != null) setProgress(ratio);
      }
    };

    socket.on('driver_location_update', handleDriverLocation);
    return () => socket.off('driver_location_update', handleDriverLocation);
  }, [socket, hasRoute, pickup?.lat, pickup?.lng, destination?.lat, destination?.lng]);

  useEffect(() => {
    if (!hasRoute) return;

    const totalMs = Math.max(60000, etaMinutes * 60000);
    const stepMs = 1000;

    const timer = setInterval(() => {
      const now = Date.now();
      setClock(now);

      const hasFreshFix = now - lastFixAtRef.current < 8000;
      if (hasFreshFix) return;

      setProgress((current) => clamp01(current + stepMs / totalMs));
    }, stepMs);

    return () => clearInterval(timer);
  }, [hasRoute, etaMinutes]);

  const isLive = hasRoute && clock - lastFixAt < 8000;
  const remainingKm = Math.max(0, distanceKm * (1 - progress));
  const remainingMinutes = etaMinutes * (1 - progress);
  const arrivalLabel = formatMinutes(remainingMinutes);
  const positionPercent = 8 + progress * 84;

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel border border-cyan-500/30 p-4 sm:p-5 space-y-3.5">
      <div className="pointer-events-none absolute -top-20 right-12 h-40 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-72 rounded-full bg-emerald-500/10 blur-3xl"></div>

      {/* Route endpoints */}
      <div className="relative z-10 flex items-center justify-between gap-3 text-xs">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60 animate-ping"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400"></span>
          </span>
          <span className="shrink-0 font-bold text-slate-400">From</span>
          <span className="truncate font-mono font-bold text-cyan-300 max-w-[120px] sm:max-w-[240px]">
            {pickup?.name || 'Select pickup'}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-mono font-bold text-emerald-300 max-w-[120px] sm:max-w-[240px]">
            {destination?.name || 'Select destination'}
          </span>
          <span className="shrink-0 font-bold text-slate-400">To</span>
          <MapPin size={14} className="shrink-0 text-emerald-400" />
        </div>
      </div>

      {/* Live track */}
      <div className="relative h-14 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/90 shadow-inner">
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 sm:inset-x-8">
          {/* Dashed idle lane — count scales down so it never overflows */}
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between gap-1 opacity-40 sm:gap-2">
            {[...Array(12)].map((_, index) => (
              <span key={`sm-${index}`} className="h-1 w-2 shrink rounded-full bg-yellow-400/80 sm:hidden"></span>
            ))}
            {[...Array(28)].map((_, index) => (
              <span key={`lg-${index}`} className="hidden h-1 w-3 shrink-0 rounded-full bg-yellow-400/80 sm:block"></span>
            ))}
          </div>

          {/* Travelled gradient */}
          <div
            className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 shadow-[0_0_14px_rgba(6,182,212,0.55)] transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          ></div>

          {/* Origin node */}
          <span className="absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-cyan-400 bg-slate-950"></span>
          {/* Destination node */}
          <span className="absolute -right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-emerald-400 bg-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.6)]"></span>

          {/* Vehicle */}
          <div
            className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-1000 ease-linear will-change-[left]"
            style={{ left: `${positionPercent}%` }}
          >
            <div
              className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 px-2.5 py-1 font-extrabold text-[10px] text-slate-950 shadow-lg shadow-cyan-500/30 ring-2 ring-slate-950/60 ${
                isLive ? '' : 'opacity-90'
              }`}
            >
              {isBike ? <Bike size={13} /> : <Car size={13} />}
              <span className="hidden sm:inline">{ride?.driver?.name?.split(' ')[0] || 'Driver'}</span>
              <span className="font-mono">{speedKph > 0 ? `${speedKph} km/h` : '--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-bold ${
              isLive
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
            }`}
          >
            <Radio size={10} className={isLive ? 'animate-pulse' : ''} />
            {isLive ? 'Live GPS' : hasRoute ? 'Simulating' : 'Awaiting route'}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/70 px-2 py-0.5 text-slate-300">
            <Gauge size={10} className="text-cyan-400" />
            {speedKph > 0 ? `${speedKph} km/h` : '--'}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/70 px-2 py-0.5 text-slate-300">
            <Navigation size={10} className="text-emerald-400" />
            {remainingKm > 0 ? `${remainingKm.toFixed(1)} km left` : '--'}
          </span>
        </div>

        <span className="flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/70 px-2 py-0.5 font-bold text-emerald-300">
          <Clock size={10} />
          {hasRoute ? (arrivalLabel ? `Arriving in ${arrivalLabel}` : 'Arriving') : 'No route selected'}
        </span>
      </div>
    </div>
  );
}
