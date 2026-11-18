import React, { useState } from 'react';
import { 
  Compass, MapPin, Star, Award, CheckCircle2, Calendar, 
  Clock, IndianRupee, Users, ShieldCheck, ToggleLeft, ToggleRight, 
  Check, ArrowRight, MessageSquare, Globe, HeartHandshake
} from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';
import { useAuth } from '../context/AuthContext';

export default function GuidePortalPage({ onNavigate }) {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [hourlyRate, setHourlyRate] = useState(350);
  const [rateSaved, setRateSaved] = useState(false);

  // Guider stats & active tour bookings
  const guiderProfile = {
    name: user?.name || 'Aarav Kapoor',
    rating: 4.98,
    reviewsCount: 142,
    badge: 'Heritage & Architectural Specialist',
    city: 'Downtown Cyber Hub & Heritage Corridor',
    earningsThisMonth: 18450,
    languages: ['English', 'Hindi', 'Punjabi']
  };

  const [tourBookings, setTourBookings] = useState([
    {
      id: 'tb_201',
      touristName: 'Alex Rivera & Maya Sharma',
      tourTitle: 'Downtown Cyber Hub & Skyline 3D Sunset',
      date: 'Today, 05:30 PM',
      duration: '2 Hours',
      payout: 700,
      status: 'confirmed',
      preview3DId: 'downtown'
    },
    {
      id: 'tb_202',
      touristName: 'Rohan Mehra',
      tourTitle: 'Oceanfront Bay Pier & Coastal Photography',
      date: 'Tomorrow, 10:00 AM',
      duration: '3 Hours',
      payout: 1050,
      status: 'pending',
      preview3DId: 'ocean'
    }
  ]);

  const handleAcceptBooking = (id) => {
    setTourBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
  };

  const handleSaveRate = (e) => {
    e.preventDefault();
    setRateSaved(true);
    setTimeout(() => setRateSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 font-black shadow-lg shadow-purple-500/20">
              <Compass size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Local Guide Portal
            </h1>
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 font-mono font-bold border border-purple-500/30 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-purple-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>{isAvailable ? 'Accepting Tourist Bookings' : 'Bookings Paused'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Welcome, <strong className="text-white">{guiderProfile.name}</strong>. Assist tourists with local city culture, scenic routes, and customized 3D destination tours.
          </p>
        </div>

        {/* Availability Switch */}
        <button
          onClick={() => setIsAvailable(!isAvailable)}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
            isAvailable
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          {isAvailable ? <ToggleRight size={22} className="text-purple-400" /> : <ToggleLeft size={22} className="text-slate-500" />}
          <span>{isAvailable ? 'Available' : 'Unavailable'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Guider Rating</span>
            <Star size={14} className="text-amber-400" />
          </span>
          <div className="text-2xl font-black text-white font-mono">{guiderProfile.rating} ★</div>
          <span className="text-[10px] text-amber-300 font-bold">{guiderProfile.reviewsCount} verified reviews</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Monthly Guide Earnings</span>
            <IndianRupee size={14} className="text-emerald-400" />
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">₹{guiderProfile.earningsThisMonth}</div>
          <span className="text-[10px] text-slate-400">Paid via Escrow Wallet</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Current Hourly Rate</span>
            <Clock size={14} className="text-cyan-400" />
          </span>
          <div className="text-2xl font-black text-white font-mono">₹{hourlyRate}/hr</div>
          <span className="text-[10px] text-cyan-300 font-bold">Customizable below</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Identity Trust</span>
            <Award size={14} className="text-purple-400" />
          </span>
          <div className="text-xs font-bold text-white truncate">Government ID Verified</div>
          <span className="text-[10px] text-purple-300 font-bold font-mono">Visible Badge Issued</span>
        </div>
      </div>

      {/* Main Grid: Bookings + Rate Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Bookings Queue (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div>
            <h2 className="text-lg font-black text-white">Tourist Expedition Bookings</h2>
            <p className="text-xs text-slate-400">Riders who have reserved you to escort or guide their destination journey.</p>
          </div>

          <div className="space-y-3">
            {tourBookings.map(b => (
              <div
                key={b.id}
                className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-black text-white">{b.tourTitle}</strong>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                      b.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">Tourist: {b.touristName}</p>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-cyan-400" />
                      <span>{b.date}</span>
                    </span>
                    <span>•</span>
                    <span>Duration: {b.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Booking Fee</span>
                    <strong className="text-lg font-mono font-black text-emerald-400">₹{b.payout}</strong>
                  </div>

                  {b.status === 'pending' ? (
                    <button
                      onClick={() => handleAcceptBooking(b.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                      Accept Tour
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate && onNavigate('chat')}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      <span>Open Chat</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rate Settings & Profile (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <form onSubmit={handleSaveRate} className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <div>
              <strong className="text-sm font-black text-white block">Hourly Guide Rate</strong>
              <p className="text-xs text-slate-400 mt-0.5">Set the fee charged per hour to tourists and co-riders.</p>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono font-black text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            {rateSaved && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 size={14} /> Rate updated successfully!
              </span>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Update Tour Rate
            </button>
          </form>

          {/* Directory Link */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-400">
            <strong className="text-white block font-bold">Public Tourist Directory</strong>
            <p>Your profile is featured on the YatraGo verified guides page with full 3D destination support.</p>
            <button
              onClick={() => onNavigate && onNavigate('guiders')}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 pt-1"
            >
              <span>View Public Guider Directory</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
