import React from 'react';
import RideBooking from '../components/RideBooking';
import MapView from '../components/MapView';
import { Car, Navigation, MapPin, Bike, Sparkles } from 'lucide-react';

export default function BookRidePage({ 
  onBookRide, 
  pickup,
  setPickup,
  selectedDestination, 
  setSelectedDestination, 
  selectedGuider, 
  onOpen3DPreview,
  activeRide
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Clean & Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Car className="text-cyan-400" />
            <span>Book Your Ride</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose your pickup and destination on the Google Map or select from presets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Driver Marcus V. (Tesla Model Y)</span>
          </div>
        </div>
      </div>

      {/* Live Animated Ride Progress Track Banner */}
      <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-slate-300 font-bold">Transit Route:</span>
            <span className="text-cyan-300 font-mono truncate max-w-[140px] sm:max-w-[240px]">
              {pickup?.name || 'Innovation Tech Park, SF'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
            <span className="truncate max-w-[140px] sm:max-w-[240px]">
              {selectedDestination?.name || 'Downtown Cyber Hub'}
            </span>
            <MapPin size={14} className="shrink-0" />
          </div>
        </div>

        {/* Animated Moving Ride on Road */}
        <div className="relative h-10 w-full rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center px-3 shadow-inner">
          <div className="absolute inset-x-0 h-0.5 top-1/2 -translate-y-1/2 flex justify-between gap-2 overflow-hidden opacity-40">
            {[...Array(24)].map((_, i) => (
              <span key={i} className="w-6 h-0.5 bg-yellow-400 rounded-full shrink-0"></span>
            ))}
          </div>

          {/* Animated Moving Bike / Car with light trail */}
          <div className="flex items-center gap-2 z-10 px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-extrabold text-[11px] shadow-lg shadow-cyan-500/20">
            <Bike size={15} />
            <span>Active Ride Simulation • Marcus V. Moving (68 km/h)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Booking Panel + Interactive Google Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (5 cols): Ride Booking Form */}
        <div className="lg:col-span-5">
          <RideBooking
            onBookRide={onBookRide}
            pickup={pickup}
            setPickup={setPickup}
            selectedDestination={selectedDestination}
            setSelectedDestination={setSelectedDestination}
            selectedGuider={selectedGuider}
            onOpen3DPreview={onOpen3DPreview}
          />
        </div>

        {/* Right Column (7 cols): Interactive Google Map */}
        <div className="lg:col-span-7 h-[580px] lg:h-auto min-h-[500px]">
          <MapView
            pickup={pickup}
            destination={selectedDestination}
            onSelectPickup={setPickup}
            onSelectDestination={setSelectedDestination}
            ride={activeRide}
            isStrangerCombined={activeRide?.isStrangerCombined}
            interactive={true}
          />
        </div>

      </div>

    </div>
  );
}
