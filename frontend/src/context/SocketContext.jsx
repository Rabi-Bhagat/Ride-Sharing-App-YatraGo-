import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'msg_1',
      senderId: 'driver_1',
      senderName: 'Marcus Vance (Driver)',
      senderRole: 'driver',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      text: 'Hello Alex! I am en route to Innovation Tech Park. ETA ~4 minutes in a silver Tesla Model Y.',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
      id: 'msg_2',
      senderId: 'usr_1',
      senderName: 'Alex Rivera',
      senderRole: 'rider',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      text: 'Great, thanks Marcus! I will be waiting near the main entrance plaza.',
      timestamp: new Date(Date.now() - 3 * 60000).toISOString()
    }
  ]);

  const [activeSosBroadcast, setActiveSosBroadcast] = useState(null);
  const [strangerAlertNotification, setStrangerAlertNotification] = useState(null);

  useEffect(() => {
    // Connect to Socket server
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Socket Connected to server:', newSocket.id);
      newSocket.emit('join_ride', 'ride_101');
    });

    // Load persisted chat history from MongoDB
    fetch('/api/rides/ride_101/messages')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});

    newSocket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('stranger_match_accepted', (data) => {
      setStrangerAlertNotification(data);
    });

    newSocket.on('sos_broadcast_alert', (sosData) => {
      console.warn('🚨 SOS Broadcast Received:', sosData);
      setActiveSosBroadcast(sosData);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = (rideId, text, user) => {
    const newMsg = {
      rideId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      senderAvatar: user.avatar,
      isVerified: user.isVerified,
      text,
      timestamp: new Date().toISOString()
    };

    if (socket) {
      socket.emit('send_message', { rideId, message: newMsg });
    } else {
      // Fallback local update
      setMessages((prev) => [...prev, { ...newMsg, id: 'msg_' + Date.now() }]);
    }
  };

  const triggerSos = (sosData) => {
    if (socket) {
      socket.emit('trigger_sos', sosData);
    }
    setActiveSosBroadcast({
      alertId: 'sos_' + Date.now(),
      ...sosData,
      status: 'ACTIVE',
      timestamp: new Date().toISOString()
    });
  };

  const clearSosAlert = () => {
    setActiveSosBroadcast(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        messages,
        sendMessage,
        activeSosBroadcast,
        triggerSos,
        clearSosAlert,
        strangerAlertNotification,
        setStrangerAlertNotification
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
