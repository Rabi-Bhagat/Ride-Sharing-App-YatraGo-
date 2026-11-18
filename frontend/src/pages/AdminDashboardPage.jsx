import React, { useState } from 'react';
import { 
  ShieldCheck, Car, Users, Compass, DollarSign, IndianRupee, 
  TrendingUp, AlertTriangle, CheckCircle2, XCircle, Sliders, 
  FileText, Award, RefreshCw, Search, Filter, Clock, Eye, 
  MapPin, Check, ChevronRight, Activity, Percent
} from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';

export default function AdminDashboardPage() {
  const [activeSubTab, setActiveSubTab] = useState('verifications'); // 'verifications', 'fares', 'disputes', 'analytics'
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Verification Requests State
  const [verificationRequests, setVerificationRequests] = useState([
    {
      id: 'vr_101',
      name: 'Rajesh Sharma',
      role: 'driver',
      email: 'rajesh.sharma@yatrago.com',
      phone: '+91 98765 43210',
      documentType: 'Commercial Driving License & Police Clearance',
      documentNumber: 'DL-0120190048291',
      vehicle: 'White Toyota Hyryder Hybrid (DL-01-AB-1234)',
      submittedAt: 'Today, 10:15 AM',
      status: 'pending', // 'pending', 'approved', 'rejected'
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'vr_102',
      name: 'Sofia Martinez',
      role: 'guider',
      email: 'sofia.martinez@yatrago.com',
      phone: '+91 98112 33445',
      documentType: 'Govt Certified Tour Guide License & Aadhaar',
      documentNumber: 'TG-IND-884219',
      vehicle: 'Downtown Cultural Specialist (5.0 ★)',
      submittedAt: 'Yesterday, 04:30 PM',
      status: 'approved',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'vr_103',
      name: 'Vikram Malhotra',
      role: 'driver',
      email: 'vikram.m@yatrago.com',
      phone: '+91 99201 88321',
      documentType: 'Aadhaar Card & EV Commercial Permit',
      documentNumber: 'ADH-9912-3401-2289',
      vehicle: 'Tata Nexon EV Prime (MH-02-CD-5678)',
      submittedAt: 'Nov 17, 02:10 PM',
      status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'vr_104',
      name: 'Aarav Kapoor',
      role: 'guider',
      email: 'aarav.kapoor@yatrago.com',
      phone: '+91 97110 55432',
      documentType: 'Heritage Guide Certificate & PAN',
      documentNumber: 'HGC-DEL-40192',
      vehicle: 'Downtown & Skyline Specialist',
      submittedAt: 'Nov 16, 11:45 AM',
      status: 'approved',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    }
  ]);

  // 2. Fare Policies State
  const [farePolicies, setFarePolicies] = useState({
    baseFareCity: 50.00,
    perKmRateCity: 14.00,
    baseFareIntercity: 450.00,
    perKmRateIntercity: 18.00,
    strangerPoolDiscount: 44, // 44%
    nightSurgeMultiplier: 1.25,
    cancellationFee: 40.00,
    platformCommissionPercent: 12
  });
  const [fareSaveFeedback, setFareSaveFeedback] = useState(false);

  // 3. Disputes State
  const [disputes, setDisputes] = useState([
    {
      id: 'dsp_801',
      rideId: 'YT-7721',
      riderName: 'Priya Sharma',
      driverName: 'Vikram Malhotra',
      issue: 'Route deviation during highway jam; requested ₹80 fare adjustment.',
      status: 'open', // 'open', 'resolved'
      amount: 80.00,
      timestamp: 'Today, 11:20 AM'
    },
    {
      id: 'dsp_802',
      rideId: 'YT-6590',
      riderName: 'Rohan Mehra',
      driverName: 'Rajesh Sharma',
      issue: 'Toll fee charged twice at Cyber Highway booth.',
      status: 'resolved',
      amount: 120.00,
      timestamp: 'Yesterday, 06:15 PM'
    }
  ]);

  const handleApproveVerification = (id) => {
    setVerificationRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'approved' } : req
    ));
  };

  const handleRejectVerification = (id) => {
    setVerificationRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'rejected' } : req
    ));
  };

  const handleSaveFares = (e) => {
    e.preventDefault();
    setFareSaveFeedback(true);
    setTimeout(() => setFareSaveFeedback(false), 2500);
  };

  const handleResolveDispute = (id) => {
    setDisputes(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'resolved' } : d
    ));
  };

  const filteredVerifications = verificationRequests.filter(req => 
    req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.documentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      
      {/* ========================================================= */}
      {/* 1. ADMIN COMMAND CENTER HEADER                            */}
      {/* ========================================================= */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/20">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Platform Administration & Governance
            </h1>
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-mono font-bold border border-cyan-500/30">
              Admin Superuser Console
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Full administrative control over driver/guide identity verifications, dynamic fare policies, dispute resolutions, and platform-wide analytics.
          </p>
        </div>

        {/* Quick System Health Pill */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shrink-0">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
          <div className="text-xs">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">System Status</span>
            <strong className="text-white font-mono">100% Operational</strong>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PLATFORM-WIDE TELEMETRY & KPIS                         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Total Completed Rides</span>
            <Car size={14} className="text-cyan-400" />
          </span>
          <div className="text-2xl font-black text-white font-mono">1,482</div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp size={12} /> +18.4% this week
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Platform Revenue (INR)</span>
            <IndianRupee size={14} className="text-emerald-400" />
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">₹4,82,500</div>
          <span className="text-[10px] text-slate-400">12% Net Platform Cut</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Verified Fleet Partners</span>
            <Award size={14} className="text-amber-400" />
          </span>
          <div className="text-2xl font-black text-white font-mono">84</div>
          <span className="text-[10px] text-amber-300 font-bold">62 Drivers • 22 Guiders</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>Carbon Reduction (Pool)</span>
            <Activity size={14} className="text-teal-400" />
          </span>
          <div className="text-2xl font-black text-teal-300 font-mono">1,820 kg</div>
          <span className="text-[10px] text-teal-400 font-bold">Via 44% Stranger Pooling</span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. NAVIGATION SUB-TABS: VERIFICATIONS, FARES, DISPUTES   */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'verifications', label: 'Driver & Guide Verifications', count: verificationRequests.filter(r => r.status === 'pending').length, icon: ShieldCheck },
          { id: 'fares', label: 'Fare Policies & Rates (₹)', icon: Sliders },
          { id: 'disputes', label: 'Disputes & SOS Safety Audit', count: disputes.filter(d => d.status === 'open').length, icon: AlertTriangle },
          { id: 'analytics', label: 'Real-Time Fleet Analytics', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-mono font-black">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DRIVER & GUIDE VERIFICATIONS DESK                  */}
      {/* ========================================================= */}
      {activeSubTab === 'verifications' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-white">Pending Credentials & Verification Queue</h2>
              <p className="text-xs text-slate-400">Review official identity documents and issue verified checkmarks to trustworthy partners.</p>
            </div>
            
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search partner or document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-64"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredVerifications.map(req => {
              const isApproved = req.status === 'approved';
              const isRejected = req.status === 'rejected';

              return (
                <div 
                  key={req.id}
                  className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Avatar & Profile */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={req.avatar}
                        alt={req.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-700"
                      />
                      {isApproved && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-extrabold text-white">{req.name}</strong>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-bold ${
                          req.role === 'driver'
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                            : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        }`}>
                          {req.role}
                        </span>
                        {isApproved && <VerificationBadge type="Government ID" size="sm" />}
                      </div>

                      <p className="text-xs text-slate-300">{req.vehicle}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <FileText size={12} className="text-cyan-400" />
                          <span>{req.documentType}: <strong className="text-white font-mono">{req.documentNumber}</strong></span>
                        </span>
                        <span>•</span>
                        <span>{req.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions / Status */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {isApproved ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span>Verified & Badge Issued</span>
                      </span>
                    ) : isRejected ? (
                      <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5">
                        <XCircle size={14} className="text-rose-400" />
                        <span>Application Rejected</span>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRejectVerification(req.id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveVerification(req.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Approve & Issue Badge</span>
                        </button>
                      </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: FARE POLICIES & RATES MANAGEMENT                   */}
      {/* ========================================================= */}
      {activeSubTab === 'fares' && (
        <form onSubmit={handleSaveFares} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white">Transparent Fare Calculation Policies</h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure live algorithmic base rates, kilometer rates, and pooling incentives.</p>
            </div>
            {fareSaveFeedback && (
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={14} /> Fare Policies Synchronized!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* City Base Fare */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>City Base Ride Fare</span>
                <span className="font-mono text-cyan-400">INR (₹)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={farePolicies.baseFareCity}
                  onChange={(e) => setFarePolicies({ ...farePolicies, baseFareCity: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <p className="text-[10px] text-slate-500">Applies for initial 2 km of city rides.</p>
            </div>

            {/* Per Km Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Per-Kilometer Distance Rate</span>
                <span className="font-mono text-cyan-400">₹ / km</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={farePolicies.perKmRateCity}
                  onChange={(e) => setFarePolicies({ ...farePolicies, perKmRateCity: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <p className="text-[10px] text-slate-500">Standard fuel/electricity rate per km.</p>
            </div>

            {/* Stranger Pooling Discount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Stranger Pooling Route Discount</span>
                <span className="font-mono text-emerald-400">% off</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                <input
                  type="number"
                  value={farePolicies.strangerPoolDiscount}
                  onChange={(e) => setFarePolicies({ ...farePolicies, strangerPoolDiscount: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-500">Encourages co-ridership on shared expressways.</p>
            </div>

            {/* Night Surge Multiplier */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Night / Peak Surge Multiplier</span>
                <span className="font-mono text-amber-400">Multiplier</span>
              </label>
              <input
                type="number"
                step="0.05"
                value={farePolicies.nightSurgeMultiplier}
                onChange={(e) => setFarePolicies({ ...farePolicies, nightSurgeMultiplier: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500">Between 11:00 PM and 05:00 AM.</p>
            </div>

            {/* Cancellation Fee */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Cancellation Protection Fee</span>
                <span className="font-mono text-cyan-400">INR (₹)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={farePolicies.cancellationFee}
                  onChange={(e) => setFarePolicies({ ...farePolicies, cancellationFee: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <p className="text-[10px] text-slate-500">Compensates driver after 5m wait time.</p>
            </div>

            {/* Platform Cut */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Platform Commission Rate</span>
                <span className="font-mono text-purple-400">%</span>
              </label>
              <input
                type="number"
                value={farePolicies.platformCommissionPercent}
                onChange={(e) => setFarePolicies({ ...farePolicies, platformCommissionPercent: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500">Used for R&D, 3D mapping & safety desk.</p>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Save & Broadcast Fare Policies
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DISPUTE RESOLUTION & SAFETY AUDIT                  */}
      {/* ========================================================= */}
      {activeSubTab === 'disputes' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-white">Customer Support & Dispute Mediation</h2>
            <p className="text-xs text-slate-400">Resolve passenger complaints, toll overcharges, and audit emergency SOS records.</p>
          </div>

          <div className="space-y-3">
            {disputes.map(d => {
              const isResolved = d.status === 'resolved';

              return (
                <div
                  key={d.id}
                  className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                        Ride #{d.rideId}
                      </span>
                      <strong className="text-sm font-bold text-white">{d.riderName} vs {d.driverName}</strong>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        isResolved ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 max-w-xl">{d.issue}</p>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                      <span>Requested Refund: <strong className="text-emerald-400 font-bold">₹{d.amount.toFixed(2)}</strong></span>
                      <span>•</span>
                      <span>Logged: {d.timestamp}</span>
                    </div>
                  </div>

                  <div className="shrink-0 self-end md:self-center">
                    {isResolved ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={16} /> Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleResolveDispute(d.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        Approve ₹{d.amount} Refund & Close
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: REAL-TIME FLEET ANALYTICS & AUDIT                  */}
      {activeSubTab === 'analytics' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h2 className="text-lg font-black text-white">Real-Time Fleet & Corridor Analytics</h2>
            <p className="text-xs text-slate-400">Live operational data on commute speeds, passenger pooling rates, and safety scores.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Top Transit Corridors</span>
              <ul className="text-xs space-y-1.5 font-mono text-slate-400">
                <li className="flex justify-between">
                  <span className="text-white">1. Delhi Airport (DEL)</span>
                  <span className="text-cyan-400 font-bold">342 rides</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-white">2. Downtown Cyber Hub</span>
                  <span className="text-cyan-400 font-bold">289 rides</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-white">3. Mumbai ⇄ Pune Express</span>
                  <span className="text-cyan-400 font-bold">198 rides</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Platform Safety Index</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">99.82%</div>
              <p className="text-[11px] text-slate-400">Zero safety incidents reported across 1,480+ rides. SOS dispatch latency under 12 seconds.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Co-Rider Pooling Efficiency</span>
              <div className="text-3xl font-black text-cyan-400 font-mono">44.6%</div>
              <p className="text-[11px] text-slate-400">Average savings per rider on shared expressway routes. 1.82 metric tons CO₂ averted.</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
