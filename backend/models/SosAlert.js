const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userPhone: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    addressName: { type: String, default: 'Live GPS Coordinates' }
  },
  status: { type: String, enum: ['ACTIVE', 'RESPONDED', 'RESOLVED'], default: 'ACTIVE' },
  broadcastRadiusKm: { type: Number, default: 5 },
  dispatchedResponders: [{ type: String }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SosAlert', sosAlertSchema);
