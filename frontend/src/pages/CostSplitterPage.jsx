import React from 'react';
import CostSplitter from '../components/CostSplitter';
import { DollarSign, PieChart, ShieldCheck, CreditCard } from 'lucide-react';

export default function CostSplitterPage({ ride }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <DollarSign className="text-blue-400" />
              <span>Automated In-App Cost Splitting Hub</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              Auto Matrix
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fair financial calculations, custom split percentage ratios, and live UPI/Credit Card payment gateway simulation.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <CostSplitter ride={ride} />
      </div>

    </div>
  );
}
