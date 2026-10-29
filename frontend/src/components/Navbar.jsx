import React, { useState } from 'react';
import { 
  Car, Users, Box, Compass, MessageSquare, AlertTriangle, 
  ShieldCheck, User, Menu, X, DollarSign, Home, Globe 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import VerificationBadge from './VerificationBadge';
import yatraGoLogo from '../logo/yatrago-logo.png';

export default function Navbar({ activeTab, setActiveTab, onOpenSos, onOpenChat, onOpenProfile }) {
  const { user } = useAuth();
  const { messages } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'book', label: 'Book Ride', icon: Car },
    { id: 'stranger', label: 'Pool & Save', icon: Users, badge: '44% Off' },
    { id: 'cost-split', label: 'Split Fare', icon: DollarSign },
    { id: 'preview-3d', label: '3D Map', icon: Globe },
    { id: 'guiders', label: 'Guiders', icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="relative w-11 h-11 rounded-2xl p-1 bg-white border border-cyan-500/40 shadow-lg shadow-cyan-500/20 flex items-center justify-center group-hover:scale-105 group-hover:border-cyan-400 transition-all overflow-hidden shrink-0">
              <img
                src={yatraGoLogo}
                alt="YatraGo Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-emerald-400 bg-clip-text text-transparent">
                  YatraGo
                </span>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-extrabold border border-emerald-500/30">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">RIDE • SHARE • EXPLORE</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                    item.danger
                      ? 'text-red-400 hover:bg-red-500/10 border border-red-500/30'
                      : isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon size={16} className={item.danger ? 'text-red-400' : isActive ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2.5">
            
            {/* Dedicated Emergency SOS Button */}
            <button
              onClick={() => setActiveTab('sos')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'sos'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
              title="Emergency Safety Protocol"
            >
              <AlertTriangle size={15} className="text-red-400 animate-pulse" />
              <span className="hidden sm:inline">SOS</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all hover:scale-105 active:scale-95"
              title="Live Group Chat"
            >
              <MessageSquare size={18} className="text-cyan-400" />
              {messages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-[10px] flex items-center justify-center shadow-md">
                  {messages.length}
                </span>
              )}
            </button>

            {/* Verified User Profile Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all group"
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                  <span>{user.name}</span>
                  {user.isVerified && <VerificationBadge type={user.verificationBadgeType} size="sm" />}
                </div>
                <span className="text-[10px] text-cyan-400 capitalize font-medium">{user.role}</span>
              </div>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-cyan-500/40 group-hover:ring-cyan-400 transition-all"
              />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-800"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2 backdrop-blur-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
