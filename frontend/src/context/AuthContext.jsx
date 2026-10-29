import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'usr_1',
    name: 'Alex Rivera',
    email: 'alex.rivera@yatrago.com',
    phone: '+1 (555) 234-8901',
    role: 'rider', // 'rider', 'guider', 'driver'
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    verificationBadgeType: 'Government ID',
    rating: 4.96,
    tripsCompleted: 64,
    bio: 'Urban explorer & tech product designer. Enthusiast of eco-shuttles and local travel guiders.',
    emergencyContacts: [
      { name: 'Elena Rivera', phone: '+1 (555) 911-0199', relation: 'Sister' },
      { name: 'Marcus Chen', phone: '+1 (555) 432-1098', relation: 'Friend' }
    ]
  });

  const [loading, setLoading] = useState(false);

  // Fetch initial profile from REST API
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      })
      .catch(err => console.log('Using local user context state'));
  }, []);

  const toggleVerification = () => {
    const updated = { ...user, isVerified: !user.isVerified };
    setUser(updated);
    fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVerified: !user.isVerified })
    }).catch(() => {});
  };

  const switchRole = (newRole) => {
    const updated = { ...user, role: newRole };
    setUser(updated);
    fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    }).catch(() => {});
  };

  const updateUserProfile = async (partialData) => {
    const updated = { ...user, ...partialData };
    setUser(updated);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.warn('Profile update synced locally');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUserProfile, toggleVerification, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
