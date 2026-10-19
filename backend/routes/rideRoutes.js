const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const Message = require('../models/Message');

// Mock fallback Active Ride state
let activeRide = {
  _id: 'ride_101',
  pickup: { name: 'Innovation Tech Park, SF', lat: 37.7749, lng: -122.4194 },
  destination: { name: 'Downtown Cyber Hub & Plaza', lat: 37.7885, lng: -122.4014, preview3DId: 'downtown' },
  riders: [
    {
      userId: 'usr_1',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      isPrimary: true,
      costShare: 16.50,
      paymentStatus: 'Paid'
    }
  ],
  driver: {
    name: 'Marcus Vance',
    vehicle: 'Tesla Model Y (Metallic Silver)',
    licensePlate: '7Velo89',
    rating: 4.97,
    phone: '+1 (555) 888-2311',
    lat: 37.7790,
    lng: -122.4130
  },
  guider: null,
  vehicleType: 'Eco Sedan',
  status: 'In Progress',
  isStrangerCombined: false,
  strangerSavingsPercentage: 0,
  totalCost: 33.00,
  distanceKm: 8.4,
  etaMinutes: 14,
  costSplits: [
    { riderName: 'Alex Rivera', amount: 33.00, percentage: 100, status: 'Paid' }
  ]
};

// Available Stranger Ride Matches database
const strangerMatchesPool = [
  {
    matchId: 'match_901',
    rider: {
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      trustBadge: 'Government Verified ID',
      rating: 4.93,
      tripsCompleted: 88,
      bio: 'Biotech researcher heading to Downtown Cyber Hub for a tech keynote.'
    },
    pickup: 'Financial District Plaza',
    destination: 'Downtown Cyber Hub (2 blocks away)',
    routeMatchPercent: 96,
    originalFare: 33.00,
    discountedFarePerPerson: 18.50,
    totalSavingsPercent: 44,
    detourMinutes: 2
  },
  {
    matchId: 'match_902',
    rider: {
      name: 'David Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      trustBadge: 'Gold Verified Rider',
      rating: 4.89,
      tripsCompleted: 54,
      bio: 'Software engineer sharing rides to optimize carbon footprint.'
    },
    pickup: 'SoMa Tech Incubator',
    destination: 'Downtown Cyber Hub',
    routeMatchPercent: 91,
    originalFare: 33.00,
    discountedFarePerPerson: 19.80,
    totalSavingsPercent: 40,
    detourMinutes: 4
  }
];

// Get current active ride (from MongoDB or fallback)
router.get('/active', async (req, res) => {
  try {
    const mongoRide = await Ride.findOne({ status: 'In Progress' }).sort({ createdAt: -1 });
    if (mongoRide) {
      return res.json({ success: true, ride: mongoRide });
    }
  } catch (err) {
    // fallback
  }
  return res.json({ success: true, ride: activeRide });
});

// Get all rides / history from MongoDB
router.get('/', async (req, res) => {
  try {
    const rides = await Ride.find().sort({ createdAt: -1 });
    return res.json({ success: true, rides });
  } catch (err) {
    return res.json({ success: true, rides: [activeRide] });
  }
});

// Book a new ride and persist to MongoDB
router.post('/book', async (req, res) => {
  const { pickup, destination, vehicleType, guiderId, guiderFee } = req.body;
  
  const baseDistance = 8.5;
  let baseRate = 18.00;
  if (vehicleType === 'Premium SUV') baseRate = 34.00;
  if (vehicleType === 'Electric Shuttle') baseRate = 22.00;
  if (vehicleType === 'Guider Co-Ride') baseRate = 28.00;

  let totalCost = baseRate + (guiderFee || 0);

  const rideData = {
    pickup: pickup || activeRide.pickup,
    destination: destination || activeRide.destination,
    riders: [
      {
        userId: 'usr_1',
        name: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
        isPrimary: true,
        costShare: totalCost,
        paymentStatus: 'Pending'
      }
    ],
    driver: {
      name: 'Marcus Vance',
      vehicle: 'Tesla Model Y (Metallic Silver)',
      licensePlate: '7Velo89',
      rating: 4.97,
      phone: '+1 (555) 888-2311',
      lat: (pickup?.lat || 37.7749) + 0.005,
      lng: (pickup?.lng || -122.4194) - 0.004
    },
    guider: guiderId ? { guiderId, name: 'Sofia Martinez', fee: guiderFee || 25 } : null,
    vehicleType: vehicleType || 'Eco Sedan',
    status: 'In Progress',
    isStrangerCombined: false,
    strangerSavingsPercentage: 0,
    totalCost,
    distanceKm: baseDistance,
    etaMinutes: 14,
    costSplits: [
      { riderName: 'Alex Rivera', amount: totalCost, percentage: 100, status: 'Pending' }
    ]
  };

  try {
    const savedRide = await Ride.create(rideData);
    activeRide = savedRide;
    return res.json({ success: true, ride: savedRide });
  } catch (err) {
    activeRide = { _id: 'ride_' + Date.now(), ...rideData };
    return res.json({ success: true, ride: activeRide });
  }
});

