const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['hotel', 'shop', 'restaurant'], required: true },
  city: { type: String, default: 'Kathmandu' },
  area: { type: String },
  description: { type: String },
  promoCode: { type: String, uppercase: true },
  discountPercent: { type: Number, default: 0 },
  commissionPercent: { type: Number, default: 10 },
  tier: { type: String, enum: ['starter', 'growth', 'enterprise'], default: 'starter' },
  rating: { type: Number, default: 4.6 },
  reviewCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: true },
  contactEmail: { type: String },
  contactPhone: { type: String },
  website: { type: String },
  managedBy: { type: String, enum: ['admin', 'developer', 'promotor'], default: 'admin' },
  status: { type: String, enum: ['active', 'pending', 'rejected'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Partner', partnerSchema);
