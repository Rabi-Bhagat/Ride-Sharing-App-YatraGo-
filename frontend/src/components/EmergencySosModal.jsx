import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Phone, MapPin, Radio, X, CheckCircle2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function EmergencySosModal({ onClose }) {
  const { triggerSos, activeSosBroadcast, clearSosAlert } = useSocket();
  const { user } = useAuth();
  
  const [countdown, setCountdown] = useState(3);
  const [isCounting, setIsCounting] = useState(false);
  const [triggered, setTriggered] = useState(!!activeSosBroadcast);

  useEffect(() => {
    let timer;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (isCounting && countdown === 0) {
      setIsCounting(false);
      executeSosTrigger();
    }
    return () => clearTimeout(timer);
  }, [isCounting, countdown]);

  const startCountdown = () => {
    setCountdown(3);
    setIsCounting(true);
  };

  const cancelCountdown = () => {
    setIsCounting(false);
    setCountdown(3);
  };

  const executeSosTrigger = () => {
    setTriggered(true);
    triggerSos({
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      lat: 37.7749,
      lng: -122.4194,
      addressName: 'Innovation Tech Park (37.7749 N, 122.4194 W)'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-lg animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-red-500/50 shadow-2xl p-6 relative text-center space-y-6 overflow-hidden">
        
        {/* Background SOS Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>

        {/* SOS Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-red-600/50 sos-button-active">
            <AlertTriangle size={36} className="animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Localized Emergency SOS</h2>
          <p className="text-xs text-red-200">
            Instantly broadcast emergency location telemetry to local radius units & nearby drivers.
          </p>
        </div>

        {/* Main Countdown or Active Trigger */}
        {!triggered ? (
          isCounting ? (
            <div className="p-6 rounded-2xl bg-red-900/60 border border-red-500 space-y-4">
              <span className="text-xs font-bold text-red-300 block uppercase">Broadcasting in...</span>
              <span className="text-6xl font-black text-white font-mono animate-ping">{countdown}</span>
              <button
                onClick={cancelCountdown}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider border border-slate-700"
              >
                Cancel SOS Press
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={startCountdown}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-lg uppercase tracking-widest shadow-2xl shadow-red-600/60 hover:scale-105 active:scale-95 transition-all border-2 border-red-400"
              >
                PRESS TO BROADCAST SOS
              </button>
              <p className="text-[11px] text-slate-400">Includes 3-second safety countdown to prevent false triggers.</p>
            </div>
          )
        ) : (
          <div className="p-5 rounded-2xl bg-red-950/80 border border-red-500/80 space-y-4 text-left">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 size={18} />
              <span>EMERGENCY SOS BROADCAST IS LIVE</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-red-400 animate-pulse" />
                <span>Broadcasting to 5.0 km radius</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-cyan-400" />
                <span className="font-mono text-[11px]">GPS: 37.7749° N, 122.4194° W</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-amber-400" />
                <span>Responders: Metro Patrol 402, Rapid Security Unit 12</span>
              </div>
            </div>

            <button
              onClick={() => {
                clearSosAlert();
                setTriggered(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-bold border border-slate-700 hover:bg-slate-800"
            >
              Deactivate SOS Broadcast
            </button>
          </div>
        )}

        {/* Emergency Contacts Quick Call */}
        <div className="pt-3 border-t border-red-900/60 flex items-center justify-between text-xs text-slate-300">
          <span>Primary Contact: {user.emergencyContacts[0]?.name}</span>
          <a
            href={`tel:${user.emergencyContacts[0]?.phone}`}
            className="flex items-center gap-1 text-cyan-400 font-bold hover:underline"
          >
            <Phone size={13} />
            <span>Call Now</span>
          </a>
        </div>

      </div>
    </div>
  );
}
