const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  rideId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['rider', 'driver', 'guider'], default: 'rider' },
  senderAvatar: { type: String },
  isVerified: { type: Boolean, default: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
