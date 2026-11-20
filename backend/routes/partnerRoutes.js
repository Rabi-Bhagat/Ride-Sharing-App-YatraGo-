const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Partner = require('../models/Partner');

const dbReady = () => mongoose.connection && mongoose.connection.readyState === 1;

// Partnership ledger fallback so the marketplace works without MongoDB.
let memoryPartners = [
  {
    _id: 'prt_1',
    name: 'Himalayan Grand Hotel',
    category: 'hotel',
    city: 'Kathmandu',
    area: 'Durbar Marg',
    description: 'Five-star heritage hotel with rooftop dining, spa and airport transfers — minutes from Durbar Square.',
    promoCode: 'NEPALSTAY20',
    discountPercent: 20,
    commissionPercent: 12,
    tier: 'enterprise',
    rating: 4.8,
    reviewCount: 412,
    isVerified: true,
    contactEmail: 'stay@himalayangrand.com',
    contactPhone: '+977 1 420 0001',
    managedBy: 'admin',
    status: 'active'
  },
  {
    _id: 'prt_2',
    name: 'Lakeside Retreat Pokhara',
    category: 'hotel',
    city: 'Pokhara',
    area: 'Lakeside Road',
    description: 'Boutique lakeside stay with Annapurna-facing balconies and free kayaking for guests.',
    promoCode: 'PHEWA15',
    discountPercent: 15,
    commissionPercent: 10,
    tier: 'growth',
    rating: 4.6,
    reviewCount: 268,
    isVerified: true,
    contactEmail: 'book@lakesideretreat.np',
    contactPhone: '+977 61 460 022',
    managedBy: 'promoter',
    status: 'active'
  },
  {
    _id: 'prt_3',
    name: 'Thamel Handicraft Bazaar',
    category: 'shop',
    city: 'Kathmandu',
    area: 'Thamel Marg',
    description: 'Pashmina shawls, singing bowls and hand-knotted carpets direct from local artisans.',
    promoCode: 'THAMEL10',
    discountPercent: 10,
    commissionPercent: 8,
    tier: 'growth',
    rating: 4.5,
    reviewCount: 189,
    isVerified: true,
    contactEmail: 'shop@thamelbazaar.np',
    contactPhone: '+977 1 451 7788',
    managedBy: 'developer',
    status: 'active'
  },
  {
    _id: 'prt_4',
    name: 'Newari Kitchen Bhaktapur',
    category: 'restaurant',
    city: 'Bhaktapur',
    area: 'Nyatapola Square',
    description: 'Traditional Newari thali, bara and juju dhau served in a restored courtyard.',
    promoCode: 'NEWARI25',
    discountPercent: 25,
    commissionPercent: 15,
    tier: 'starter',
    rating: 4.7,
    reviewCount: 301,
    isVerified: true,
    contactEmail: 'eat@newarikitchen.np',
    contactPhone: '+977 1 661 2244',
    managedBy: 'promoter',
    status: 'active'
  },
  {
    _id: 'prt_5',
    name: 'Everest Gear Outfitters',
    category: 'shop',
    city: 'Namche Bazaar',
    area: 'Khumbu Trailhead',
    description: 'Rental down jackets, trekking poles and altitude gear vetted by certified guides.',
    promoCode: 'TREK12',
    discountPercent: 12,
    commissionPercent: 9,
    tier: 'growth',
    rating: 4.4,
    reviewCount: 96,
    isVerified: true,
    contactEmail: 'gear@everestoutfitters.np',
    contactPhone: '+977 38 550 118',
    managedBy: 'developer',
    status: 'active'
  },
  {
    _id: 'prt_6',
    name: 'Momo Mahal Kathmandu',
    category: 'restaurant',
    city: 'Kathmandu',
    area: 'Jhamsikhel',
    description: 'Steamed, jhol and fried momo platters plus sel roti in a buzzing courtyard.',
    promoCode: 'MOMO18',
    discountPercent: 18,
    commissionPercent: 11,
    tier: 'starter',
    rating: 4.3,
    reviewCount: 154,
    isVerified: true,
    contactEmail: 'hello@momomahal.np',
    contactPhone: '+977 1 552 9010',
    managedBy: 'admin',
    status: 'active'
  },
  {
    _id: 'prt_7',
    name: 'Bhaktapur Heritage Inn',
    category: 'hotel',
    city: 'Bhaktapur',
    area: 'Nyatapola Square',
    description: 'Restored Newari townhouse with carved courtyards, steps away from the five-storey temple.',
    promoCode: 'NEWARSTAY18',
    discountPercent: 18,
    commissionPercent: 11,
    tier: 'growth',
    rating: 4.7,
    reviewCount: 186,
    isVerified: true,
    contactEmail: 'inn@bhaktapurheritage.np',
    contactPhone: '+977 1 661 3355',
    managedBy: 'admin',
    status: 'active'
  },
  {
    _id: 'prt_8',
    name: 'Everest Base Camp Lodge',
    category: 'hotel',
    city: 'Namche Bazaar',
    area: 'Khumbu Trailhead',
    description: 'Trekker lodge with heated dorms, altitude acclimatisation advice and Sherpa-guided departures.',
    promoCode: 'TREKSTAY25',
    discountPercent: 25,
    commissionPercent: 14,
    tier: 'enterprise',
    rating: 4.5,
    reviewCount: 341,
    isVerified: true,
    contactEmail: 'stay@ebclodge.np',
    contactPhone: '+977 38 550 220',
    managedBy: 'promoter',
    status: 'active'
  },
  {
    _id: 'prt_9',
    name: 'Lumbini Peace Garden Resort',
    category: 'hotel',
    city: 'Lumbini',
    area: 'Sacred Garden Zone',
    description: 'Quiet meditation-friendly resort beside the monastic zone with vegetarian kitchen and cycle hire.',
    promoCode: 'PEACE12',
    discountPercent: 12,
    commissionPercent: 9,
    tier: 'starter',
    rating: 4.4,
    reviewCount: 97,
    isVerified: true,
    contactEmail: 'book@peacegarden.np',
    contactPhone: '+977 71 580 112',
    managedBy: 'admin',
    status: 'active'
  },
  {
    _id: 'prt_10',
    name: 'Annapurna Trek Supplies',
    category: 'shop',
    city: 'Pokhara',
    area: 'Lakeside Marg',
    description: 'Sleeping bags, gaiters and permits desk for Annapurna circuits — gear fitting included.',
    promoCode: 'ANNAPURNA12',
    discountPercent: 12,
    commissionPercent: 8,
    tier: 'starter',
    rating: 4.3,
    reviewCount: 132,
    isVerified: true,
    contactEmail: 'gear@annapurnasupplies.np',
    contactPhone: '+977 61 462 889',
    managedBy: 'developer',
    status: 'active'
  },
  {
    _id: 'prt_11',
    name: 'Patan Metalworks Studio',
    category: 'shop',
    city: 'Lalitpur',
    area: 'Patan Durbar',
    description: 'Hand-cast brass statues and ritual items made by third-generation Newari craftsmen.',
    promoCode: 'PATAN20',
    discountPercent: 20,
    commissionPercent: 11,
    tier: 'enterprise',
    rating: 4.9,
    reviewCount: 74,
    isVerified: true,
    contactEmail: 'studio@patanmetal.np',
    contactPhone: '+977 1 552 4477',
    managedBy: 'developer',
    status: 'active'
  },
  {
    _id: 'prt_12',
    name: 'Lakeside Thakali Diner',
    category: 'restaurant',
    city: 'Pokhara',
    area: 'Baidam Road',
    description: 'Authentic Thakali dal-bhat sets with mustard greens and lake-facing terrace seating.',
    promoCode: 'THAKALI15',
    discountPercent: 15,
    commissionPercent: 10,
    tier: 'growth',
    rating: 4.6,
    reviewCount: 223,
    isVerified: true,
    contactEmail: 'dine@thakalikitchen.np',
    contactPhone: '+977 61 464 330',
    managedBy: 'promoter',
    status: 'active'
  },
  {
    _id: 'prt_13',
    name: 'Durbar Rooftop Cafe',
    category: 'restaurant',
    city: 'Kathmandu',
    area: 'Basantapur',
    description: 'Rooftop espresso and Newari snacks overlooking the temple spires of Durbar Square.',
    promoCode: 'DURBARCafe10',
    discountPercent: 10,
    commissionPercent: 9,
    tier: 'starter',
    rating: 4.2,
    reviewCount: 88,
    isVerified: true,
    contactEmail: 'cafe@durbarrooftop.np',
    contactPhone: '+977 1 425 6677',
    managedBy: 'admin',
    status: 'active'
  }
];

