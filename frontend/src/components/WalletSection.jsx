import React, { useState, useMemo, useEffect } from 'react';
import {
  Wallet, Plus, ArrowDownLeft, ArrowUpRight, CreditCard, ShieldCheck,
  Loader2, Check, Sparkles, TrendingUp, Receipt, X, IndianRupee
} from 'lucide-react';
import { openRazorpayCheckout } from '../utils/razorpayCheckout';
import { formatINR } from '../utils/receipt';
import { useLanguage } from '../i18n/LanguageContext';

const QUICK_AMOUNTS = [100, 250, 500, 1000];
const MAX_TOPUP = 10000;

const SEED_ACTIVITY = [
  { id: 'tx1', type: 'debit', label: 'Ride • Downtown Cyber Hub → Delhi Airport', amount: 428.5, at: -1 },
  { id: 'tx2', type: 'credit', label: 'Wallet top-up via Razorpay', amount: 1000, at: -2 },
  { id: 'tx3', type: 'debit', label: 'Ride • Pool share settlement', amount: 119, at: -4 }
];

const timeAgo = (days) => {
  const d = Math.abs(days);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
};

export default function WalletSection({ user, walletBalance, onBalanceChange, onToast }) {
  const { isHindi } = useLanguage();
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [error, setError] = useState('');
  const [activity, setActivity] = useState(SEED_ACTIVITY);
  const [showStatement, setShowStatement] = useState(false);

  const spendable = Number(walletBalance) || 0;

  // Wallet health: how many typical rides the balance covers.
  const ridesCovered = Math.floor(spendable / 150);
  const tier = spendable >= 1500 ? 'Gold' : spendable >= 500 ? 'Silver' : 'Basic';
  const tierClass =
    tier === 'Gold'
      ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
      : tier === 'Silver'
        ? 'border-slate-400/40 bg-slate-400/15 text-slate-200'
        : 'border-slate-600/40 bg-slate-600/15 text-slate-400';

  const amountToAdd = selectedAmount ?? (Number(customAmount) || 0);
  const isValidAmount = amountToAdd >= 10 && amountToAdd <= MAX_TOPUP;

  useEffect(() => {
    if (!isValidAmount) setError('');
  }, [isValidAmount]);

  const handleTopUp = () => {
    if (!isValidAmount) {
      setError(
        amountToAdd < 10
          ? 'Minimum top-up is ₹10.'
          : `Maximum single top-up is ${formatINR(MAX_TOPUP)}.`
      );
      return;
    }

    setError('');
    setIsToppingUp(true);

    openRazorpayCheckout({
      amountInRupees: amountToAdd,
      riderName: user?.name || 'YatraGo Traveller',
      riderEmail: user?.email || 'rider@yatrago.com',
      riderPhone: user?.phone || '+91 98765 43210',
      description: `YatraGo Wallet Top-Up ${formatINR(amountToAdd)}`,
      rideId: 'wallet_' + Date.now(),
      onSuccess: () => {
        setIsToppingUp(false);
        const next = Math.round((spendable + amountToAdd) * 100) / 100;
        if (onBalanceChange) onBalanceChange(next);
        setActivity((prev) => [
          { id: 'tx_' + Date.now(), type: 'credit', label: isHindi ? 'वॉलेट टॉप-अप (Razorpay)' : 'Wallet top-up via Razorpay', amount: amountToAdd, at: 0 },
          ...prev
        ]);
        setSelectedAmount(null);
        setCustomAmount('');
        if (onToast) onToast(`Added ${formatINR(amountToAdd)} to your wallet.`, 'success');
      },
      onFailure: (message) => {
        setIsToppingUp(false);
        setError(message || 'Payment failed. Please try again.');
      },
      onDismiss: () => setIsToppingUp(false)
    });
  };

  const totals = useMemo(() => {
    const credited = activity.filter((a) => a.type === 'credit').reduce((s, a) => s + a.amount, 0);
    const debited = activity.filter((a) => a.type === 'debit').reduce((s, a) => s + a.amount, 0);
    return { credited, debited };
  }, [activity]);

  return (
    <div className="space-y-5">
      {/* ---- Card ---- */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950 p-5 shadow-2xl sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-56 rounded-full bg-cyan-500/15 blur-3xl"></div>

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-slate-950 p-1">
              <Wallet size={18} className="text-cyan-400" />
            </div>
            <div>
              <span className="block font-mono text-[9px] uppercase tracking-widest text-cyan-400">
                {isHindi ? 'यात्राgo ब्लैक कार्ड' : 'YatraGo Black Card'}
              </span>
              <strong className="text-sm font-black text-white">{isHindi ? 'इन-ऐप मोबिलिटी क्रेडिट' : 'In-App Mobility Credit'}</strong>
            </div>
          </div>
          <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold ${tierClass}`}>
            {tier}
          </span>
        </div>

        <div className="relative z-10 mt-5">
          <span className="block font-mono text-[10px] uppercase text-slate-400">
            {isHindi ? 'उपलब्ध शेष राशि' : 'Available Balance'}
          </span>
          <span className="block text-3xl font-black tracking-tight text-white tabular-nums sm:text-4xl">
            {formatINR(spendable)}
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-300">
            <TrendingUp size={11} className="text-emerald-400" />
            {isHindi
              ? `लगभग ${ridesCovered} राइड के लिए पर्याप्त`
              : `Covers roughly ${ridesCovered} more ride${ridesCovered === 1 ? '' : 's'}`}
          </span>
        </div>

        <div className="relative z-10 mt-5 flex items-center justify-between border-t border-slate-700/60 pt-3 font-mono text-[10px] text-slate-300">
          <div>
            <span className="block text-[9px] uppercase text-slate-500">Cardholder</span>
            <strong className="text-white">{user?.name || 'YatraGo Traveller'}</strong>
          </div>
          <div className="text-right">
            <span className="block text-[9px] uppercase text-slate-500">Linked UPI</span>
            <strong className="text-cyan-400">{user?.upiId || 'yatrago@icici'}</strong>
          </div>
        </div>
      </div>

      {/* ---- Add money ---- */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-black text-white">
            <Plus size={15} className="text-cyan-400" />
            {isHindi ? 'पैसे जोड़ें' : 'Add Money'}
          </h3>
          <span className="font-mono text-[10px] text-slate-500">
            {isHindi ? `अधिकतम ${formatINR(MAX_TOPUP)}` : `Max ${formatINR(MAX_TOPUP)} per top-up`}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUICK_AMOUNTS.map((amt) => {
            const isActive = selectedAmount === amt;
            return (
              <button
                key={amt}
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                  setError('');
                }}
                aria-pressed={isActive}
                className={`rounded-xl border py-2.5 text-xs font-bold transition-all active:scale-95 ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30'
                    : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                +{formatINR(amt)}
              </button>
            );
          })}
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <IndianRupee size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="number"
              min="10"
              max={MAX_TOPUP}
              value={customAmount}
              onChange={(event) => {
                setCustomAmount(event.target.value);
                setSelectedAmount(null);
                setError('');
              }}
              placeholder={isHindi ? 'अपनी राशि दर्ज करें' : 'Enter custom amount'}
              aria-label="Custom top-up amount"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-8 pr-3 text-xs text-white transition-colors focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <button
            onClick={handleTopUp}
            disabled={isToppingUp || !isValidAmount}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isToppingUp ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            {isToppingUp
              ? isHindi ? 'प्रोसेस हो रहा है…' : 'Processing…'
              : `${isHindi ? 'जोड़ें' : 'Add'} ${amountToAdd > 0 ? formatINR(amountToAdd) : ''}`}
          </button>
        </div>

        <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
          <CreditCard size={10} /> {isHindi ? 'Razorpay द्वारा सुरक्षित — UPI, कार्ड, नेटबैंकिंग' : 'Secured by Razorpay — UPI, cards & netbanking'}
        </p>

        {error && (
          <div role="alert" className="mt-2 flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-2.5 text-[11px] text-rose-200 animate-slideDown">
            <X size={12} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* ---- Activity ---- */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-black text-white">
            <Receipt size={15} className="text-cyan-400" />
            {isHindi ? 'हाल के लेनदेन' : 'Recent Transactions'}
          </h3>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <ArrowDownLeft size={10} /> {formatINR(totals.credited)}
            </span>
            <span className="flex items-center gap-1 text-rose-300">
              <ArrowUpRight size={10} /> {formatINR(totals.debited)}
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          {activity.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              {isHindi ? 'अभी कोई लेनदेन नहीं' : 'No transactions yet'}
            </p>
          ) : (
            (showStatement ? activity : activity.slice(0, 4)).map((tx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 transition-colors hover:border-slate-700"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isCredit ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                    </span>
                    <div className="min-w-0">
                      <strong className="block truncate text-[11px] font-bold text-slate-200">{tx.label}</strong>
                      <span className="font-mono text-[9px] text-slate-500">{timeAgo(tx.at)}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 font-mono text-xs font-black ${isCredit ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {isCredit ? '+' : '−'}{formatINR(tx.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {activity.length > 4 && (
          <button
            onClick={() => setShowStatement((prev) => !prev)}
            className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 py-2 text-[11px] font-bold text-slate-300 transition-colors hover:border-cyan-500/50 hover:text-white"
          >
            {showStatement
              ? isHindi ? 'कम दिखाएँ' : 'Show less'
              : isHindi ? `सभी ${activity.length} लेनदेन देखें` : `View all ${activity.length} transactions`}
          </button>
        )}
      </div>

      {/* ---- Perks ---- */}
      <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-3.5">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-emerald-400" />
        <p className="text-[11px] leading-relaxed text-emerald-200/90">
          {isHindi
            ? 'वॉलेट से भुगतान पर हर राइड पर अतिरिक्त कैशबैक मिलता है और भुगतान तुरंत होता है।'
            : 'Paying from your wallet settles rides instantly and earns cashback on every trip.'}
        </p>
      </div>
    </div>
  );
}
