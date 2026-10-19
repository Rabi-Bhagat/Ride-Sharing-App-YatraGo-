import React from 'react';
import { CheckCircle2, ShieldCheck, Award } from 'lucide-react';

export default function VerificationBadge({ type = 'Government ID', size = 'md', showLabel = false }) {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  return (
    <div className="inline-flex items-center gap-1 group relative">
      <div className="flex items-center justify-center p-0.5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/40">
        <CheckCircle2 className={`w-${iconSize / 4} h-${iconSize / 4}`} size={iconSize} />
      </div>
      
      {showLabel && (
        <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
          <ShieldCheck size={12} className="text-cyan-400" />
          Verified Profile
        </span>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
        <div className="bg-slate-900/95 border border-cyan-500/30 text-slate-200 text-xs py-1.5 px-3 rounded-lg shadow-xl backdrop-blur-md whitespace-nowrap flex items-center gap-1.5">
          <Award size={14} className="text-cyan-400" />
          <span>Identity Verified • <strong className="text-cyan-300">{type}</strong></span>
        </div>
        <div className="w-2 h-2 bg-slate-900 border-r border-b border-cyan-500/30 rotate-45 -mt-1"></div>
      </div>
    </div>
  );
}
