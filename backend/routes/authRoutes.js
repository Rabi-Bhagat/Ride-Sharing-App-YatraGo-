const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Mock memory user state if mongo disconnected
let memoryUser = {
  id: 'usr_verified_1',
  name: 'Alex Rivera',
  email: 'alex.rivera@yatrago.com',
  phone: '+1 (555) 234-8901',
  role: 'rider',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  isVerified: true,
  verificationBadgeType: 'Government ID',
  rating: 4.96,
  tripsCompleted: 64,
  bio: 'Urban explorer & tech product designer. Always looking for eco-shuttles and local guiders.',
  walletBalance: 145.50,
  upiId: 'alex.rivera@oksbi',
  emergencyContacts: [
    { name: 'Elena Rivera', phone: '+1 (555) 911-0199', relation: 'Sister' },
    { name: 'Marcus Chen', phone: '+1 (555) 432-1098', relation: 'Friend' }
  ]
};

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const user = await User.findOne({ email: memoryUser.email });
    if (user) {
      return res.json({ success: true, user });
    }
    return res.json({ success: true, user: memoryUser });
  } catch (err) {
    return res.json({ success: true, user: memoryUser });
  }
});

// Update user profile or toggle verification status
router.put('/me', async (req, res) => {
  try {
    const { name, bio, isVerified, role, phone, emergencyContacts, walletBalance, upiId } = req.body;
    memoryUser = { ...memoryUser, ...req.body };
    
    let user = await User.findOne({ email: memoryUser.email });
    if (user) {
      if (name !== undefined) user.name = name;
      if (bio !== undefined) user.bio = bio;
      if (typeof isVerified === 'boolean') user.isVerified = isVerified;
      if (role !== undefined) user.role = role;
      if (phone !== undefined) user.phone = phone;
      if (emergencyContacts !== undefined) user.emergencyContacts = emergencyContacts;
      if (walletBalance !== undefined) user.walletBalance = walletBalance;
      if (upiId !== undefined) user.upiId = upiId;
      await user.save();
      return res.json({ success: true, user });
    }
    
    return res.json({ success: true, user: memoryUser });
  } catch (err) {
    return res.json({ success: true, user: memoryUser });
  }
});

module.exports = router;
