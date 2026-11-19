import React, { useState } from 'react';
import { 
  Car, Users, DollarSign, Box, Compass, AlertTriangle, 
  ShieldCheck, ArrowRight, Sparkles, MapPin, Zap, CheckCircle2, Bike,
  Navigation, Shield, Check, Clock, Radio, ChevronRight, Layers, 
  Image as ImageIcon, Plane, Smartphone, QrCode, Briefcase, Award,
  Calendar, Package, HeartHandshake, Eye
} from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';
import yatraGoLogo from '../logo/yatrago-logo.png';
import Interactive3DRideScene from '../components/Interactive3DRideScene';
import HeroImageSlider from '../components/HeroImageSlider';
import VehicleFleetShowcase, { VEHICLE_FLEET_DATA } from '../components/VehicleFleetShowcase';
import YatraGoRideRequestCard from '../components/YatraGoRideRequestCard';
import YatraGoReserveSection from '../components/YatraGoReserveSection';
import YatraGoAirportIntercityHub from '../components/YatraGoAirportIntercityHub';
import YatraGoFaqSection from '../components/YatraGoFaqSection';

export default function HomePage({ onNavigate, user }) {
  const [heroDisplayMode, setHeroDisplayMode] = useState('slider'); // 'slider' or '3d'
  const [selectedVehicleId, setSelectedVehicleId] = useState('superbike');
  const [quickPickup, setQuickPickup] = useState('Innovation Tech Park, SF');
  const [quickDropoff, setQuickDropoff] = useState('Downtown Cyber Hub');

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
      <section className="relative">
        
        {/* Background Ambient Glow */}
        <div className="absolute -top-12 -left-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
          
          {/* Left Column (5 Cols): YatraGo Request a Ride Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <YatraGoRideRequestCard
              initialPickup={quickPickup}
              initialDropoff={quickDropoff}
              onBookRide={handleInstantBook}
            />
          </div>

          {/* Right Column (7 Cols): Hero Transition Showcase / 3D Simulator */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            
            {/* View Mode Switcher Header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
                <button
                  onClick={() => setHeroDisplayMode('slider')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    heroDisplayMode === 'slider'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>Scenic Routes</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                </button>

                <button
                  onClick={() => setHeroDisplayMode('3d')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    heroDisplayMode === '3d'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box size={14} />
                  <span>3D Route Preview</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="hidden sm:inline">{heroDisplayMode === 'slider' ? 'Featured Destinations' : 'Interactive 3D Engine'}</span>
              </div>
            </div>

            {/* Media Container */}
            <div className="flex-1 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              {heroDisplayMode === 'slider' ? (
                <HeroImageSlider
                  onBookRideWithRoute={(info) => {
                    if (info?.waypoint) setQuickPickup(info.waypoint);
                    handleInstantBook(info);
                  }}
                />
              ) : (
                <Interactive3DRideScene 
                  activeVehicleType={selectedVehicleId === 'superbike' || selectedVehicleId === 'aeroscooter' ? 'bike' : 'car'}
                  onBookRideWithRoute={() => handleInstantBook()}
                />
              )}
            </div>

          </div>

        </div>

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
            Explore What You Can Do with YatraGo
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Smart urban transit solutions engineered for individuals, friends, and corporate teams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Daily Ride */}
          <div
            onClick={() => onNavigate('book')}
            className="p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
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
            className="p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-emerald-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
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
            className="p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-amber-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
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
            className="p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
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
            className="p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-blue-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
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
            className="p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-violet-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
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
      <section className="rounded-3xl p-6 sm:p-8 bg-slate-900/80 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-xl">
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Enterprise Transit</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Looking for Business Solutions?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Get information about how companies leverage YatraGo for Business: automated expense management, courtesy rides for clients, employee daily commuting, and express courier logistics.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400 shrink-0" /><span>Business Travel</span></div>
            <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400 shrink-0" /><span>Courtesy Rides</span></div>
            <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400 shrink-0" /><span>Meal Programs</span></div>
            <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400 shrink-0" /><span>Item Delivery</span></div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-2.5">
          <button
            onClick={() => onNavigate('cost-split')}
            className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Get Started with Business</span>
            <ArrowRight size={15} />
          </button>
          <span className="text-center text-[10px] text-slate-500 font-mono">
            Direct monthly GST invoicing & automated billing
          </span>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FREQUENTLY ASKED QUESTIONS ACCORDION                  */}
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

    </div>
  );
}
