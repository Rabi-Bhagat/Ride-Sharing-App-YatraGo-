// Central fare engine for YatraGo.
//
// The published comparison (at the 8 km reference distance) is:
//   Bike:            Ola/Uber ₹64–₹76   | YatraGo solo ₹64 (₹59 at ₹4/km) | shared n/a
//   Mini / Hatchback Ola/Uber ₹162–₹194 | YatraGo solo ₹158              | ~₹58/person (3 riders)
//   Sedan:           Ola/Uber ₹260–₹274 | YatraGo solo ₹227              | ~₹83/person (3 riders)
//
// Base + per-km rates below are calibrated to reproduce those exact figures.
// Shared fares add a 10% pooling/detour fee, then divide by 3 riders.

export const FARE_REFERENCE_KM = 8;
export const SHARED_RIDERS = 3;
export const SHARED_SURCHARGE = 1.1;

export const FARE_CLASSES = {
  bike: {
    id: 'bike',
    label: 'Bike',
    base: 8,
    perKm: 7,
    saverBase: 27,
    saverPerKm: 4,
    competitorMin: 64,
    competitorMax: 76,
    sharedRiders: null
  },
  mini: {
    id: 'mini',
    label: 'Mini / Hatchback',
    base: 38,
    perKm: 15,
    competitorMin: 162,
    competitorMax: 194,
    sharedRiders: SHARED_RIDERS
  },
  sedan: {
    id: 'sedan',
    label: 'Sedan',
    base: 43,
    perKm: 23,
    competitorMin: 260,
    competitorMax: 274,
    sharedRiders: SHARED_RIDERS
  }
};

// Maps every vehicle tier used in the UI to a published fare class plus a
// within-class premium (SUV vs sedan, superbike vs commuter bike, etc.).
export const TIER_FARE_CLASS = {
  // BookRidePage / VEHICLE_TIERS
  eco: { fareClass: 'sedan', multiplier: 1 },
  premium: { fareClass: 'sedan', multiplier: 1.25 },
  shuttle: { fareClass: 'mini', multiplier: 1 },
  guider: { fareClass: 'sedan', multiplier: 1.12 },
  moto: { fareClass: 'bike', multiplier: 1.15 },
  scooter: { fareClass: 'bike', multiplier: 0.9 },
  moto_express: { fareClass: 'bike', multiplier: 1 },

  // Home quick-request card tiers
  premier: { fareClass: 'sedan', multiplier: 1 },
  comfort: { fareClass: 'mini', multiplier: 1 },
  xl: { fareClass: 'sedan', multiplier: 1.35 },
  auto: { fareClass: 'mini', multiplier: 0.8 },
  moto_classic: { fareClass: 'bike', multiplier: 1 },
  hyperbike: { fareClass: 'bike', multiplier: 1.2 },
  moto_fast: { fareClass: 'bike', multiplier: 1.05 },

  // Pool tiers
  pool_sedan: { fareClass: 'sedan', multiplier: 1 },
  pool_xl: { fareClass: 'sedan', multiplier: 1.2 }
};

const roundRupee = (value) => Math.max(0, Math.round(Number(value) || 0));

const resolveTier = (tierId, fallbackClass = 'sedan') =>
  TIER_FARE_CLASS[tierId] || { fareClass: fallbackClass, multiplier: 1 };

/**
 * Returns a complete fare estimate for a trip.
 *
 * @param {Object} options
 * @param {'bike'|'mini'|'sedan'} [options.fareClass]
 * @param {number} [options.distanceKm]
 * @param {number} [options.multiplier]  within-class premium
 * @param {number} [options.riders]      shared riders (default 3)
 * @param {boolean} [options.saver]      bike ₹4/km saver rate
 */
export function getFareEstimate({
  fareClass = 'sedan',
  distanceKm = FARE_REFERENCE_KM,
  multiplier = 1,
  riders = SHARED_RIDERS,
  saver = false
} = {}) {
  const config = FARE_CLASSES[fareClass] || FARE_CLASSES.sedan;
  const km = Math.max(1, Number(distanceKm) || FARE_REFERENCE_KM);
  const scale = km / FARE_REFERENCE_KM;

  const useSaver = Boolean(saver && config.saverBase != null && config.saverPerKm != null);
  const base = useSaver ? config.saverBase : config.base;
  const perKm = useSaver ? config.saverPerKm : config.perKm;

  const solo = roundRupee((base + perKm * km) * multiplier);
  const competitorMin = roundRupee(config.competitorMin * scale);
  const competitorMax = roundRupee(config.competitorMax * scale);

  const sharedRiders = config.sharedRiders || Math.max(2, Number(riders) || SHARED_RIDERS);
  const supportsShared = Boolean(config.sharedRiders);
  const sharedPerPerson = supportsShared
    ? roundRupee((solo * SHARED_SURCHARGE) / sharedRiders)
    : null;
  const sharedTotal = sharedPerPerson != null ? sharedPerPerson * sharedRiders : null;

  const savingsSolo = competitorMax > 0
    ? Math.round(((competitorMax - solo) / competitorMax) * 100)
    : 0;
  const savingsShared = sharedPerPerson != null && competitorMin > 0
    ? Math.round(((competitorMin - sharedPerPerson) / competitorMin) * 100)
    : null;

  return {
    fareClass,
    label: config.label,
    distanceKm: km,
    multiplier,
    saver: useSaver,
    base,
    perKm,
    solo,
    competitorMin,
    competitorMax,
    supportsShared,
    sharedRiders,
    sharedPerPerson,
    sharedTotal,
    savingsSolo,
    savingsShared
  };
}

// Convenience helper for a specific vehicle tier.
export function getTierFare(tierId, distanceKm, options = {}) {
  const { fareClass, multiplier } = resolveTier(tierId, options.fallbackClass || 'sedan');
  return getFareEstimate({ ...options, fareClass, multiplier, distanceKm });
}

// The Bike/Mini/Sedan comparison table used across the UI.
export function getFareComparison(distanceKm = FARE_REFERENCE_KM) {
  return ['bike', 'mini', 'sedan'].map((id) => getFareEstimate({ fareClass: id, distanceKm }));
}

export const formatRupees = (value) =>
  `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;
