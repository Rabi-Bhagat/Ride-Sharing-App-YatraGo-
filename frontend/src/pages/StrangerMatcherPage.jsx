import React, { useState } from 'react';
import StrangerMatcher from '../components/StrangerMatcher';
import AiTravelMatchmaker from '../components/AiTravelMatchmaker';
import { Users, Sparkles, Navigation } from 'lucide-react';

// Lazy-load the map engine so the pooling UI renders instantly.
const MapView = React.lazy(() => import('../components/MapView'));

export default function StrangerMatcherPage({ onCombineSuccess, activeRide, onNavigate }) {
  const [poolingMode, setPoolingMode] = useState('route'); // 'route' or 'ai'

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Users className="text-emerald-400" />
              <span>Carpool & Shared Rides</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1 font-mono">
              <Sparkles size={12} />
              Save up to 45%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Share your trip with verified passengers travelling along the same route to split costs, reduce traffic, and travel comfortably.
          </p>
        </div>

        {/* Mode Switcher Pill */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
          <button
            onClick={() => setPoolingMode('route')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              poolingMode === 'route'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation size={14} />
            <span>Active Route Pools</span>
          </button>

          <button
            onClick={() => setPoolingMode('ai')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              poolingMode === 'ai'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Match by Interests</span>
          </button>
        </div>
      </div>

      {poolingMode === 'route' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6">
            <StrangerMatcher onCombineSuccess={onCombineSuccess} />
          </div>
          <div className="lg:col-span-6 h-[min(550px,70dvh)] min-h-[320px] rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
            <React.Suspense fallback={
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-900/60">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
                <span className="text-xs font-mono text-slate-400">Loading map…</span>
              </div>
            }>
              <MapView
                pickup={activeRide?.pickup}
                destination={activeRide?.destination}
                ride={activeRide}
                isStrangerCombined={activeRide?.isStrangerCombined}
              />
            </React.Suspense>
          </div>
        </div>
      ) : (
        <AiTravelMatchmaker 
          onSelectMatch={(candidate) => {
            if (onCombineSuccess) {
              onCombineSuccess({
                ...activeRide,
                isStrangerCombined: true,
                strangerSavingsPercentage: candidate.savingsPercent
              });
            }
          }}
          onOpenChat={() => onNavigate && onNavigate('chat')}
        />
      )}

    </div>
  );
}
