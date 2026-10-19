import React, { useState, useEffect } from 'react';
import { 
  Compass, Star, Languages, Award, CheckCircle2, 
  MapPin, Clock, ArrowRight, ShieldCheck 
} from 'lucide-react';
import VerificationBadge from './VerificationBadge';

export default function GuiderProfiles({ onSelectGuider, selectedGuider }) {
  const [guiders, setGuiders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/guiders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGuiders(data.guiders);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="text-violet-400" />
            <span>Local Guider Network</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Book local expert guiders to join your ride share and guide your destination exploration.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
          Verified Local Experts
        </span>
      </div>

      {/* Guider Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm mt-2">Loading verified guider profiles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guiders.map((g) => {
            const isSelected = (selectedGuider?._id && (selectedGuider._id === g._id || selectedGuider._id === g.id)) ||
                               (selectedGuider?.id && (selectedGuider.id === g.id || selectedGuider.id === g._id)) ||
                               (selectedGuider?.name && selectedGuider.name === g.name);
            return (
              <div
                key={g.id || g._id}
                className={`glass-card p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-violet-950/60 to-slate-900 border-violet-500 shadow-xl shadow-violet-500/20 ring-1 ring-violet-500'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={g.avatar}
                      alt={g.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-violet-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-white">{g.name}</h3>
                        <VerificationBadge type="Top Guider" size="md" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-400 mt-0.5">
                        <Star size={13} fill="currentColor" />
                        <strong className="font-bold">{g.rating}</strong>
                        <span className="text-slate-400">({g.reviewCount} reviews)</span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-violet-400" />
                        {g.city}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-3">{g.bio}</p>

                  {/* Languages Spoken */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <Languages size={14} className="text-cyan-400 shrink-0" />
                    <span>{g.languages.join(' • ')}</span>
                  </div>

                  {/* Specialties Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {g.specialties.map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-violet-950/80 text-violet-300 border border-violet-500/30">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action & Rates */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate</span>
                    <span className="text-lg font-extrabold text-white">${g.hourlyRate}<span className="text-xs text-slate-400 font-normal">/hr</span></span>
                  </div>

                  <button
                    onClick={() => onSelectGuider(isSelected ? null : g)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Booked for Trip</span>
                      </>
                    ) : (
                      <>
                        <span>Add to Ride</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
