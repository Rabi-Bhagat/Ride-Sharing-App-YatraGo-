import React, { useState, useRef } from 'react';
import { 
  User, ShieldCheck, CheckCircle2, Star, Award, Phone, Mail, 
  Edit3, X, Save, AlertTriangle, CreditCard, Wallet, Smartphone, 
  Plus, Trash2, Leaf, Shield, Check, Compass, Car, Zap, RefreshCw, 
  ChevronRight, Camera, Upload, MapPin, Lock, LogOut, KeyRound, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VerificationBadge from './VerificationBadge';
import yatraGoLogo from '../logo/yatrago-logo.png';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80'
];

export default function UserProfile({ onClose, onSelectPickupForRide }) {
  const { 
    user, 
    toggleVerification, 
    switchRole, 
    updateUserProfile, 
    uploadProfilePhoto,
    changePassword, 
    logout,
    openAuthModal 
  } = useAuth();
  
  const photoInputRef = useRef(null);

  // Navigation Tabs: 'overview', 'details', 'security', 'wallet', 'emergency', 'badges'
  const [activeTab, setActiveTab] = useState('overview');

  // Form states - Personal & Contact Details
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-8901');
  const [address, setAddress] = useState(user?.address || 'Innovation Tech Park, SF');
  const [homeAddress, setHomeAddress] = useState(user?.homeAddress || '450 Mission St, San Francisco, CA');
  const [workAddress, setWorkAddress] = useState(user?.workAddress || '1 Market St, San Francisco, CA');
  const [bio, setBio] = useState(user?.bio || 'Urban explorer & tech product designer.');
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance || 145.50);
  const [upiId, setUpiId] = useState(user?.upiId || 'alex.rivera@oksbi');
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Form states - Security & Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState(
    user?.emergencyContacts && user?.emergencyContacts.length > 0
      ? user.emergencyContacts
      : [
          { name: 'Elena Rivera', phone: '+1 (555) 911-0199', relation: 'Sister' },
          { name: 'Marcus Chen', phone: '+1 (555) 432-1098', relation: 'Friend' }
        ]
  );

  // New emergency contact draft
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Family');
  const [showAddContact, setShowAddContact] = useState(false);

  // Status feedback
  const [toastMessage, setToastMessage] = useState(null);
  const [testSosSent, setTestSosSent] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Profile Photo Upload from Device
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image size must be under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result;
      if (base64Data) {
        await uploadProfilePhoto(base64Data);
        showToast('Profile photo updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Instant Preset Avatar Selection
  const handleSelectPresetAvatar = async (presetUrl) => {
    await updateUserProfile({ avatar: presetUrl });
    showToast('Avatar updated!');
  };

  // Browser GPS auto-detection
  const handleDetectAddress = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          if (data && data.display_name) {
            const cleanAddr = data.display_name.split(',').slice(0, 3).join(', ').trim();
            setAddress(cleanAddr);
            showToast(`GPS location detected: ${cleanAddr}`);
          } else {
            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (e) {
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsDetectingGps(false);
        }
      },
      () => {
        setIsDetectingGps(false);
        showToast('GPS permission denied. Please enter address manually.');
      },
      { timeout: 8000 }
    );
  };

  // Save Personal Details (Name, Phone, Address, Bio, etc.)
  const handleSaveProfile = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      showToast('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    await updateUserProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      homeAddress: homeAddress.trim(),
      workAddress: workAddress.trim(),
      bio: bio.trim(),
      emergencyContacts,
      walletBalance,
      upiId: upiId.trim()
    });
    setIsEditing(false);
    showToast('Profile information & address updated successfully!');
  };

  // Change Password Submission
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match. Please verify.');
      return;
    }

    setPasswordLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setPasswordLoading(false);

    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('Your password has been changed successfully!');
    } else {
      showToast(res.error || 'Failed to update password.');
    }
  };

  // Top-Up Wallet
  const handleTopUpWallet = (amount) => {
    const updated = walletBalance + amount;
    setWalletBalance(updated);
    updateUserProfile({ walletBalance: updated });
    showToast(`Added $${amount}.00 to YatraGo Wallet!`);
  };

  // Add Emergency Contact
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

  // Remove Emergency Contact
  const handleRemoveEmergencyContact = (idx) => {
    const updated = emergencyContacts.filter((_, i) => i !== idx);
    setEmergencyContacts(updated);
    updateUserProfile({ emergencyContacts: updated });
    showToast('Emergency contact removed.');
  };

  // Simulate SOS test ping
  const handleSimulateTestSos = () => {
    setTestSosSent(true);
    setTimeout(() => setTestSosSent(false), 3500);
  };

  // Log Out
  const handleLogout = () => {
    logout();
    onClose();
    showToast('Logged out of YatraGo account.');
  };

  // Calculate live password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Empty', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 33, text: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 66, text: 'Good', color: 'bg-amber-500' };
    return { score: 100, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800 p-6 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <User size={30} />
          </div>
          <h3 className="text-lg font-black text-white">Not Logged In</h3>
          <p className="text-xs text-slate-400">
            Please log in or create an account to access your rider profile, saved addresses, and wallet.
          </p>
          <div className="flex items-center gap-3 justify-center pt-2">
            <button
              onClick={() => {
                onClose();
                openAuthModal('login');
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:scale-105 transition-all shadow-lg"
            >
              Sign In
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="h-28 w-full bg-gradient-to-r from-cyan-950 via-blue-950 to-slate-950 border-b border-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>

          <div className="px-6 pb-2 -mt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            
            {/* Avatar & Info */}
            <div className="flex items-end gap-4">
              <div className="relative group shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-950 border-2 border-cyan-500 shadow-2xl bg-slate-900"
                />
                
                {/* Photo Upload Trigger Overlay */}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/75 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-cyan-300 font-bold transition-all border-2 border-cyan-400"
                  title="Upload New Profile Photo"
                >
                  <Camera size={18} className="mb-0.5" />
                  <span>Update Photo</span>
                </button>

                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-950" title="Online & Active" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-white tracking-tight">{user.name}</h2>
                  {user.isVerified && <VerificationBadge type={user.verificationBadgeType || 'Government ID'} size="md" showLabel={true} />}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                    <Mail size={12} /> {user.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Phone size={12} /> {user.phone}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin size={11} className="text-cyan-400 shrink-0" />
                  <span className="truncate max-w-[240px]">{user.address || 'San Francisco, CA'}</span>
                </div>
              </div>
            </div>

            {/* Role Badge & Quick Logout */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {user.role} Tier
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 px-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Log Out of this Account"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 px-6 pt-3 pb-2 text-center">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Rating</span>
              <span className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                <Star size={13} fill="currentColor" /> {user.rating || 4.96}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Trips</span>
              <span className="text-sm font-black text-white">{user.tripsCompleted || 64}</span>
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

          {/* Tab Navigation Switches */}
          <div className="flex items-center gap-1 px-6 border-b border-slate-800 overflow-x-auto scrollbar-none pt-2">
            {[
              { id: 'overview', label: 'Overview & Trust', icon: ShieldCheck },
              { id: 'details', label: 'Address & Profile', icon: User },
              { id: 'security', label: 'Password & Security', icon: Lock },
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

          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW & TRUST */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Quick Profile Photo Switcher */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Camera size={14} className="text-cyan-400" />
                    <span>Quick Profile Avatar Switcher</span>
                  </span>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                  >
                    <Upload size={12} />
                    <span>Upload Custom Photo</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((presetUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPresetAvatar(presetUrl)}
                      className={`w-10 h-10 rounded-xl overflow-hidden ring-2 transition-all shrink-0 ${
                        user.avatar === presetUrl ? 'ring-cyan-400 scale-105 shadow-md shadow-cyan-500/30' : 'ring-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={presetUrl} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

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
                  Active YatraGo Profile Mode
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

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: ADDRESS, PHONE NUMBER & PROFILE EDIT */}
          {/* ========================================================= */}
          {activeTab === 'details' && (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Ride & Contact Information</h3>
                  <p className="text-xs text-slate-400">Update your pickup address, mobile phone number, and commuter presets.</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition-all"
                  >
                    <Edit3 size={14} />
                    <span>Edit Info</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold shadow-md hover:scale-105 transition-all"
                  >
                    <Save size={14} />
                    <span>Save All Changes</span>
                  </button>
                )}
              </div>

              {/* Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User size={13} className="text-cyan-400" />
                    <span>Full Legal Name</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Phone size={13} className="text-cyan-400" />
                    <span>Mobile Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60 font-mono"
                  />
                </div>
              </div>

              {/* Primary Address with GPS Button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin size={13} className="text-cyan-400" />
                    <span>Primary Ride Pickup Address</span>
                  </label>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleDetectAddress}
                      disabled={isDetectingGps}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                    >
                      {isDetectingGps ? <RefreshCw size={11} className="animate-spin" /> : <Compass size={11} />}
                      <span>Auto GPS</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Innovation Tech Park, SF"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                  />
                  {onSelectPickupForRide && (
                    <button
                      onClick={() => {
                        onSelectPickupForRide({ name: address, lat: 37.7749, lng: -122.4194 });
                        showToast('Address set as active ride pickup!');
                      }}
                      className="px-3 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold hover:bg-cyan-500/30 whitespace-nowrap"
                      title="Use this address for your next ride booking"
                    >
                      Use for Ride
                    </button>
                  )}
                </div>
              </div>

              {/* Home & Work Commute Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin size={13} className="text-emerald-400" />
                    <span>Saved Home Address</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    placeholder="e.g. 450 Mission St, San Francisco, CA"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin size={13} className="text-blue-400" />
                    <span>Saved Work / Office Address</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={workAddress}
                    onChange={(e) => setWorkAddress(e.target.value)}
                    placeholder="e.g. 1 Market St, San Francisco, CA"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Bio & UPI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Account Email (Permanent ID)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 opacity-60 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Linked Payment UPI ID</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 disabled:opacity-60 font-mono"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Rider Bio & Travel Preferences</label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio with co-riders (e.g. Quiet ride enthusiast, loves podcasts)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60 resize-none"
                />
              </div>

              {isEditing && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 flex items-center justify-between">
                  <span>Changes will be synced across your YatraGo ride requests.</span>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:scale-105 transition-all shadow-md"
                  >
                    Save All
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: PASSWORD & SECURITY */}
          {/* ========================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock size={16} className="text-cyan-400" />
                  <span>Update Account Password</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Ensure your account is protected with a secure password containing letters, numbers, and symbols.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound size={14} className="text-cyan-400" />
                    <span>Current Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock size={14} className="text-emerald-400" />
                    <span>New Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-cyan-400" />
                    <span>Confirm New Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all ${
                      confirmNewPassword && confirmNewPassword === newPassword
                        ? 'border-emerald-500/80'
                        : 'border-slate-700 focus:border-cyan-400'
                    }`}
                  />
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Password Strength:</span>
                      <span className={`font-bold ${
                        strength.score <= 33 ? 'text-red-400' : strength.score <= 66 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {strength.text}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Save New Password</span>
                  )}
                </button>

              </form>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: WALLET & PAYMENTS */}
          {/* ========================================================= */}
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

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: EMERGENCY SOS CONTACTS */}
          {/* ========================================================= */}
          {activeTab === 'emergency' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="text-red-400" />
                    <span>Emergency SOS Contacts</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Trusted guardians automatically alerted with GPS telemetry during SOS triggers.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold hover:bg-red-500/30 transition-all flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Add Contact</span>
                </button>
              </div>

              {/* Add New Emergency Contact Modal Box */}
              {showAddContact && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-red-500/40 space-y-3 animate-slideDown">
                  <strong className="text-xs text-red-300 block">Add Verified Emergency Contact</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                    <select
                      value={newContactRelation}
                      onChange={(e) => setNewContactRelation(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Family">Family</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sister">Sister</option>
                      <option value="Brother">Brother</option>
                      <option value="Friend">Friend</option>
                      <option value="Colleague">Colleague</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 justify-end pt-1">
                    <button
                      onClick={() => setShowAddContact(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddEmergencyContact}
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md"
                    >
                      Save Guardian
                    </button>
                  </div>
                </div>
              )}

              {/* Emergency Contacts List */}
              <div className="space-y-2.5">
                {emergencyContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-xs font-bold">{contact.name}</strong>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {contact.relation}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Phone size={11} /> {contact.phone}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveEmergencyContact(idx)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Remove contact"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Simulated SOS Ping Button */}
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center justify-between gap-4">
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

          {/* ========================================================= */}
          {/* TAB 6: IMPACT BADGES */}
          {/* ========================================================= */}
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
                    icon: Leaf
                  },
                  {
                    title: 'Punctual Traveler',
                    desc: '100% on-time pickup meeting point rating with 64 completed rides.',
                    icon: Award
                  },
                  {
                    title: '5-Star Co-Rider',
                    desc: 'Maintained 4.96+ rating over the past 30 days from fellow riders.',
                    icon: Star
                  },
                  {
                    title: 'Night Owl Navigator',
                    desc: 'Safe pooled travel during peak night transit hours with live SOS telemetry.',
                    icon: Shield
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
            <div className="w-5 h-5 rounded-md bg-white p-0.5 flex items-center justify-center shrink-0">
              <img src={yatraGoLogo} alt="YatraGo" className="w-full h-full object-contain" />
            </div>
            <span className="font-mono text-[11px]">Member: {user.email} • YatraGo Pro</span>
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
