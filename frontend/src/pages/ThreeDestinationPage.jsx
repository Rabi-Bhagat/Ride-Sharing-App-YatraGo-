import React, { useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { DESTINATIONS_3D } from '../data/mockData';
import { Box, Globe, Sparkles, MapPin, Search, Bike } from 'lucide-react';

// Code-split the heavy 3D / map engines so this route renders instantly.
const ThreeDestinationPreview = React.lazy(() => import('../components/ThreeDestinationPreview'));
const Google3DMapSearch = React.lazy(() => import('../components/Google3DMapSearch'));
const Interactive3DRideScene = React.lazy(() => import('../components/Interactive3DRideScene'));

function SceneLoader() {
  return (
    <div className="w-full h-[420px] rounded-3xl border border-slate-800 bg-slate-900/60 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
      <span className="text-xs font-mono text-slate-400">Loading 3D experience…</span>
    </div>
  );
}

const VIEW_MODES = ['google3d', 'simulator', 'threejs'];

export default function ThreeDestinationPage({ initialDestinationId, initialViewMode = 'google3d', onSelectLocationForRide }) {
  const [viewMode, setViewMode] = useState(VIEW_MODES.includes(initialViewMode) ? initialViewMode : 'google3d'); // 'simulator', 'google3d', or 'threejs'

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header with View Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Globe className="text-cyan-400" />
              <span>3D Map & Destination Explorer</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              Interactive 3D Experience
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search any landmark worldwide on the 3D satellite map, simulate a highway cruise, or explore volumetric cities.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('google3d')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              viewMode === 'google3d'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Globe size={15} />
            <span>Google 3D Satellite</span>
          </button>

          <button
            onClick={() => setViewMode('simulator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              viewMode === 'simulator'
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Bike size={15} />
            <span>3D Highway Simulator</span>
          </button>

          <button
            onClick={() => setViewMode('threejs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              viewMode === 'threejs'
                ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Box size={15} />
            <span>Volumetric Cities</span>
          </button>
        </div>
      </div>

      {/* Render Active 3D View with ErrorBoundary Protection */}
      <div className="max-w-6xl mx-auto">
        <ErrorBoundary>
          <React.Suspense fallback={<SceneLoader />}>
            {viewMode === 'simulator' && (
              <Interactive3DRideScene
                onBookRideWithRoute={() => {
                  const dest = DESTINATIONS_3D.find(d => d.id === initialDestinationId) || DESTINATIONS_3D[0];
                  if (onSelectLocationForRide) {
                    onSelectLocationForRide({ ...dest, city: dest.address }, 'destination');
                  }
                }}
              />
            )}

            {viewMode === 'google3d' && (
              <Google3DMapSearch onSelectLocationForRide={onSelectLocationForRide} />
            )}

            {viewMode === 'threejs' && (
              <ThreeDestinationPreview 
                initialDestinationId={initialDestinationId} 
                onSelectLocationForRide={onSelectLocationForRide} 
              />
            )}
          </React.Suspense>
        </ErrorBoundary>
      </div>

    </div>
  );
}
