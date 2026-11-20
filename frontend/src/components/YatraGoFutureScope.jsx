import React from 'react';
import {
  Sparkles, Brain, Wallet, ShieldCheck, Glasses, TrendingUp,
  ArrowUpRight, CheckCircle2, Clock
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const ROADMAP = [
  {
    id: 'matchmaker',
    icon: Brain,
    title: 'AI Travel-Companion Matchmaker',
    titleHi: 'AI यात्रा-साथी मैचमेकर',
    description:
      'Pairs riders with compatible co-travellers using route overlap, interests and travel style for safer, cheaper shared trips.',
    accent: 'cyan'
  },
  {
    id: 'recommendation',
    icon: Sparkles,
    title: 'AI Destination Recommendation',
    titleHi: 'AI गंतव्य सुझाव',
    description:
      'Suggests trips combining your mood and budget preferences — a quiet lakeside escape or a high-energy city night, tuned to what you can spend.',
    accent: 'violet'
  },
  {
    id: 'dynamic-pricing',
    icon: TrendingUp,
    title: 'Dynamic Pricing & Demand Prediction',
    titleHi: 'गतिशील मूल्य और मांग पूर्वानुमान',
    description:
      'Forecasts demand across corridors and adjusts fares fairly in real time, rewarding riders who travel off-peak.',
    accent: 'emerald'
  },
  {
    id: 'wallet-gateway',
    icon: Wallet,
    title: 'In-App Payment Gateway with Wallet',
    titleHi: 'वॉलेट के साथ इन-ऐप भुगतान',
    description:
      'Top up once, then pay for rides, splits, stays and partner promos instantly — with a full transaction ledger.',
    accent: 'amber',
    shipped: true
  },
  {
    id: 'driver-safety',
    icon: ShieldCheck,
    title: 'AI Driver Behaviour & Safety Monitoring',
    titleHi: 'AI चालक व्यवहार और सुरक्षा निगरानी',
    description:
      'Detects harsh braking, speeding and fatigue, surfaces a live safety score, and escalates to the SOS desk automatically.',
    accent: 'rose'
  },
  {
    id: 'ar-navigation',
    icon: Glasses,
    title: 'AR On-Site Navigation',
    titleHi: 'AR ऑन-साइट नेविगेशन',
    description:
      'Expands the 3D preview into augmented reality — hold up your phone and see waypoints, gates and pickups overlaid on the real street.',
    accent: 'blue'
  }
];

const ACCENT_CLASSES = {
  cyan: { tile: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', dot: 'bg-cyan-400' },
  violet: { tile: 'bg-violet-500/15 text-violet-300 border-violet-500/30', dot: 'bg-violet-400' },
  emerald: { tile: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  amber: { tile: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  rose: { tile: 'bg-rose-500/15 text-rose-300 border-rose-500/30', dot: 'bg-rose-400' },
  blue: { tile: 'bg-blue-500/15 text-blue-300 border-blue-500/30', dot: 'bg-blue-400' }
};

export default function YatraGoFutureScope() {
  const { isHindi } = useLanguage();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl sm:p-7 lg:p-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-80 rounded-full bg-violet-500/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-80 rounded-full bg-cyan-500/10 blur-3xl"></div>

      <div className="relative z-10 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-violet-400">
              <Sparkles size={12} />
              Roadmap
            </span>
            <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
              {isHindi ? 'भविष्य की योजना' : 'Future Scope'}
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-400">
              {isHindi
                ? 'हम निरंतर कुछ अतिरिक्त सुविधाएँ बनाने पर काम कर रहे हैं जो आपकी यात्रा को आसान बनाएँगी।'
                : 'We are continuously working to build additional features that help you travel better.'}
            </p>
          </div>

          <span className="flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-1 text-[10px] font-semibold text-slate-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
            {isHindi ? 'सक्रिय विकास' : 'In active development'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROADMAP.map((item, index) => {
            const Icon = item.icon;
            const accent = ACCENT_CLASSES[item.accent] || ACCENT_CLASSES.cyan;
            return (
              <article
                key={item.id}
                style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
                className="group relative flex flex-col gap-2.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 animate-stagger-in transition-all duration-300 hover:-translate-y-1 hover:border-slate-600 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${accent.tile}`}>
                    <Icon size={18} />
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold ${
                      item.shipped
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                    }`}
                  >
                    {item.shipped ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={9} /> {isHindi ? 'लाइव' : 'Live'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock size={9} /> {isHindi ? 'आगामी' : 'Upcoming'}
                      </span>
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="flex items-center gap-1 text-sm font-black text-white">
                    {isHindi ? item.titleHi : item.title}
                    <ArrowUpRight
                      size={12}
                      className="text-slate-500 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    />
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
