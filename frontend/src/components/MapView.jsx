import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Navigation, MapPin, Crosshair, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup, Polyline as LeafletPolyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Google Dark Map Stylesheet for sleek modern appearance
const GOOGLE_DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#062016" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334155" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1e3a5f" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0284c7" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#021526" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }]
  }
];

// Helper to reverse geocode coordinates to an address name
async function reverseGeocode(lat, lng) {
  // Try Google Geocoder first if available
  if (window.google && window.google.maps && window.google.maps.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response && response.results && response.results[0]) {
        const full = response.results[0].formatted_address;
        const parts = full.split(',');
        return parts.slice(0, 2).join(', ').trim();
      }
    } catch (e) {
      // Fall through to Nominatim
    }
  }

  // Fallback to OpenStreetMap Nominatim reverse geocode
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    if (data && data.display_name) {
      const parts = data.display_name.split(',');
      return parts.slice(0, 2).join(', ').trim();
    }
  } catch (e) {
    // Ignore
  }

  return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

// Leaflet Bounds Auto-Fit Helper
function ChangeLeafletBounds({ pLat, pLng, dLat, dLng }) {
  const map = useMap();
  useEffect(() => {
    if (map && pLat && pLng && dLat && dLng) {
      try {
        const bounds = L.latLngBounds([
          [pLat, pLng],
          [dLat, dLng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch (e) {}
    }
  }, [pLat, pLng, dLat, dLng, map]);
  return null;
}

// Leaflet Click Listener Helper
function LeafletMapEvents({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function MapView({ 
  pickup, 
  destination, 
  onSelectPickup, 
  onSelectDestination, 
  ride, 
  isStrangerCombined,
  interactive = true,
  threeD = false
}) {
  const googleMapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const directionsRequestRef = useRef(0);

  const [useGoogleMaps, setUseGoogleMaps] = useState(true);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  const [clickTargetMode, setClickTargetMode] = useState('pickup'); // 'pickup' | 'destination'
  const [driverPos, setDriverPos] = useState([37.7790, -122.4130]);
  const [lastSelectedNotice, setLastSelectedNotice] = useState(null);

  // Keep the map listeners pointing at the latest handler instead of a stale closure
  const mapClickHandlerRef = useRef(null);

  const hasPickup = Number.isFinite(pickup?.lat) && Number.isFinite(pickup?.lng);
  const hasDestination = Number.isFinite(destination?.lat) && Number.isFinite(destination?.lng);

  // Only use coordinates the user actually chose — never invent a default place
  const pLat = hasPickup ? pickup.lat : null;
  const pLng = hasPickup ? pickup.lng : null;
  const dLat = hasDestination ? destination.lat : null;
  const dLng = hasDestination ? destination.lng : null;

  const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

  // Handle map click for choosing pickup or destination
  const handleMapCoordinateChosen = useCallback(async (lat, lng) => {
    if (!interactive) return;

    const address = await reverseGeocode(lat, lng);

    if (clickTargetMode === 'pickup') {
      const updatedPickup = {
        name: address,
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
      if (onSelectPickup) onSelectPickup(updatedPickup);
      setLastSelectedNotice({ type: 'pickup', name: address });
      // Automatically toggle to destination next for natural UX flow
      setClickTargetMode('destination');
    } else {
      const updatedDest = {
        id: 'dest_' + Date.now(),
        name: address,
        address: address,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        category: 'Custom Destination'
      };
      if (onSelectDestination) onSelectDestination(updatedDest);
      setLastSelectedNotice({ type: 'destination', name: address });
    }

    setTimeout(() => setLastSelectedNotice(null), 3500);
  }, [clickTargetMode, interactive, onSelectPickup, onSelectDestination]);

  mapClickHandlerRef.current = handleMapCoordinateChosen;

  // Check if Google Maps script is available
  useEffect(() => {
    let checkCount = 0;
    const interval = setInterval(() => {
      checkCount++;
      if (window.google && window.google.maps && window.google.maps.Map) {
        setGoogleMapsReady(true);
        clearInterval(interval);
      } else if (checkCount > 40) {
        // Fallback to Leaflet if Google script didn't load
        setUseGoogleMaps(false);
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Initialize and update Google Map
  useEffect(() => {
    if (!useGoogleMaps || !googleMapsReady || !googleMapRef.current) return;

    try {
      const center = hasPickup && hasDestination
        ? { lat: (pLat + dLat) / 2, lng: (pLng + dLng) / 2 }
        : hasPickup
          ? { lat: pLat, lng: pLng }
          : hasDestination
            ? { lat: dLat, lng: dLng }
            : DEFAULT_CENTER;

      if (!mapInstanceRef.current) {
        const map = new window.google.maps.Map(googleMapRef.current, {
          center,
          zoom: 13,
          styles: threeD ? [] : GOOGLE_DARK_MAP_STYLE,
          mapTypeId: threeD ? 'satellite' : 'roadmap',
          tilt: threeD ? 45 : 0,
          heading: threeD ? 30 : 0,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        });

        // Click to pick location
        map.addListener('click', (e) => {
          mapClickHandlerRef.current?.(e.latLng.lat(), e.latLng.lng());
        });

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Keep the base map in sync with the requested 2D / 3D mode
      map.setOptions({ styles: threeD ? [] : GOOGLE_DARK_MAP_STYLE });
      map.setMapTypeId(threeD ? 'satellite' : 'roadmap');
      map.setTilt(threeD ? 45 : 0);
      map.setHeading(threeD ? 30 : 0);

      // Update Pickup Marker (Cyan)
      if (!hasPickup) {
        if (pickupMarkerRef.current) {
          pickupMarkerRef.current.setMap(null);
          pickupMarkerRef.current = null;
        }
      } else if (!pickupMarkerRef.current) {
        const marker = new window.google.maps.Marker({
          position: { lat: pLat, lng: pLng },
          map,
          title: `Pickup: ${pickup?.name || 'Selected'}`,
          draggable: interactive,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#06b6d4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5
          }
        });

        marker.addListener('dragend', (e) => {
          mapClickHandlerRef.current?.(e.latLng.lat(), e.latLng.lng());
        });

        pickupMarkerRef.current = marker;
      } else {
        pickupMarkerRef.current.setPosition({ lat: pLat, lng: pLng });
      }

      // Update Destination Marker (Violet/Purple)
      if (!hasDestination) {
        if (destMarkerRef.current) {
          destMarkerRef.current.setMap(null);
          destMarkerRef.current = null;
        }
      } else if (!destMarkerRef.current) {
        const marker = new window.google.maps.Marker({
          position: { lat: dLat, lng: dLng },
          map,
          title: `Destination: ${destination?.name || 'Selected'}`,
          draggable: interactive,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#a855f7',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5
          }
        });

        marker.addListener('dragend', (e) => {
          mapClickHandlerRef.current?.(e.latLng.lat(), e.latLng.lng());
        });

        destMarkerRef.current = marker;
      } else {
        destMarkerRef.current.setPosition({ lat: dLat, lng: dLng });
      }

      // Draw the route only when both endpoints are known
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        routePolylineRef.current = null;
      }

      if (hasPickup && hasDestination) {
        const pathCoordinates = [
          { lat: pLat, lng: pLng },
          { lat: (pLat * 2 + dLat) / 3 + 0.002, lng: (pLng * 2 + dLng) / 3 - 0.003 },
          { lat: (pLat + dLat * 2) / 3 - 0.001, lng: (pLng + dLng * 2) / 3 + 0.002 },
          { lat: dLat, lng: dLng }
        ];

        routePolylineRef.current = new window.google.maps.Polyline({
          path: pathCoordinates,
          geodesic: true,
          strokeColor: '#06b6d4',
          strokeOpacity: 0.85,
          strokeWeight: 5,
          map
        });

        // Replace the fallback line with the real driving route for these two points
        const directionsRequestId = ++directionsRequestRef.current;
        const activePolyline = routePolylineRef.current;
        if (window.google.maps.DirectionsService) {
          try {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
              {
                origin: { lat: pLat, lng: pLng },
                destination: { lat: dLat, lng: dLng },
                travelMode: window.google.maps.TravelMode.DRIVING
              },
              (result, status) => {
                if (directionsRequestId !== directionsRequestRef.current) return;
                if (status !== 'OK') return;
                const routePath = result?.routes?.[0]?.overview_path;
                if (routePath?.length && activePolyline === routePolylineRef.current) {
                  activePolyline.setPath(routePath);
                }
              }
            );
          } catch (e) {
            // Keep the local preview line if Directions is unavailable
          }
        }
      }

      // Fit the map to whatever points are available
      if (hasPickup && hasDestination) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: pLat, lng: pLng });
        bounds.extend({ lat: dLat, lng: dLng });
        map.fitBounds(bounds, 50);
      } else {
        map.setCenter(center);
        map.setZoom(13);
      }

    } catch (err) {
      console.warn('Google Maps display fallback to Leaflet:', err);
      setUseGoogleMaps(false);
    }
  }, [useGoogleMaps, googleMapsReady, pLat, pLng, dLat, dLng, hasPickup, hasDestination, interactive, threeD, handleMapCoordinateChosen]);

  // Leaflet Icons
  const createLeafletDivIcon = (color, label) => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          background: ${color};
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px ${color}80, 0 4px 10px rgba(0,0,0,0.6);
          border: 2px solid #ffffff;
          color: white;
          font-weight: 800;
          font-size: 11px;
        ">
          ${label}
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl glass-card flex flex-col">
      
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Pick on Map Mode Selector */}
        {interactive ? (
          <div className="glass-panel p-1 rounded-xl border border-slate-700/80 shadow-xl flex items-center gap-1 pointer-events-auto bg-slate-950/90 backdrop-blur-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
              <Crosshair size={12} className="text-cyan-400" />
              <span>Tap Map Sets:</span>
            </span>
            <button
              onClick={() => setClickTargetMode('pickup')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                clickTargetMode === 'pickup'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Navigation size={12} />
              <span>Pickup</span>
            </button>
            <button
              onClick={() => setClickTargetMode('destination')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                clickTargetMode === 'destination'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MapPin size={12} />
              <span>Destination</span>
            </button>
          </div>
        ) : <span />}

        {/* Engine Indicator (Google Maps API badge) */}
        <div className="glass-panel px-3 py-1.5 rounded-xl border border-slate-700/60 text-[10px] font-mono text-slate-300 flex items-center gap-2 pointer-events-auto bg-slate-950/80 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white">{threeD ? '3D Satellite Map' : 'Google Maps JS API'}</span>
          {threeD && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              TILT 45°
            </span>
          )}
          {interactive && (
            <button
              onClick={() => setUseGoogleMaps(!useGoogleMaps)}
              className="text-[9px] text-cyan-400 underline hover:text-cyan-300 ml-1"
            >
              {useGoogleMaps ? 'Switch to Leaflet' : 'Switch to Google'}
            </button>
          )}
        </div>

      </div>

      {/* Floating User Action Confirmation Notice */}
      {lastSelectedNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-slideDown">
          <Check size={14} />
          <span>
            {lastSelectedNotice.type === 'pickup' ? '📍 Pickup Point updated: ' : '🎯 Destination updated: '}
            {lastSelectedNotice.name}
          </span>
        </div>
      )}

      {/* Map Viewport Canvas */}
      <div className="relative w-full flex-1">
        {useGoogleMaps && googleMapsReady ? (
          // Google Maps Real JavaScript Canvas
          <div ref={googleMapRef} className="w-full h-full min-h-[460px]" />
        ) : (
          // Fallback Leaflet OpenStreetMap Canvas
          <MapContainer
            center={
              hasPickup && hasDestination
                ? [(pLat + dLat) / 2, (pLng + dLng) / 2]
                : hasPickup
                  ? [pLat, pLng]
                  : hasDestination
                    ? [dLat, dLng]
                    : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]
            }
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full min-h-[460px]"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {hasPickup && hasDestination && (
              <>
                <ChangeLeafletBounds pLat={pLat} pLng={pLng} dLat={dLat} dLng={dLng} />
                <LeafletPolyline
                  positions={[[pLat, pLng], [dLat, dLng]]}
                  pathOptions={{ color: '#06b6d4', weight: 5, opacity: 0.85 }}
                />
              </>
            )}
            {interactive && <LeafletMapEvents onMapClick={handleMapCoordinateChosen} />}
            {hasPickup && (
              <LeafletMarker position={[pLat, pLng]} icon={createLeafletDivIcon('#06b6d4', 'A')}>
                <LeafletPopup>
                  <strong>Pickup Point:</strong><br />{pickup?.name || 'Selected'}
                </LeafletPopup>
              </LeafletMarker>
            )}
            {hasDestination && (
              <LeafletMarker position={[dLat, dLng]} icon={createLeafletDivIcon('#a855f7', 'B')}>
                <LeafletPopup>
                  <strong>Destination:</strong><br />{destination?.name || 'Selected'}
                </LeafletPopup>
              </LeafletMarker>
            )}
          </MapContainer>
        )}
      </div>

      {/* Bottom Route Summary Bar */}
      <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-400">Pickup:</span>
            <strong className="text-white truncate max-w-[140px] sm:max-w-[200px]">{pickup?.name || 'Tap map or use GPS'}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-slate-400">Drop-off:</span>
            <strong className="text-white truncate max-w-[140px] sm:max-w-[200px]">{destination?.name || 'Search or tap map'}</strong>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-cyan-400">
          {interactive ? (
            <span>Click anywhere to choose {clickTargetMode}</span>
          ) : (
            <span>{hasPickup && hasDestination ? 'Live route synced to your search' : 'Search a pickup and destination to preview the route'}</span>
          )}
        </div>
      </div>

    </div>
  );
}
