const express = require('express');
const router = express.Router();
const SosAlert = require('../models/SosAlert');

let activeSosBroadcasts = [];

// Trigger Emergency SOS alert
router.post('/trigger', async (req, res) => {
  const { userId, userName, userPhone, lat, lng, addressName } = req.body;

  const newAlert = {
    id: 'sos_' + Date.now(),
    userId: userId || 'usr_1',
    userName: userName || 'Alex Rivera',
    userPhone: userPhone || '+1 (555) 234-8901',
    location: {
      lat: lat || 37.7749,
      lng: lng || -122.4194,
      addressName: addressName || 'Innovation Tech Park (37.7749 N, 122.4194 W)'
    },
    status: 'ACTIVE',
    broadcastRadiusKm: 5.0,
    dispatchedResponders: ['Metro Patrol 402', 'Rapid Security Unit 12'],
    timestamp: new Date().toISOString()
  };

  activeSosBroadcasts.unshift(newAlert);

  try {
    const alert = new SosAlert({
      userId: newAlert.userId,
      userName: newAlert.userName,
      userPhone: newAlert.userPhone,
      location: newAlert.location,
      status: 'ACTIVE'
    });
    await alert.save();
  } catch (err) {
    // Ignore mongo sync fail if offline
  }

  return res.json({
    success: true,
    message: '🚨 EMERGENCY BROADCAST ACTIVATED! Nearby response units and co-riders alerted.',
    alert: newAlert
  });
});

// Get active emergency SOS alerts
router.get('/active', (req, res) => {
  return res.json({ success: true, alerts: activeSosBroadcasts.filter(a => a.status === 'ACTIVE') });
});

// Resolve Emergency SOS
router.post('/resolve/:id', (req, res) => {
  const alertIndex = activeSosBroadcasts.findIndex(a => a.id === req.params.id);
  if (alertIndex !== -1) {
    activeSosBroadcasts[alertIndex].status = 'RESOLVED';
  }
  return res.json({ success: true, message: 'Emergency alert marked as resolved.' });
});

module.exports = router;
