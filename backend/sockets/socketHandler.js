const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join ride group room
    socket.on('join_ride', (rideId) => {
      socket.join(`ride_${rideId}`);
      console.log(`User ${socket.id} joined ride room: ride_${rideId}`);
      io.to(`ride_${rideId}`).emit('room_notice', {
        text: `A co-rider connected to group chat.`
      });
    });

    // Send group chat message
    socket.on('send_message', async (data) => {
      const { rideId, message } = data;
      const formattedMessage = {
        ...message,
        id: 'msg_' + Date.now() + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString()
      };
      
      // Broadcast immediately to room for real-time latency
      io.to(`ride_${rideId}`).emit('new_message', formattedMessage);

      // Persist asynchronously in MongoDB Atlas
      try {
        const Message = require('../models/Message');
        await Message.create({
          rideId: rideId ? String(rideId) : 'ride_101',
          senderId: message.senderId || 'usr_1',
          senderName: message.senderName || 'Anonymous',
          senderRole: message.senderRole || 'rider',
          senderAvatar: message.senderAvatar,
          isVerified: message.isVerified !== false,
          text: message.text || message.content || '',
          timestamp: new Date()
        });
      } catch (err) {
        // Continue if offline
      }
    });

    // Stranger ride combined notification
    socket.on('combine_ride_request', (data) => {
      const { rideId, strangerInfo } = data;
      io.to(`ride_${rideId}`).emit('stranger_match_accepted', {
        message: `${strangerInfo.name} joined your ride! Combined cost discount applied.`,
        stranger: strangerInfo,
        newSavings: 42
      });
    });

    // Driver location update stream
    socket.on('driver_location', (data) => {
      const { rideId, lat, lng } = data;
      io.to(`ride_${rideId}`).emit('driver_location_update', { lat, lng, timestamp: Date.now() });
    });

    // Emergency SOS Broadcast
    socket.on('trigger_sos', (sosData) => {
      console.warn(`🚨 EMERGENCY SOS BROADCAST TRIGGERED BY ${sosData.userName}`);
      // Broadcast to ALL connected clients and radius
      io.emit('sos_broadcast_alert', {
        alertId: 'sos_' + Date.now(),
        ...sosData,
        timestamp: new Date().toISOString(),
        status: 'ACTIVE'
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocketHandlers;
