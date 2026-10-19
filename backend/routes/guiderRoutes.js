const express = require('express');
const router = express.Router();
const Guider = require('../models/Guider');

// Seed mock local guider directory
const mockGuiders = [
  {
    id: 'gdr_1',
    name: 'Sofia Martinez',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    languages: ['English', 'Spanish', 'French'],
    specialties: ['Architectural Landmarks', 'Local Gastronomy', 'Nightlife Routes'],
    hourlyRate: 35,
    rating: 4.98,
    reviewCount: 142,
    isVerifiedGuider: true,
    city: 'Downtown Cyber Hub',
    bio: 'Licensed city guide with 6+ years experience showing visitors hidden cultural gems and tech hubs.',
    toursOffered: [
      { title: 'Tech Hub & Skyline Sunset Tour', duration: '2 Hours', price: 45, preview3DId: 'downtown' },
      { title: 'Historic Cultural District Walk', duration: '3 Hours', price: 60, preview3DId: 'historic' }
    ]
  },
  {
    id: 'gdr_2',
    name: 'Kenji Takahashi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    languages: ['English', 'Japanese'],
    specialties: ['Oceanfront Coast', 'Sunset Photography', 'Eco Navigation'],
    hourlyRate: 40,
    rating: 4.92,
    reviewCount: 98,
    isVerifiedGuider: true,
    city: 'Oceanfront Bay Resort',
    bio: 'Avid coastal photographer and maritime navigator. I escort co-riders along scenic ocean drives.',
    toursOffered: [
      { title: 'Pacific Rim Panoramic Drive', duration: '2.5 Hours', price: 55, preview3DId: 'ocean' }
    ]
  },
  {
    id: 'gdr_3',
    name: 'Amara Okafor',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
    languages: ['English', 'Igbo', 'German'],
    specialties: ['Mountain Trails', 'Art Galleries', 'Food Markets'],
    hourlyRate: 30,
    rating: 4.95,
    reviewCount: 115,
    isVerifiedGuider: true,
    city: 'Alpine Summit & Valley',
    bio: 'Outdoor enthusiast and local food critic. Ready to join your ride share and guide your valley expedition.',
    toursOffered: [
      { title: 'Alpine Gateway & Peak Preview', duration: '4 Hours', price: 80, preview3DId: 'alpine' }
    ]
  }
];

// Get all guider profiles
router.get('/', async (req, res) => {
  try {
    const guiders = await Guider.find();
    if (guiders && guiders.length > 0) {
      return res.json({ success: true, guiders });
    }
    return res.json({ success: true, guiders: mockGuiders });
  } catch (err) {
    return res.json({ success: true, guiders: mockGuiders });
  }
});

// Get single guider detail
router.get('/:id', async (req, res) => {
  const guider = mockGuiders.find(g => g.id === req.params.id || g._id === req.params.id);
  if (guider) {
    return res.json({ success: true, guider });
  }
  return res.status(404).json({ success: false, message: 'Guider not found' });
});

module.exports = router;
