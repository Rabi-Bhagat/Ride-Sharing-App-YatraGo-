import React, { useState } from 'react';
import { 
  Car, Navigation, CheckCircle2, ShieldCheck, Phone, 
  MapPin, Clock, IndianRupee, Key, AlertTriangle, ArrowRight, 
  TrendingUp, Award, Zap, ToggleLeft, ToggleRight, Check, X
} from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';

export default function DriverPortalPage() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [rideState, setRideState] = useState('idle'); // 'idle', 'incoming', 'accepted', 'arrived', 'riding', 'completed'
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);

  // Incoming ride request details
  const activeDispatch = {
    id: 'YT-8492',
    riderName: 'Alex Rivera',
    riderRating: 4.96,
    coRidersCount: 2,
    pickup: 'Innovation Tech Park, Gate 3',
    destination: 'Downtown Cyber Hub, Tower 2',
    distanceKm: 12.4,
    estimatedMinutes: 18,
    fare: 280,
    expectedOtp: '4892',
    vehicleRequested: 'Toyota Hyryder Hybrid'
  };

  // Driver metrics
  const driverStats = {
    name: user?.name || 'Rajesh Sharma',
    rating: 4.98,
    tripsToday: 7,
    todayEarnings: 1850,
    weeklyEarnings: 12400,
    acceptanceRate: '98%',
    vehicle: 'White Toyota Hyryder Hybrid (DL-01-AB-1234)'
  };

  const handleAcceptRide = () => {
    setRideState('accepted');
  };

  const handleDeclineRide = () => {
    setRideState('idle');
  };

  const handleArrivedAtPickup = () => {
    setRideState('arrived');
  };

  const handleVerifyOtpAndStart = (e) => {
    e.preventDefault();
    if (enteredOtp.trim() === activeDispatch.expectedOtp) {
      setOtpError(false);
      setRideState('riding');
    } else {
      setOtpError(true);
    }
  };

  const handleCompleteTrip = () => {
    setRideState('completed');
    setTimeout(() => {
      setRideState('idle');
      setEnteredOtp('');
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* ========================================================= */}
      {/* 1. DRIVER PARTNER HEADER & STATUS TOGGLE                  */}
      {/* ========================================================= */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Car size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Driver Partner Dashboard
            </h1>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>{isOnline ? 'Online & Ready for Rides' : 'Offline'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Welcome, <strong className="text-white">{driverStats.name}</strong>. Accept incoming ride requests, verify passenger boarding OTPs, follow turn-by-turn navigation, and view your daily payouts.
          </p>
        </div>

        {/* Online Shift Switch */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
            isOnline
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-emerald-500/10'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          {isOnline ? <ToggleRight size={22} className="text-emerald-400" /> : <ToggleLeft size={22} className="text-slate-500" />}
          <span>{isOnline ? 'Online' : 'Go Online'}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. DRIVER DAILY EARNINGS & TELEMETRY KPIS                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Today's Earnings</span>
            <IndianRupee size={14} className="text-emerald-400" />
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">₹{driverStats.todayEarnings}</div>
          <span className="text-[10px] text-slate-400">{driverStats.tripsToday} trips completed</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Weekly Payout</span>
            <TrendingUp size={14} className="text-cyan-400" />
          </span>
          <div className="text-2xl font-black text-white font-mono">₹{driverStats.weeklyEarnings}</div>
          <span className="text-[10px] text-cyan-300 font-bold">Direct Bank UPI Deposit</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Driver Rating</span>
            <Award size={14} className="text-amber-400" />
          </span>
          <div className="text-2xl font-black text-white font-mono">{driverStats.rating} ★</div>
          <span className="text-[10px] text-amber-300 font-bold">Top 1% Fleet Partner</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Assigned Vehicle</span>
            <Zap size={14} className="text-teal-400" />
          </span>
          <div className="text-xs font-bold text-white truncate">{driverStats.vehicle}</div>
          <span className="text-[10px] text-emerald-400 font-bold font-mono">Verified EV / Hybrid</span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. DISPATCH WORKSPACE & RIDE FLOW                          */}
      {/* ========================================================= */}
      {!isOnline ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Car size={32} />
          </div>
          <h2 className="text-lg font-black text-white">Shift Paused</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You are currently offline. Toggle your shift status above to begin receiving real-time passenger dispatches and airport corridors.
          </p>
          <button
            onClick={() => setIsOnline(true)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Start Shift & Go Online
          </button>
        </div>
      ) : rideState === 'idle' ? (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/30 text-center space-y-4 bg-gradient-to-b from-cyan-950/20 to-slate-900">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/30">
              <Navigation size={32} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Scanning Active Transit Corridors...</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Your location is broadcasting to nearby riders at Innovation Tech Park and Cyber Hub. You will receive an instant audio-visual ping when matched.
            </p>
          </div>
          
          <button
            onClick={() => setRideState('incoming')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400 text-xs font-bold text-cyan-300 transition-all cursor-pointer"
          >
            Simulate Incoming Ride Request ⚡
          </button>
        </div>
      ) : rideState === 'incoming' ? (
        /* INCOMING DISPATCH PING */
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-cyan-400 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 shadow-2xl animate-pulse space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
              <strong className="text-sm font-black text-white uppercase tracking-wider">New Ride Request Nearby!</strong>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded-full border border-cyan-500/40">
              Auto-declines in 25s
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Trip Specs */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={activeDispatch.riderName}
                  size="md"
                  className="ring-2 ring-cyan-400 rounded-2xl overflow-hidden shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-sm font-black text-white">{activeDispatch.riderName}</strong>
                    <VerificationBadge type="Government ID" size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{activeDispatch.riderRating} ★ • {activeDispatch.coRidersCount} Passengers (Pool)</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin size={14} className="text-cyan-400 shrink-0" />
                  <span className="truncate">Pickup: <strong className="text-white">{activeDispatch.pickup}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Navigation size={14} className="text-emerald-400 shrink-0" />
                  <span className="truncate">Drop: <strong className="text-white">{activeDispatch.destination}</strong></span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400 border-t border-slate-800">
                  <span>Distance: {activeDispatch.distanceKm} km</span>
                  <span>Est. Duration: {activeDispatch.estimatedMinutes} mins</span>
                </div>
              </div>
            </div>

            {/* Fare Payout & Actions */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-center">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Estimated Driver Payout</span>
                <span className="text-3xl font-black text-emerald-400 font-mono">₹{activeDispatch.fare}</span>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Includes 44% Pool shared fare credit</p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={handleDeclineRide}
                  className="py-3 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptRide}
                  className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check size={16} />
                  <span>Accept Ride</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE IN-TRANSIT WORKSPACE */
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <strong className="text-sm font-black text-white">
                {rideState === 'accepted' && 'En Route to Pickup Location'}
                {rideState === 'arrived' && 'Arrived at Pickup • Waiting for Passenger'}
                {rideState === 'riding' && 'Ride in Progress • Navigating to Destination'}
                {rideState === 'completed' && 'Trip Completed Successfully!'}
              </strong>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
              Trip #{activeDispatch.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Waypoints & Navigation Status */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Pickup Waypoint</span>
                    <strong className="text-xs text-white block">{activeDispatch.pickup}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
                    <Navigation size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Drop-off Destination</span>
                    <strong className="text-xs text-white block">{activeDispatch.destination}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Total Distance:</span>
                <span className="text-white font-bold">{activeDispatch.distanceKm} km (~18 min)</span>
              </div>
            </div>

            {/* Right: OTP Verification / Action Buttons */}
            <div className="space-y-4 flex flex-col justify-between">
              
              {rideState === 'accepted' && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-center">
                  <p className="text-xs text-slate-300">
                    Drive towards Gate 3. When you reach the passenger, tap below to notify them.
                  </p>
                  <button
                    onClick={handleArrivedAtPickup}
                    className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                  >
                    I Have Arrived at Pickup Point
                  </button>
                </div>
              )}

              {rideState === 'arrived' && (
                <form onSubmit={handleVerifyOtpAndStart} className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-4">
                  <div>
                    <strong className="text-sm font-black text-white block">Passenger Boarding OTP Verification</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ask rider Alex Rivera for their 4-digit boarding OTP displayed on their screen.
                    </p>
                  </div>

                  <div className="relative">
                    <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Enter 4-digit OTP (e.g. 4892)"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-center text-lg tracking-widest font-black text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {otpError && (
                    <span className="text-[11px] text-rose-400 block font-bold">
                      Incorrect OTP! Ask rider to verify their screen.
                    </span>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    Verify OTP & Start Ride
                  </button>
                </form>
              )}

              {rideState === 'riding' && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Speed: 64 km/h • GPS Highway Sync Active</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Heading towards Downtown Cyber Hub. Follow GPS turn-by-turn guidance.
                  </p>
                  <button
                    onClick={handleCompleteTrip}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                  >
                    Arrived at Destination • Complete Ride
                  </button>
                </div>
              )}

              {rideState === 'completed' && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500 space-y-2 text-center animate-fadeIn">
                  <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                  <strong className="text-base font-black text-white block">Trip Completed!</strong>
                  <p className="text-xs text-slate-300">₹{activeDispatch.fare} added to your daily wallet payout.</p>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
