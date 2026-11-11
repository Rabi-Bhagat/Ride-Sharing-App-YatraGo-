import React, { useState, useRef } from 'react';
import { 
  User, Mail, Lock, Phone, MapPin, Eye, EyeOff, ShieldCheck, 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Camera, 
  Upload, X, Compass, Car, Check, RefreshCw, KeyRound, HeartHandshake, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import yatraGoLogo from '../logo/yatrago-logo.png';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80'
];

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { 
    login, 
    register, 
    forgotPassword, 
    loading, 
    authModalTab, 
    setAuthModalTab 
  } = useAuth();

  const fileInputRef = useRef(null);

  // Active view: 'login' | 'signup' | 'forgot'
  const activeTab = authModalTab || initialTab;
  const setActiveTab = (tab) => setAuthModalTab(tab);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states - Sign Up
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [workAddress, setWorkAddress] = useState('');
  const [role, setRole] = useState('rider');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Family');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Form states - Forgot / Change Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // UI Feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Clear messages on tab change
  const handleSwitchTab = (tab) => {
    setErrorMessage('');
    setSuccessMessage('');
    setActiveTab(tab);
  };

  // One-click demo credentials filler
  const handleFillDemo = () => {
    setLoginEmail('alex.rivera@yatrago.com');
    setLoginPassword('password123');
    setErrorMessage('');
  };

  // Image Upload handler for Profile Photo
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result;
      if (base64Data) {
        setAvatar(base64Data);
        setSuccessMessage('Photo ready! It will be saved with your profile.');
        setTimeout(() => setSuccessMessage(''), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Browser GPS auto-detection for pickup address
  const handleDetectAddress = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGps(true);
    setErrorMessage('');
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
            if (!homeAddress) setHomeAddress(cleanAddr);
            setSuccessMessage(`GPS location detected: ${cleanAddr}`);
            setTimeout(() => setSuccessMessage(''), 3000);
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
        setErrorMessage('Location permission was denied. You can enter your address manually.');
      },
      { timeout: 8000 }
    );
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

  const strength = getPasswordStrength(activeTab === 'signup' ? signupPassword : newPassword);

  // 1. SUBMIT LOGIN
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const res = await login(loginEmail, loginPassword);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials.');
    } else {
      setSuccessMessage('Logged in successfully!');
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  // 2. SUBMIT SIGN UP
  const handleSubmitSignup = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!signupEmail.trim() || !emailRegex.test(signupEmail.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. rider@example.com).');
      return;
    }

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      setErrorMessage('Please provide a valid contact phone number (at least 7 digits).');
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the YatraGo Transit Safety & Community guidelines.');
      return;
    }

    const payload = {
      name: name.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      phone: phone.trim(),
      address: address.trim() || 'San Francisco, CA',
      homeAddress: homeAddress.trim() || address.trim() || '450 Mission St, SF',
      workAddress: workAddress.trim() || 'Downtown Cyber Hub',
      avatar,
      role,
      emergencyContactName: emergencyName.trim(),
      emergencyContactPhone: emergencyPhone.trim(),
      emergencyContactRelation: emergencyRelation
    };

    const res = await register(payload);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create account.');
    } else {
      setSuccessMessage('Account created! Welcome to YatraGo Mobility.');
      setTimeout(() => {
        onClose();
      }, 600);
    }
  };

  // 3. SUBMIT FORGOT / CHANGE PASSWORD
  const handleSubmitForgot = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail.trim() || !emailRegex.test(forgotEmail.trim())) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match. Please verify.');
      return;
    }

    const res = await forgotPassword(forgotEmail, newPassword);
    if (!res.success) {
      setErrorMessage(res.error || 'Could not reset password.');
    } else {
      setSuccessMessage('Password reset successfully! Please log in with your new credentials.');
      setTimeout(() => {
        setLoginEmail(forgotEmail);
        setLoginPassword('');
        handleSwitchTab('login');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-cyan-500/40 shadow-2xl relative overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-emerald-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl p-1 bg-white border border-cyan-500/40 shadow-md flex items-center justify-center shrink-0">
              <img src={yatraGoLogo} alt="YatraGo Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">YatraGo Access</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30">
                  Secure ID
                </span>
              </div>
              <p className="text-xs text-slate-400">Next-Gen Urban Transit & Pooling Network</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all hover:scale-105"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Switches */}
        <div className="px-6 pt-4 pb-2 relative z-10 flex border-b border-slate-800/60 bg-slate-950/40">
          <div className="grid grid-cols-3 w-full p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
            <button
              type="button"
              onClick={() => handleSwitchTab('login')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('signup')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('forgot')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                activeTab === 'forgot'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Reset Pass
            </button>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5 animate-slideDown shadow-lg">
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-slideDown shadow-lg">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 relative z-10">

          {/* ========================================================= */}
          {/* 1. SIGN IN (LOGIN) VIEW */}
          {/* ========================================================= */}
          {activeTab === 'login' && (
            <form onSubmit={handleSubmitLogin} className="space-y-4">
              
              {/* Quick Demo Login Pill */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-cyan-300 font-medium">
                  <Sparkles size={16} className="text-cyan-400 shrink-0" />
                  <span>Test with Demo Account?</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold transition-all hover:scale-105"
                >
                  Fill Demo (Alex Rivera)
                </button>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Mail size={14} className="text-cyan-400" />
                  <span>Email Address</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. alex.rivera@yatrago.com"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock size={14} className="text-cyan-400" />
                    <span>Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('forgot')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-4 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Keep me logged in on this browser</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Log In to YatraGo</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Footer Switch */}
              <div className="pt-2 text-center text-xs text-slate-400">
                <span>New to YatraGo? </span>
                <button
                  type="button"
                  onClick={() => handleSwitchTab('signup')}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4"
                >
                  Create your rider account
                </button>
              </div>

            </form>
          )}

          {/* ========================================================= */}
          {/* 2. CREATE ACCOUNT (SIGN UP) VIEW */}
          {/* ========================================================= */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSubmitSignup} className="space-y-5">
              
              {/* Profile Photo Uploader & Avatar Selector */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Camera size={14} className="text-cyan-400" />
                    <span>Profile Photo (Upload or Choose)</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">Used for Driver & Co-Rider ID</span>
                </label>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Current Active Preview */}
                  <div className="relative group shrink-0">
                    <img
                      src={avatar}
                      alt="Selected Profile"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-500/50 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-cyan-300 font-bold transition-all"
                    >
                      <Upload size={14} />
                      <span>Change</span>
                    </button>
                  </div>

                  {/* Upload from file button */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Upload size={13} />
                      <span>Upload Photo from Device</span>
                    </button>
                    <span className="text-[10px] text-slate-400 block mt-1">Supports PNG, JPG, WebP up to 8MB</span>
                  </div>
                </div>

                {/* Preset Avatars Row */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">Or select an instant traveler avatar:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(presetUrl)}
                        className={`w-9 h-9 rounded-xl overflow-hidden ring-2 transition-all shrink-0 ${
                          avatar === presetUrl ? 'ring-cyan-400 scale-105 shadow-md shadow-cyan-500/30' : 'ring-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={presetUrl} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personal Details: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User size={14} className="text-cyan-400" />
                    <span>Full Legal Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Mail size={14} className="text-cyan-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="rider@example.com"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Phone & Pickup Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Phone size={14} className="text-cyan-400" />
                    <span>Mobile Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <MapPin size={14} className="text-cyan-400" />
                      <span>Primary Ride Address</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectAddress}
                      disabled={isDetectingGps}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                    >
                      {isDetectingGps ? <RefreshCw size={10} className="animate-spin" /> : <Compass size={10} />}
                      <span>Auto GPS</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street or Tech Park address"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Commute Presets: Home & Work Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin size={14} className="text-emerald-400" />
                    <span>Home Address (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    placeholder="e.g. 450 Mission St, SF"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin size={14} className="text-blue-400" />
                    <span>Work Address (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={workAddress}
                    onChange={(e) => setWorkAddress(e.target.value)}
                    placeholder="e.g. Downtown Cyber Hub"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Emergency SOS Contact (Ride-Sharing Safety Requirement) */}
              <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                    <Shield size={14} className="text-red-400" />
                    <span>Emergency SOS Contact (For Ride Safety)</span>
                  </div>
                  <span className="text-[10px] text-red-400/80 font-mono">Auto-notified on SOS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Contact Name (e.g. Elena)"
                    className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                  />
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Emergency Phone #"
                    className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                  />
                  <select
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                  >
                    <option value="Family">Family</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                  </select>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock size={14} className="text-cyan-400" />
                    <span>Create Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-4 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-cyan-400" />
                    <span>Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className={`w-full bg-slate-900/90 border rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                      confirmPassword && confirmPassword === signupPassword
                        ? 'border-emerald-500/80 focus:ring-1 focus:ring-emerald-400'
                        : 'border-slate-700/80 focus:border-cyan-400'
                    }`}
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              {signupPassword && (
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

              {/* Account Role Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Account Role:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'rider', label: 'Rider / Commuter', icon: User },
                    { id: 'driver', label: 'Driver Partner', icon: Car },
                    { id: 'guider', label: 'City Guider', icon: Compass }
                  ].map(r => {
                    const Icon = r.icon;
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon size={16} className={isSelected ? 'text-cyan-400' : 'text-slate-500'} />
                        <span className="text-[11px]">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>
                    I accept the YatraGo <strong className="text-slate-300">Transit Safety Protocol</strong>, Verified Identity Terms, and zero-tolerance passenger safety guarantee.
                  </span>
                </label>
              </div>

              {/* Submit Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Creating Verified Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete YatraGo Registration</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Footer Switch */}
              <div className="text-center text-xs text-slate-400">
                <span>Already registered with YatraGo? </span>
                <button
                  type="button"
                  onClick={() => handleSwitchTab('login')}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4"
                >
                  Log In directly
                </button>
              </div>

            </form>
          )}

          {/* ========================================================= */}
          {/* 3. FORGOT / CHANGE PASSWORD VIEW */}
          {/* ========================================================= */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleSubmitForgot} className="space-y-4">
              
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2.5">
                <KeyRound size={18} className="text-cyan-400 shrink-0" />
                <span>
                  Enter your registered YatraGo email address and choose a new, secure password.
                </span>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Mail size={14} className="text-cyan-400" />
                  <span>Registered Account Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. alex.rivera@yatrago.com"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock size={14} className="text-cyan-400" />
                  <span>New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-4 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>

              {/* Password Strength */}
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

              {/* Reset Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset & Save New Password</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Return to Sign In */}
              <div className="text-center text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => handleSwitchTab('login')}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4"
                >
                  Return to Sign In
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}

