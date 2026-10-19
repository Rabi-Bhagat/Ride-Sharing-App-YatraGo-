import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MapPin, Globe, Compass, Box, Eye, RotateCw, 
  Sparkles, CheckCircle2, Layers, Navigation, ArrowRight, Shield, LocateFixed, Loader2 
} from 'lucide-react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

// Preset Famous 3D Destinations Database for instant search suggestions
export const GLOBAL_3D_PLACES = [
  {
    id: 'sf_financial',
    name: 'Financial District & SalesForce Tower',
    city: 'San Francisco, CA',
    country: 'USA',
    lat: 37.7897,
    lng: -122.3972,
    zoom: 17,
    pitch: 60,
    category: 'Tech & Business Hub',
    description: 'Towering 3D skyscrapers, transit center sky park, and ambient coastal fog.',
    previewImage: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'nyc_times_square',
    name: 'Times Square & Midtown Cyber Plaza',
    city: 'New York, NY',
    country: 'USA',
    lat: 40.7580,
    lng: -73.9855,
    zoom: 17,
    pitch: 60,
    category: 'Commercial & Entertainment',
    description: 'High-density 3D digital billboards, Broadway avenues, and glowing streetscapes.',
    previewImage: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'paris_eiffel',
    name: 'Eiffel Tower & Champ de Mars',
    city: 'Paris',
    country: 'France',
    lat: 48.8584,
    lng: 2.2945,
    zoom: 17,
    pitch: 60,
    category: 'Historic Landmark',
    description: 'World-famous 300m wrought-iron lattice 3D landmark with manicured gardens.',
    previewImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'tokyo_shibuya',
    name: 'Shibuya Scramble & Sky Tower',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6595,
    lng: 139.7005,
    zoom: 17,
    pitch: 65,
    category: 'Futuristic Metropolis',
    description: 'World-famous 3D scramble intersection surrounded by neon commercial towers.',
    previewImage: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'dubai_burj',
    name: 'Burj Khalifa & Downtown Marina',
    city: 'Dubai',
    country: 'UAE',
    lat: 25.1972,
    lng: 55.2744,
    zoom: 16,
    pitch: 65,
    category: 'Supertall Architecture',
    description: 'The world tallest 828m 3D structure with artificial lakes and luxury promenades.',
    previewImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'sydney_opera',
    name: 'Sydney Opera House & Harbor Bridge',
    city: 'Sydney',
    country: 'Australia',
    lat: -33.8568,
    lng: 151.2153,
    zoom: 17,
    pitch: 60,
    category: 'Coastal Architectural Icon',
    description: 'Distinctive sail-shaped 3D performing arts center over Sydney Harbor waters.',
    previewImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'singapore_mbs',
    name: 'Marina Bay Sands & Gardens SkyPark',
    city: 'Singapore',
    country: 'Singapore',
    lat: 1.2834,
    lng: 103.8607,
    zoom: 17,
    pitch: 60,
    category: 'Futuristic Bay Oasis',
    description: 'Iconic 3-tower cantilevered skybridge, waterfront boardwalks, and glowing Supertrees.',
    previewImage: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'taj_mahal',
    name: 'Taj Mahal & Yamuna Heritage Esplanade',
    city: 'Agra',
    country: 'India',
    lat: 27.1751,
    lng: 78.0421,
    zoom: 17,
    pitch: 60,
    category: 'World Heritage Wonder',
    description: 'Breathtaking 17th-century ivory-white marble mausoleum with reflective water canals and gardens.',
    previewImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'sfo_airport',
    name: 'SFO International Airport & SkyTrain Gateway',
    city: 'San Francisco, CA',
    country: 'USA',
    lat: 37.6213,
    lng: -122.3790,
    zoom: 16,
    pitch: 60,
    category: 'Airport & Transit Hub',
    description: 'Global international air transit hub with elevated SkyTrain transit tracks and terminal terminals.',
    previewImage: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=400&q=80'
  }
];

// Loop-safe MapCameraFlyTo helper for Leaflet
function MapCameraFlyTo({ lat, lng, zoom }) {
  const map = useMap();
  const lastCoordRef = useRef({ lat: null, lng: null });

  useEffect(() => {
    if (!map || typeof lat !== 'number' || typeof lng !== 'number') return;
    if (lastCoordRef.current.lat === lat && lastCoordRef.current.lng === lng) {
      return;
    }
    lastCoordRef.current = { lat, lng };

    map.flyTo([lat, lng], zoom || 16, {
      duration: 1.5,
      easeLinearity: 0.25
    });

    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {}
    }, 250);

    return () => clearTimeout(timer);
  }, [lat, lng, zoom, map]);

  return null;
}

