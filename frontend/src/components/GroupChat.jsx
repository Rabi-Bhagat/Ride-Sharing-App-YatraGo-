import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Send, X, ShieldCheck, User, Compass, Car, Users,
  Phone, PhoneOff, MapPin, CheckCheck, Sparkles, AlertTriangle,
  Smile, Mic, Paperclip, ChevronRight, Volume2, Shield
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import VerificationBadge from './VerificationBadge';
import UserAvatar from './UserAvatar';

export default function GroupChat({ 
  activeChannel = 'driver', 
  onClose, 
  isModal = false,
  channelData = null 
}) {
  const { messages: socketMessages, sendMessage } = useSocket();
  const { user, openAuthModal } = useAuth();
  const [text, setText] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callMuted, setCallMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [locationShared, setLocationShared] = useState(false);
  const messagesEndRef = useRef(null);

  // Channels definitions
  const CHANNELS_INFO = {
    driver: {
      name: 'Rajesh Sharma',
      role: 'Verified Driver',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      vehicle: 'White Toyota Hyryder Hybrid',
      plate: 'DL-01-AB-1234',
      rating: '4.98 ★',
      eta: '2 mins away'
    },
    pool: {
      name: 'Co-Riders Corridor Pool',
      role: 'Pool Group (3 Riders)',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&q=80',
      vehicle: 'Cyber Harbor Route',
      plate: 'Saved 44%',
      rating: 'Pool Hub',
      eta: 'In Transit'
    },
    guider: {
      name: 'Aarav Kapoor',
      role: 'Local City Guider',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      vehicle: 'Downtown Transit Guide',
      plate: 'Verified Specialist',
      rating: '5.0 ★',
      eta: 'Online'
    },
    support: {
      name: 'YatraGo Safety Desk',
      role: '24/7 Safety Protocol',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      vehicle: 'Emergency Response Network',
      plate: 'SOS Armed',
      rating: '24/7',
      eta: 'Instant'
    }
  };

  const channel = channelData || CHANNELS_INFO[activeChannel] || CHANNELS_INFO.driver;

  // Local message state keyed per channel
  const [channelMessages, setChannelMessages] = useState({
    driver: [
      {
        id: 'd_1',
        senderId: 'driver_1',
        senderName: 'Rajesh Sharma',
        senderRole: 'driver',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        isVerified: true,
        text: 'Namaste Alex! I am en route in a white Toyota Hyryder Hybrid (DL-01-AB-1234). ETA ~2 minutes.',
        timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
        type: 'text'
      },
      {
        id: 'd_2',
        senderId: user ? (user._id || user.id || 'usr_me') : 'rider_demo',
        senderName: user?.name || 'Passenger',
        senderRole: 'rider',
        senderAvatar: user?.avatar || '',
        isVerified: true,
        text: 'Thanks Rajesh! I am at Innovation Tech Park near the glass canopy entrance.',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        type: 'text'
      },
      {
        id: 'd_3',
        senderId: 'driver_1',
        senderName: 'Rajesh Sharma',
        senderRole: 'driver',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        isVerified: true,
        text: 'Perfect, I just crossed the Cyber Harbor signal. Pulling in with hazard lights on!',
        timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
        type: 'text'
      }
    ],
    pool: [
      {
        id: 'p_1',
        senderId: 'co_1',
        senderName: 'Maya Sharma',
        senderRole: 'pool_rider',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        isVerified: true,
        text: 'Hi co-riders! I will board at Cyber Harbor Viaduct stop. Heading to Downtown Tech Park.',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        type: 'text'
      },
      {
        id: 'p_2',
        senderId: 'system',
        senderName: 'YatraGo Smart Pool',
        senderRole: 'system',
        senderAvatar: '/yatrago-logo.png',
        isVerified: true,
        text: 'Smart Pool algorithm matched: 44% fare discount applied (₹280 split per rider).',
        timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
        type: 'system'
      },
      {
        id: 'p_3',
        senderId: 'co_2',
        senderName: 'Rahul Verma',
        senderRole: 'pool_rider',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        isVerified: true,
        text: 'Hello Maya & Alex! Looking forward to the ride.',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        type: 'text'
      }
    ],
    guider: [
      {
        id: 'g_1',
        senderId: 'guider_1',
        senderName: 'Aarav Kapoor',
        senderRole: 'guider',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        isVerified: true,
        text: 'Welcome Alex! I am your assigned trip guider. If you need any recommendations for Downtown Cyber Hub or airport gate shortcuts, feel free to ask!',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        type: 'text'
      }
    ],
    support: [
      {
        id: 's_1',
        senderId: 'support_1',
        senderName: 'YatraGo Safety Support',
        senderRole: 'support',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        isVerified: true,
        text: 'Your ride is protected by 24/7 safety monitoring and verified drivers. Tap SOS anytime if you need urgent assistance.',
        timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
        type: 'system'
      }
    ]
  });

  const activeMessages = channelMessages[activeChannel] || channelMessages.driver;

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, activeChannel]);

  // Call duration counter
  useEffect(() => {
    let timer = null;
    if (isCalling) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  const formatCallTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!user) {
      if (openAuthModal) openAuthModal('login', 'chat');
      return;
    }
    if (!text.trim()) return;

    const newMsg = {
      id: 'msg_' + Date.now(),
      senderId: user._id || user.id || 'usr_me',
      senderName: user.name || 'Rider',
      senderRole: user.role || 'rider',
      senderAvatar: user.avatar || '',
      isVerified: Boolean(user.isVerified),
      text: text.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setChannelMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg]
    }));

    if (sendMessage) {
      sendMessage('ride_101', text.trim(), user);
    }

    setText('');
  };

  const handleShareLocation = () => {
    if (!user) {
      if (openAuthModal) openAuthModal('login', 'chat');
      return;
    }
    const locMsg = {
      id: 'loc_' + Date.now(),
      senderId: user._id || user.id || 'usr_me',
      senderName: user.name || 'Rider',
      senderRole: user.role || 'rider',
      senderAvatar: user.avatar || '',
      isVerified: Boolean(user.isVerified),
      text: '📍 Shared Live GPS Pickup Pin: Innovation Tech Park (East Concourse, Canopy Area)',
      timestamp: new Date().toISOString(),
      type: 'location'
    };

    setChannelMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), locMsg]
    }));

    setLocationShared(true);
    setTimeout(() => setLocationShared(false), 3000);
  };

  const presets = [
    "I'm waiting near the pickup pin.",
    "Please wait 2 mins, on my way down.",
    "Which car color / lane?",
    "Traffic is moving fast!",
    "Thank you, see you soon!"
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-950/95 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl">
      
      {/* ========================================================= */}
      {/* 1. CHAT HEADER: PARTICIPANT IDENTITY, STATUS & ACTIONS    */}
      {/* ========================================================= */}
      <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={channel.avatar}
              alt={channel.name}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover ring-2 ring-cyan-500/40 shadow-md"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-white truncate">
                {channel.name}
              </h2>
              <VerificationBadge size="sm" showLabel={false} />
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono font-bold border border-cyan-500/30 shrink-0">
                {channel.role}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
              {channel.vehicle && (
                <span className="flex items-center gap-1 text-[11px] text-slate-300 font-medium truncate">
                  <Car size={12} className="text-cyan-400 shrink-0" />
                  <span className="truncate">{channel.vehicle}</span>
                </span>
              )}
              {channel.plate && (
                <>
                  <span className="h-2.5 w-px bg-slate-800" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {channel.plate}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons (Call Driver, Share Pin, Close) */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* Simulated In-App Call Button */}
          <button
            onClick={() => setIsCalling(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Call via Secure Proxy"
          >
            <Phone size={13} className="text-emerald-400" />
            <span className="hidden md:inline">Call</span>
          </button>

          {/* Share Live Pin Button */}
          <button
            onClick={handleShareLocation}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Share Live GPS Pickup Pin"
          >
            <MapPin size={13} className="text-cyan-400" />
            <span className="hidden md:inline">Share Pin</span>
          </button>

          {/* Modal Close Button */}
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          )}

        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. DRIVER ETA BANNER NOTIFICATION                          */}
      {/* ========================================================= */}
      <div className="px-4 py-2 bg-gradient-to-r from-cyan-950/60 via-slate-900/60 to-emerald-950/60 border-b border-cyan-500/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span className="text-[11px] text-slate-300 font-medium">
            Ride <strong className="text-white font-bold">#YT-8492</strong> • Status: <strong className="text-cyan-300">{channel.eta}</strong>
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
          Masked Privacy Call Active
        </span>
      </div>

      {/* ========================================================= */}
      {/* 3. SCROLLABLE MESSAGE STREAM                              */}
      {/* ========================================================= */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        
        {activeMessages.map((msg, idx) => {
          const isMe = msg.senderId === (user?._id || user?.id || 'usr_1');
          const isSystem = msg.type === 'system' || msg.senderRole === 'system';
          const isLocation = msg.type === 'location';

          if (isSystem) {
            return (
              <div key={msg.id || idx} className="flex justify-center my-2">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 font-medium shadow-sm">
                  <ShieldCheck size={13} className="text-cyan-400 shrink-0" />
                  <span>{msg.text}</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id || idx}
              className={`flex gap-3 items-end ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Sender Avatar */}
              <UserAvatar
                name={msg.senderName}
                avatar={msg.senderAvatar}
                size="sm"
                className="rounded-xl overflow-hidden shrink-0"
              />

              <div className={`max-w-[80%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                
                {/* Name & Role Tag */}
                <div className={`flex items-center gap-1.5 text-[11px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span className="font-bold text-slate-200">{msg.senderName}</span>
                  {msg.isVerified && <VerificationBadge size="sm" showLabel={false} />}
                  <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-mono font-bold ${
                    msg.senderRole === 'driver'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : msg.senderRole === 'pool_rider'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {msg.senderRole}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm font-medium shadow-md leading-relaxed ${
                    isLocation
                      ? 'bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 border border-cyan-500/40 text-cyan-200 rounded-br-none'
                      : isMe
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-cyan-500/20 shadow-lg'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {isLocation ? (
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div className="space-y-1">
                        <strong className="block text-white font-bold text-xs">Live Pickup Waypoint Shared</strong>
                        <p className="text-xs text-slate-300 leading-normal">{msg.text.replace('📍 ', '')}</p>
                        <span className="inline-block text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                          Accurate to 3 meters • GPS Synced
                        </span>
                      </div>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>

                {/* Timestamp & Read Receipt */}
                <div className={`flex items-center gap-1 text-[10px] font-mono text-slate-500 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span>
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && <CheckCheck size={12} className="text-cyan-400" />}
                </div>

              </div>

            </div>
          );
        })}

        <div ref={messagesEndRef} />

      </div>

      {/* ========================================================= */}
      {/* 4. PRESET QUICK-REPLY CHIPS                               */}
      {/* ========================================================= */}
      <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 shrink-0">Quick:</span>
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => setText(preset)}
            className="text-[11px] px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white whitespace-nowrap border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer shadow-sm shrink-0"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 5. COMPOSER INPUT BAR                                     */}
      {/* ========================================================= */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0">
        
        {/* Quick Pin Shortcut */}
        <button
          type="button"
          onClick={handleShareLocation}
          disabled={!user}
          className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 transition-all cursor-pointer disabled:opacity-40"
          title={user ? "Share GPS Location Pin" : "Sign in to share location"}
        >
          <MapPin size={16} />
        </button>

        {/* Message Input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!user}
          placeholder={user ? `Message ${channel.name.split(' ')[0]}...` : "Sign in to send messages..."}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors shadow-inner disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!user || !text.trim()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          <span>Send</span>
          <Send size={14} />
        </button>

      </form>

      {/* ========================================================= */}
      {/* 6. SIMULATED SECURE VOICE CALL POPUP OVERLAY              */}
      {/* ========================================================= */}
      {isCalling && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 animate-fadeIn">
          
          {/* Call Header */}
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>YATRAGO ENCRYPTED VOICE PROXY</span>
            </span>
            <p className="text-xs text-slate-400">Caller ID Masked for Safety</p>
          </div>

          {/* Caller Avatar & Ringing Animation */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
              <img
                src={channel.avatar}
                alt={channel.name}
                className="relative w-24 h-24 rounded-full object-cover ring-4 ring-cyan-500 shadow-2xl"
              />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-black text-white">{channel.name}</h3>
              <p className="text-xs text-cyan-400 font-mono mt-0.5">{channel.role}</p>
              <div className="mt-2 text-lg font-mono font-black text-emerald-400">
                {formatCallTime(callDuration)}
              </div>
            </div>
          </div>

          {/* In-Call Action Buttons */}
          <div className="flex items-center gap-4">
            
            <button
              onClick={() => setCallMuted(!callMuted)}
              className={`p-4 rounded-full transition-all cursor-pointer ${
                callMuted
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title={callMuted ? 'Unmute' : 'Mute'}
            >
              <Mic size={20} />
            </button>

            <button
              onClick={() => setIsCalling(false)}
              className="p-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="End Call"
            >
              <PhoneOff size={24} />
            </button>

            <button
              onClick={() => alert("Speakerphone toggled")}
              className="p-4 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Speakerphone"
            >
              <Volume2 size={20} />
            </button>

          </div>

        </div>
      )}

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-lg h-[620px] relative">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
