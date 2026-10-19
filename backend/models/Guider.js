const mongoose = require('mongoose');

const guiderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String },
  languages: [{ type: String }],
  specialties: [{ type: String }],
  hourlyRate: { type: Number, default: 25 },
  rating: { type: Number, default: 4.95 },
  reviewCount: { type: Number, default: 128 },
  isVerifiedGuider: { type: Boolean, default: true },
  city: { type: String, default: 'San Francisco, CA' },
  bio: { type: String },
  toursOffered: [
    {
      title: String,
      duration: String,
      price: Number,
      preview3DId: String
    }
  ],
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Guider', guiderSchema);