// 3D Pin Custom Leaflet Icon
const create3DPinIcon = (title) => {
  return L.divIcon({
    className: 'custom-3d-pin-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #06b6d4, #8b5cf6);
        padding: 6px 12px;
        border-radius: 12px;
        box-shadow: 0 0 25px rgba(6, 182, 212, 0.8), 0 8px 16px rgba(0,0,0,0.6);
        border: 2px solid #ffffff;
        color: white;
        font-weight: 800;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        transform: perspective(600px) rotateX(15deg);
      ">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ffffff; box-shadow: 0 0 8px #ffffff;"></span>
        <span>${title || 'Location'}</span>
      </div>
    `,
    iconSize: [120, 36],
    iconAnchor: [60, 36],
    popupAnchor: [0, -36]
  });
};

export default function Google3DMapSearch({ onSelectLocationForRide }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlace, setActivePlace] = useState(GLOBAL_3D_PLACES[0]);
  const [mapLayerType, setMapLayerType] = useState('satellite'); // 'satellite', 'hybrid', 'street3d'
  const [is3DTilt, setIs3DTilt] = useState(true);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [locateError, setLocateError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Google Maps JS API Engine state
  const googleMapContainerRef = useRef(null);
  const googleMapInstanceRef = useRef(null);
  const googleMarkerRef = useRef(null);

  const [googleMapsReady, setGoogleMapsReady] = useState(
    typeof window !== 'undefined' && Boolean(window.google && window.google.maps)
  );
  const [useGoogle3D, setUseGoogle3D] = useState(true);

  // Check if Google Maps JS API is available
  useEffect(() => {
    if (googleMapsReady) return;
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setGoogleMapsReady(true);
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [googleMapsReady]);

  // Initialize or update Google 3D Satellite Map
  useEffect(() => {
    if (!useGoogle3D || !googleMapsReady || !googleMapContainerRef.current) return;

    try {
      const position = { lat: activePlace.lat, lng: activePlace.lng };

      if (!googleMapInstanceRef.current) {
        const map = new window.google.maps.Map(googleMapContainerRef.current, {
          center: position,
          zoom: activePlace.zoom || 17,
          mapTypeId: mapLayerType === 'street3d' ? 'roadmap' : 'satellite',
          tilt: is3DTilt ? 45 : 0,
          heading: 45,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        const marker = new window.google.maps.Marker({
          position,
          map,
          title: activePlace.name,
          animation: window.google.maps.Animation.DROP
        });

        googleMapInstanceRef.current = map;
        googleMarkerRef.current = marker;
      } else {
        const map = googleMapInstanceRef.current;
        map.panTo(position);
        map.setZoom(activePlace.zoom || 17);
        map.setMapTypeId(mapLayerType === 'street3d' ? 'roadmap' : 'satellite');
        map.setTilt(is3DTilt ? 45 : 0);

        if (googleMarkerRef.current) {
          googleMarkerRef.current.setPosition(position);
          googleMarkerRef.current.setTitle(activePlace.name);
        }
      }
    } catch (err) {
      console.warn('Google 3D Map initialization note:', err);
    }
  }, [activePlace, mapLayerType, is3DTilt, useGoogle3D, googleMapsReady]);

  // Search My Location in 3D function
  const handleLocateMeIn3D = () => {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingUser(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let placeName = 'My Real-Time Location';
        let city = 'Current Position';
        let desc = `Live GPS: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'Accept-Language': 'en' }
          });
          const data = await res.json();
          if (data && data.display_name) {
            placeName = data.name || data.display_name.split(',')[0];
            city = data.display_name.split(',').slice(1, 3).join(', ').trim();
            desc = data.display_name;
          }
        } catch (err) {
          console.warn('Reverse geocoding error:', err);
        }

        const user3DPlace = {
          id: 'user_live_loc_' + Date.now(),
          name: placeName,
          city: city,
          country: 'Live GPS',
          lat,
          lng,
          zoom: 17,
          pitch: 65,
          category: 'My Real-Time Location',
          description: desc,
          isUserLocation: true
        };

        setActivePlace(user3DPlace);
        setSearchQuery(placeName);
        setIs3DTilt(true);
        setIsLocatingUser(false);
      },
      (err) => {
        setIsLocatingUser(false);
        setLocateError('GPS Access Denied or Timed Out: ' + (err.message || 'Please enable browser location permissions.'));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Search Suggestions filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = GLOBAL_3D_PLACES.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSuggestions(filtered);
  }, [searchQuery]);

  const handleExecuteSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const lowerQ = searchQuery.trim().toLowerCase();
    if (
      lowerQ === 'my location' || 
      lowerQ === 'current location' || 
      lowerQ === 'me' || 
      lowerQ === 'here' ||
      lowerQ === 'gps' ||
      lowerQ === 'my pos'
    ) {
      handleLocateMeIn3D();
      return;
    }

    setIsSearching(true);
    const foundPreset = GLOBAL_3D_PLACES.find(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundPreset) {
      setActivePlace(foundPreset);
      setIsSearching(false);
      setSuggestions([]);
    } else {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Accept-Language': 'en' }
      })
        .then(res => res.json())
        .then(data => {
          setIsSearching(false);
          if (data && data.length > 0) {
            const first = data[0];
            const customPlace = {
              id: 'custom_' + Date.now(),
              name: first.display_name.split(',')[0],
              city: first.display_name.split(',').slice(1, 3).join(', ').trim(),
              country: 'Searched Location',
              lat: parseFloat(first.lat),
              lng: parseFloat(first.lon),
              zoom: 16,
              pitch: 60,
              category: 'Searched Location',
              description: first.display_name
            };
            setActivePlace(customPlace);
            setSuggestions([]);
          }
        })
        .catch(() => setIsSearching(false));
    }
  };

  const selectPlace = (place) => {
    setActivePlace(place);
    setSearchQuery(place.name);
    setSuggestions([]);
  };

  // Leaflet tile url fallback
  const getLeafletTileUrl = () => {
    if (mapLayerType === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapLayerType === 'hybrid') {
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    } else {
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
      
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Globe className="text-cyan-400" />
              <span>3D Satellite Map & Location Explorer</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Search any location worldwide to view high-resolution 3D satellite elevation, terrain, and building textures.
            </p>
          </div>

          {/* Engine & 3D Tilt Controls */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            {googleMapsReady && (
              <button
                onClick={() => setUseGoogle3D(!useGoogle3D)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  useGoogle3D 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {useGoogle3D ? 'Google Maps 3D' : 'Satellite Grid'}
              </button>
            )}

            <button
              onClick={() => setIs3DTilt(!is3DTilt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                is3DTilt
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Box size={14} />
              <span>{is3DTilt ? '3D Perspective Tilt' : '2D Top-Down'}</span>
            </button>
          </div>
        </div>

        {/* Global Search Input Bar */}
        <form onSubmit={handleExecuteSearch} className="relative z-30">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-2xl p-2 focus-within:border-cyan-500 shadow-xl transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination worldwide (e.g. Times Square, Eiffel Tower, or type 'my location')..."
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 font-semibold focus:outline-none px-2 min-w-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-white px-2 shrink-0"
              >
                Clear
              </button>
            )}

            {/* Direct 'Search My Location in 3D' Button */}
            <button
              type="button"
              onClick={handleLocateMeIn3D}
              disabled={isLocatingUser}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-md transition-all shrink-0 hover:scale-105"
              title="Search and lock into my real-time GPS location in 3D"
            >
              {isLocatingUser ? (
                <>
                  <Loader2 size={15} className="animate-spin text-emerald-400" />
                  <span className="hidden md:inline">Acquiring 3D GPS...</span>
                </>
              ) : (
                <>
                  <LocateFixed size={15} className="text-emerald-400" />
                  <span className="hidden md:inline">Search My Location in 3D</span>
                  <span className="md:hidden">My GPS</span>
                </>
              )}
            </button>

            <button
              type="submit"
              disabled={isSearching}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all shrink-0"
            >
              {isSearching ? <span>Searching...</span> : <span>Search 3D</span>}
            </button>
          </div>

          {/* Location Error notification */}
          {locateError && (
            <div className="mt-2 p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center justify-between">
              <span>⚠️ {locateError}</span>
              <button onClick={() => setLocateError(null)} className="text-slate-400 hover:text-white text-xs px-2">Dismiss</button>
            </div>
          )}

          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden divide-y divide-slate-800 z-50 max-h-60 overflow-y-auto">
              {suggestions.map((p) => (
                <div
                  key={p.id}
                  onClick={() => selectPlace(p)}
                  className="p-3.5 hover:bg-cyan-950/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-cyan-400 shrink-0" />
                    <div>
                      <strong className="text-white font-bold block">{p.name}</strong>
                      <span className="text-slate-400">{p.city}, {p.country} • {p.category}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded font-mono">3D Ready</span>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Preset Landmark Chips & Live User Location Chip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider">Quick Presets:</span>
        
        {/* Live GPS Chip */}
        <button
          onClick={handleLocateMeIn3D}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
            activePlace.isUserLocation
              ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/50'
          }`}
        >
          <LocateFixed size={13} className={isLocatingUser ? 'animate-spin' : ''} />
          <span>📍 My Live GPS Location (3D)</span>
        </button>

        {GLOBAL_3D_PLACES.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPlace(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activePlace.id === p.id && !activePlace.isUserLocation
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {p.name.split('&')[0]} ({p.city.split(',')[0]})
          </button>
        ))}
      </div>

      {/* Main 3D Satellite Map Canvas Viewport */}
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        
        {/* Google Maps 3D Real Satellite Canvas */}
        {useGoogle3D && googleMapsReady ? (
          <div ref={googleMapContainerRef} className="w-full h-full" />
        ) : (
          /* Fallback Leaflet High-Res Satellite Canvas */
          <MapContainer
            center={[activePlace.lat, activePlace.lng]}
            zoom={activePlace.zoom || 16}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <MapCameraFlyTo lat={activePlace.lat} lng={activePlace.lng} zoom={activePlace.zoom || 16} />

            <TileLayer
              key={mapLayerType}
              attribution='&copy; ESRI World Imagery & Google Maps 3D Services'
              url={getLeafletTileUrl()}
              maxZoom={19}
            />

            <Marker position={[activePlace.lat, activePlace.lng]} icon={create3DPinIcon(activePlace.name)}>
              <Popup>
                <div className="p-1">
                  <strong className="text-cyan-400 font-bold block text-sm">{activePlace.name}</strong>
                  <p className="text-xs text-slate-300">{activePlace.description}</p>
                  <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                    GPS: {activePlace.lat.toFixed(4)}° N, {activePlace.lng.toFixed(4)}° W
                  </span>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        )}

        {/* Floating Telemetry Box */}
        <div className="absolute top-4 left-4 z-[1000] glass-panel px-4 py-2.5 rounded-xl border border-slate-700/60 text-xs text-slate-200 flex items-center gap-3 backdrop-blur-md">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
          <div>
            <strong className="text-white font-bold block">{activePlace.name}</strong>
            <span className="text-[10px] text-cyan-400 font-mono">
              {useGoogle3D && googleMapsReady ? 'Google 3D Satellite Tilt' : 'High-Res Satellite Grid'} • {activePlace.category || 'Location'}
            </span>
          </div>
        </div>

        {/* Layer Switcher Controls */}
        <div className="absolute top-4 right-4 z-[1000] glass-panel p-1.5 rounded-xl border border-slate-700/60 flex items-center gap-1.5 backdrop-blur-md">
          {[
            { id: 'satellite', label: '3D Satellite' },
            { id: 'hybrid', label: 'Street Hybrid' },
            { id: 'street3d', label: 'Vector' }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => setMapLayerType(l.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                mapLayerType === l.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Set Searched Location as Ride Destination or Pickup Buttons */}
        {onSelectLocationForRide && (
          <div className="absolute bottom-4 right-4 z-[1000] flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectLocationForRide(activePlace, 'pickup')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 font-bold text-xs border border-cyan-500/40 shadow-lg backdrop-blur-md hover:scale-105 transition-all"
            >
              <MapPin size={14} className="text-cyan-400" />
              <span>Set as Pickup</span>
            </button>
            <button
              onClick={() => onSelectLocationForRide(activePlace, 'destination')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-extrabold text-xs shadow-xl shadow-cyan-500/30 hover:scale-105 transition-all"
            >
              <Navigation size={14} />
              <span>Set as Destination</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

      </div>

      {/* Searched Location Detail Box */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Active 3D Destination Spot</span>
          <strong className="text-sm text-white font-bold">{activePlace.name} — {activePlace.city}</strong>
          <p className="text-xs text-slate-300 mt-0.5">{activePlace.description}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block">GPS Telemetry</span>
          <span className="text-xs font-mono font-bold text-cyan-400">{activePlace.lat.toFixed(4)}° N, {activePlace.lng.toFixed(4)}° W</span>
        </div>
      </div>

    </div>
  );
}
