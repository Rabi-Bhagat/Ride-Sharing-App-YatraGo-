import React, { useState } from 'react';
import { MapPin, ArrowRight, Sparkles, Image as ImageIcon } from 'lucide-react';
import { HERO_IMAGES } from './HeroImageSlider';

export default function ScenicRoutesGallery({ onBookRideWithRoute, onNavigate }) {
  const [activeId, setActiveId] = useState(HERO_IMAGES[0].id);

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon size={14} className="text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Scenic Routes</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Scenic Corridors & Featured Drives
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Full-frame route previews across the network. Select any corridor to book it instantly.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {HERO_IMAGES.length} Live Corridors
          </span>
          {onNavigate && (
            <button
              onClick={() => onNavigate('preview-3d')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer font-bold"
            >
              <span>3D Hub</span>
              <ArrowRight size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Compact, full-image-fit Route Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {HERO_IMAGES.map((route) => {
          const isActive = activeId === route.id;
          return (
            <div
              key={route.id}
              onMouseEnter={() => setActiveId(route.id)}
              onClick={() => setActiveId(route.id)}
              className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 bg-slate-950 cursor-pointer ${
                isActive
                  ? 'border-cyan-400/70 ring-1 ring-cyan-400/40 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-800 hover:border-slate-600'
              }`}
            >
              {/* Ambient blurred backdrop so the entire picture fits without cropping */}
              <img
                src={route.src}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none"
              />
              <div className="absolute inset-0 bg-slate-950/50 pointer-events-none" />

              {/* Contained (uncropped) frame with padding */}
              <div className="relative aspect-[4/3] p-2 flex items-center justify-center">
                <img
                  src={route.src}
                  alt={route.title}
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl border border-slate-800/80 shadow-md transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />

                {/* Route tag */}
                <span className="absolute top-2.5 left-2.5 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/85 border border-slate-700/80 text-cyan-300 backdrop-blur-sm">
                  {route.tag}
                </span>

                {/* Hover book action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onBookRideWithRoute) {
                      onBookRideWithRoute({ waypoint: route.location, slideTitle: route.title });
                    }
                  }}
                  className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 text-[10px] font-black shadow-md opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all cursor-pointer"
                >
                  <span>Book</span>
                  <ArrowRight size={11} />
                </button>
              </div>

              {/* Caption strip */}
              <div className="relative px-3 py-2.5 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin size={11} className="text-cyan-400 shrink-0" />
                  <span className="text-[11px] font-bold text-white truncate">{route.location}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 truncate">{route.title}</span>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 shrink-0">{route.stat}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
        <Sparkles size={11} className="text-cyan-500" />
        <span>Full-frame previews — every corridor is shown completely inside its frame, never cropped.</span>
      </div>
    </section>
  );
}
