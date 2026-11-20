import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Car, Bike, Compass, ArrowRight, LocateFixed, Search, X, Loader2 } from 'lucide-react';
import { VEHICLE_TIERS } from '../data/mockData';


// Helper to calculate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

const NEARBY_FALLBACK_DESTS = [
  { name: 'Downtown Cyber Hub', distance: '8.4 km', icon: '🏢', lat: 28.4950, lng: 77.0890, desc: 'Tech corridor & dining plaza' },
  { name: 'Delhi Airport (DEL) T3', distance: '16.2 km', icon: '✈️', lat: 28.5562, lng: 77.1000, desc: 'Indira Gandhi International Airport' },
  { name: 'Cyber City Rapid Metro', distance: '7.8 km', icon: '🚇', lat: 28.4920, lng: 77.0870, desc: 'Rapid Metro Station interchange' },
  { name: 'Ambala Cantt Railway Hub', distance: '14.5 km', icon: '🚉', lat: 30.3340, lng: 76.8370, desc: 'Northern Railway Main Junction' },
  { name: 'Tech Park Central', distance: '6.8 km', icon: '💻', lat: 28.5020, lng: 77.0780, desc: 'Innovation towers & business park' },
  { name: 'Ambience Mall & Promenade', distance: '10.5 km', icon: '🛍️', lat: 28.5040, lng: 77.0970, desc: 'Retail, leisure & entertainment hub' }
];

