import React from 'react';
import CostSplitter from '../components/CostSplitter';
import { Receipt, ShieldCheck, Users, Wallet } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Users, label: 'Equal, custom or distance-based splits' },
  { icon: Wallet, label: 'UPI, card and wallet settlement' },
  { icon: Receipt, label: 'Downloadable & shareable receipts' }
];

export default function CostSplitterPage({ ride }) {
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              <ShieldCheck size={12} />
              Verified settlement
            </span>
            <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight text-white">
              Split the fare
              <span className="rounded-full border border-blue-500/30 bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold text-blue-300">
                Auto Matrix
              </span>
            </h1>
            <p className="mt-1 max-w-xl text-xs text-slate-400">
              Divide the ride fare fairly, collect each passenger&apos;s share, and issue an official receipt you can
              download, print, or send to your co-riders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-1 text-[10px] font-semibold text-slate-300"
              >
                <Icon size={11} className="text-cyan-400" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <CostSplitter ride={ride} />
      </div>
    </div>
  );
}