// Accepts the canonical role names plus the legacy "promotor" spelling.
const normalizeManager = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'promotor' || normalized === 'promoter') return 'promoter';
  if (normalized === 'developer') return 'developer';
  return 'admin';
};

const sanitizePartner = (partner) => {
  const raw = typeof partner.toObject === 'function' ? partner.toObject() : partner;
  const { __v, ...rest } = raw;
  return rest;
};

// List partners, optionally filtered by category / city / search
router.get('/', async (req, res) => {
  const { category, city, search } = req.query;

  let partners = null;
  if (dbReady()) {
    try {
      const docs = await Partner.find().sort({ createdAt: -1 });
      if (docs) partners = docs.map(sanitizePartner);
    } catch (err) {
      partners = null;
    }
  }
  if (!partners) partners = memoryPartners.map(sanitizePartner);

  const term = String(search || '').trim().toLowerCase();
  const filtered = partners.filter((partner) => {
    if (category && category !== 'all' && partner.category !== category) return false;
    if (city && city !== 'all' && partner.city !== city) return false;
    if (!term) return true;
    return [partner.name, partner.city, partner.area, partner.promoCode, partner.category]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
  });

  return res.json({ success: true, count: filtered.length, partners: filtered });
});

// Register a new business partner (hotel / shop / restaurant)
router.post('/register', async (req, res) => {
  const {
    name,
    category,
    city,
    area,
    description,
    promoCode,
    discountPercent,
    contactEmail,
    contactPhone,
    listedBy,
    managedBy
  } = req.body || {};

  if (!name || !category) {
    return res.status(400).json({ success: false, message: 'Business name and category are required.' });
  }
  if (!['hotel', 'shop', 'restaurant'].includes(category)) {
    return res.status(400).json({ success: false, message: 'Category must be hotel, shop or restaurant.' });
  }

  const payload = {
    name: String(name).trim(),
    category,
    city: city || 'Kathmandu',
    area: area || '',
    description: description || '',
    promoCode: (promoCode || '').toUpperCase().replace(/\s+/g, '') || null,
    discountPercent: Math.max(0, Math.min(90, Number(discountPercent) || 0)),
    commissionPercent: 10,
    tier: 'starter',
    rating: 0,
    reviewCount: 0,
    isVerified: false,
    contactEmail: contactEmail || '',
    contactPhone: contactPhone || '',
    listedBy: listedBy === 'traveller' ? 'traveller' : 'shopkeeper',
    managedBy: normalizeManager(managedBy),
    status: 'pending'
  };

  if (dbReady()) {
    try {
      const created = await Partner.create(payload);
      return res.status(201).json({ success: true, message: 'Partner application submitted for review.', partner: sanitizePartner(created) });
    } catch (err) {
      // fall through to memory store
    }
  }

  const created = { _id: 'prt_' + Date.now(), ...payload };
  memoryPartners = [created, ...memoryPartners];
  return res.status(201).json({ success: true, message: 'Partner application submitted for review.', partner: created });
});

