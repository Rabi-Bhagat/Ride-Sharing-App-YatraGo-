import React, { useCallback, useState } from 'react';
import { Car, Users, Box, Compass, ShieldCheck, ArrowRight, Sparkles, Zap, Bike, Navigation, Plane, Smartphone, QrCode, Briefcase, Calendar, Package, HeartHandshake, Eye, Utensils } from 'lucide-react';


import ScenicRoutesGallery from '../components/ScenicRoutesGallery';
import VehicleFleetShowcase from '../components/VehicleFleetShowcase';
import YatraGoRideRequestCard from '../components/YatraGoRideRequestCard';
import YatraGoReserveSection from '../components/YatraGoReserveSection';
import YatraGoAirportIntercityHub from '../components/YatraGoAirportIntercityHub';
import YatraGoFaqSection from '../components/YatraGoFaqSection';
import YatraGoFutureScope from '../components/YatraGoFutureScope';

// Heavy WebGL / map engines are code-split so they never block the initial page load.
const MapView = React.lazy(() => import('../components/MapView'));

export default function HomePage({ onNavigate, user }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState('superbike');
  const [quickPickup, setQuickPickup] = useState('');
  const [quickDropoff, setQuickDropoff] = useState('');
  const [previewRoute, setPreviewRoute] = useState({
    pickup: null,
    destination: null
  });

  // Keep the 3D map in lockstep with whatever is typed/selected in the ride card
  const handleRouteChange = useCallback((route) => {
    setPreviewRoute(() => ({
      pickup: Number.isFinite(route.pickup?.lat) && Number.isFinite(route.pickup?.lng)
        ? route.pickup
        : null,
      destination: Number.isFinite(route.destination?.lat) && Number.isFinite(route.destination?.lng)
        ? route.destination
        : null
    }));
  }, []);

  const handleInstantBook = (bookingInfo) => {
    const isBike = bookingInfo?.vehicleCategory === 'bike' || 
      bookingInfo?.service === 'moto' || 
      bookingInfo?.tier?.includes('moto') || 
      bookingInfo?.tier?.includes('bike');

    if (bookingInfo?.pickup) {
      setQuickPickup(typeof bookingInfo.pickup === 'string' ? bookingInfo.pickup : bookingInfo.pickup.name);
    }
    if (bookingInfo?.dropoff) {
      setQuickDropoff(typeof bookingInfo.dropoff === 'string' ? bookingInfo.dropoff : bookingInfo.dropoff.name);
    }
    if (isBike) {
      setSelectedVehicleId('superbike');
    } else {
      setSelectedVehicleId('ecosudan');
    }

    onNavigate('book', {
      pickup: bookingInfo?.pickup,
      destination: bookingInfo?.dropoff,
      distanceKm: bookingInfo?.distanceKm,
      tier: bookingInfo?.tier,
      vehicleType: bookingInfo?.vehicleType,
      vehicleCategory: isBike ? 'bike' : 'car',
      fare: bookingInfo?.fare
    });
  };

  return (
    <div className="space-y-12 animate-fadeIn text-slate-100">
      
      {/* ======================================================== */}
      {/* 1. YATRAGO HERO SPLIT: RIDE REQUEST CARD + HERO IMAGE SLIDER */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden">
        
        {/* Layer 1: engineering grid + animated ambient glows */}
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-70"></div>
        <div className="animate-hero-glow absolute -top-12 -left-12 w-80 h-80 sm:w-96 sm:h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="animate-hero-glow absolute top-1/2 -right-12 w-80 h-80 sm:w-96 sm:h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" style={{ animationDelay: '1.8s' }}></div>
        <div className="animate-spin-slow absolute top-10 right-1/3 w-24 h-24 rounded-full border border-dashed border-cyan-500/20 pointer-events-none hidden lg:block"></div>
        <div className="animate-float-slow absolute bottom-6 left-1/3 w-16 h-16 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur pointer-events-none hidden xl:block"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
          
          {/* Left Column (5 Cols): YatraGo Request a Ride Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <YatraGoRideRequestCard
              initialPickup={quickPickup}
              initialDropoff={quickDropoff}
              onBookRide={handleInstantBook}
              onRouteChange={handleRouteChange}
            />
          </div>

          {/* Right Column (7 Cols): 3D Route Preview Map */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            
            {/* Map Header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-black shadow-md">
                  <Box size={14} />
                  <span>3D Route Preview</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  {previewRoute.pickup && previewRoute.destination
                    ? 'Live route synced'
                    : 'Search a route to preview'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden sm:inline">Satellite · Tilt 45°</span>
              </div>
            </div>

            {/* Professional Framed Map */}
            <div className="relative flex-1 min-h-[320px] sm:min-h-[460px] lg:min-h-[520px] rounded-3xl overflow-hidden border border-slate-700/70 bg-slate-950 shadow-2xl ring-1 ring-cyan-500/10 transition-all duration-500 hover:ring-cyan-400/40 hover:shadow-cyan-500/20">
              {/* Inner bezel accent */}
              <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-inset ring-white/5 z-20"></div>
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-cyan-400/50 rounded-tl-md pointer-events-none z-20"></div>
              <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-cyan-400/50 rounded-tr-md pointer-events-none z-20"></div>
              <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-cyan-400/50 rounded-bl-md pointer-events-none z-20"></div>
              <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-cyan-400/50 rounded-br-md pointer-events-none z-20"></div>

              <div className="absolute inset-0">
                <React.Suspense fallback={
                  <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center gap-3 bg-slate-900/60">
                    <div className="w-10 h-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                    <span className="text-xs font-mono text-slate-400">Loading 3D route map…</span>
                  </div>
                }>
                  <MapView
                    threeD
                    interactive={false}
                    pickup={previewRoute.pickup}
                    destination={previewRoute.destination}
                  />
                </React.Suspense>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* Live network stat strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { value: '120K+', label: 'Verified riders', tint: 'text-cyan-300', ring: 'hover:border-cyan-400/50' },
          { value: '45+', label: 'Cities live', tint: 'text-emerald-300', ring: 'hover:border-emerald-400/50' },
          { value: '44%', label: 'Average pool savings', tint: 'text-amber-300', ring: 'hover:border-amber-400/50' },
          { value: '24/7', label: 'SOS safety cover', tint: 'text-rose-300', ring: 'hover:border-rose-400/50' }
        ].map((stat, index) => (
          <div
            key={stat.label}
            style={{ animationDelay: `${index * 70}ms` }}
            className={`animate-stagger-in rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-center backdrop-blur transition-all duration-300 hover:-translate-y-1 ${stat.ring}`}
          >
            <strong className={`block text-xl font-black tracking-tight sm:text-2xl ${stat.tint}`}>{stat.value}</strong>
            <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* ======================================================== */}
      {/* 1.1 SCENIC ROUTES GALLERY (SEPARATE, COMPACT SECTION)    */}
      {/* ======================================================== */}
      <section>
        <ScenicRoutesGallery
          onNavigate={onNavigate}
          onBookRideWithRoute={(info) => {
            if (info?.waypoint) setQuickPickup(info.waypoint);
            handleInstantBook(info);
          }}
        />
      </section>

      {/* ======================================================== */}
      {/* 2. EXPLORE WHAT YOU CAN DO WITH YATRAGO OFFERINGS        */}
      {/* ======================================================== */}
      <section className="space-y-4 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">YatraGo Offerings</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Explore What You Can Do with <span className="gradient-text">YatraGo</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Smart urban transit solutions engineered for individuals, friends, and corporate teams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Daily Ride */}
          <div
            onClick={() => onNavigate('book')}
            className="animate-stagger-in tilt-card card-shine p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Car size={24} />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                INSTANT PICKUP
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                <span>Ride</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Go anywhere with YatraGo. Request a ride, hop in, and reach your destination with top-rated drivers.
              </p>
            </div>
          </div>

          {/* Card 2: Stranger Pooling */}
          <div
            onClick={() => onNavigate('stranger')}
            className="animate-stagger-in tilt-card card-shine p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-emerald-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                SAVE UP TO 44%
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                <span>Stranger Pooling</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                AI route alignment pairs you with verified co-riders on identical highway routes to slash fare prices.
              </p>
            </div>
          </div>

          {/* Card 3: Reserve in Advance */}
          <div
            onClick={() => onNavigate('book')}
            className="animate-stagger-in tilt-card card-shine p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                UP TO 90 DAYS
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                <span>Reserve</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Reserve your ride in advance so you can relax on the day of your trip. Complimentary wait time included.
              </p>
            </div>
          </div>

          {/* Card 4: YatraGo Moto */}
          <div
            onClick={() => onNavigate('book')}
            className="animate-stagger-in tilt-card card-shine p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bike size={24} />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                BEAT THE TRAFFIC
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                <span>YatraGo Moto</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Affordable motorcycle rides that cut through city gridlock and get you to your destination swiftly.
              </p>
            </div>
          </div>

          {/* Card 5: Courier Services */}
          <div
            onClick={() => onNavigate('book')}
            className="animate-stagger-in tilt-card card-shine p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-blue-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package size={24} />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                SAME DAY PARCEL
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-blue-300 transition-colors flex items-center justify-between">
                <span>Courier & Package</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Send documents, food, gifts, or forgotten keys across town with real-time GPS courier tracking.
              </p>
            </div>
          </div>

          {/* Card 6: Local Guiders */}
          <div
            onClick={() => onNavigate('guiders')}
            className="animate-stagger-in tilt-card card-shine p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-violet-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass size={24} />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold">
                VERIFIED LOCAL EXPERTS
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-violet-300 transition-colors flex items-center justify-between">
                <span>Local Guiders</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Book certified local guides to join your ride share and tour historical landmarks and hidden city gems.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. YATRAGO RESERVE SHOWCASE (PLAN FOR LATER)             */}
      {/* ======================================================== */}
      <section>
        <YatraGoReserveSection
          onReserveClick={(details) => {
            if (details?.destination) setQuickDropoff(details.destination);
            onNavigate('book');
          }}
        />
      </section>

      {/* ======================================================== */}
      {/* 4. RIDE WITH FRIENDS SEAMLESSLY (GROUP RIDES BANNER)     */}
      {/* ======================================================== */}
      <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Co-Rider Social Mobility</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Ride with Friends Seamlessly
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Riding with friends just got easier: set up a group ride in the YatraGo app, invite your friends, and arrive at your destination together. Friends who ride together save together.
          </p>
        </div>

        <button
          onClick={() => onNavigate('cost-split')}
          className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Set Up Group Ride & Split</span>
          <ArrowRight size={16} />
        </button>
      </section>

      {/* ======================================================== */}
      {/* 5. PRODUCTION VEHICLE FLEET SHOWCASE                     */}
      {/* ======================================================== */}
      <section>
        <VehicleFleetShowcase
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={(veh) => setSelectedVehicleId(veh.id)}
          onBookVehicle={(veh) => {
            setSelectedVehicleId(veh.id);
            handleInstantBook();
          }}
        />
      </section>

      {/* ======================================================== */}
      {/* 6. AIRPORTS, HIGHWAYS & COURIER HUB (YATRAGO EXPANDED) */}
      {/* ======================================================== */}
      <section>
        <YatraGoAirportIntercityHub
          onSelectRoute={(route) => {
            if (route?.pickup) setQuickPickup(route.pickup);
            if (route?.dropoff) setQuickDropoff(route.dropoff);
            onNavigate('book');
          }}
        />
      </section>

      {/* ======================================================== */}
      {/* 7. YATRAGO FOR BUSINESS SOLUTIONS                       */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-72 rounded-full bg-emerald-500/10 blur-3xl"></div>

        <div className="relative z-10 grid grid-cols-1 items-center gap-8 md:grid-cols-12">
          <div className="space-y-3 md:col-span-8">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-cyan-400" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">Enterprise Transit</span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white sm:text-3xl">
              Looking for Business Solutions?
            </h3>
            <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              Automated expense management, courtesy rides for clients, employee daily commuting, and express courier
              logistics — all on one GST-ready billing account.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4">
              {[
                { icon: Plane, label: 'Business Travel', tile: 'bg-cyan-500/15 text-cyan-400' },
                { icon: HeartHandshake, label: 'Courtesy Rides', tile: 'bg-emerald-500/15 text-emerald-400' },
                { icon: Utensils, label: 'Meal Programs', tile: 'bg-amber-500/15 text-amber-400' },
                { icon: Package, label: 'Item Delivery', tile: 'bg-violet-500/15 text-violet-400' }
              ].map(({ icon: Icon, label, tile }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-2.5 py-2 transition-colors hover:border-slate-700"
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${tile}`}>
                    <Icon size={13} />
                  </span>
                  <span className="truncate font-mono text-[11px] font-bold text-slate-200">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 md:col-span-4">
            <button
              onClick={() => onNavigate('business')}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs font-black text-slate-950 shadow-md transition-all hover:bg-slate-100 hover:shadow-lg sm:text-sm"
            >
              <span>Get Started with Business</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate('business')}
              className="text-center font-mono text-[10px] text-slate-400 underline-offset-2 transition-colors hover:text-cyan-300 hover:underline"
            >
              Browse partner hotels, shops &amp; promo codes →
            </button>
            <span className="text-center font-mono text-[10px] text-slate-500">
              Direct monthly GST invoicing &amp; automated billing
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FUTURE SCOPE / ROADMAP                                */}
      {/* ======================================================== */}
      <YatraGoFutureScope />

      {/* ======================================================== */}
      {/* 9. FREQUENTLY ASKED QUESTIONS ACCORDION                  */}
      {/* ======================================================== */}
      <section>
        <YatraGoFaqSection />
      </section>

      {/* ======================================================== */}
      {/* 9. DO MORE IN THE APP (YATRAGO DOWNLOAD BLOCK)           */}
      {/* ======================================================== */}
      <section className="rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-2xl">
        <div className="md:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <Smartphone size={13} />
            <span>DO MORE IN THE APP</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Download the YatraGo App
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            Join the millions of riders who trust YatraGo for their everyday urban travel needs. Get doorstep pickup and dropoff to your chosen destination at the tap of a button.
          </p>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 inline-block text-xs text-emerald-400 font-mono font-bold">
            *First ride free. Valid within 14 days of signup. T&Cs apply.
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div className="w-24 h-24 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg">
            <QrCode size={80} className="text-slate-950" />
          </div>
          <div>
            <strong className="text-xs text-white block font-bold">Scan to download</strong>
            <span className="text-[10px] text-slate-400 font-mono">iOS & Android supported</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. IMMERSIVE 3D DRIVE SIMULATOR lives in Explore & 3D     */}
      {/*     (preview-3d → 3D Highway Simulator view mode)          */}
      {/* ======================================================== */}

    </div>
  );
}
