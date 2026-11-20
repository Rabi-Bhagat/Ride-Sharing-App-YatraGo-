import React, { useEffect, useState } from 'react';
import EmergencySosModal from '../components/EmergencySosModal';
import {
  AlertTriangle, Phone, Radio, Share2, ShieldCheck, MapPin, Loader2,
  Copy, Check, Users, Wifi, WifiOff, Clock, MessageSquare, LifeBuoy
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

const SAFETY_TIPS = [
  { icon: MapPin, title: 'Share your live location', body: 'Send your trip link to a trusted contact before you travel.' },
  { icon: Users, title: 'Verify before boarding', body: 'Match the driver name, vehicle and number plate on your app.' },
  { icon: ShieldCheck, title: 'Sit in the back right', body: 'Keeps you clear of traffic-side doors and gives you an exit.' },
  { icon: Clock, title: 'Use SOS on deviation', body: 'Trigger SOS if the route strays noticeably from the map.' }
];

const formatCoord = (value, positive, negative) => {
  if (!Number.isFinite(value)) return '—';
  const dir = value >= 0 ? positive : negative;
  return `${Math.abs(value).toFixed(4)}° ${dir}`;
};

export default function EmergencySosPage() {
  const { activeSosBroadcast, socket } = useSocket();
  const { user } = useAuth();
  const { isHindi } = useLanguage();

  const [showSosModal, setShowSosModal] = useState(false);
  const [coords, setCoords] = useState(null);
  const [geoState, setGeoState] = useState('idle'); // idle | locating | ready | denied
  const [copied, setCopied] = useState(false);

  const isOnline = Boolean(socket?.connected);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoState('denied');
      return;
    }
    setGeoState('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setGeoState('ready');
      },
      () => setGeoState('denied'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  const contacts =
    user?.emergencyContacts && user.emergencyContacts.length > 0
      ? user.emergencyContacts
      : [
          { name: 'National Emergency Response', relation: 'Police / Ambulance', phone: '112' },
          { name: 'YatraGo 24/7 Safety Desk', relation: 'Incident Support', phone: '1800-112-999' }
        ];

  const shareLiveLocation = async () => {
    const link =
      coords && Number.isFinite(coords.lat)
        ? `https://maps.google.com/?q=${coords.lat},${coords.lng}`
        : 'Location unavailable';
    const text = `YatraGo Safety — I am on a ride. Live location: ${link}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'YatraGo Safety', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="glass-panel rounded-2xl border border-red-500/30 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="flex items-center gap-2 text-xl font-extrabold text-white sm:text-2xl">
                <AlertTriangle className="text-red-500" />
                <span>{isHindi ? 'आपातकालीन सुरक्षा केंद्र और स्थानीय एसओएस' : 'Emergency Safety Center & Local SOS'}</span>
              </h1>
              <span className="rounded-full border border-red-500/30 bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-300">
                24/7
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {isHindi
                ? '3-सेकंड काउंटडाउन के साथ तुरंत एसओएस प्रसारण, लाइव जीपीएस और रिस्पॉन्डर डिस्पैच।'
                : 'One-tap SOS broadcast with a 3-second safety countdown, live GPS and responder dispatch.'}
            </p>
          </div>

          <button
            onClick={() => setShowSosModal(true)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95 sm:px-6"
          >
            <AlertTriangle size={16} />
            {isHindi ? 'एसओएस शुरू करें' : 'Launch SOS'}
          </button>
        </div>
      </div>

      {/* Active broadcast banner */}
      {activeSosBroadcast && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-500/50 bg-red-950/40 p-3.5 animate-slideDown">
          <div className="flex items-start gap-2.5">
            <span className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500"></span>
            <div>
              <strong className="block text-xs font-bold text-red-200">
                {isHindi ? 'सक्रिय एसओएस प्रसारण' : 'Active SOS broadcast in progress'}
              </strong>
              <span className="text-[11px] text-red-300/80">
                {activeSosBroadcast.userName || 'A rider'} • {activeSosBroadcast.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">

        {/* Live status */}
        <div className="glass-panel space-y-4 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <Radio className="animate-pulse text-cyan-400" size={16} />
              {isHindi ? 'लाइव सुरक्षा स्थिति' : 'Live Safety Status'}
            </h2>
            <span
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold ${
                isOnline
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-amber-500/40 bg-amber-500/15 text-amber-300'
              }`}
            >
              {isOnline ? <Wifi size={9} /> : <WifiOff size={9} />}
              {isOnline ? 'Guardian online' : 'Offline'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
              <span className="text-slate-400">{isHindi ? 'जीपीएस स्थान:' : 'Current GPS:'}</span>
              {geoState === 'locating' ? (
                <span className="flex items-center gap-1.5 font-mono text-cyan-400">
                  <Loader2 size={11} className="animate-spin" /> locating…
                </span>
              ) : coords ? (
                <strong className="font-mono text-white">
                  {formatCoord(coords.lat, 'N', 'S')}, {formatCoord(coords.lng, 'E', 'W')}
                </strong>
              ) : (
                <span className="font-mono text-amber-300">{isHindi ? 'अनुमति नहीं' : 'Location blocked'}</span>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
              <span className="text-slate-400">{isHindi ? 'प्रसारण त्रिज्या:' : 'Broadcast radius:'}</span>
              <strong className="font-bold text-cyan-400">5.0 km</strong>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
              <span className="text-slate-400">{isHindi ? 'रिस्पॉन्स यूनिट:' : 'Response unit:'}</span>
              <strong className="font-bold text-emerald-400">{isHindi ? 'स्टैंडबाय' : 'Metro team standby'}</strong>
            </div>

            {coords?.accuracy && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
                <span className="text-slate-400">{isHindi ? 'सटीकता:' : 'Accuracy:'}</span>
                <strong className="font-mono text-slate-200">±{Math.round(coords.accuracy)} m</strong>
              </div>
            )}
          </div>

          <button
            onClick={shareLiveLocation}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 py-2.5 text-xs font-bold text-cyan-300 transition-colors hover:bg-cyan-500/20"
          >
            {copied ? <Check size={13} /> : <Share2 size={13} />}
            {copied
              ? isHindi ? 'लिंक कॉपी हुआ' : 'Live location copied'
              : isHindi ? 'लाइव स्थान साझा करें' : 'Share live location'}
          </button>
        </div>

        {/* Contacts */}
        <div className="glass-panel space-y-4 rounded-2xl border border-slate-800 p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-white">
            <Phone className="text-amber-400" size={16} />
            {isHindi ? 'प्राथमिक आपातकालीन संपर्क' : 'Primary Emergency Contacts'}
          </h2>

          <div className="space-y-2.5">
            {contacts.map((c, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3.5 transition-colors hover:border-slate-700"
              >
                <div className="min-w-0">
                  <strong className="block truncate text-sm text-white">{c.name}</strong>
                  <span className="font-mono text-[11px] text-slate-400">
                    {c.relation} • {c.phone}
                  </span>
                </div>
                <a
                  href={`tel:${c.phone}`}
                  className="shrink-0 rounded-xl border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-500/30 active:scale-95"
                >
                  {isHindi ? 'कॉल करें' : 'Call'}
                </a>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <LifeBuoy size={13} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="text-[11px] leading-relaxed text-slate-400">
              {isHindi
                ? 'एसओएस दबाने पर आपके निकटतम सुरक्षा रिस्पॉन्डर और आपके आपातकालीन संपर्कों को स्थान भेजा जाएगा।'
                : 'Triggering SOS shares your live location with nearby safety responders and your emergency contacts.'}
            </p>
          </div>
        </div>
      </div>

      {/* Safety tips */}
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-3 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <ShieldCheck size={12} className="text-emerald-400" />
          {isHindi ? 'सुरक्षा युक्तियाँ' : 'Safety tips for every trip'}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SAFETY_TIPS.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.title}
                style={{ animationDelay: `${index * 70}ms` }}
                className="animate-stagger-in rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-600"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Icon size={14} />
                </span>
                <strong className="mt-2 block text-[11px] font-black text-white">{tip.title}</strong>
                <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">{tip.body}</p>
              </div>
            );
          })}
        </div>
      </div>

      {showSosModal && <EmergencySosModal onClose={() => setShowSosModal(false)} />}
    </div>
  );
}
