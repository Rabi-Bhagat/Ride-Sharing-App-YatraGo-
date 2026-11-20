/**
 * Shared geospatial helpers — distance, nearest-first ranking and
 * user-location resolution used across pickup/destination search.
 */

const EARTH_RADIUS_KM = 6371;

export function haversineKm(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every((v) => Number.isFinite(Number(v)))) return null;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function formatDistanceKm(km) {
  if (!Number.isFinite(km)) return '';
  if (km < 1) return `${Math.max(50, Math.round(km * 1000))} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/**
 * Ranks results nearest-first relative to an origin.
 * Results without coordinates are kept at the end rather than dropped.
 */
export function rankByNearest(items, origin) {
  if (!origin || !Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) {
    return items.map((item) => ({ ...item, distanceKm: null }));
  }

  return items
    .map((item) => {
      const distanceKm =
        Number.isFinite(item.lat) && Number.isFinite(item.lng)
          ? haversineKm(origin.lat, origin.lng, item.lat, item.lng)
          : null;
      return { ...item, distanceKm };
    })
    .sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
}

let cachedUserLocation = null;

/**
 * Resolves the traveller's position for nearest-first search.
 * Uses a cached value, then the browser Geolocation API, then falls back to
 * the app's default service area so results are still sensibly ordered.
 */
export function getUserLocation({ timeout = 6000, fallback = { lat: 28.495, lng: 77.089 } } = {}) {
  if (cachedUserLocation) return Promise.resolve(cachedUserLocation);

  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    cachedUserLocation = fallback;
    return Promise.resolve(fallback);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cachedUserLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        resolve(cachedUserLocation);
      },
      () => {
        cachedUserLocation = fallback;
        resolve(fallback);
      },
      { enableHighAccuracy: false, timeout, maximumAge: 120000 }
    );
  });
}

export function clearUserLocationCache() {
  cachedUserLocation = null;
}
