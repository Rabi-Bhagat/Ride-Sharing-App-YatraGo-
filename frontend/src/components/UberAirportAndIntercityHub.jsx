import React, { useState } from 'react';
import { 
  Plane, MapPin, ArrowRight, Car, Compass, Package, 
  Bus, Clock, ShieldCheck, ChevronRight, Sparkles, Navigation
} from 'lucide-react';

const AIRPORTS_DATA = [
  { code: 'DEL', name: 'Delhi Indira Gandhi Airport', city: 'New Delhi', basePrice: 650.00, duration: '35 mins', popularRoute: 'Connaught Place to DEL' },
  { code: 'BOM', name: 'Mumbai Chhatrapati Shivaji Airport', city: 'Mumbai', basePrice: 750.00, duration: '40 mins', popularRoute: 'Bandra BKC to BOM' },
  { code: 'BLR', name: 'Bengaluru Kempegowda Airport', city: 'Bengaluru', basePrice: 850.00, duration: '50 mins', popularRoute: 'Electronic City to BLR' },
  { code: 'HYD', name: 'Hyderabad Rajiv Gandhi Airport', city: 'Hyderabad', basePrice: 680.00, duration: '42 mins', popularRoute: 'Hitec City to HYD' },
  { code: 'CCU', name: 'Kolkata Netaji Subhash Airport', city: 'Kolkata', basePrice: 550.00, duration: '30 mins', popularRoute: 'Salt Lake to CCU' },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', basePrice: 600.00, duration: '38 mins', popularRoute: 'T. Nagar to MAA' },
  { code: 'AMD', name: 'Ahmedabad Sardar Vallabhbhai Airport', city: 'Ahmedabad', basePrice: 480.00, duration: '25 mins', popularRoute: 'SG Highway to AMD' },
  { code: 'PNQ', name: 'Pune Lohegaon International Airport', city: 'Pune', basePrice: 520.00, duration: '32 mins', popularRoute: 'Hinjawadi to PNQ' },
  { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', basePrice: 620.00, duration: '45 mins', popularRoute: 'Ernakulam to COK' },
  { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', basePrice: 450.00, duration: '28 mins', popularRoute: 'Pink City to JAI' }
];

const INTERCITY_DATA = [
  { from: 'Mumbai', to: 'Pune', distance: '148 km', duration: '2 hrs 45 mins', price: 2200.00, highway: 'Expressway' },
  { from: 'Delhi', to: 'Mathura', distance: '162 km', duration: '2 hrs 50 mins', price: 2400.00, highway: 'Yamuna Exp.' },
  { from: 'Gurgaon', to: 'Delhi', distance: '34 km', duration: '48 mins', price: 450.00, highway: 'NH 48' },
  { from: 'Lucknow', to: 'Kanpur', distance: '85 km', duration: '1 hr 35 mins', price: 1450.00, highway: 'Agra-Lucknow' },
  { from: 'Bangalore', to: 'Mysore', distance: '144 km', duration: '2 hrs 30 mins', price: 2100.00, highway: 'Access Expressway' },
  { from: 'Haveli', to: 'Mumbai', distance: '155 km', duration: '3 hrs', price: 2300.00, highway: 'Pune Highway' },
  { from: 'Thane', to: 'Haveli', distance: '140 km', duration: '2 hrs 40 mins', price: 1950.00, highway: 'NH 48' },
  { from: 'Ahmedabad', to: 'Vadodara', distance: '112 km', duration: '1 hr 55 mins', price: 1650.00, highway: 'NE 1' },
  { from: 'Thrissur', to: 'Chavakkad', distance: '28 km', duration: '40 mins', price: 550.00, highway: 'State Hwy' },
  { from: 'Thiruvananthapuram', to: 'Neyyattinkara', distance: '20 km', duration: '32 mins', price: 420.00, highway: 'NH 66' }
];

const COURIER_DATA = [
  { city: 'New Delhi', eta: 'Same Day (< 2 hrs)', fee: 65.00, desc: 'Documents, food, gifts across NCR' },
  { city: 'Mumbai (Suburban)', eta: 'Same Day (< 2.5 hrs)', fee: 75.00, desc: 'Doorstep parcel handover' },
  { city: 'Bangalore North', eta: 'Same Day (< 2 hrs)', fee: 70.00, desc: 'Express tech corridor delivery' },
  { city: 'Hyderabad', eta: 'Same Day (< 2 hrs)', fee: 60.00, desc: 'Live GPS tracked package messenger' },
  { city: 'Kolkata', eta: 'Same Day (< 2.5 hrs)', fee: 55.00, desc: 'Fast city wide courier dispatch' },
  { city: 'Chennai', eta: 'Same Day (< 2 hrs)', fee: 60.00, desc: 'Secure direct envelope delivery' },
  { city: 'Jaipur', eta: 'Same Day (< 1.5 hrs)', fee: 50.00, desc: 'Handcrafted items & quick parcel' },
  { city: 'Lucknow', eta: 'Same Day (< 2 hrs)', fee: 50.00, desc: 'Reliable package drop-off' }
];

const BUS_ROUTES_DATA = [
  { route: 'Delhi to Manali Bus', duration: '12 hrs', fare: 850.00, type: 'Volvo AC Sleeper' },
  { route: 'Hyderabad to Bangalore Bus', duration: '9 hrs', fare: 750.00, type: 'Multi-Axle Semi-Sleeper' },
  { route: 'Bangalore to Chennai Bus', duration: '6 hrs', fare: 550.00, type: 'Executive Electric AC' },
  { route: 'Delhi to Rishikesh Bus', duration: '5.5 hrs', fare: 450.00, type: 'Express Non-Stop' },
  { route: 'Bangalore to Tirupati Bus', duration: '5 hrs', fare: 420.00, type: 'Pilgrim Direct Express' },
  { route: 'Lucknow to Delhi Bus', duration: '7.5 hrs', fare: 680.00, type: 'Expressway Intercity' }
];

export default function UberAirportAndIntercityHub({ onSelectRoute }) {
  const [activeTab, setActiveTab] = useState('airports'); // 'airports', 'intercity', 'courier', 'bus'

  const handleRouteClick = (item) => {
    if (onSelectRoute) {
      if (item.code) {
        onSelectRoute({ pickup: 'Current City Center', dropoff: `${item.name} (${item.code})`, fare: item.basePrice });
      } else if (item.from && item.to) {
        onSelectRoute({ pickup: item.from, dropoff: item.to, fare: item.price });
      } else if (item.city) {
        onSelectRoute({ pickup: `${item.city} Center`, dropoff: `${item.city} Outer Hub`, fare: item.fee });
      } else if (item.route) {
        onSelectRoute({ pickup: item.route.split(' to ')[0], dropoff: item.route.split(' to ')[1]?.replace(' Bus', ''), fare: item.fare });
      }
    }
  };

  return (
    <div className="space-y-6 pt-2">
      
      {/* Header & Section Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <Compass size={12} className="text-cyan-400" />
              <span>EXPLORE EXPANDED MOBILITY</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              700+ AIRPORTS • 15,000+ CITIES
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Use YatraGo to Help You{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Travel Your Way
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            There’s more than one way to move with YatraGo. Book fixed-rate airport shuttles, one-way intercity highways, courier deliveries, or scheduled express buses.
          </p>
        </div>

        {/* Category Tabs Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('airports')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'airports'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plane size={14} />
            <span>Airports (10)</span>
          </button>

          <button
            onClick={() => setActiveTab('intercity')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'intercity'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car size={14} />
            <span>Intercity Highways (10)</span>
          </button>

          <button
            onClick={() => setActiveTab('courier')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'courier'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Courier Services</span>
          </button>

          <button
            onClick={() => setActiveTab('bus')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'bus'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bus size={14} />
            <span>Intercity Bus</span>
          </button>
        </div>
      </div>

      {/* 1. AIRPORTS GRID (10 Major Airports from text file) */}
      {activeTab === 'airports' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 animate-fadeIn">
          {AIRPORTS_DATA.map((apt) => (
            <div
              key={apt.code}
              onClick={() => handleRouteClick(apt)}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-400 cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-black text-xs border border-cyan-500/30">
                    {apt.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">{apt.city}</span>
                </div>

                <h4 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors mt-2 leading-snug">
                  {apt.name}
                </h4>

                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Clock size={11} className="text-cyan-400" />
                  <span>{apt.duration} average trip</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">From</span>
                  <strong className="text-sm font-black text-emerald-400 font-mono">₹{apt.basePrice.toFixed(2)}</strong>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition-all">
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. INTERCITY HIGHWAY CORRIDORS (10 routes from text file) */}
      {activeTab === 'intercity' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 animate-fadeIn">
          {INTERCITY_DATA.map((route, i) => (
            <div
              key={i}
              onClick={() => handleRouteClick(route)}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-400 cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    {route.highway}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {route.distance}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{route.from}</span>
                  </div>
                  <div className="w-0.5 h-2 bg-slate-700 ml-1"></div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-xs bg-emerald-400"></span>
                    <span>{route.to}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 mt-2 font-mono">
                  ETA: {route.duration}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">One-Way</span>
                  <strong className="text-sm font-black text-white font-mono">₹{route.price.toFixed(2)}</strong>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition-all">
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. COURIER SERVICES GRID */}
      {activeTab === 'courier' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fadeIn">
          {COURIER_DATA.map((c, i) => (
            <div
              key={i}
              onClick={() => handleRouteClick(c)}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-400 cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Package size={15} />
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    {c.eta}
                  </span>
                </div>

                <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors mt-2">
                  {c.city}
                </h4>

                <p className="text-xs text-slate-400 mt-1">
                  {c.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Delivery from</span>
                  <strong className="text-sm font-black text-white font-mono">₹{c.fee.toFixed(2)}</strong>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition-all">
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. INTERCITY BUS ROUTES */}
      {activeTab === 'bus' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fadeIn">
          {BUS_ROUTES_DATA.map((bus, i) => (
            <div
              key={i}
              onClick={() => handleRouteClick(bus)}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-400 cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Bus size={15} />
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full font-bold">
                    {bus.type}
                  </span>
                </div>

                <h4 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors mt-2">
                  {bus.route}
                </h4>

                <p className="text-xs text-slate-400 mt-1">
                  Duration: {bus.duration} • Guaranteed seat & live tracking
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Bus Seat From</span>
                  <strong className="text-sm font-black text-emerald-400 font-mono">₹{bus.fare.toFixed(2)}</strong>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-cyan-400 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition-all">
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

