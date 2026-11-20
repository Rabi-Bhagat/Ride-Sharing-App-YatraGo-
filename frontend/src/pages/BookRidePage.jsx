import React from 'react';
import RideBooking from '../components/RideBooking';
import LiveTransitTrack from '../components/LiveTransitTrack';
import { Car, Bike } from 'lucide-react';

// Lazy-load the map engine (Leaflet) so it never blocks the booking form.
const MapView = React.lazy(() => import('../components/MapView'));

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
  const isBike = activeRide?.vehicleCategory === 'bike' || 
    activeRide?.vehicleType?.toLowerCase().includes('bike') || 
    activeRide?.vehicleType?.toLowerCase().includes('moto');

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Clean & Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            {isBike ? <Bike className="text-cyan-400" /> : <Car className="text-cyan-400" />}
            <span>{isBike ? 'Book Your Bike Ride' : 'Book Your Car Ride'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBike 
              ? 'Fast motorcycle & superbike transit with verified helmet-wearing riders.'
              : 'Choose your pickup and destination on the map or select from presets.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Driver {activeRide?.driver?.name || 'Marcus V.'} ({activeRide?.driver?.vehicle || (isBike ? 'HyperBike 1200R' : 'Tesla Model Y')})</span>
          </div>
        </div>
      </div>

      {/* Live Real-Time Transit Track */}
      <LiveTransitTrack pickup={pickup} destination={selectedDestination} ride={activeRide} />

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
            activeRide={activeRide}
          />
        </div>

        {/* Right Column (7 cols): Interactive Google Map */}
        <div className="lg:col-span-7 h-[580px] lg:h-auto min-h-[500px]">
          <React.Suspense fallback={
            <div className="w-full h-full min-h-[400px] rounded-3xl border border-slate-800 bg-slate-900/60 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
              <span className="text-xs font-mono text-slate-400">Loading map…</span>
            </div>
          }>
            <MapView
              pickup={pickup}
              destination={selectedDestination}
              onSelectPickup={setPickup}
              onSelectDestination={setSelectedDestination}
              ride={activeRide}
              isStrangerCombined={activeRide?.isStrangerCombined}
              interactive={true}
            />
          </React.Suspense>
        </div>

      </div>

    </div>
  );
}