export default function RideBooking({ 
  onBookRide, 
  pickup, 
  setPickup, 
  selectedDestination, 
  setSelectedDestination, 
  selectedGuider,
  activeRide
}) {
  const isInitialBike = activeRide?.vehicleCategory === 'bike' || 
    activeRide?.vehicleType?.toLowerCase().includes('bike') || 
    activeRide?.vehicleType?.toLowerCase().includes('moto');

  const [vehicleCategory, setVehicleCategory] = useState(isInitialBike ? 'bike' : 'car');
  const [selectedVehicle, setSelectedVehicle] = useState(isInitialBike ? 'moto' : 'eco');
  const [addGuider, setAddGuider] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);

  // Sync category if activeRide changes from parent
  useEffect(() => {
    const isBike = activeRide?.vehicleCategory === 'bike' || 
      activeRide?.vehicleType?.toLowerCase().includes('bike') || 
      activeRide?.vehicleType?.toLowerCase().includes('moto');
    if (isBike) {
      setVehicleCategory('bike');
      setSelectedVehicle('moto');
    } else if (activeRide?.vehicleCategory === 'car') {
      setVehicleCategory('car');
      setSelectedVehicle('eco');
    }
  }, [activeRide?.vehicleCategory, activeRide?.vehicleType]);

  // Search states for Destination
  const [destQuery, setDestQuery] = useState(selectedDestination?.name || '');
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Search states for Pickup
  const [pickupQuery, setPickupQuery] = useState(pickup?.name || '');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);

  const destDropdownRef = useRef(null);
  const pickupDropdownRef = useRef(null);

  const vehicleObj = VEHICLE_TIERS.find(v => v.id === selectedVehicle) || VEHICLE_TIERS[0];

  // Sync inputs when external props update
  useEffect(() => {
    if (selectedDestination?.name) {
      setDestQuery(selectedDestination.name);
    } else {
      setDestQuery('');
    }
  }, [selectedDestination]);

  useEffect(() => {
    if (pickup?.name) {
      setPickupQuery(pickup.name);
    }
  }, [pickup]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (destDropdownRef.current && !destDropdownRef.current.contains(e.target)) {
        setShowDestDropdown(false);
      }
      if (pickupDropdownRef.current && !pickupDropdownRef.current.contains(e.target)) {
        setShowPickupDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search Destination with auto-complete
  useEffect(() => {
    if (!destQuery || destQuery.trim().length < 2) {
      setDestSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDest(true);
      try {
        const proximity = pickup ? `&viewbox=${pickup.lng-0.5},${pickup.lat+0.5},${pickup.lng+0.5},${pickup.lat-0.5}` : '';
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destQuery)}${proximity}&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map(item => {
            const parts = item.display_name.split(',');
            return {
              shortName: parts.slice(0, 2).join(', ').trim(),
              fullName: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            };
          });
          setDestSuggestions(formatted);
          setShowDestDropdown(true);
        }
      } catch (e) {
        // ignore
      } finally {
        setIsSearchingDest(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [destQuery, pickup]);

  // Search Pickup with auto-complete
  useEffect(() => {
    if (!pickupQuery || pickupQuery.trim().length < 2) {
      setPickupSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPickup(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickupQuery)}&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map(item => {
            const parts = item.display_name.split(',');
            return {
              shortName: parts.slice(0, 2).join(', ').trim(),
              fullName: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            };
          });
          setPickupSuggestions(formatted);
          setShowPickupDropdown(true);
        }
      } catch (e) {
        // ignore
      } finally {
        setIsSearchingPickup(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pickupQuery]);

  // Route metrics calculation between pickup and destination
  const pLat = pickup?.lat;
  const pLng = pickup?.lng;
  const dLat = selectedDestination?.lat;
  const dLng = selectedDestination?.lng;

  const hasValidRoute = pLat && pLng && dLat && dLng;
  const rawDistance = hasValidRoute ? calculateDistance(pLat, pLng, dLat, dLng) : 0;
  const isIntercontinental = rawDistance > 1200;
  // Apply urban road factor of 1.28x
  const distanceKm = hasValidRoute 
    ? (isIntercontinental ? Math.round(rawDistance) : Math.max(1.2, Math.round(rawDistance * 1.28 * 10) / 10))
    : 8.5;
  const etaMinutes = Math.max(3, Math.round(distanceKm * 1.5));

  // Fare Calculation (in Indian Rupees ₹)
  const isBike = vehicleCategory === 'bike';
  const basePrice = Math.max(
    isBike ? 35.00 : 60.00,
    Math.round(((isBike ? 25.00 : 50.00) + Math.min(distanceKm, 100) * (isBike ? 9.5 : 16.0)) * (vehicleObj?.multiplier || 1.0))
  );
  const guiderFee = (addGuider || selectedGuider) ? (selectedGuider?.hourlyRate || 350) : 0;
  const totalPrice = (basePrice + guiderFee).toFixed(2);

  // 1-Click GPS Detect Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let addr = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'Accept-Language': 'en' }
          });
          const data = await res.json();
          if (data && data.display_name) {
            addr = data.display_name.split(',').slice(0, 3).join(', ').trim();
          }
        } catch (e) {}

        if (setPickup) {
          setPickup({ name: addr, lat, lng });
        }
        setPickupQuery(addr);
        setLocatingUser(false);
      },
      () => {
        setLocatingUser(false);
      },
      { timeout: 7000 }
    );
  };

  const handleSelectDestSuggestion = (item) => {
    const updated = {
      id: 'dest_' + Date.now(),
      name: item.shortName,
      address: item.fullName,
      lat: item.lat,
      lng: item.lng
    };
    if (setSelectedDestination) setSelectedDestination(updated);
    setDestQuery(item.shortName);
    setShowDestDropdown(false);
  };

  const handleSelectNearbyFallback = (place) => {
    const updated = {
      id: 'dest_' + Date.now(),
      name: place.name,
      address: place.desc || place.name,
      lat: place.lat || 28.5355,
      lng: place.lng || 77.3910
    };
    if (setSelectedDestination) setSelectedDestination(updated);
    setDestQuery(place.name);
    setShowDestDropdown(false);
  };

  const handleSelectCustomDest = (customName) => {
    const trimmed = (customName || '').trim();
    if (!trimmed) return;
    const updated = {
      id: 'dest_' + Date.now(),
      name: trimmed,
      address: trimmed,
      lat: (pickup?.lat || 28.6139) + 0.045,
      lng: (pickup?.lng || 77.2090) + 0.052
    };
    if (setSelectedDestination) setSelectedDestination(updated);
    setDestQuery(trimmed);
    setShowDestDropdown(false);
  };

  const handleSelectPickupSuggestion = (item) => {
    const updated = {
      name: item.shortName,
      lat: item.lat,
      lng: item.lng
    };
    if (setPickup) setPickup(updated);
    setPickupQuery(item.shortName);
    setShowPickupDropdown(false);
  };

  const handleConfirm = () => {
    if (!pickup?.name) {
      alert('Please enter or select a pickup location.');
      return;
    }
    if (!selectedDestination?.name) {
      alert('Please enter or search a destination.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onBookRide({
        pickup,
        destination: selectedDestination,
        vehicleType: vehicleObj.name,
        vehicleCategory,
        guiderId: selectedGuider?._id || selectedGuider?.id || (addGuider ? 'gdr_1' : null),
        guiderFee,
        totalPrice,
        distanceKm: distanceKm || 8.5,
        etaMinutes: etaMinutes || 14
      });
      setIsSubmitting(false);
    }, 600);
  };

  // Quick Local Destination Suggestions
  const quickDestCategories = [
    { label: 'Airport', icon: '✈️' },
    { label: 'Railway Station', icon: '🚆' },
    { label: 'City Center', icon: '🏙️' },
    { label: 'Shopping Mall', icon: '🛍️' },
    { label: 'Hospital', icon: '🏥' }
  ];

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-5 shadow-2xl flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Car className="text-cyan-400" size={20} />
            <span>Plan Your Ride</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Fast, safe & transparent ride booking</p>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">
          Drivers Nearby
        </span>
      </div>

      {/* Input Route Box (Pickup + Destination) */}
      <div className="space-y-2.5 relative">
        {/* Connecting vertical trail line */}
        <div className="absolute left-[18px] top-7 bottom-7 w-0.5 bg-gradient-to-b from-emerald-400 via-cyan-500 to-purple-500 z-0"></div>

        {/* 1. Pickup Input */}
        <div ref={pickupDropdownRef} className="relative z-20">
          <div className="flex items-center gap-3 bg-slate-900/90 hover:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-800 focus-within:border-cyan-500 transition-all shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/40"></span>
            </div>
            
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Pickup</span>
              <input
                type="text"
                value={pickupQuery}
                onChange={(e) => {
                  setPickupQuery(e.target.value);
                  if (setPickup) setPickup(prev => ({ ...prev, name: e.target.value }));
                }}
                onFocus={() => {
                  if (pickupSuggestions.length > 0) setShowPickupDropdown(true);
                }}
                className="w-full bg-transparent text-sm text-slate-100 font-semibold focus:outline-none placeholder:text-slate-500 truncate"
                placeholder="Where to pick you up?"
              />
            </div>

            {isSearchingPickup && <Loader2 size={15} className="animate-spin text-cyan-400 shrink-0" />}

            {pickupQuery && !isSearchingPickup && (
              <button
                type="button"
                onClick={() => {
                  setPickupQuery('');
                  setPickupSuggestions([]);
                  if (setPickup) setPickup(null);
                }}
                className="text-slate-500 hover:text-slate-300 p-1 shrink-0"
              >
                <X size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locatingUser}
              title="Use current GPS location"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 shrink-0 transition-all"
            >
              <LocateFixed size={13} className={locatingUser ? 'animate-spin text-cyan-400' : 'text-cyan-400'} />
              <span>{locatingUser ? 'Locating...' : 'GPS'}</span>
            </button>
          </div>

          {/* Pickup Autocomplete Dropdown */}
          {showPickupDropdown && pickupSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden divide-y divide-slate-800 z-50 animate-fadeIn">
              {pickupSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPickupSuggestion(item)}
                  className="p-3 hover:bg-cyan-950/40 cursor-pointer flex items-center gap-2.5 text-xs transition-colors"
                >
                  <Navigation size={14} className="text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <strong className="text-white block truncate">{item.shortName}</strong>
                    <span className="text-[11px] text-slate-400 block truncate">{item.fullName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Destination Input ("Where to?") */}
        <div ref={destDropdownRef} className="relative z-10">
          <div className="flex items-center gap-3 bg-slate-900/90 hover:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-800 focus-within:border-purple-500 transition-all shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <MapPin size={16} />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block">Where to?</span>
              <input
                type="text"
                value={destQuery}
                onChange={(e) => {
                  setDestQuery(e.target.value);
                  if (setSelectedDestination) setSelectedDestination(prev => ({ ...prev, name: e.target.value }));
                }}
                onFocus={() => {
                  if (destSuggestions.length > 0) setShowDestDropdown(true);
                }}
                className="w-full bg-transparent text-sm text-slate-100 font-semibold focus:outline-none placeholder:text-slate-500 truncate"
                placeholder="Search destination (city, airport, street)..."
              />
            </div>

            {isSearchingDest && <Loader2 size={15} className="animate-spin text-purple-400 shrink-0" />}

            {destQuery && !isSearchingDest && (
              <button
                type="button"
                onClick={() => {
                  setDestQuery('');
                  setDestSuggestions([]);
                  if (setSelectedDestination) setSelectedDestination(null);
                }}
                className="text-slate-500 hover:text-slate-300 p-1 shrink-0"
              >
                <X size={14} />
              </button>
            )}

            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <Search size={14} />
            </div>
          </div>

          {/* Destination Autocomplete Suggestions & Nearby Fallbacks */}
          {showDestDropdown && (
            destSuggestions.length > 0 ? (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden divide-y divide-slate-800 z-50 animate-fadeIn max-h-72 overflow-y-auto no-scrollbar">
                {destSuggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectDestSuggestion(item)}
                    className="p-3 hover:bg-purple-950/40 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin size={14} className="text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="min-w-0">
                        <strong className="text-white block truncate group-hover:text-purple-300 transition-colors">{item.shortName}</strong>
                        <span className="text-[11px] text-slate-400 block truncate">{item.fullName}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-purple-400 font-mono font-bold shrink-0 ml-2">Select ➔</span>
                  </div>
                ))}
              </div>
            ) : (
              destQuery.trim().length >= 2 && !isSearchingDest && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl p-3 z-50 animate-fadeIn space-y-2.5">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Compass size={14} className="text-amber-400 shrink-0" />
                      <span>No exact place found for "{destQuery}"</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      We couldn't locate this exact place. Here are recommended nearby hubs & transit stations:
                    </p>
                  </div>

                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                    Suggested Nearby Places:
                  </span>

                  <div className="space-y-1">
                    {NEARBY_FALLBACK_DESTS.map((place, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectNearbyFallback(place)}
                        className="p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-purple-500/40 cursor-pointer text-xs flex items-center justify-between text-white transition-all group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm shrink-0">{place.icon}</span>
                          <span className="font-bold truncate group-hover:text-purple-300 transition-colors">{place.name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0 ml-2">{place.distance}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleSelectCustomDest(destQuery)}
                      className="w-full text-left p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs text-purple-200 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate">Proceed with custom dropoff: <strong>"{destQuery}"</strong></span>
                      <span className="text-[10px] font-mono text-purple-300 shrink-0 ml-1">Use Custom ➔</span>
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* Quick Destination Ideas */}
      {!selectedDestination?.name && (
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Quick Destination Search:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickDestCategories.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setDestQuery(c.label)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-slate-700 transition-all"
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Route Distance & Drive Time Pill (Shown when valid route exists) */}
      {hasValidRoute && !isIntercontinental && (
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-slate-400">Route:</span>
            <strong className="text-cyan-400 font-mono font-bold">{distanceKm} km</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Est. Time:</span>
            <strong className="text-emerald-400 font-mono font-bold">~{etaMinutes} mins</strong>
          </div>
        </div>
      )}

      {/* Vehicle Category Selector: Bike vs Car */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
            {vehicleCategory === 'bike' ? '🏍️ Select Bike Option' : '🚗 Select Car Option'}
          </label>
          <span className={`text-[10px] font-mono font-bold ${vehicleCategory === 'bike' ? 'text-cyan-400' : 'text-emerald-400'}`}>
            {vehicleCategory === 'bike' ? 'Bike Travel Mode' : 'Car Travel Mode'}
          </span>
        </div>

        {/* Travel Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setVehicleCategory('bike');
              setSelectedVehicle('moto');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              vehicleCategory === 'bike'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike size={15} />
            <span>Motorcycle / Bike</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setVehicleCategory('car');
              setSelectedVehicle('eco');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              vehicleCategory === 'car'
                ? 'bg-white text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car size={15} />
            <span>Car / Sedan / SUV</span>
          </button>
        </div>

        {/* Display ONLY vehicles matching the selected travel category */}
        <div className="space-y-2">
          {VEHICLE_TIERS.filter(v => v.category === vehicleCategory).map(v => {
            const isSelected = selectedVehicle === v.id;
            const cappedDist = Math.min(distanceKm || 10, 100);
            const isBikeMode = vehicleCategory === 'bike';
            const tierPrice = Math.max(
              isBikeMode ? 35.00 : 60.00,
              Math.round(((isBikeMode ? 25.00 : 50.00) + cappedDist * (isBikeMode ? 9.5 : 16.0)) * v.multiplier)
            );

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVehicle(v.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? isBikeMode
                      ? 'bg-gradient-to-r from-cyan-950/70 to-slate-900 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-gradient-to-r from-emerald-950/70 to-slate-900 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected 
                      ? (isBikeMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400') 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isBikeMode ? <Bike size={18} /> : <Car size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{v.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({v.capacity})</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono block">
                      {isBikeMode ? 'Helmet included • ' : ''}ETA ~{v.etaMinutes} mins away
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-white block">₹{tierPrice.toFixed(2)}</span>
                  {isSelected && (
                    <span className={`text-[10px] font-bold block ${isBikeMode ? 'text-cyan-400' : 'text-emerald-400'}`}>
                      Selected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Local Travel Guider Add-on (Simple Toggle) */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
            <Compass size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Include Local Travel Guide</span>
            <span className="text-[10px] text-slate-400">
              {selectedGuider ? `${selectedGuider.name} (+₹${selectedGuider.hourlyRate})` : 'Adds expert guide (+ ₹350.00)'}
            </span>
          </div>
        </div>

        <input
          type="checkbox"
          checked={addGuider || !!selectedGuider}
          onChange={(e) => setAddGuider(e.target.checked)}
          className="w-4 h-4 accent-cyan-500 cursor-pointer rounded"
        />
      </div>

      {/* Prominent Primary Action Button */}
      <div className="pt-2">
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Contacting Nearby Drivers...</span>
            </span>
          ) : (
            <>
              <span>Request {vehicleObj.name} • ₹{totalPrice}</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