// Look up a promo code and compute the traveller discount
router.post('/redeem', async (req, res) => {
  const { code, amount } = req.body || {};
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) {
    return res.status(400).json({ success: false, message: 'Enter a promo code to redeem.' });
  }

  let partners = memoryPartners.map(sanitizePartner);
  if (dbReady()) {
    try {
      const docs = await Partner.find({ promoCode: normalized });
      if (docs && docs.length > 0) partners = docs.map(sanitizePartner);
    } catch (err) {
      // keep memory fallback
    }
  }

  const partner = partners.find((item) => String(item.promoCode || '').toUpperCase() === normalized);
  if (!partner) {
    return res.status(404).json({ success: false, message: 'That promo code is not linked to an active partner.' });
  }

  const base = Number(amount);
  const discountAmount = Number.isFinite(base) && base > 0
    ? Math.round(base * (partner.discountPercent / 100) * 100) / 100
    : null;

  return res.json({
    success: true,
    partner: {
      _id: partner._id,
      name: partner.name,
      category: partner.category,
      city: partner.city,
      area: partner.area
    },
    promoCode: partner.promoCode,
    discountPercent: partner.discountPercent,
    discountAmount,
    message: `${partner.discountPercent}% off at ${partner.name}`
  });
});

// Aggregate marketplace stats for the hub header
router.get('/stats', async (req, res) => {
  let partners = memoryPartners.map(sanitizePartner);
  if (dbReady()) {
    try {
      const docs = await Partner.find();
      if (docs && docs.length > 0) partners = docs.map(sanitizePartner);
    } catch (err) {
      // keep memory fallback
    }
  }

  const byCategory = partners.reduce((acc, partner) => {
    acc[partner.category] = (acc[partner.category] || 0) + 1;
    return acc;
  }, {});

  return res.json({
    success: true,
    stats: {
      totalPartners: partners.length,
      hotels: byCategory.hotel || 0,
      shops: byCategory.shop || 0,
      restaurants: byCategory.restaurant || 0,
      avgCommission: partners.length
        ? Math.round((partners.reduce((sum, partner) => sum + (partner.commissionPercent || 0), 0) / partners.length) * 10) / 10
        : 0,
      maxDiscount: partners.reduce((max, partner) => Math.max(max, partner.discountPercent || 0), 0)
    }
  });
});

module.exports = router;
