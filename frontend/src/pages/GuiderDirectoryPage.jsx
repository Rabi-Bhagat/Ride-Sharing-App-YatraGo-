import React from 'react';
import GuiderProfiles from '../components/GuiderProfiles';
import { Compass, Star, Languages, Award, ShieldCheck } from 'lucide-react';

export default function GuiderDirectoryPage({ selectedGuider, onSelectGuider }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Compass className="text-amber-400" />
              <span>Local Guider Network Directory</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Verified Local Experts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Book licensed travel guiders to escort your ride share and guide your destination exploration.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <GuiderProfiles selectedGuider={selectedGuider} onSelectGuider={onSelectGuider} />
      </div>

    </div>
  );
}
