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
import UserProfile from './components/UserProfile';
import ErrorBoundary from './components/ErrorBoundary';
import RideTransitionOverlay from './components/RideTransitionOverlay';
import FloatingRideTracker from './components/FloatingRideTracker';

import { DESTINATIONS_3D } from './data/mockData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { Sparkles } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'book', 'stranger', 'cost-split', 'preview-3d', 'guiders', 'sos', 'chat'
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionFromTab, setTransitionFromTab] = useState('home');
  const [transitionToTab, setTransitionToTab] = useState('home');

  const handleNavigateWithTransition = (targetTab) => {
    if (targetTab === activeTab) return;
    setTransitionFromTab(activeTab);
    setTransitionToTab(targetTab);
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(targetTab);
    }, 280);
  };

  const [pickupLocation, setPickupLocation] = useState({
    name: 'Innovation Tech Park, SF',
    lat: 37.7749,
    lng: -122.4194
  });
  const [selectedDestination, setSelectedDestination] = useState(DESTINATIONS_3D[0]);
  const [selectedGuider, setSelectedGuider] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const { strangerAlertNotification } = useSocket();
  const { user } = useAuth();

  const [activeRide, setActiveRide] = useState({
    _id: 'ride_101',
    pickup: { name: 'Innovation Tech Park, SF', lat: 37.7749, lng: -122.4194 },
    destination: DESTINATIONS_3D[0],
    riders: [
      {
        userId: 'usr_1',
        name: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
        costShare: 16.50,
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
    totalCost: 33.00,
    distanceKm: 8.4,
    etaMinutes: 14
  });

  // Fetch initial live active ride from MongoDB Atlas
  React.useEffect(() => {
    fetch('/api/rides/active')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.ride) {
          setActiveRide(data.ride);
          if (data.ride.pickup) {
            setPickupLocation(data.ride.pickup);
          }
          if (data.ride.destination) {
            const matchDest = DESTINATIONS_3D.find(d => d.id === data.ride.destination.preview3DId || d.name === data.ride.destination.name);
            if (matchDest) setSelectedDestination(matchDest);
          }
        }
      })
      .catch(() => {});

    // Auto-detect browser GPS location on load for seamless local experience
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
              headers: { 'Accept-Language': 'en' }
            });
            const data = await res.json();
            if (data && data.display_name) {
              const addr = data.display_name.split(',').slice(0, 3).join(', ').trim();
              setPickupLocation({ name: addr, lat, lng });
            }
          } catch (e) {}
        },
        () => {},
        { timeout: 8000 }
      );
    }
  }, []);

  const handleBookRide = (bookingDetails) => {
    fetch('/api/rides/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup: bookingDetails.pickup,
        destination: bookingDetails.destination,
        vehicleType: bookingDetails.vehicleType,
        guiderId: selectedGuider?._id || selectedGuider?.id,
        guiderFee: selectedGuider?.hourlyRate || 0,
        totalCost: parseFloat(bookingDetails.totalPrice)
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
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateWithTransition}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Content Page Container with kinetic entrance animation */}
      <main key={activeTab} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter-kinetic">
        
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
          <StrangerMatcherPage onCombineSuccess={handleCombineSuccess} activeRide={activeRide} />
        )}

        {activeTab === 'cost-split' && (
          <CostSplitterPage ride={activeRide} />
        )}

        {activeTab === 'preview-3d' && (
          <ErrorBoundary>
            <ThreeDestinationPage
              initialDestinationId={selectedDestination?.id || 'downtown'}
              onSelectLocationForRide={handleSelectLocationForRide}
            />
          </ErrorBoundary>
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

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <p>© 2026 YatraGo Mobility • Next-Generation Ride Sharing</p>
      </footer>

      {/* 3D Ride Kinetic Page Transition Overlay */}
      <RideTransitionOverlay
        isTransitioning={isTransitioning}
        fromTab={transitionFromTab}
        toTab={transitionToTab}
        onTransitionComplete={() => setIsTransitioning(false)}
      />

      {/* Persistent Floating 3D Ride Companion */}
      <FloatingRideTracker
        onNavigate={handleNavigateWithTransition}
        activeRide={activeRide}
      />

      {/* Profile Modal */}
      {showProfileModal && <UserProfile onClose={() => setShowProfileModal(false)} />}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainApp />
      </SocketProvider>
    </AuthProvider>
  );
}
