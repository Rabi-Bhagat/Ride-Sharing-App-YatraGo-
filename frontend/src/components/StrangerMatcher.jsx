import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, DollarSign, Sparkles, MapPin, 
  ArrowRight, Percent, UserCheck, CheckCircle2 
} from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import { useSocket } from '../context/SocketContext';

export default function StrangerMatcher({ onCombineSuccess }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [combiningId, setCombiningId] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    fetch('/api/rides/stranger-matches')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMatches(data.matches);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCombine = (match) => {
    setCombiningId(match.matchId);
    
    fetch('/api/rides/combine-stranger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.matchId })
    })
      .then(res => res.json())
      .then(data => {
        setCombiningId(null);
        if (data.success) {
          if (socket) {
            socket.emit('combine_ride_request', {
              rideId: 'ride_101',
              strangerInfo: match.rider
            });
          }
          if (onCombineSuccess) onCombineSuccess(data.ride);
        }
      })
      .catch(() => setCombiningId(null));
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Co-Rider Pooling & Savings</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles size={12} />
              Route Pooling
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pair your ride with verified co-passengers heading in your direction to save up to 45% on trip costs!
          </p>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm">Finding co-riders along your route...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="py-8 text-center text-slate-400">
          <p>No active co-rider pool matches found nearby right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.matchId}
              className="glass-card p-5 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Rider Info */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={match.rider.avatar}
                    alt={match.rider.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/40 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{match.rider.name}</span>
                      <VerificationBadge type={match.rider.trustBadge} size="md" showLabel={true} />
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{match.rider.bio}</p>

                    {/* Route Proximity Metrics */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-semibold flex items-center gap-1">
                        <MapPin size={12} />
                        {match.routeMatchPercent}% Route Overlap
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        +${match.detourMinutes}m detour
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {match.rider.tripsCompleted} completed rides • {match.rider.rating} ★
                      </span>
                    </div>
                  </div>
                </div>

                {/* Savings & Action */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Percent size={14} />
                      Save {match.totalSavingsPercent}% Total
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-extrabold text-white">${match.discountedFarePerPerson.toFixed(2)}</span>
                      <span className="text-xs text-slate-400 line-through">${match.originalFare.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCombine(match)}
                    disabled={combiningId === match.matchId}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {combiningId === match.matchId ? (
                      <span>Joining Pool...</span>
                    ) : (
                      <>
                        <UserCheck size={16} />
                        <span>Pool Ride</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
        <ShieldCheck size={18} className="text-cyan-400 shrink-0" />
        <span>All co-riders undergo identity verification before ride pooling is approved.</span>
      </div>

    </div>
  );
}
