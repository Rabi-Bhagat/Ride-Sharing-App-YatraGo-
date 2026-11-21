import React, { useState, useEffect, useMemo } from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, ArrowRight, X, Compass, Car, MapPin, Loader2, Check, KeyRound, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { preloadGoogleAuth } from '../utils/googleAuth';
import yatraGoLogo from '../logo/yatrago-logo.webp';

// Google Official SVG Icon
function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const { 
    login, 
    register, 
    loginWithGoogle,
    forgotPassword, 
    sendResetCode,
    verifyResetCode,
    loading, 
    authModalTab, 
    setAuthModalTab 
  } = useAuth();

  // Active view: 'login' | 'signup' | 'forgot'
  const activeTab = (authModalTab === 'otp' ? 'login' : authModalTab) || 'login';
  const setActiveTab = (tab) => setAuthModalTab(tab);

  // Form states - Sign In
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states - Sign Up
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('traveler'); // 'traveler', 'driver', 'guide'
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Form states - Forgot / Reset Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [previousCode, setPreviousCode] = useState('');
  const [showPreviousCode, setShowPreviousCode] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [codeSentMessage, setCodeSentMessage] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Feedback notifications
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Preload Google Identity Services so the account-chooser popup opens on click
  useEffect(() => {
    if (isOpen) preloadGoogleAuth();
  }, [isOpen]);

  // Clear messages when switching tabs
  const handleSwitchTab = (tab) => {
    setErrorMessage('');
    setSuccessMessage('');
    setActiveTab(tab);
  };

  // Live Password Strength Calculation
  const passwordStrength = useMemo(() => {
    const pass = activeTab === 'signup' ? signupPassword : newPassword;
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700', textCol: 'text-slate-500', width: '0%' };

    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) {
      return { score: 1, label: 'Weak', color: 'bg-red-500', textCol: 'text-red-400', width: '33%' };
    } else if (score <= 3) {
      return { score: 2, label: 'Medium', color: 'bg-amber-500', textCol: 'text-amber-400', width: '66%' };
    } else {
      return { score: 3, label: 'Strong', color: 'bg-emerald-500', textCol: 'text-emerald-400', width: '100%' };
    }
  }, [activeTab, signupPassword, newPassword]);

  // 1. Submit Sign In
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your email or mobile phone number.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const res = await login(loginIdentifier.trim(), loginPassword, rememberMe);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials.');
    } else {
      setSuccessMessage(res.message || 'Login successful!');
      if (onAuthSuccess && res.nextRoute) {
        onAuthSuccess(res.nextRoute, res.user);
      }
      setTimeout(() => {
        if (onClose) onClose();
      }, 350);
    }
  };

  // 2. Submit Sign Up
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter your full legal name (at least 2 characters).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!signupEmail.trim() || !emailRegex.test(signupEmail.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. rider@example.com).');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile phone number.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please agree to YatraGo Terms of Service & Privacy Policy.');
      return;
    }

    const formData = {
      name: name.trim(),
      email: signupEmail.trim().toLowerCase(),
      phone: phone.trim(),
      password: signupPassword,
      role: selectedRole,
      address: 'Innovation Tech Park, SF',
      homeAddress: '450 Mission St, San Francisco, CA',
      workAddress: 'Downtown Cyber Hub'
    };

    const res = await register(formData);
    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed.');
    } else {
      setSuccessMessage('Account created successfully! Welcome to YatraGo.');
      if (onAuthSuccess && res.nextRoute) {
        onAuthSuccess(res.nextRoute, res.user);
      }
      setTimeout(() => {
        if (onClose) onClose();
      }, 400);
    }
  };

  // 3. Submit Google SSO
  const handleGoogleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    const res = await loginWithGoogle(selectedRole);
    if (!res.success) {
      setErrorMessage(res.error || 'Google sign-in failed. Please try again.');
      return;
    }
    setSuccessMessage(res.message || 'Signed in with Google successfully!');
    if (onAuthSuccess && res.nextRoute) {
      onAuthSuccess(res.nextRoute, res.user);
    }
    setTimeout(() => {
      if (onClose) onClose();
    }, 350);
  };

  // 4. Send Verification Code to Registered Email
  const handleSendResetCode = async () => {
    setErrorMessage('');
    setCodeSentMessage('');
    setCodeVerified(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail.trim() || !emailRegex.test(forgotEmail.trim())) {
      setErrorMessage('Please enter your valid registered email address first.');
      return;
    }
    setCodeSending(true);
    const res = await sendResetCode(forgotEmail.trim());
    setCodeSending(false);
    if (res.success) {
      setCodeSentMessage(res.message || '6-digit verification code sent to your email! Please check your inbox.');
      setSuccessMessage('Verification code sent to ' + forgotEmail.trim());
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to dispatch code. Please check email address.');
    }
  };

  // 4.6 Verify the code before revealing the new-password step
  const handleVerifyResetCode = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail.trim() || !emailRegex.test(forgotEmail.trim())) {
      setErrorMessage('Please enter your registered email address first.');
      return;
    }
    if (!previousCode.trim()) {
      setErrorMessage('Please enter the 6-digit code or your previous password.');
      return;
    }
    setVerifyingCode(true);
    const res = await verifyResetCode(forgotEmail.trim(), previousCode.trim());
    setVerifyingCode(false);
    if (!res.success) {
      setCodeVerified(false);
      setErrorMessage(res.error || 'Invalid or expired verification code.');
      return;
    }
    setCodeVerified(true);
    setSuccessMessage('Code verified! Create your new password below.');
  };

  // 5. Submit Forgot / Reset Password
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!codeVerified) {
      setErrorMessage('Please verify your code before resetting your password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail.trim() || !emailRegex.test(forgotEmail.trim())) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }
    if (!previousCode.trim()) {
      setErrorMessage('Please enter your previous password or verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match. Please recheck.');
      return;
    }

    const res = await forgotPassword(forgotEmail.trim(), previousCode.trim(), newPassword);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to reset password.');
    } else {
      setSuccessMessage(res.message || 'Password reset successfully! Redirecting to Sign In...');
      setTimeout(() => {
        setActiveTab('login');
        setLoginIdentifier(forgotEmail.trim());
        setLoginPassword(newPassword);
        setPreviousCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 1500);
    }
  };



  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* ======================================================== */}
          {/* LEFT PANEL (DESKTOP): BRAND SHOWCASE & TRUST BADGES       */}
          {/* ======================================================== */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/50 border-r border-slate-800/80 relative overflow-hidden">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header Brand */}
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white p-1 border border-cyan-400/40 shadow-md flex items-center justify-center shrink-0">
                  <img src={yatraGoLogo} alt="YatraGo Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList?.add('img-fallback'); }} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black text-white tracking-tight">YatraGo</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider">RIDE • SHARE • EXPLORE</p>
                </div>
              </div>

              <div className="pt-2">
                <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  Smart Urban & Highway Mobility Network
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Join verified riders, experienced highway drivers, and certified local guides across India.
                </p>
              </div>
            </div>

            {/* 3 Trust Badges */}
            <div className="relative z-10 space-y-3.5 my-6">
              
              {/* Trust Badge 1 */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-start gap-3 backdrop-blur-sm shadow-sm hover:border-cyan-500/30 transition-all">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shrink-0 mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-white block">Verified Riders & Guides</strong>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Mandatory Government ID badge and photo verification for 100% community safety.
                  </p>
                </div>
              </div>

              {/* Trust Badge 2 */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-start gap-3 backdrop-blur-sm shadow-sm hover:border-emerald-500/30 transition-all">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0 mt-0.5">
                  <Sparkles size={18} />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-white block">Smart Cost Splitting</strong>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Save up to 44% on highway & airport corridors with automated Razorpay & UPI escrow pooling.
                  </p>
                </div>
              </div>

              {/* Trust Badge 3 */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-start gap-3 backdrop-blur-sm shadow-sm hover:border-red-500/30 transition-all">
                <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25 shrink-0 mt-0.5">
                  <HeartHandshake size={18} />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-white block">24/7 SOS Safety Guardians</strong>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Live GPS telemetry, instant family tracking links, and 3-second rapid emergency dispatch.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT PANEL: DISTRACTION-FREE AUTH FORM CONTAINER         */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            
            {/* Top Bar: Segmented Pill Switcher */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('login')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'login'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('signup')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'signup'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Toast Messages */}
              {errorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start justify-between gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="text-red-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <button onClick={() => setErrorMessage('')} className="text-red-400 hover:text-red-200">
                    <X size={14} />
                  </button>
                </div>
              )}

              {successMessage && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start justify-between gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                  <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-emerald-200">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Google SSO Button */}
              {activeTab !== 'forgot' && (
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSubmit}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2.5 shadow-sm group cursor-pointer disabled:opacity-50"
                  >
                    <GoogleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{loading ? 'Opening Google…' : 'Continue with Google'}</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-800"></div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                      or continue with email
                    </span>
                    <div className="flex-1 h-px bg-slate-800"></div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 1: SIGN IN FORM                                 */}
              {/* ==================================================== */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Email or Mobile Phone
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        autoComplete="username"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="Enter your email to sign in"
                        className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSwitchTab('forgot')}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-medium cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-10 pl-10 pr-10 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        tabIndex={-1}
                      >
                        {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-[11px] text-slate-300">Remember me for 30 days</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-slate-950" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to YatraGo</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ==================================================== */}
              {/* VIEW 2: SIGN UP FORM WITH INTERACTIVE ROLE CARDS     */}
              {/* ==================================================== */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignupSubmit} autoComplete="off" className="mt-4 space-y-3.5">
                  
                  {/* Interactive Role Selection Cards */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                      I want to join YatraGo as:
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      
                      {/* Role 1: Traveler */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole('traveler')}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedRole === 'traveler'
                            ? 'bg-cyan-500/15 border-cyan-400 ring-1 ring-cyan-400/40 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Compass size={16} className={selectedRole === 'traveler' ? 'text-cyan-400' : 'text-slate-400'} />
                          {selectedRole === 'traveler' && <Check size={12} className="text-cyan-400" />}
                        </div>
                        <strong className="text-xs font-bold block text-white">Traveler</strong>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          Book rides & split costs
                        </p>
                      </button>

                      {/* Role 2: Driver / Rider */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole('driver')}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedRole === 'driver'
                            ? 'bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-400/40 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Car size={16} className={selectedRole === 'driver' ? 'text-emerald-400' : 'text-slate-400'} />
                          {selectedRole === 'driver' && <Check size={12} className="text-emerald-400" />}
                        </div>
                        <strong className="text-xs font-bold block text-white">Rider / Driver</strong>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          Offer rides & share routes
                        </p>
                      </button>

                      {/* Role 3: Local Guide / Host */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole('guide')}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedRole === 'guide'
                            ? 'bg-purple-500/15 border-purple-400 ring-1 ring-purple-400/40 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <MapPin size={16} className={selectedRole === 'guide' ? 'text-purple-400' : 'text-slate-400'} />
                          {selectedRole === 'guide' && <Check size={12} className="text-purple-400" />}
                        </div>
                        <strong className="text-xs font-bold block text-white">Local Guide</strong>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          Guide tourists & stays
                        </p>
                      </button>

                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          autoComplete="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="Enter your email to sign up"
                          className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Mobile Phone Number
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number to sign up"
                          className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Live Strength Meter */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Create Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        name="new-password"
                        autoComplete="new-password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="At least 6 characters with letters & numbers"
                        className="w-full h-10 pl-10 pr-10 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        tabIndex={-1}
                      >
                        {showSignupPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Live Strength Meter Bar */}
                    {signupPassword && (
                      <div className="mt-2 space-y-1 animate-fadeIn">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-mono">Password Strength:</span>
                          <span className={`font-bold ${passwordStrength.textCol}`}>{passwordStrength.label}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${passwordStrength.color}`} 
                            style={{ width: passwordStrength.width }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 mt-0.5"
                      />
                      <span className="text-[11px] text-slate-400 leading-tight">
                        I agree to the <span className="text-cyan-400 underline">Terms of Service</span>, <span className="text-cyan-400 underline">Community Guidelines</span>, and consent to safety telemetry.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-slate-950" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account as {selectedRole.toUpperCase()}</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ==================================================== */}
              {/* VIEW 3: FORGOT / RESET PASSWORD                      */}
              {/* ==================================================== */}
              {activeTab === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3.5">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300">
                    Enter your registered email, previous password (or 6-digit email code), and your new password.
                  </div>

                  {/* Registered Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => { setForgotEmail(e.target.value); setCodeVerified(false); }}
                        placeholder="rider@example.com"
                        className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Previous Password or Code */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-300">
                        Previous Password or Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={handleSendResetCode}
                        disabled={codeSending}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {codeSending ? 'Sending...' : 'Send Code to Email'}
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPreviousCode ? 'text' : 'password'}
                        autoComplete="one-time-code"
                        value={previousCode}
                        onChange={(e) => { setPreviousCode(e.target.value); setCodeVerified(false); }}
                        placeholder="Enter previous password or 6-digit code"
                        className="w-full h-10 pl-10 pr-10 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none transition-all font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPreviousCode(!showPreviousCode)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPreviousCode ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {codeSentMessage && (
                      <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>{codeSentMessage}</span>
                      </p>
                    )}

                    {/* Verify code gate */}
                    <div className="mt-2">
                      {codeVerified ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2 py-1">
                          <CheckCircle2 size={12} /> Code verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleVerifyResetCode}
                          disabled={verifyingCode || !previousCode.trim()}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {verifyingCode ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                          {verifyingCode ? 'Verifying…' : 'Verify Code'}
                        </button>
                      )}
                    </div>
                  </div>

                  {codeVerified ? (
                    <div className="space-y-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300">
                        <ShieldCheck size={13} /> Create your new password
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter minimum 6 characters"
                            className="w-full h-10 pl-10 pr-10 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                            tabIndex={-1}
                          >
                            {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="password"
                            autoComplete="new-password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
                      <KeyRound size={12} className="text-cyan-400 shrink-0" />
                      <span>Verify your code above to unlock the new password fields.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleSwitchTab('login')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-bold cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !codeVerified}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-slate-950" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password & Send Alert</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}



            </div>

            {/* Bottom Switch Links */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
              {activeTab === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('signup')}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline transition-colors cursor-pointer"
                  >
                    Sign Up for Free
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('login')}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