// Stranger Ride Combining matching algorithm endpoint
router.get('/stranger-matches', (req, res) => {
  return res.json({
    success: true,
    matches: strangerMatchesPool,
    algorithmMeta: {
      searchRadiusKm: 3.5,
      maxDetourMinutes: 5,
      matchedCount: strangerMatchesPool.length
    }
  });
});

// Combine ride with a stranger match
router.post('/combine-stranger', async (req, res) => {
  const { matchId } = req.body;
  const match = strangerMatchesPool.find(m => m.matchId === matchId) || strangerMatchesPool[0];

  const newRider = {
    userId: 'usr_stranger_' + Date.now(),
    name: match.rider.name,
    avatar: match.rider.avatar,
    isVerified: match.rider.isVerified,
    isPrimary: false,
    costShare: match.discountedFarePerPerson,
    paymentStatus: 'Paid'
  };

  let targetRide = activeRide;
  try {
    const mongoRide = await Ride.findOne({ status: 'In Progress' }).sort({ createdAt: -1 });
    if (mongoRide) {
      targetRide = mongoRide;
    }
  } catch (err) {}

  targetRide.riders.push(newRider);
  targetRide.isStrangerCombined = true;
  targetRide.strangerSavingsPercentage = match.totalSavingsPercent;
  targetRide.totalCost = Math.round((match.discountedFarePerPerson * targetRide.riders.length) * 100) / 100;

  const perPersonShare = Math.round((targetRide.totalCost / targetRide.riders.length) * 100) / 100;
  targetRide.costSplits = targetRide.riders.map(r => ({
    riderName: r.name,
    amount: perPersonShare,
    percentage: Math.round(100 / targetRide.riders.length),
    status: r.paymentStatus || 'Pending'
  }));

  try {
    if (targetRide.save) {
      await targetRide.save();
    }
  } catch (err) {}

  activeRide = targetRide;

  return res.json({
    success: true,
    message: `Ride successfully combined with ${match.rider.name}! Saved ${match.totalSavingsPercent}%`,
    ride: targetRide
  });
});

// In-App Automated Cost Splitting calculator & update
router.post('/split-cost', async (req, res) => {
  const { customSplits, tipAmount } = req.body;
  
  let targetRide = activeRide;
  try {
    const mongoRide = await Ride.findOne({ status: 'In Progress' }).sort({ createdAt: -1 });
    if (mongoRide) targetRide = mongoRide;
  } catch (err) {}

  let currentTotal = targetRide.totalCost + (tipAmount || 0);
  
  if (customSplits && Array.isArray(customSplits)) {
    targetRide.costSplits = customSplits.map(s => ({
      riderName: s.riderName,
      amount: Math.round((currentTotal * (s.percentage / 100)) * 100) / 100,
      percentage: s.percentage,
      status: s.status || 'Pending'
    }));
  }

  try {
    if (targetRide.save) await targetRide.save();
  } catch (err) {}

  activeRide = targetRide;

  return res.json({
    success: true,
    totalCost: currentTotal,
    costSplits: targetRide.costSplits,
    ride: targetRide
  });
});

// Get group chat messages for a ride
router.get('/:rideId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ rideId: req.params.rideId }).sort({ timestamp: 1 });
    return res.json({ success: true, messages });
  } catch (err) {
    return res.json({ success: true, messages: [] });
  }
});

module.exports = router;
