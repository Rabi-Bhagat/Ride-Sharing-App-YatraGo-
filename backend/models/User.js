const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['rider', 'driver', 'guider'], default: 'rider' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  isVerified: { type: Boolean, default: true },
  verificationBadgeType: { type: String, enum: ['Government ID', 'Top Guider', 'Gold Driver'], default: 'Government ID' },
  rating: { type: Number, default: 4.9 },
  tripsCompleted: { type: Number, default: 42 },
  bio: { type: String, default: 'Passionate traveler & tech enthusiast who loves exploring tech hubs and coastal routes.' },
  emergencyContacts: [
    {
      name: { type: String, default: 'Emergency Contact 1' },
      phone: { type: String, default: '+1 (555) 911-0199' },
      relation: { type: String, default: 'Family' }
    }
  ],
  walletBalance: { type: Number, default: 145.50 },
  upiId: { type: String, default: 'alex.rivera@oksbi' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
