import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
      senderAvatar: '',
      isVerified: true,
      text: 'Great, thanks Marcus! I will be waiting near the main entrance plaza.',
      timestamp: new Date(Date.now() - 3 * 60000).toISOString()
    }
  ]);

  const [activeSosBroadcast, setActiveSosBroadcast] = useState(null);
  const [strangerAlertNotification, setStrangerAlertNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mark all chat messages as read (called when the chat page is opened)
  const markMessagesRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Read the signed-in user's identifiers straight from storage so the socket
  // handler always compares against the latest account.
  const getCurrentUserIds = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('yatrago_user') || 'null');
      if (!stored) return [];
      return [stored._id, stored.id, stored.email]
        .filter(Boolean)
        .map(value => String(value));
    } catch (e) {
      return [];
    }
  };

  useEffect(() => {
    // Connect to Socket server with polling fallback and graceful error handling
    const newSocket = io(window.location.origin, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      autoConnect: true,
      timeout: 5000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Socket Connected to server:', newSocket.id);
      newSocket.emit('join_ride', 'ride_101');
    });

    newSocket.on('connect_error', () => {
      // Quietly handle offline backend without throwing errors
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

      // Only incoming messages from another person count as unread;
      // history loaded on startup and your own sent messages do not.
      const senderId = message?.senderId != null ? String(message.senderId) : '';
      const isOwnMessage = senderId && getCurrentUserIds().includes(senderId);
      if (!isOwnMessage) {
        setUnreadCount((prev) => prev + 1);
      }
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
      senderId: user._id || user.id || user.email,
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
        unreadCount,
        markMessagesRead,
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
