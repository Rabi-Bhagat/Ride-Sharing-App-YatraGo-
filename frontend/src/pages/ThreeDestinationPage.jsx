import React, { useState } from 'react';
import ThreeDestinationPreview from '../components/ThreeDestinationPreview';
import Google3DMapSearch from '../components/Google3DMapSearch';
import ErrorBoundary from '../components/ErrorBoundary';
import { Box, Globe, Sparkles, MapPin, Search } from 'lucide-react';

export default function ThreeDestinationPage({ initialDestinationId, onSelectLocationForRide }) {
  const [viewMode, setViewMode] = useState('google3d'); // 'google3d' or 'threejs'

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header with View Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Globe className="text-cyan-400" />
              <span>3D Map & Destination Explorer Hub</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              Interactive 3D Search
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search any landmark, city, or destination worldwide in 3D Satellite view or explore Three.js WebGL volumetric models.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('google3d')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              viewMode === 'google3d'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Globe size={15} />
            <span>Google 3D Satellite Search</span>
          </button>

          <button
            onClick={() => setViewMode('threejs')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              viewMode === 'threejs'
                ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Box size={15} />
            <span>Three.js WebGL City View</span>
          </button>
        </div>
      </div>

      {/* Render Active 3D View with ErrorBoundary Protection */}
      <div className="max-w-6xl mx-auto">
        <ErrorBoundary>
          {viewMode === 'google3d' ? (
            <Google3DMapSearch onSelectLocationForRide={onSelectLocationForRide} />
          ) : (
            <ThreeDestinationPreview 
              initialDestinationId={initialDestinationId} 
              onSelectLocationForRide={onSelectLocationForRide} 
            />
          )}
        </ErrorBoundary>
      </div>

    </div>
  );
}
