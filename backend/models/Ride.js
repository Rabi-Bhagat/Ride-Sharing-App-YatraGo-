const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  pickup: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  destination: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    preview3DId: { type: String, default: 'downtown' }
  },
  riders: [
    {
      userId: String,
      name: String,
      avatar: String,
      isVerified: Boolean,
      isPrimary: Boolean,
      costShare: Number,
      paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' }
    }
  ],
  driver: {
    name: String,
    vehicle: String,
    licensePlate: String,
    rating: Number,
    phone: String,
    lat: Number,
    lng: Number
  },
  guider: {
    guiderId: String,
    name: String,
    fee: Number
  },
  vehicleType: { type: String, enum: ['Eco Sedan', 'Premium SUV', 'Electric Shuttle', 'Guider Co-Ride'], default: 'Eco Sedan' },
  status: { type: String, enum: ['Requested', 'Matched', 'In Progress', 'Completed', 'Cancelled'], default: 'Requested' },
  isStrangerCombined: { type: Boolean, default: false },
  strangerSavingsPercentage: { type: Number, default: 0 },
  totalCost: { type: Number, required: true },
  distanceKm: { type: Number, default: 12.5 },
  etaMinutes: { type: Number, default: 18 },
  costSplits: [
    {
      riderName: String,
      amount: Number,
      percentage: Number,
      status: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
