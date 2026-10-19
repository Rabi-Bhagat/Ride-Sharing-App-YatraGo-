import React from 'react';
import StrangerMatcher from '../components/StrangerMatcher';
import MapView from '../components/MapView';
import { Users, Sparkles, ShieldCheck, DollarSign } from 'lucide-react';

export default function StrangerMatcherPage({ onCombineSuccess, activeRide }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Users className="text-emerald-400" />
              <span>Stranger Ride Combining Engine</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
              <Sparkles size={12} />
              AI Route Matching
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pair rides with identity-verified co-passengers traveling along similar route trajectories to save up to 45% on fare.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6">
          <StrangerMatcher onCombineSuccess={onCombineSuccess} />
        </div>
        <div className="lg:col-span-6 h-[550px]">
          <MapView
            pickup={activeRide.pickup}
            destination={activeRide.destination}
            ride={activeRide}
            isStrangerCombined={activeRide.isStrangerCombined}
          />
        </div>
      </div>

    </div>
  );
}
