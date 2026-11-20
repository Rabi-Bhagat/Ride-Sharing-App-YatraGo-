const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  googleId: { type: String, default: '' },
  authProvider: { type: String, enum: ['password', 'google'], default: 'password' },
  address: { type: String, default: 'Innovation Tech Park, SF' },
  homeAddress: { type: String, default: '450 Mission St, San Francisco, CA' },
  workAddress: { type: String, default: '1 Market St, San Francisco, CA' },
  role: { 
    type: String, 
    enum: ['traveler', 'rider', 'driver', 'guide', 'guider', 'admin'], 
    default: 'traveler' 
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  isVerified: { type: Boolean, default: true },
  verificationBadgeType: { 
    type: String, 
    enum: ['Government ID', 'Top Guider', 'Gold Driver'], 
    default: 'Government ID' 
  },
  rating: { type: Number, default: 4.96 },
  tripsCompleted: { type: Number, default: 42 },
  bio: { 
    type: String, 
    default: 'Passionate traveler & tech enthusiast who loves exploring tech hubs and coastal routes.' 
  },
  emergencyContacts: [
    {
      name: { type: String, default: 'Elena Rivera' },
      phone: { type: String, default: '+1 (555) 911-0199' },
      relation: { type: String, default: 'Family' }
    }
  ],
  walletBalance: { type: Number, default: 145.50 },
  upiId: { type: String, default: 'alex.rivera@oksbi' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
