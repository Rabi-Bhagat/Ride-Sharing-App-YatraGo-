import React, { useState } from 'react';
import { MessageSquare, Send, X, ShieldCheck, User, Compass, Car } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import VerificationBadge from './VerificationBadge';

export default function GroupChat({ onClose }) {
  const { messages, sendMessage } = useSocket();
  const { user } = useAuth();
  const [text, setText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage('ride_101', text, user);
    setText('');
  };

  const presets = [
    "I'm waiting near the pickup pin.",
    "En route to destination!",
    "Guider joining the group."
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg h-[580px] rounded-2xl border border-slate-800 shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Ride Group Chat</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-400">Co-Riders • Driver • Local Guider</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user.id;
            return (
              <div
                key={msg.id || idx}
                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <img
                  src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-slate-700 shrink-0"
                />

                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-1.5 text-[11px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="font-bold text-slate-300">{msg.senderName}</span>
                    {msg.isVerified && <VerificationBadge size="sm" />}
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 uppercase">
                      {msg.senderRole}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs font-medium shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  
                  <span className="text-[9px] text-slate-500 block text-right font-mono">
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preset Chips */}
        <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => setText(preset)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700/60"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type live group message..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
