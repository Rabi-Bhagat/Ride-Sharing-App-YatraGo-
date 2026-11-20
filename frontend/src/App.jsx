import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BookRidePage from './pages/BookRidePage';
import StrangerMatcherPage from './pages/StrangerMatcherPage';
import CostSplitterPage from './pages/CostSplitterPage';
import ThreeDestinationPage from './pages/ThreeDestinationPage';
import GuiderDirectoryPage from './pages/GuiderDirectoryPage';
import EmergencySosPage from './pages/EmergencySosPage';
import GroupChatPage from './pages/GroupChatPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DriverPortalPage from './pages/DriverPortalPage';
import GuidePortalPage from './pages/GuidePortalPage';
import BusinessHubPage from './pages/BusinessHubPage';
import AuthPage from './pages/AuthPage';
import UserProfile from './components/UserProfile';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import YatraGoAiAssistant from './components/YatraGoAiAssistant';
import YatraGoFooter from './components/YatraGoFooter';

import { DESTINATIONS_3D } from './data/mockData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { Sparkles } from 'lucide-react';

function MainApp() {
  const { user, authModalOpen, closeAuthModal, openAuthModal } = useAuth();

  // If user is not authenticated, website runs directly from the login or signup page!
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash === 'signup' || hash === 'login' || hash === 'auth' || hash === 'forgot') {
      return hash;
    }
    // If not authenticated, always run from the login page
    if (!user) {
      return 'login';
    }
    if (hash && ['home', 'book', 'stranger', 'cost-split', 'preview-3d', 'guiders', 'sos', 'chat', 'admin', 'driver', 'guide-portal', 'business'].includes(hash)) {
      return hash;
    }
    return 'home';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Keep URL hash in sync with activeTab so browser history and direct paths work
  React.useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  // Listen to browser hash changes
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && hash !== activeTab) {
        if (!user && ['driver', 'guide-portal', 'admin', 'cost-split', 'chat'].includes(hash)) {
          openAuthModal('login', hash);
          setActiveTab('login');
        } else {
          setActiveTab(hash);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab, user]);

  // If user logs out, route immediately to login page
  React.useEffect(() => {
    if (!user && activeTab !== 'login' && activeTab !== 'signup' && activeTab !== 'forgot' && activeTab !== 'auth' && activeTab !== 'home') {
      setActiveTab('login');
    }
  }, [user]);

  const handleNavigateWithTransition = (targetTab, params) => {
    // Protected routes check: redirect to login/auth and return here upon login
    const protectedTabs = ['driver', 'guide-portal', 'admin', 'cost-split', 'chat'];
    if (!user && protectedTabs.includes(targetTab)) {
      openAuthModal('login', targetTab);
      setActiveTab('login');
      return;
    }
    if (params?.pickup) {
      setPickupLocation(typeof params.pickup === 'string' ? { name: params.pickup, lat: 28.4950, lng: 77.0890 } : params.pickup);
    }
    if (params?.destination) {
      setSelectedDestination(typeof params.destination === 'string' ? { name: params.destination, address: params.destination, lat: 28.5562, lng: 77.1000 } : params.destination);
    }
    if (params?.viewMode) {
      setExplore3DView(params.viewMode);
    }
    const isBike = params?.vehicleCategory === 'bike' ||
      params?.vehicleType?.toLowerCase().includes('bike') ||
      params?.vehicleType?.toLowerCase().includes('moto');

    if (isBike) {
      setActiveRide(prev => ({
        ...prev,
        vehicleType: params.vehicleType || 'HyperBike 1200R',
        vehicleCategory: 'bike',
        totalCost: parseFloat(params.fare) || prev.totalCost,
        distanceKm: params.distanceKm || prev.distanceKm,
        driver: {
          name: 'Marcus Vance',
          vehicle: 'HyperBike 1200R (Midnight Black • Helmet Verified)',
          rating: 4.98,
          phone: '+91 98765 43210',
          lat: (params?.pickup?.lat || 28.4950) + 0.005,
          lng: (params?.pickup?.lng || 77.0890) - 0.004
        }
      }));
    } else if (params?.vehicleCategory === 'car') {
      setActiveRide(prev => ({
        ...prev,
        vehicleType: params.vehicleType || 'Eco Sedan',
        vehicleCategory: 'car',
        totalCost: parseFloat(params.fare) || prev.totalCost,
        distanceKm: params.distanceKm || prev.distanceKm,
        driver: {
          name: 'Marcus Vance',
          vehicle: 'Tesla Model Y (Silver Electric Sedan)',
          rating: 4.97,
          phone: '+91 98765 43210',
          lat: (params?.pickup?.lat || 28.4950) + 0.005,
          lng: (params?.pickup?.lng || 77.0890) - 0.004
        }
      }));
    }
    setActiveTab(targetTab);
  };

  const [pickupLocation, setPickupLocation] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedGuider, setSelectedGuider] = useState(null);
  const [explore3DView, setExplore3DView] = useState('google3d');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const { strangerAlertNotification } = useSocket();

  const [activeRide, setActiveRide] = useState({
    _id: 'ride_101',
    pickup: null,
    destination: null,
    riders: [
      {
        userId: 'usr_1',
        name: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
        costShare: 160.00,
        paymentStatus: 'Paid'
      }
    ],
    driver: {
      name: 'Marcus Vance',
      vehicle: 'Tesla Model Y (Silver)',
      rating: 4.97,
      phone: '+1 (555) 888-2311',
      lat: 37.7790,
      lng: -122.4130
    },
    guider: null,
    vehicleType: 'Eco Sedan',
    status: 'In Progress',
    isStrangerCombined: false,
    totalCost: 320.00,
    distanceKm: 8.4,
    etaMinutes: 14
  });

  // Fetch the live active ride for tracking (does not pre-fill the search fields)
  React.useEffect(() => {
    fetch('/api/rides/active')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.ride) {
          setActiveRide(data.ride);
        }
      })
      .catch(() => {});
  }, []);

  const handleBookRide = (bookingDetails) => {
    if (!user) {
      openAuthModal('login', 'book');
      return;
    }
    fetch('/api/rides/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup: bookingDetails.pickup,
        destination: bookingDetails.destination,
        vehicleType: bookingDetails.vehicleType,
        vehicleCategory: bookingDetails.vehicleCategory,
        distanceKm: bookingDetails.distanceKm,
        guiderId: selectedGuider?._id || selectedGuider?.id,
        guiderFee: selectedGuider?.hourlyRate || 0,
        totalCost: parseFloat(bookingDetails.totalPrice),
        riderId: user?._id || user?.id,
        riderName: user?.name,
        riderAvatar: user?.avatar,
        riderVerified: user?.isVerified
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.ride) {
          setActiveRide(data.ride);
        }
      })
      .catch(() => {});

    setActiveRide((prev) => ({
      ...prev,
      pickup: bookingDetails.pickup,
      destination: bookingDetails.destination,
      vehicleType: bookingDetails.vehicleType,
      totalCost: parseFloat(bookingDetails.totalPrice),
      guider: selectedGuider,
      status: 'In Progress'
    }));
    setActiveTab('cost-split');
  };

  const handleCombineSuccess = (updatedRide) => {
    setActiveRide(updatedRide);
    setActiveTab('cost-split');
  };

  const handleSelectLocationForRide = (searchedPlace, targetType = 'destination') => {
    const formattedLoc = {
      id: searchedPlace.id,
      name: searchedPlace.name,
      category: searchedPlace.category || 'Searched Location',
      address: searchedPlace.city,
      lat: searchedPlace.lat,
      lng: searchedPlace.lng,
      description: searchedPlace.description
    };

    if (targetType === 'pickup') {
      setPickupLocation(formattedLoc);
      setActiveRide(prev => ({
        ...prev,
        pickup: formattedLoc
      }));
    } else {
      setSelectedDestination(formattedLoc);
      setActiveRide(prev => ({
        ...prev,
        destination: formattedLoc
      }));
    }

    setActiveTab('book');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Keyboard skip link for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateWithTransition}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Content Page Container with kinetic entrance animation */}
      <main
        id="main-content"
        tabIndex={-1}
        key={activeTab}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter-kinetic focus:outline-none"
      >
        
        {/* Co-Rider Match Notification Banner */}
        {strangerAlertNotification && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 flex items-center justify-between text-xs text-slate-200 animate-slideDown shadow-lg">
            <div className="flex items-center gap-3">
              <Sparkles className="text-emerald-400 shrink-0" size={20} />
              <span>{strangerAlertNotification.message}</span>
            </div>
            <button
              onClick={() => handleNavigateWithTransition('cost-split')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:scale-105 transition-all"
            >
              View Split Fare
            </button>
          </div>
        )}

        {/* Dedicated Page Router */}
        <ErrorBoundary>
          {activeTab === 'home' && (
            <HomePage onNavigate={handleNavigateWithTransition} user={user} />
          )}

          {activeTab === 'book' && (
            <BookRidePage
              onBookRide={handleBookRide}
              pickup={pickupLocation}
              setPickup={setPickupLocation}
              selectedDestination={selectedDestination}
              setSelectedDestination={setSelectedDestination}
              selectedGuider={selectedGuider}
              onOpen3DPreview={(destId) => {
                const dest = DESTINATIONS_3D.find(d => d.id === destId);
                if (dest) setSelectedDestination(dest);
                handleNavigateWithTransition('preview-3d');
              }}
              activeRide={activeRide}
            />
          )}

          {activeTab === 'stranger' && (
            <StrangerMatcherPage
              onCombineSuccess={handleCombineSuccess}
              activeRide={activeRide}
              onNavigate={handleNavigateWithTransition}
            />
          )}

          {activeTab === 'cost-split' && (
            <CostSplitterPage ride={activeRide} />
          )}

          {activeTab === 'preview-3d' && (
            <ThreeDestinationPage
              key={explore3DView}
              initialViewMode={explore3DView}
              initialDestinationId={selectedDestination?.id || 'downtown'}
              onSelectLocationForRide={handleSelectLocationForRide}
            />
          )}

          {activeTab === 'business' && (
            <BusinessHubPage onNavigate={handleNavigateWithTransition} />
          )}

          {activeTab === 'guiders' && (
            <GuiderDirectoryPage selectedGuider={selectedGuider} onSelectGuider={setSelectedGuider} />
          )}

          {activeTab === 'sos' && (
            <EmergencySosPage />
          )}

          {activeTab === 'chat' && (
            <GroupChatPage />
          )}

          {activeTab === 'admin' && (
            <AdminDashboardPage />
          )}

          {activeTab === 'driver' && (
            <DriverPortalPage />
          )}

          {activeTab === 'guide-portal' && (
            <GuidePortalPage onNavigate={handleNavigateWithTransition} />
          )}

          {(activeTab === 'auth' || activeTab === 'login' || activeTab === 'signup' || activeTab === 'forgot') && (
            <AuthPage
              onNavigate={handleNavigateWithTransition}
              initialTab={activeTab === 'signup' ? 'signup' : (activeTab === 'forgot' ? 'forgot' : 'login')}
            />
          )}
        </ErrorBoundary>

      </main>

      {/* Global YatraGo Footer */}
      <YatraGoFooter onNavigate={handleNavigateWithTransition} />

      {/* Persistent AI Travel Assistant (replaces the floating 3D tracker on the home screen) */}
      {user && !['login', 'signup', 'forgot', 'auth'].includes(activeTab) && (
        <YatraGoAiAssistant
          route={{
            pickup: pickupLocation,
            destination: selectedDestination
          }}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfile
          onClose={() => setShowProfileModal(false)}
          onSelectPickupForRide={(loc) => {
            setPickupLocation(loc);
            setActiveRide(prev => ({ ...prev, pickup: loc }));
            setActiveTab('book');
          }}
        />
      )}

      {/* Authentication Modal (Login / Sign Up / Forgot Password) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        onAuthSuccess={(targetTab) => {
          if (targetTab) {
            handleNavigateWithTransition(targetTab);
          }
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <MainApp />
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
