import React, { useState } from 'react';
import EmergencySosModal from '../components/EmergencySosModal';
import { AlertTriangle, ShieldAlert, Phone, MapPin, Radio, CheckCircle2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function EmergencySosPage() {
  const { activeSosBroadcast } = useSocket();
  const { user } = useAuth();
  const [showSosModal, setShowSosModal] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-red-500/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              <span>Emergency Safety Center & Local SOS</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/30">
              5km Radius Telemetry Beacon
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Instant 1-click emergency SOS broadcast with 3-second safety countdown, live GPS coordinates & responder dispatch.
          </p>
        </div>

        <button
          onClick={() => setShowSosModal(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition-all animate-pulse"
        >
          Launch Emergency SOS
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        
        {/* Safety Telemetry Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="text-cyan-400 animate-pulse" />
            <span>Active Safety Telemetry</span>
          </h2>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Current GPS Coordinates:</span>
              <strong className="text-white font-mono">37.7749° N, 122.4194° W</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Broadcast Radius:</span>
              <strong className="text-cyan-400 font-bold">5.0 km Radius</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Response Patrol Unit:</span>
              <strong className="text-emerald-400 font-bold">Metro Patrol #402 Standby</strong>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Phone className="text-amber-400" />
            <span>Primary Emergency Contacts</span>
          </h2>

          <div className="space-y-3">
            {user.emergencyContacts.map((c, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-white block text-sm">{c.name} ({c.relation})</strong>
                  <span className="text-xs text-slate-400 font-mono">{c.phone}</span>
                </div>
                <a
                  href={`tel:${c.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-all"
                >
                  Call Contact
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>

      {showSosModal && <EmergencySosModal onClose={() => setShowSosModal(false)} />}

    </div>
  );
}
