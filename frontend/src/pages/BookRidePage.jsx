import React from 'react';
import RideBooking from '../components/RideBooking';
import MapView from '../components/MapView';
import { Car, Navigation, MapPin } from 'lucide-react';

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
