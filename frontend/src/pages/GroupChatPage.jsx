import React, { useState } from 'react';
import GroupChat from '../components/GroupChat';
import { 
  MessageSquare, ShieldCheck, User, Car, Users, Compass, 
  PhoneCall, AlertTriangle, MapPin, Clock, IndianRupee, 
  CheckCircle2, Sparkles, Key, Navigation, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VerificationBadge from '../components/VerificationBadge';

export default function GroupChatPage() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState('driver');
  const [searchFilter, setSearchFilter] = useState('');

  // Active simulated trip telemetry for rich contextual chat
  const currentTrip = {
    id: 'YT-8492',
    pickup: 'Innovation Tech Park, Gate 3',
    destination: 'Downtown Cyber Hub, Tower 2',
    eta: '2 mins away',
    driver: 'Rajesh Sharma',
    driverRating: 4.98,
    driverTrips: '3,420 trips',
    vehicle: 'White Toyota Hyryder Hybrid',
    licensePlate: 'DL-01-AB-1234',
    otp: '4892',
    fare: 280,
    originalFare: 500,
    discount: '44% Pool Saved',
    distance: '12.4 km'
  };

  const channelsList = [
    {
      id: 'driver',
      name: 'Rajesh Sharma',
      badgeRole: 'Driver',
      vehicleInfo: 'Toyota Hyryder • DL-01-AB-1234',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Pulling in with hazard lights on near Gate 3!',
      time: 'Just now',
      unread: 1,
      isOnline: true,
      verified: true,
      tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    },
    {
      id: 'pool',
      name: 'Corridor Pool (3 Co-Riders)',
      badgeRole: 'Pool Group',
      vehicleInfo: 'Maya S. & Rahul V. onboard',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Rahul: Hello Maya & Alex! Looking forward to the ride.',
      time: '5m ago',
      unread: 2,
      isOnline: true,
      verified: true,
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      id: 'guider',
      name: 'Aarav Kapoor',
      badgeRole: 'Local Guider',
      vehicleInfo: 'Downtown Specialist • 5.0 ★',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Let me know if you need terminal shortcut tips!',
      time: '15m ago',
      unread: 0,
      isOnline: true,
      verified: true,
      tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    },
    {
      id: 'support',
      name: '24/7 Safety Command Desk',
      badgeRole: 'Safety Protocol',
      vehicleInfo: 'Instant Response Team • SOS Armed',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Live trip tracking and GPS active.',
      time: '20m ago',
      unread: 0,
      isOnline: true,
      verified: true,
      tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    }
  ];

  const filteredChannels = channelsList.filter(ch => 
    ch.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    ch.vehicleInfo.toLowerCase().includes(searchFilter.toLowerCase()) ||
    ch.badgeRole.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER: TITLE & LIVE SECURE TELEMETRY             */}
      {/* ========================================================= */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <MessageSquare size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ride & Driver Chat
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Encrypted</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Message your driver, fellow pool passengers, or trip guide in real time. Your personal phone number is never shared.
          </p>
        </div>

        {/* Trip Quick Telemetry Pill */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Ride Booking #{currentTrip.id}</span>
            <div className="text-xs font-black text-white flex items-center gap-1">
              <Clock size={12} className="text-cyan-400" />
              <span>Arrival: <strong className="text-cyan-300">{currentTrip.eta}</strong></span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Boarding OTP</span>
            <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
              {currentTrip.otp}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN 2-COLUMN LAYOUT: CHANNELS SIDEBAR + CHAT WORKSPACE*/}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================= */}
        {/* LEFT COLUMN: ACTIVE TRIP DETAILS & CHANNELS LIST        */}
        {/* ======================================================= */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Trip Status Card */}
          <div className="glass-panel p-4 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/90 to-slate-900 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Car size={16} className="text-cyan-400" />
                <span className="text-xs font-extrabold text-white">Active Ride Status</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {currentTrip.discount}
              </span>
            </div>

            {/* Vehicle & Driver Snapshot */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                  alt="Driver Rajesh"
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-cyan-500/50"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white truncate">{currentTrip.driver}</h3>
                  <VerificationBadge type="Government ID" size="sm" />
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate">{currentTrip.vehicle}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                  <span className="text-amber-400 font-bold">{currentTrip.driverRating} ★</span>
                  <span>•</span>
                  <span className="text-cyan-300 font-bold">{currentTrip.licensePlate}</span>
                </div>
              </div>
            </div>

            {/* Route corridor points */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1 shrink-0"></span>
                <span className="text-slate-300 truncate">From: <strong className="text-white">{currentTrip.pickup}</strong></span>
              </div>
              <div className="ml-1 border-l-2 border-dashed border-slate-700 h-2"></div>
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0"></span>
                <span className="text-slate-300 truncate">To: <strong className="text-white">{currentTrip.destination}</strong></span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Total Fare:</span>
                <span className="text-emerald-400 font-extrabold text-xs">
                  ₹{currentTrip.fare} <span className="text-slate-500 line-through font-normal text-[10px]">₹{currentTrip.originalFare}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Channels / Conversations List */}
          <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
                Ride Channels ({filteredChannels.length})
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                Auto-Synced
              </span>
            </div>

            {/* Search channels */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter chats or co-riders..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Channel buttons */}
            <div className="space-y-1.5">
              {filteredChannels.map((ch) => {
                const isSelected = activeChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 cursor-pointer group ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Channel Avatar with online indicator */}
                    <div className="relative shrink-0">
                      <img
                        src={ch.avatar}
                        alt={ch.name}
                        className={`w-10 h-10 rounded-xl object-cover ring-2 transition-all ${
                          isSelected ? 'ring-cyan-400' : 'ring-slate-700 group-hover:ring-slate-500'
                        }`}
                      />
                      {ch.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
                      )}
                    </div>

                    {/* Channel Info & Snippet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <strong className={`text-xs font-bold truncate transition-colors ${
                            isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}>
                            {ch.name}
                          </strong>
                          {ch.verified && <VerificationBadge type="Government ID" size="sm" />}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {ch.time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-1">
                        <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                          {ch.lastMessage}
                        </p>
                        {ch.unread > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-mono font-black shrink-0">
                            {ch.unread}
                          </span>
                        )}
                      </div>

                      <span className={`inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border mt-1.5 ${ch.tagColor}`}>
                        {ch.badgeRole}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Safety & Protocol Footer */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <ShieldCheck size={14} />
                <span>Masked Identity Protection</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                YatraGo never shares your actual phone number with drivers or co-riders. All in-app calls and chats are securely proxied.
              </p>
            </div>

          </div>

        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: INTERACTIVE GROUP CHAT WORKSPACE           */}
        {/* ======================================================= */}
        <div className="lg:col-span-8 h-[680px]">
          <GroupChat 
            key={activeChannel}
            activeChannel={activeChannel}
            isModal={false}
          />
        </div>

      </div>

    </div>
  );
}
