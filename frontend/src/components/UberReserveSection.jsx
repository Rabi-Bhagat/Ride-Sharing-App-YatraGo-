import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, DollarSign } from 'lucide-react';

export default function UberReserveSection({ onReserveClick }) {
  const [reserveDate, setReserveDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [reserveTime, setReserveTime] = useState('08:00');
  const [destination, setDestination] = useState('Delhi Airport (DEL)');

  const handleReserve = () => {
    if (onReserveClick) {
      onReserveClick({
        date: reserveDate,
        time: reserveTime,
        destination,
        service: 'reserve'
      });
    }
  };

  return (
    <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-2xl relative">
      
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Heading, Info & Form */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <Calendar size={13} className="text-cyan-400" />
              <span>PLAN FOR LATER</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Get Your Ride Right with{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                YatraGo Reserve
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Reserve your ride up to 90 days in advance so you can relax on the day of your flight, meeting, or event. Your driver is locked in advance with complimentary wait time.
            </p>
          </div>

          {/* Interactive Date, Time & Destination Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl">
            {/* Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                <Calendar size={12} className="text-cyan-400" />
                <span>Choose Date</span>
              </label>
              <input
                type="date"
                value={reserveDate}
                onChange={(e) => setReserveDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              />
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                <Clock size={12} className="text-emerald-400" />
                <span>Pickup Time</span>
              </label>
              <input
                type="time"
                value={reserveTime}
                onChange={(e) => setReserveTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
              />
            </div>

            {/* Destination */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                <MapPin size={12} className="text-amber-400" />
                <span>Destination</span>
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400 cursor-pointer truncate"
              >
                <option value="Delhi Airport (DEL)">Delhi Airport (DEL)</option>
                <option value="Mumbai Airport (BOM)">Mumbai Airport (BOM)</option>
                <option value="Bengaluru Airport (BLR)">Bengaluru Airport (BLR)</option>
                <option value="Downtown Cyber Hub">Downtown Cyber Hub</option>
                <option value="Oceanfront Bay Pier">Oceanfront Bay Pier</option>
              </select>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleReserve}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-white/10 hover:shadow-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>See Prices & Reserve</span>
              <ArrowRight size={15} />
            </button>

            <span className="text-xs text-slate-400 font-mono">
              ⚡ Lock in fare with zero surge pricing
            </span>
          </div>

        </div>

        {/* Right Column: Key Benefits Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-black text-sm">
              <CheckCircle2 size={18} />
              <h4>Book Up to 90 Days in Advance</h4>
            </div>
            <p className="text-xs text-slate-400 pl-6">
              Plan corporate trips, flights, and weekend getaways with guaranteed driver assignment.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <CheckCircle2 size={18} />
              <h4>Extra Wait Time Included</h4>
            </div>
            <p className="text-xs text-slate-400 pl-6">
              Includes up to 15 minutes of complimentary wait time at standard pickups (up to 45 mins at airports).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
              <CheckCircle2 size={18} />
              <h4>Free Cancellation Policy</h4>
            </div>
            <p className="text-xs text-slate-400 pl-6">
              Cancel at no charge up to 60 minutes before scheduled pickup time with instant refund.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

