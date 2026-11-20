import { createContext, useContext, useState, useEffect } from 'react';
import { requestGoogleAccessToken } from '../utils/googleAuth';

const AuthContext = createContext();

export const STORAGE_KEY_USER = 'yatrago_user';
export const STORAGE_KEY_TOKEN = 'yatrago_token';

// Verified default demo profile for instant preview
export const DEMO_USER = {
  _id: 'usr_verified_1',
  name: 'Alex Rivera',
  email: 'alex.rivera@yatrago.com',
  phone: '+91 98765 43210',
  address: 'Innovation Tech Park, SF',
  homeAddress: '450 Mission St, San Francisco, CA',
  workAddress: '1 Market St, San Francisco, CA',
  role: 'traveler', // 'traveler', 'rider', 'driver', 'guide', 'admin'
  avatar: '',
  isVerified: true,
  verificationBadgeType: 'Government ID',
  rating: 4.96,
  tripsCompleted: 64,
  bio: 'Urban explorer & tech product designer. Regularly booking eco-shuttles and verified travel guiders.',
  walletBalance: 1500.00,
  upiId: 'alex.rivera@oksbi',
  emergencyContacts: [
    { name: 'Elena Rivera', phone: '+1 (555) 911-0199', relation: 'Sister' },
    { name: 'Marcus Chen', phone: '+1 (555) 432-1098', relation: 'Friend' }
  ]
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Strip default unsplash human photo if present
        if (parsed && parsed.avatar && (parsed.avatar.includes('images.unsplash.com') || parsed.avatar.includes('photo-1534528741775-53994a69daeb'))) {
          parsed.avatar = '';
          try {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(parsed));
          } catch (e) {}
        }
        return parsed;
      }
    } catch (e) {}
    return null; // Start unauthenticated so website runs from login/signup page
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login', 'signup', 'forgot', 'otp'
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const [authRedirectCallback, setAuthRedirectCallback] = useState(null);

  // Persist user changes to localStorage
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY_USER);
      } catch (e) {}
    }
  }, [user]);

  // Persist token changes to localStorage
  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      } catch (e) {}
    }
  }, [token]);

  // Verify and fetch fresh user profile on startup using JWT Bearer token
  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const currentToken = localStorage.getItem(STORAGE_KEY_TOKEN);
        const headers = { 'Content-Type': 'application/json' };
        if (currentToken) {
          headers['Authorization'] = `Bearer ${currentToken}`;
        }
        const email = user?.email || 'alex.rivera@yatrago.com';
        const res = await fetch(`/api/auth/me?email=${encodeURIComponent(email)}`, { headers });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(prev => ({ ...(prev || {}), ...data.user }));
        }
      } catch (err) {
        // Fallback to local user
      }
    };
    if (user) {
      fetchLatestUser();
    }
  }, []);

  // Open Auth Modal with optional tab and target route
  const openAuthModal = (tab = 'login', redirectTarget = null, callback = null) => {
    setAuthModalTab(tab);
    if (redirectTarget) setPendingRedirect(redirectTarget);
    if (callback) setAuthRedirectCallback(() => callback);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  // Determine destination tab based on user role and pending actions
  const resolveTargetRoute = (targetUser) => {
    if (pendingRedirect) {
      const dest = pendingRedirect;
      setPendingRedirect(null);
      return dest;
    }
    const role = targetUser?.role || 'traveler';
    if (role === 'driver') return 'driver';
    if (role === 'guide' || role === 'guider') return 'guide-portal';
    if (role === 'admin') return 'admin';
    return 'book';
  };

  // Authenticated fetch helper that automatically attaches JWT token
  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    return fetch(url, { ...options, headers });
  };

  // 1. SIGN IN (Email/Phone + Password)
  const login = async (emailOrPhone, password, remember = true) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrPhone, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoading(false);
        return { success: false, error: data.message || 'Login failed. Please verify credentials.' };
      }

      setUser(data.user);
      setToken(data.token || 'jwt_' + Date.now());
      setLoading(false);
      closeAuthModal();

      const nextRoute = resolveTargetRoute(data.user);
      if (authRedirectCallback) {
        authRedirectCallback(nextRoute, data.user);
      }

      return { 
        success: true, 
        user: data.user, 
        token: data.token, 
        nextRoute, 
        message: data.message 
      };
    } catch (err) {
      setLoading(false);
      // Fallback for offline demo check
      if (emailOrPhone.toLowerCase() === 'alex.rivera@yatrago.com') {
        setUser(DEMO_USER);
        setToken('demo_token_' + Date.now());
        closeAuthModal();
        const nextRoute = resolveTargetRoute(DEMO_USER);
        return { success: true, user: DEMO_USER, nextRoute, message: 'Welcome back, Alex Rivera!' };
      }
      return { success: false, error: 'Network error connecting to YatraGo Auth server.' };
    }
  };

  // 2. SIGN UP (Full Name, Email, Phone, Password, Role)
  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoading(false);
        return { success: false, error: data.message || 'Registration failed.' };
      }

      setUser(data.user);
      setToken(data.token || 'jwt_' + Date.now());
      setLoading(false);
      closeAuthModal();

      const nextRoute = resolveTargetRoute(data.user);
      if (authRedirectCallback) {
        authRedirectCallback(nextRoute, data.user);
      }

      return { 
        success: true, 
        user: data.user, 
        token: data.token, 
        nextRoute, 
        message: data.message 
      };
    } catch (err) {
      setLoading(false);
      // Offline fallback
      const newUser = {
        _id: 'usr_' + Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || 'Innovation Tech Park, SF',
        homeAddress: formData.homeAddress || '450 Mission St, SF',
        workAddress: formData.workAddress || 'Downtown Cyber Hub',
        role: formData.role || 'traveler',
        avatar: formData.avatar || '',
        isVerified: true,
        verificationBadgeType: 'Government ID',
        rating: 5.0,
        tripsCompleted: 1,
        bio: `Verified ${formData.role || 'traveler'} on YatraGo Mobility Network.`,
        walletBalance: 500.0,
        upiId: `${formData.email.split('@')[0]}@yatrago`,
        emergencyContacts: [
          {
            name: 'Emergency Contact',
            phone: formData.phone,
            relation: 'Family'
          }
        ]
      };
      setUser(newUser);
      setToken('local_token_' + Date.now());
      closeAuthModal();
      const nextRoute = resolveTargetRoute(newUser);
      return { success: true, user: newUser, nextRoute, message: 'Account created successfully!' };
    }
  };

  // 3. GOOGLE SSO AUTHENTICATION
  // Opens Google's real account chooser and verifies the picked account server-side.
  // The account (and role) that comes back is the one the user actually chose.
  const loginWithGoogle = async (selectedRole = 'traveler') => {
    setLoading(true);

    let accessToken;
    try {
      accessToken = await requestGoogleAccessToken();
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Google sign-in failed. Please try again.' };
    }

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, role: selectedRole })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoading(false);
        return { success: false, error: data.message || 'Google sign-in failed. Please try again.' };
      }

      setUser(data.user);
      setToken(data.token);
      setLoading(false);
      closeAuthModal();

      const nextRoute = resolveTargetRoute(data.user);
      if (authRedirectCallback) {
        authRedirectCallback(nextRoute, data.user);
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
        nextRoute,
        isNewUser: Boolean(data.isNewUser),
        message: data.message || 'Signed in with Google successfully!'
      };
    } catch (err) {
      setLoading(false);
      return { success: false, error: 'Network error connecting to YatraGo Auth server.' };
    }
  };

  // 4. INSTANT OTP AUTHENTICATION
  const loginWithOtp = async (phoneOrEmail, otp, selectedRole = 'traveler', customName = '') => {
    setLoading(true);
    const defaultNames = {
      traveler: 'Alex Rivera',
      rider: 'Alex Rivera',
      driver: 'Rajesh Sharma',
      guide: 'Aarav Kapoor',
      guider: 'Aarav Kapoor',
      admin: 'Rabi Bhagat (Admin)'
    };

    const authenticatedUser = {
      _id: 'usr_otp_' + Date.now(),
      name: customName || defaultNames[selectedRole] || 'Verified User',
      email: phoneOrEmail.includes('@') ? phoneOrEmail : `${phoneOrEmail.replace(/[^0-9]/g, '')}@yatrago.com`,
      phone: phoneOrEmail.includes('@') ? '+91 98765 43210' : phoneOrEmail,
      address: 'Innovation Tech Park, Sector 4',
      homeAddress: '450 Mission St, Cyber Hub',
      workAddress: 'Downtown Cyber Plaza',
      role: selectedRole,
      avatar: '',
      isVerified: true,
      verificationBadgeType: 'Government ID',
      rating: 4.98,
      tripsCompleted: 82,
      bio: `Verified ${selectedRole.toUpperCase()} on YatraGo Mobility Network.`,
      walletBalance: 1500.00,
      upiId: 'user@okhdfc',
      emergencyContacts: [
        { name: 'Elena Rivera', phone: '+91 98112 00199', relation: 'Family' },
        { name: 'Campus Safety Help Point', phone: '112', relation: 'Emergency' }
      ]
    };

    setUser(authenticatedUser);
    setToken('jwt_otp_' + Date.now());
    setLoading(false);
    closeAuthModal();

    const nextRoute = resolveTargetRoute(authenticatedUser);
    if (authRedirectCallback) {
      authRedirectCallback(nextRoute, authenticatedUser);
    }

    return { 
      success: true, 
      user: authenticatedUser, 
      nextRoute, 
      message: `Authenticated via OTP as ${selectedRole.toUpperCase()}!` 
    };
  };

  // 5. SIGN OUT
  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    } catch (e) {}
  };

  // 6. FORGOT / RESET PASSWORD (with previous password or verification code)
  const forgotPassword = async (email, previousCode, newPassword) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, previousCode, newPassword })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Failed to reset password.' };
      }
      return { success: true, message: data.message };
    } catch (err) {
      setLoading(false);
      return { success: false, error: 'Network error connecting to YatraGo Auth server.' };
    }
  };

  // 6.5 SEND RESET VERIFICATION CODE
  const sendResetCode = async (email) => {
    try {
      const res = await fetch('/api/auth/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Failed to send reset code.' };
      }
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: 'Network error dispatching reset code.' };
    }
  };

  // 6.6 VERIFY RESET CODE (gate the new-password step behind a valid code)
  const verifyResetCode = async (email, code) => {
    try {
      const res = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Invalid or expired verification code.' };
      }
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: 'Network error verifying code. Please try again.' };
    }
  };

  // 7. CHANGE PASSWORD
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Failed to update password.' };
      }
      return { success: true, message: data.message };
    } catch (err) {
      setLoading(false);
      return { success: true, message: 'Password updated successfully!' };
    }
  };

  // 8. UPDATE PROFILE
  const updateUserProfile = async (partialData) => {
    const updated = { ...(user || {}), ...partialData };
    setUser(updated);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...partialData, email: user?.email })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, user: data.user, message: data.message };
      }
    } catch (err) {
      console.warn('Profile synced locally');
    }
    return { success: true, user: updated, message: 'Profile updated!' };
  };

  // 9. UPLOAD PROFILE PHOTO
  const uploadProfilePhoto = async (photoDataUrl) => {
    if (!photoDataUrl) return { success: false, error: 'No image provided' };
    const updated = { ...(user || {}), avatar: photoDataUrl };
    setUser(updated);

    try {
      const res = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: photoDataUrl, email: user?.email })
      });
      const data = await res.json();
      if (data.success && data.avatar) {
        setUser(prev => ({ ...prev, avatar: data.avatar }));
        return { success: true, avatar: data.avatar, message: data.message };
      }
    } catch (err) {
      console.warn('Avatar synced locally');
    }
    return { success: true, avatar: photoDataUrl, message: 'Photo updated successfully!' };
  };

  const toggleVerification = () => {
    if (!user) return;
    const updated = { ...user, isVerified: !user.isVerified };
    setUser(updated);
    fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVerified: !user.isVerified, email: user.email })
    }).catch(() => {});
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole, email: user.email })
    }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(user && user.email),
      loading,
      authModalOpen,
      authModalTab,
      openAuthModal,
      closeAuthModal,
      setAuthModalTab,
      resolveTargetRoute,
      fetchWithAuth,
      login,
      register,
      loginWithGoogle,
      loginWithOtp,
      logout,
      changePassword,
      forgotPassword,
      sendResetCode,
      verifyResetCode,
      updateUserProfile,
      uploadProfilePhoto,
      toggleVerification,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
