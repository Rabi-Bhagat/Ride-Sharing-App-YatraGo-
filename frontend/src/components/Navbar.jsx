import React, { useState, useEffect, useRef } from 'react';
import { Car, Users, Compass, MessageSquare, AlertTriangle, ShieldCheck, User, Menu, X, IndianRupee, Home, Globe, LogIn, LogOut, ChevronDown, Search, Wallet, Plus, CreditCard, ArrowRight, Plane, MapPin, Bike, Zap, Shield, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import VerificationBadge from './VerificationBadge';
import UserAvatar from './UserAvatar';
import yatraGoLogo from '../logo/yatrago-logo.webp';

const POPULAR_SEARCH_PRESETS = [
  { name: 'Delhi Indira Gandhi Airport (DEL)', type: 'Airport', tag: 'Fastest Route', tab: 'book' },
  { name: 'Mumbai Airport (BOM)', type: 'Airport', tag: 'Fixed ₹750', tab: 'book' },
  { name: 'Bengaluru Kempegowda Airport (BLR)', type: 'Airport', tag: 'Direct Corridor', tab: 'book' },
  { name: 'Downtown Cyber Hub & Plaza', type: 'Tech Hub', tag: '44% Pool Save', tab: 'book' },
  { name: 'Mumbai to Pune Expressway', type: 'Intercity', tag: 'From ₹2,200', tab: 'book' },
  { name: 'Oceanfront Bay Resort & Pier', type: 'Scenic', tag: '3D Preview', tab: 'preview-3d' },
  { name: 'Kathmandu Durbar Square (Nepal)', type: 'Heritage', tag: '3D Map', tab: 'preview-3d', viewMode: 'google3d' },
  { name: 'Pokhara Phewa Lake (Nepal)', type: 'Scenic', tag: '3D Map', tab: 'preview-3d', viewMode: 'google3d' },
  { name: 'Everest Base Camp Trail (Nepal)', type: 'Adventure', tag: 'Trek Route', tab: 'book' },
  { name: 'Lumbini Maya Devi Temple (Nepal)', type: 'Pilgrimage', tag: 'Heritage', tab: 'book' }
];

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenSos, 
  onOpenChat, 
  onOpenProfile 
}) {
  const { user, isAuthenticated, openAuthModal, logout, updateUserProfile } = useAuth();
  const { messages, unreadCount, markMessagesRead } = useSocket();

  // Dropdown states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // Refs for click outside handling
  const servicesRef = useRef(null);
  const exploreRef = useRef(null);
  const portalsRef = useRef(null);
  const profileRef = useRef(null);
  const walletRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesDropdownOpen(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setExploreDropdownOpen(false);
      }
      if (portalsRef.current && !portalsRef.current.contains(e.target)) {
        setPortalsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (walletRef.current && !walletRef.current.contains(e.target)) {
        setWalletDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setServicesDropdownOpen(false);
        setExploreDropdownOpen(false);
        setPortalsDropdownOpen(false);
        setProfileDropdownOpen(false);
        setWalletDropdownOpen(false);
        setSearchModalOpen(false);
      }
      // Ctrl+K or Cmd+K opens quick search modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Focus search input when search modal opens
  useEffect(() => {
    if (searchModalOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchModalOpen]);

  // While the chat page is open, any arriving message is already being read
  useEffect(() => {
    if (activeTab === 'chat') {
      markMessagesRead();
    }
  }, [activeTab, messages.length, markMessagesRead]);

  // Drop any unread count when the user signs out
  useEffect(() => {
    if (!user) markMessagesRead();
  }, [user, markMessagesRead]);

  // Elevate the header as the page scrolls for a smooth, premium feel
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Wallet Quick Top-up handler
  const handleQuickTopUp = async (amount) => {
    const currentBal = user?.walletBalance || 1500;
    const updated = currentBal + amount;
    if (updateUserProfile) {
      await updateUserProfile({ walletBalance: updated });
    }
    setWalletDropdownOpen(false);
  };

  const handleSelectSearchResult = (result) => {
    setActiveTab(result.tab || 'book', result.viewMode ? { viewMode: result.viewMode } : undefined);
    setSearchModalOpen(false);
    setSearchQuery('');
  };

  const filteredPresets = POPULAR_SEARCH_PRESETS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className={`sticky top-0 z-40 w-full border-b transition-all duration-300 animate-slideDown ${
        scrolled
          ? 'bg-slate-950/95 backdrop-blur-2xl border-slate-800/90 shadow-2xl shadow-cyan-950/40'
          : 'bg-slate-950/70 backdrop-blur-xl border-slate-800/60 shadow-none'
      }`}>
        {/* Animated gradient accent lines */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 -bottom-2 h-2 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-sm" />
        <div className="max-w-7xl 2xl:max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
            
            {/* ========================================================= */}
            {/* 1. BRAND LOGO & LIVE CITY TELEMETRY */}
            {/* ========================================================= */}
            <div 
              className="flex items-center gap-3 cursor-pointer group shrink-0" 
              onClick={() => setActiveTab('home')}
              title="YatraGo Mobility • Home"
            >
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl p-1 bg-white border border-cyan-500/40 shadow-lg shadow-cyan-500/20 flex items-center justify-center group-hover:scale-105 group-hover:border-cyan-400 transition-all overflow-hidden shrink-0">
                <img
                  src={yatraGoLogo}
                  alt="YatraGo Logo"
                  className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList?.add('img-fallback'); }} />
                <span className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-emerald-400 bg-clip-text text-transparent group-hover:to-cyan-300 transition-colors">
                    YatraGo
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>RIDE • SHARE • EXPLORE</span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 2. DESKTOP INTERACTIVE NAVIGATION BAR WITH MEGA DROPDOWNS */}
            {/* ========================================================= */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5">
              
              {/* Home */}
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'home'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Home size={15} className={activeTab === 'home' ? 'text-cyan-400' : 'text-slate-400'} />
                <span>Home</span>
              </button>

              {/* Ride Services Mega Dropdown */}
              <div ref={servicesRef} className="relative">
                <button
                  onClick={() => {
                    setServicesDropdownOpen(!servicesDropdownOpen);
                    setExploreDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    ['book', 'stranger'].includes(activeTab) || servicesDropdownOpen
                      ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Car size={15} className={['book', 'stranger'].includes(activeTab) ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>Ride Services</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-black font-mono">
                    -44%
                  </span>
                  <ChevronDown size={13} className={`transition-transform duration-200 text-slate-400 ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Services Mega Menu Popover */}
                {servicesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl p-2.5 z-50 animate-fadeIn space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                      <span>YatraGo Mobility Suites</span>
                      <span className="text-emerald-400">Upfront Rates</span>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('book');
                        setServicesDropdownOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Car size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">YatraGo Premier & Sedans</strong>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">From ₹60</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Autonomous EV sedans, zero surge doorstep rides</p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('stranger');
                        setServicesDropdownOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-all flex items-start gap-3 group bg-emerald-950/20 border border-emerald-500/20"
                    >
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 group-hover:scale-105 transition-transform shrink-0">
                        <Users size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-emerald-300">Co-Rider Pool & Save</strong>
                          <span className="text-[9px] font-mono bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded font-black">SAVE 44%</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">Share with verified co-travelers heading your way</p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('book');
                        setServicesDropdownOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Bike size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Moto & Auto Express</strong>
                          <span className="text-[10px] font-mono text-amber-400 font-bold">From ₹25</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Quick agile city hops that beat rush-hour jams</p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('home');
                        setServicesDropdownOpen(false);
                        setTimeout(() => {
                          window.scrollTo({ top: 900, behavior: 'smooth' });
                        }, 100);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Plane size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Airports & Intercity</strong>
                          <span className="text-[10px] font-mono text-purple-400 font-bold">DEL • BOM • BLR</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Fixed rates to 700+ airports and expressway routes</p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('driver');
                        setServicesDropdownOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Car size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">Driver Partner Console</strong>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">Earn ₹</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Accept dispatches, verify OTP & navigate routes</p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('guide-portal');
                        setServicesDropdownOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Compass size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Local Guider Portal</strong>
                          <span className="text-[10px] font-mono text-purple-400 font-bold">₹350/hr</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Manage tour bookings & 3D destinations</p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('admin');
                        setServicesDropdownOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">Operations & Admin</strong>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">Staff</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Verify driver/guide licenses & configure fare policies</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Split Fare Tab */}
              <button
                onClick={() => setActiveTab('cost-split')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'cost-split'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <IndianRupee size={15} className={activeTab === 'cost-split' ? 'text-cyan-400' : 'text-slate-400'} />
                <span>Split Fare</span>
              </button>

              {/* Business & Promo Hub */}
              <button
                onClick={() => setActiveTab('business')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'business'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
                title="Partner hotels, shops & restaurants with traveller promo codes"
              >
                <Store size={15} className={activeTab === 'business' ? 'text-emerald-400' : 'text-slate-400'} />
                <span>Business & Promos</span>
              </button>

              {/* Explore 3D & Guiders Dropdown */}
              <div ref={exploreRef} className="relative">
                <button
                  onClick={() => {
                    setExploreDropdownOpen(!exploreDropdownOpen);
                    setServicesDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    ['preview-3d', 'guiders'].includes(activeTab) || exploreDropdownOpen
                      ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Globe size={15} className={['preview-3d', 'guiders'].includes(activeTab) ? 'text-purple-400' : 'text-slate-400'} />
                  <span>Explore & 3D</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 text-slate-400 ${exploreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Explore Menu Popover */}
                {exploreDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl p-2.5 z-50 animate-fadeIn space-y-1">
                    <div
                      onClick={() => {
                        setActiveTab('preview-3d', { viewMode: 'google3d' });
                        setExploreDropdownOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Globe size={16} />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors block">3D Map Explorer</strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">Search any place worldwide on a live 3D satellite map</p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('preview-3d', { viewMode: 'simulator' });
                        setExploreDropdownOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Bike size={16} />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors block">3D Highway Simulator</strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">Cruise a bike & vehicle simulation across 3D routes</p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('guiders');
                        setExploreDropdownOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Compass size={16} />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors block">Local Guider Network</strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">Book certified travel guides (from ₹300/hr) to co-ride</p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('home');
                        setExploreDropdownOpen(false);
                        setTimeout(() => {
                          const fleetEl = document.getElementById('vehicle-fleet-section');
                          if (fleetEl) fleetEl.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Zap size={16} />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors block">Fleet Vehicles & Specs</strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">Explore EV Sedan, SUV, Superbike & Scooters</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Role-Based Workspaces & Portals Dropdown */}
              <div ref={portalsRef} className="relative">
                <button
                  onClick={() => {
                    setPortalsDropdownOpen(!portalsDropdownOpen);
                    setServicesDropdownOpen(false);
                    setExploreDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    ['driver', 'admin', 'guide-portal'].includes(activeTab) || portalsDropdownOpen
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                  title="Role-Based Workspaces & Portals"
                >
                  <ShieldCheck size={15} className={['driver', 'admin', 'guide-portal'].includes(activeTab) ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>Workspaces</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 text-slate-400 ${portalsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {portalsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl p-2.5 z-50 animate-fadeIn space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                      <span>Role-Specific Portals</span>
                      <span className="text-cyan-400 font-mono font-bold">Verified</span>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('driver');
                        setPortalsDropdownOpen(false);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 group ${
                        activeTab === 'driver' ? 'bg-emerald-950/50 border border-emerald-500/40' : 'hover:bg-slate-800/90'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Car size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Driver Partner Console</strong>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">Online</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Dispatches, passenger OTP verification & fare payouts</p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('admin');
                        setPortalsDropdownOpen(false);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 group ${
                        activeTab === 'admin' ? 'bg-cyan-950/50 border border-cyan-500/40' : 'hover:bg-slate-800/90'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">Operations & Admin</strong>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">Staff</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Verify driver/guide licenses & fare management policies</p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('guide-portal');
                        setPortalsDropdownOpen(false);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 group ${
                        activeTab === 'guide-portal' ? 'bg-purple-950/50 border border-purple-500/40' : 'hover:bg-slate-800/90'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Compass size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Local Guider Portal</strong>
                          <span className="text-[10px] font-mono text-purple-400 font-bold">₹350/hr</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Manage tourist tour requests & 3D destinations</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </nav>

            {/* ========================================================= */}
            {/* 3. QUICK SEARCH CAPSULE (SHORTCUT: ⌘K / CTRL+K) */}
            {/* ========================================================= */}
            <div className="hidden xl:flex items-center shrink-0">
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center justify-between gap-2.5 w-36 lg:w-48 xl:w-60 h-9 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-all shadow-inner whitespace-nowrap overflow-hidden group cursor-pointer shrink-0"
                title="Search routes or airports (Ctrl+K)"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Search size={14} className="text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate text-xs">Search route or airport...</span>
                </div>
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-950 border border-slate-800 rounded shrink-0">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* ========================================================= */}
            {/* 4. RIGHT ACTION PILLS: WALLET, SOS, CHAT, USER */}
            {/* ========================================================= */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Interactive Wallet Balance Pill & Quick Top-Up (Only when authenticated) */}
              {user && (
                <div ref={walletRef} className="relative">
                  <button
                    onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono font-bold text-white transition-all shadow-sm cursor-pointer"
                    title="YatraGo In-App Mobility Wallet"
                  >
                    <Wallet size={14} className="text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-extrabold">₹{user.walletBalance ? Number(user.walletBalance).toFixed(0) : '1,500'}</span>
                    <Plus size={11} className="text-cyan-400 hidden sm:inline" />
                  </button>

                  {/* Quick Wallet Dropdown */}
                  {walletDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl p-4 z-50 animate-fadeIn space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Wallet size={14} className="text-emerald-400" />
                          <span>Mobility Wallet</span>
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
                          Live Escrow
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Available Balance</span>
                          <strong className="text-xl font-black text-white font-mono">
                            ₹{user.walletBalance ? Number(user.walletBalance).toFixed(2) : '1,500.00'}
                          </strong>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-1 rounded-lg">
                          Ready ✓
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Quick Top-Up Balance</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[100, 250, 500].map((amt) => (
                            <button
                              key={amt}
                              onClick={() => handleQuickTopUp(amt)}
                              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-white transition-all text-center cursor-pointer"
                            >
                              +₹{amt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setWalletDropdownOpen(false);
                          if (onOpenProfile) onOpenProfile();
                        }}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                      >
                        <CreditCard size={13} />
                        <span>Manage Wallet & Cards</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Dedicated Emergency SOS Safety Button */}
              <button
                onClick={() => setActiveTab('sos')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  activeTab === 'sos'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400/50'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
                title="Emergency Safety Protocol & SOS Beacon"
              >
                <AlertTriangle size={14} className="text-red-400 animate-pulse shrink-0" />
                <span className="font-extrabold text-[11px] sm:text-xs">SOS</span>
              </button>

              {/* Live Group Chat Icon Button (signed-in users only) */}
              {user && (
                <button
                  onClick={() => {
                    markMessagesRead();
                    if (setActiveTab) setActiveTab('chat');
                  }}
                  className={`relative h-9 w-9 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center ${
                    activeTab === 'chat'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800'
                  }`}
                  title={unreadCount > 0 ? `${unreadCount} new chat message${unreadCount > 1 ? 's' : ''}` : 'Live Group Ride Chat'}
                  aria-label={unreadCount > 0 ? `${unreadCount} new chat messages` : 'Live Group Ride Chat'}
                >
                  <MessageSquare size={16} className="text-cyan-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-2 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-md animate-bounce">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Profile Button with Interactive Popover */}
              {user ? (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-2 sm:pl-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all group"
                    title="Account & Profile Settings"
                  >
                    <div className="flex flex-col items-end hidden md:flex">
                      <div className="flex items-center gap-1 text-xs font-extrabold text-white">
                        <span className="max-w-[90px] truncate">{user.name?.split(' ')[0] || 'User'}</span>
                        {user.isVerified && <VerificationBadge type={user.verificationBadgeType || 'Government ID'} size="sm" />}
                      </div>
                      <span className="text-[9px] text-cyan-400 capitalize font-mono leading-none">
                        {user.role || 'rider'}
                      </span>
                    </div>

                    <UserAvatar
                      user={user}
                      size="sm"
                      className="ring-2 ring-cyan-500/40 group-hover:ring-cyan-400 transition-all rounded-lg overflow-hidden shrink-0"
                    />
                    <ChevronDown size={12} className={`text-slate-400 hidden sm:inline transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl p-2.5 z-50 animate-fadeIn space-y-1">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2.5 mb-1">
                        <UserAvatar
                          user={user}
                          size="md"
                          className="ring-2 ring-cyan-500/40 rounded-xl overflow-hidden shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <strong className="text-xs font-bold text-white block truncate">{user.name}</strong>
                          <span className="text-[10px] text-slate-400 block truncate font-mono">{user.email}</span>
                          <span className="text-[9px] text-emerald-400 font-bold font-mono">★ {user.rating || '4.96'} Rating</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          if (onOpenProfile) onOpenProfile();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <User size={15} className="text-cyan-400" />
                          <span>View & Edit Profile</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setActiveTab('cost-split');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <IndianRupee size={15} className="text-emerald-400" />
                          <span>Active Ride & Settlement</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">Live</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setActiveTab('sos');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Shield size={15} className="text-red-400" />
                          <span>Emergency SOS Guardians</span>
                        </div>
                      </button>

                      <div className="pt-1 border-t border-slate-800 space-y-0.5">
                        <span className="text-[9px] uppercase font-mono font-bold text-slate-500 px-2 block">Switch Mode</span>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setActiveTab('driver');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-emerald-300 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Car size={14} className="text-emerald-400" />
                            <span>Driver Console</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono">Shift</span>
                        </button>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setActiveTab('admin');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-cyan-300 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-cyan-400" />
                            <span>Admin Desk</span>
                          </div>
                          <span className="text-[10px] text-cyan-400 font-mono">Control</span>
                        </button>
                      </div>

                      <div className="pt-1 mt-1 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            if (logout) logout();
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-red-500/10 text-xs font-bold text-red-400 hover:text-red-300 transition-all"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (setActiveTab) setActiveTab('login');
                      else if (openAuthModal) openAuthModal('login');
                    }}
                    className="group h-9 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-600 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <LogIn size={14} className="text-cyan-400 transition-transform duration-300 group-hover:-translate-x-0.5" />
                    <span>Log In</span>
                  </button>
                  <button
                    onClick={() => {
                      if (setActiveTab) setActiveTab('signup');
                      else if (openAuthModal) openAuthModal('signup');
                    }}
                    className="group relative hidden sm:flex h-9 px-4 rounded-xl overflow-hidden bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 items-center justify-center whitespace-nowrap border border-cyan-300/40"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-[130%] group-hover:translate-x-[130%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <span className="relative z-10">Sign Up</span>
                  </button>
                </div>
              )}

              {/* Mobile Drawer Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-drawer"
              >
                {mobileMenuOpen ? <X size={20} className="text-cyan-400" /> : <Menu size={20} />}
              </button>

            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. RESPONSIVE MOBILE DRAWER */}
        {/* ========================================================= */}
        {mobileMenuOpen && (
          <div id="mobile-nav-drawer" className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-5 space-y-3 backdrop-blur-2xl animate-slideDown max-h-[85vh] overflow-y-auto">
            
            {/* Quick Search on Mobile */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Delhi, Mumbai, Airport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveTab('book');
                    setMobileMenuOpen(false);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
            </div>

            {/* Mobile User Card / Auth */}
            {user ? (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    user={user}
                    size="md"
                    className="ring-2 ring-cyan-500/40 rounded-xl overflow-hidden shrink-0"
                  />
                  <div>
                    <strong className="text-white text-xs block font-bold">{user.name}</strong>
                    <span className="text-[10px] text-cyan-400 capitalize font-mono">{user.role} • Wallet ₹{Number(user.walletBalance || 1500).toFixed(0)}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenProfile) onOpenProfile();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
                >
                  Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (setActiveTab) setActiveTab('login');
                    else if (openAuthModal) openAuthModal('login');
                  }}
                  className="py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs border border-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn size={14} className="text-cyan-400" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (setActiveTab) setActiveTab('signup');
                    else if (openAuthModal) openAuthModal('signup');
                  }}
                  className="group relative overflow-hidden py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-300/40 shadow-md shadow-cyan-500/20"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-[130%] group-hover:translate-x-[130%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  <span className="relative z-10">Sign Up</span>
                </button>
              </div>
            )}

            {/* Primary Mobile Nav Links */}
            <div className="space-y-1 pt-1">
              {[
                { id: 'home', label: 'Home Page', icon: Home },
                { id: 'book', label: 'Request a Ride', icon: Car, badge: 'From ₹25' },
                { id: 'stranger', label: 'Pool & Save', icon: Users, badge: '-44% OFF', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
                { id: 'cost-split', label: 'Smart Fare Splitter', icon: IndianRupee },
                { id: 'business', label: 'Business & Promo Hub', icon: Store, badge: 'Partners', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
                { id: 'preview-3d', label: '3D Map Explorer', icon: Globe, viewMode: 'google3d' },
                { id: 'guiders', label: 'Local Guider Network', icon: Compass },
                { id: 'driver', label: 'Driver Partner Console', icon: Car, badge: 'Online', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
                { id: 'admin', label: 'Operations & Admin', icon: ShieldCheck, badge: 'Staff', badgeColor: 'bg-cyan-500/20 text-cyan-300' },
                { id: 'guide-portal', label: 'Local Guider Portal', icon: Compass, badge: '₹350/hr', badgeColor: 'bg-purple-500/20 text-purple-300' },
                ...(!user ? [{ id: 'auth', label: 'Sign In / Register', icon: LogIn, badge: 'Access', badgeColor: 'bg-cyan-500/20 text-cyan-300' }] : []),
                { id: 'chat', label: 'Group Ride Chat', icon: MessageSquare },
                { id: 'sos', label: 'Emergency SOS Center', icon: AlertTriangle, danger: true }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id, item.viewMode ? { viewMode: item.viewMode } : undefined);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      item.danger
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={item.danger ? 'text-red-400' : isActive ? 'text-cyan-400' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-cyan-500/20 text-cyan-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* 6. GLOBAL QUICK SEARCH DIALOG MODAL (CTRL+K) */}
      {/* ========================================================= */}
      {searchModalOpen && (
        <div 
          onClick={() => setSearchModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 pt-20 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Search destinations"
            className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden space-y-3 p-4 animate-slideDown"
          >
            {/* Search Input Box */}
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-3.5 text-cyan-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search any destination, airport, or corridor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-semibold"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Presets List */}
            <div className="space-y-1 max-h-72 overflow-y-auto pt-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase font-bold text-slate-400">
                Popular Routes & Hubs
              </div>

              {filteredPresets.map((preset, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectSearchResult(preset)}
                  className="p-3 rounded-xl hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                      {preset.type === 'Airport' ? <Plane size={15} /> : <MapPin size={15} />}
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors block">
                        {preset.name}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-mono">{preset.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {preset.tag}
                    </span>
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Bottom Keyboard Shortcut Hints */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono px-2">
              <div className="flex items-center gap-2">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">ESC</kbd>
                <span>to close</span>
              </div>
              <span className="text-cyan-400 font-bold">YatraGo Smart Route Jump</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
