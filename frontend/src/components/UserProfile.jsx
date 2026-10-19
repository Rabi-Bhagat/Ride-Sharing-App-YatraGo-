import React, { useState } from 'react';
import { 
  User, ShieldCheck, CheckCircle2, Star, Award, Phone, Mail, 
  Edit3, X, Save, AlertTriangle, CreditCard, Wallet, Smartphone, 
  Plus, Trash2, Leaf, Shield, Check, Compass, Car, Zap, RefreshCw, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VerificationBadge from './VerificationBadge';
import yatraGoLogo from '../logo/YatraGo Travel Logo Presentation.png';

export default function UserProfile({ onClose }) {
  const { user, toggleVerification, switchRole, updateUserProfile } = useAuth();
  
  // Navigation Tabs: 'overview', 'details', 'wallet', 'emergency', 'badges'
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || 'Alex Rivera');
  const [phone, setPhone] = useState(user.phone || '+1 (555) 234-8901');
  const [bio, setBio] = useState(user.bio || 'Urban explorer & tech product designer.');
  const [walletBalance, setWalletBalance] = useState(user.walletBalance || 145.50);
  const [upiId, setUpiId] = useState(user.upiId || 'alex.rivera@oksbi');
  const [emergencyContacts, setEmergencyContacts] = useState(
    user.emergencyContacts && user.emergencyContacts.length > 0
      ? user.emergencyContacts
      : [
          { name: 'Elena Rivera', phone: '+1 (555) 911-0199', relation: 'Sister' },
          { name: 'Marcus Chen', phone: '+1 (555) 432-1098', relation: 'Friend' }
        ]
  );

  // New emergency contact draft
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Friend');
  const [showAddContact, setShowAddContact] = useState(false);

  // Status feedback
  const [toastMessage, setToastMessage] = useState(null);
  const [testSosSent, setTestSosSent] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = async () => {
    await updateUserProfile({
      name,
      phone,
      bio,
      emergencyContacts,
      walletBalance,
      upiId
    });
    setIsEditing(false);
    showToast('Profile information successfully saved and synced!');
  };

  const handleTopUpWallet = (amount) => {
    const updated = walletBalance + amount;
    setWalletBalance(updated);
    updateUserProfile({ walletBalance: updated });
    showToast(`Added $${amount}.00 to Velocita Wallet balance!`);
  };

  const handleAddEmergencyContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const updated = [...emergencyContacts, { name: newContactName, phone: newContactPhone, relation: newContactRelation }];
    setEmergencyContacts(updated);
    updateUserProfile({ emergencyContacts: updated });
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
    showToast(`Added ${newContactName} to emergency SOS contacts`);
  };

  const handleRemoveEmergencyContact = (idx) => {
    const updated = emergencyContacts.filter((_, i) => i !== idx);
    setEmergencyContacts(updated);
    updateUserProfile({ emergencyContacts: updated });
    showToast('Emergency contact removed.');
  };

  const handleSimulateTestSos = () => {
    setTestSosSent(true);
    setTimeout(() => setTestSosSent(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-xl animate-bounce flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-all backdrop-blur-md"
        >
          <X size={18} />
        </button>

        {/* Cover & Profile Banner */}
        <div className="relative shrink-0">
          <div className="h-28 w-full bg-gradient-to-r from-cyan-900 via-blue-900 to-slate-900 border-b border-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>

          <div className="px-6 pb-2 -mt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-950 border-2 border-cyan-500 shadow-2xl bg-slate-900"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-950" title="Online & Active" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-white tracking-tight">{user.name}</h2>
                  {user.isVerified && <VerificationBadge type={user.verificationBadgeType} size="md" showLabel={true} />}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                    <Mail size={12} /> {user.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Phone size={12} /> {user.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {user.role} Tier
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 px-6 pt-3 pb-2 text-center">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Rating</span>
              <span className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                <Star size={13} fill="currentColor" /> {user.rating}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Trips</span>
              <span className="text-sm font-black text-white">{user.tripsCompleted}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Trust Score</span>
              <span className="text-sm font-black text-emerald-400">98%</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">CO2 Saved</span>
              <span className="text-sm font-black text-cyan-400">142 kg</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 px-6 border-b border-slate-800 overflow-x-auto scrollbar-none pt-2">
            {[
              { id: 'overview', label: 'Overview & Trust', icon: ShieldCheck },
              { id: 'details', label: 'Personal Info', icon: User },
              { id: 'wallet', label: 'Wallet & Pay', icon: Wallet },
              { id: 'emergency', label: 'Emergency SOS', icon: AlertTriangle },
              { id: 'badges', label: 'Impact Badges', icon: Award }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* TAB 1: OVERVIEW & TRUST */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Identity Verification Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 ring-2 ring-cyan-500/30">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-sm font-bold">Government ID Biometric Verification</strong>
                      {user.isVerified && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          Verified & Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {user.isVerified
                        ? 'Your national identity document and facial biometric hash have been cryptographically authenticated.'
                        : 'Unverified profile. Complete ID verification to access premium stranger pooling & verified guiders.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleVerification}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    user.isVerified
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/30 hover:scale-105'
                  }`}
                >
                  {user.isVerified ? 'Simulate Re-verify' : 'Verify ID Now'}
                </button>
              </div>

              {/* Role Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Active Velocita Profile Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'rider', title: 'Passenger Rider', desc: 'Book rides, pool with strangers & split fares.', icon: Car },
                    { id: 'guider', title: 'Local Guider', desc: 'Guide tourists & earn per-hour booking fees.', icon: Compass },
                    { id: 'driver', title: 'Eco Driver', desc: 'Drive verified electric shuttles & cars.', icon: Zap }
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = user.role === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => switchRole(r.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Icon size={18} className={isSelected ? 'text-cyan-400' : 'text-slate-400'} />
                          {isSelected && <CheckCircle2 size={16} className="text-cyan-400" />}
                        </div>
                        <strong className="text-white text-xs font-bold block">{r.title}</strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Safety & Trust Index Metrics */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Shield size={16} className="text-emerald-400" />
                    <span>Safety & Trust Scorecard</span>
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-400">98 / 100</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full" style={{ width: '98%' }}></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                  <span>✓ 0 SOS Emergencies Triggered</span>
                  <span>✓ 100% Ride Completion Rate</span>
                  <span>✓ Dual-Factor Authentication Active</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PERSONAL & CONTACT DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Profile Information</h3>
                  <p className="text-xs text-slate-400">Manage your publicly visible rider details.</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition-all"
                  >
                    <Edit3 size={14} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold shadow-md hover:scale-105 transition-all"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Email Address (Locked)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 opacity-60 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Phone Number</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Preferred UPI ID</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 disabled:opacity-60 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Rider Bio & Preferences</label>
                <textarea
                  rows={3}
                  disabled={!isEditing}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio with co-riders (e.g. Quiet ride enthusiast, loves podcasts)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60 resize-none"
                />
              </div>

              {isEditing && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 flex items-center justify-between">
                  <span>Press Save Changes to sync this info across your active ride sessions.</span>
                  <button
                    onClick={handleSaveProfile}
                    className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    Save Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WALLET & PAYMENTS */}
          {activeTab === 'wallet' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Virtual Holographic YatraGo Black Card */}
              <div className="relative p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950 border border-cyan-500/40 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 p-1 border border-cyan-500/40 shadow-md">
                      <img src={yatraGoLogo} alt="YatraGo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <span className="text-[10px] tracking-widest uppercase font-extrabold text-cyan-400">YatraGo Black Card</span>
                      <h4 className="text-white font-extrabold text-lg">In-App Mobility Credit</h4>
                    </div>
                  </div>
                  <CreditCard size={28} className="text-cyan-400" />
                </div>

                <div className="mb-6">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Available Balance</span>
                  <span className="text-3xl font-black text-white tracking-tight">${walletBalance.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-300 border-t border-slate-700/60 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Cardholder</span>
                    <strong className="text-white">{user.name}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block uppercase">Linked UPI</span>
                    <strong className="text-cyan-400">{upiId}</strong>
                  </div>
                </div>
              </div>

              {/* Instant Top-Up Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Balance Top-Up
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleTopUpWallet(amt)}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                    >
                      <Plus size={14} className="text-cyan-400" />
                      <span>+${amt}.00</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Saved Payment Methods */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Linked Payment Methods
                </label>
                
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      UPI
                    </div>
                    <div>
                      <strong className="text-white text-xs block">{upiId}</strong>
                      <span className="text-[10px] text-emerald-400 font-mono">Primary Instant Split Gateway</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Default</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      VISA
                    </div>
                    <div>
                      <strong className="text-white text-xs block">Visa Platinum •••• 4829</strong>
                      <span className="text-[10px] text-slate-400 font-mono">Expires 09/28</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">Backup</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: EMERGENCY CONTACTS */}
          {activeTab === 'emergency' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-400" />
                    <span>Emergency SOS Contacts</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Contacts alerted immediately when you trigger the Topbar SOS Emergency button.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-all"
                >
                  <Plus size={14} />
                  <span>Add Contact</span>
                </button>
              </div>

              {/* Add Contact Form Inline */}
              {showAddContact && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
                  <span className="text-xs font-bold text-white block">Add Trusted Contact</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Phone (+1 / +91...)"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                    <select
                      value={newContactRelation}
                      onChange={(e) => setNewContactRelation(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                    >
                      <option value="Sister">Sister</option>
                      <option value="Brother">Brother</option>
                      <option value="Parent">Parent</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Friend">Friend</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddContact(false)}
                      className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddEmergencyContact}
                      className="px-4 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      Save Contact
                    </button>
                  </div>
                </div>
              )}

              {/* Contacts List */}
              <div className="space-y-2">
                {emergencyContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                        SOS
                      </div>
                      <div>
                        <strong className="text-white text-xs block">{contact.name} ({contact.relation})</strong>
                        <span className="text-[11px] text-slate-400 font-mono">{contact.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                        {idx === 0 ? 'Primary Priority' : 'Secondary'}
                      </span>
                      {emergencyContacts.length > 1 && (
                        <button
                          onClick={() => handleRemoveEmergencyContact(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                          title="Remove contact"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Test SOS Button */}
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-between">
                <div>
                  <strong className="text-xs text-white block">Test SOS Notification Broadcast</strong>
                  <span className="text-[11px] text-slate-300">Simulate sending an automated SMS telemetry beacon.</span>
                </div>
                <button
                  onClick={handleSimulateTestSos}
                  disabled={testSosSent}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
                >
                  {testSosSent ? 'Broadcast Sent ✓' : 'Send Test Ping'}
                </button>
              </div>

            </div>
          )}

          {/* TAB 5: IMPACT BADGES */}
          {activeTab === 'badges' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Leaf className="text-emerald-400" />
                  <span>Green Mobility & Community Badges</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Earned through carbon-reduced carpooling, stranger rides, and verified ratings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: 'Eco-Champion Level 3',
                    desc: 'Saved 142 kg of CO2 emissions by carpooling with stranger passengers.',
                    color: 'emerald',
                    icon: Leaf,
                    unlocked: true
                  },
                  {
                    title: 'Punctual Traveler',
                    desc: '100% on-time pickup meeting point rating with 64 completed rides.',
                    color: 'cyan',
                    icon: Award,
                    unlocked: true
                  },
                  {
                    title: '5-Star Co-Rider',
                    desc: 'Maintained 4.96+ rating over the past 30 days from fellow riders.',
                    color: 'amber',
                    icon: Star,
                    unlocked: true
                  },
                  {
                    title: 'Night Owl Navigator',
                    desc: 'Safe pooled travel during peak night transit hours with live SOS telemetry.',
                    color: 'violet',
                    icon: Shield,
                    unlocked: true
                  }
                ].map((b, idx) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Icon size={20} />
                      </div>
                      <div>
                        <strong className="text-white text-xs font-bold block">{b.title}</strong>
                        <p className="text-[11px] text-slate-400 mt-1">{b.desc}</p>
                        <span className="text-[9px] font-mono text-emerald-400 block mt-1.5 uppercase font-bold">
                          ✓ Unlocked & Verified
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <img src={yatraGoLogo} alt="YatraGo" className="w-4 h-4 object-contain" />
            <span className="font-mono text-[11px]">Member ID: {user.id || 'usr_verified_1'} • YatraGo Pro v2.5</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
