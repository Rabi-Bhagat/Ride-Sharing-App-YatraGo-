import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, PieChart, Users, CheckCircle2, Clock, ShieldCheck, CreditCard, Smartphone, Check, ArrowRight, X, Plus, Trash2, QrCode, Receipt, Share2, Percent, Navigation, Download, Printer, AlertTriangle, Wallet, Link2, Sparkles } from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import { useAuth } from '../context/AuthContext';
import yatraGoLogo from '../logo/yatrago-logo.webp';
import { openRazorpayCheckout } from '../utils/razorpayCheckout';
import { downloadReceipt, shareReceipt, printReceipt } from '../utils/receipt';

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

const formatINR = (value) =>
  `₹${round2(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Distribute 100% across N riders so the percentages always total exactly 100.
const evenPercentages = (count) => {
  if (count <= 0) return [];
  const base = Math.floor(100 / count);
  const remainder = 100 - base * count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
};

// Split total paise by weights, distributing any remainder so shares sum to the total.
const splitPaise = (totalPaise, weights) => {
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  if (!weights.length || weightSum <= 0) return weights.map(() => 0);

  const paise = weights.map((weight) => Math.floor((totalPaise * weight) / weightSum));
  let remainder = totalPaise - paise.reduce((sum, value) => sum + value, 0);

  let index = 0;
  while (remainder > 0) {
    paise[index % paise.length] += 1;
    remainder -= 1;
    index += 1;
  }

  return paise;
};

const getInitials = (name) =>
  String(name || 'Rider')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

export default function CostSplitter({ ride }) {
  const { user } = useAuth();

  const baseFare = Number(ride?.totalCost) || 0;
  const isStrangerDiscounted = Boolean(ride?.isStrangerCombined);
  const rideDistanceKm = Number(ride?.distanceKm) || 0;

  const [splitMode, setSplitMode] = useState('equal');
  const [tip, setTip] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(isStrangerDiscounted ? 80 : 0);
  const [promoApplied, setPromoApplied] = useState(isStrangerDiscounted);

  const [ridersList, setRidersList] = useState(() => {
    if (ride?.riders?.length) {
      return ride.riders.map((rider) => ({ ...rider, distanceKm: rider.distanceKm || 0 }));
    }
    return [
      {
        userId: user?._id || user?.id || 'you',
        name: user?.name || 'You',
        avatar: user?.avatar || '',
        isVerified: Boolean(user?.isVerified),
        percentage: 100,
        distanceKm: rideDistanceKm,
        paymentStatus: 'Pending',
        phone: user?.phone || ''
      }
    ];
  });

  const [showAddRider, setShowAddRider] = useState(false);
  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderPhone, setNewRiderPhone] = useState('');

  const [activePaymentIdx, setActivePaymentIdx] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [toast, setToast] = useState(null);
  const [showTripReceipt, setShowTripReceipt] = useState(false);
  const [gatewayKeyId, setGatewayKeyId] = useState('');

  const reference = useMemo(() => {
    const raw = String(ride?._id || ride?.id || 'ride_101').replace(/[^a-z0-9]/gi, '');
    return `RC-${raw.slice(-6).toUpperCase() || '000101'}`;
  }, [ride?._id, ride?.id]);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.key_id) setGatewayKeyId(data.key_id);
      })
      .catch(() => {});
  }, []);

  const showToast = (message, tone = 'info') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3000);
  };

  const maskedGatewayKey = gatewayKeyId
    ? `${gatewayKeyId.slice(0, 12)}…${gatewayKeyId.slice(-4)}`
    : 'Not configured';

  const netTotal = round2(Math.max(0, baseFare - promoDiscount) + tip);

  // Fare allocation in paise so every split mode sums exactly to the net total.
  const shares = useMemo(() => {
    const totalPaise = Math.round(netTotal * 100);
    if (!ridersList.length || totalPaise <= 0) return ridersList.map(() => 0);

    const weights =
      splitMode === 'custom'
        ? ridersList.map((rider) => Math.max(0, Number(rider.percentage) || 0))
        : splitMode === 'distance'
          ? ridersList.map((rider) => Math.max(0, Number(rider.distanceKm) || 0))
          : ridersList.map(() => 1);

    // A zero total weight has no proportional meaning — fall back to an equal split.
    const effectiveWeights = weights.some((weight) => weight > 0) ? weights : ridersList.map(() => 1);

    return splitPaise(totalPaise, effectiveWeights).map((paise) => paise / 100);
  }, [ridersList, splitMode, netTotal]);

  const enrichedRiders = ridersList.map((rider, index) => ({
    ...rider,
    share: shares[index] || 0,
    percentOfTotal: netTotal > 0 ? ((shares[index] || 0) / netTotal) * 100 : 0
  }));

  const allocatedTotal = round2(shares.reduce((sum, share) => sum + share, 0));
  const allocationDelta = round2(netTotal - allocatedTotal);
  const customPercentTotal = round2(ridersList.reduce((sum, rider) => sum + (Number(rider.percentage) || 0), 0));

  const paidCount = enrichedRiders.filter((rider) => rider.paymentStatus === 'Paid').length;
  const totalCollected = round2(
    enrichedRiders.reduce((sum, rider) => (rider.paymentStatus === 'Paid' ? sum + rider.share : sum), 0)
  );
  const outstanding = round2(Math.max(0, netTotal - totalCollected));
  const percentCollected = netTotal > 0 ? Math.min(100, Math.round((totalCollected / netTotal) * 100)) : 0;

  const isSettled = paidCount === enrichedRiders.length;

  const activePaymentRider = activePaymentIdx != null ? enrichedRiders[activePaymentIdx] : null;

  const handleAddRider = () => {
    if (!newRiderName.trim()) return;
    const next = [
      ...ridersList,
      {
        userId: 'usr_' + Date.now(),
        name: newRiderName.trim(),
        avatar: '',
        isVerified: false,
        distanceKm: 0,
        paymentStatus: 'Pending',
        phone: newRiderPhone.trim()
      }
    ];
    const percentages = evenPercentages(next.length);
    setRidersList(next.map((rider, index) => ({ ...rider, percentage: percentages[index] })));
    setNewRiderName('');
    setNewRiderPhone('');
    setShowAddRider(false);
  };

  const handleRemoveRider = (index) => {
    if (ridersList.length <= 1) return;
    const filtered = ridersList.filter((_, i) => i !== index);
    const percentages = evenPercentages(filtered.length);
    setRidersList(filtered.map((rider, i) => ({ ...rider, percentage: percentages[i] })));
    setActivePaymentIdx(null);
  };

  const handleUpdatePercentage = (index, value) => {
    const next = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
    setRidersList((prev) => prev.map((rider, i) => (i === index ? { ...rider, percentage: next } : rider)));
  };

  const handleUpdateDistance = (index, value) => {
    const next = Math.max(0, Number(value) || 0);
    setRidersList((prev) => prev.map((rider, i) => (i === index ? { ...rider, distanceKm: next } : rider)));
  };

  const handleRebalancePercentages = () => {
    const percentages = evenPercentages(ridersList.length);
    setRidersList((prev) => prev.map((rider, index) => ({ ...rider, percentage: percentages[index] })));
    showToast('Split ratios rebalanced to 100%.', 'success');
  };

  const handleApplyPromo = (event) => {
    event.preventDefault();
    if (!promoCode.trim()) return;
    if (['POOL44', 'VELO20'].includes(promoCode.toUpperCase())) {
      setPromoDiscount(80);
      setPromoApplied(true);
      showToast('Promo applied — ₹80.00 pool discount deducted.', 'success');
    } else {
      showToast('Invalid promo code. Try POOL44 or VELO20.', 'error');
    }
  };

  const handleRemovePromo = () => {
    setPromoDiscount(0);
    setPromoApplied(false);
    setPromoCode('');
    showToast('Promo discount removed.', 'info');
  };

  const markRiderPaid = (index, { txnId, method, label }) => {
    setRidersList((prev) =>
      prev.map((rider, i) =>
        i === index
          ? {
              ...rider,
              paymentStatus: 'Paid',
              paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              paidVia: method,
              txnId,
              method: label
            }
          : rider
      )
    );
  };

  const handleExecutePayment = () => {
    if (!activePaymentRider) return;
    setPaymentError('');

    const share = activePaymentRider.share;
    const index = activePaymentIdx;

    if (share <= 0) {
      setPaymentError('This passenger has no amount due for the current split.');
      return;
    }

    if (paymentMethod === 'razorpay') {
      setIsProcessing(true);
      openRazorpayCheckout({
        amountInRupees: share,
        riderName: activePaymentRider.name,
        riderEmail: user?.email || 'rider@yatrago.com',
        riderPhone: activePaymentRider.phone || user?.phone || '+91 98765 43210',
        description: `Ride Fare Settlement for ${activePaymentRider.name}`,
        rideId: ride?._id || ride?.id || 'ride_101',
        onSuccess: (verifyData, razorpayRes) => {
          setIsProcessing(false);
          const txnId = razorpayRes?.razorpay_payment_id || `pay_${Date.now()}`;
          markRiderPaid(index, { txnId, method: 'razorpay', label: 'Razorpay (Verified)' });
          setPaidReceipt({
            txnId,
            orderId: razorpayRes?.razorpay_order_id || '',
            amount: share,
            riderName: activePaymentRider.name,
            method: 'RAZORPAY STANDARD (VERIFIED)',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('en-IN')
          });
          showToast('Payment verified successfully via Razorpay.', 'success');
        },
        onFailure: (errorMessage) => {
          setIsProcessing(false);
          setPaymentError(errorMessage);
        },
        onDismiss: () => setIsProcessing(false)
      });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const txnId = 'TXN_LOCAL_' + Math.floor(100000 + Math.random() * 900000);
      markRiderPaid(index, { txnId, method: paymentMethod, label: paymentMethod.toUpperCase() });
      setPaidReceipt({
        txnId,
        amount: share,
        riderName: activePaymentRider.name,
        method: paymentMethod.toUpperCase(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-IN')
      });
      showToast(`Settlement recorded via ${paymentMethod.toUpperCase()}.`, 'success');
    }, 800);
  };

  const handleCopySplitLink = async () => {
    const link = `https://yatrago.app/split/${ride?.id || ride?._id || 'ride_live_772'}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      showToast('Split link copied — share it with your co-riders.', 'success');
    } catch (error) {
      showToast('Could not copy the link on this device.', 'error');
    }
  };

  const receiptModel = (focusRiderName = null) => ({
    reference,
    issuedAt: new Date().toISOString(),
    rideId: ride?._id || ride?.id || 'ride_101',
    route: {
      from: ride?.pickup?.name || 'Pickup not set',
      to: ride?.destination?.name || 'Drop-off not set'
    },
    vehicle: ride?.vehicleType || 'Ride',
    driverName: ride?.driver?.name || 'Unassigned',
    fare: baseFare,
    promo: promoDiscount,
    tip,
    netTotal,
    collected: totalCollected,
    outstanding,
    riders: enrichedRiders.map((rider) => ({
      name: rider.name,
      share: rider.share,
      percentage: Math.round(rider.percentOfTotal),
      status: rider.paymentStatus === 'Paid' ? 'Paid' : 'Due',
      method: rider.paidVia ? String(rider.paidVia).toUpperCase() : null,
      txnId: rider.txnId || null
    })),
    focusRiderName
  });

  const handleDownloadReceipt = (focusRiderName) => {
    downloadReceipt(receiptModel(focusRiderName));
    showToast('Receipt downloaded to your device.', 'success');
  };

  const handleShareReceipt = async (focusRiderName) => {
    const result = await shareReceipt(receiptModel(focusRiderName));
    showToast(result.message, result.ok ? 'success' : 'error');
  };

  const handlePrintReceipt = (focusRiderName) => {
    printReceipt(receiptModel(focusRiderName));
  };

  const splitModes = [
    { id: 'equal', label: 'Equal (1/N)', icon: Users },
    { id: 'custom', label: 'Custom %', icon: Percent },
    { id: 'distance', label: 'By Distance', icon: Navigation }
  ];

  const paymentMethods = [
    { id: 'razorpay', label: 'Razorpay', icon: ShieldCheck, highlight: true },
    { id: 'upi', label: 'UPI / QR', icon: QrCode },
    { id: 'card', label: 'Card 3DS', icon: CreditCard },
    { id: 'wallet', label: 'Wallet', icon: Wallet }
  ];

  const customAllocationBroken = splitMode === 'custom' && Math.abs(customPercentTotal - 100) > 0.5;

  return (
    <div className="relative space-y-4">
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-2xl animate-slideDown ${
            toast.tone === 'error'
              ? 'bg-red-500 text-white'
              : toast.tone === 'success'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-100 text-slate-900'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      {/* Summary */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-white">Fare Split & Settlement</h2>
              <p className="text-[11px] text-slate-400">
                {formatINR(netTotal)} across {enrichedRiders.length} {enrichedRiders.length === 1 ? 'passenger' : 'passengers'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopySplitLink}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 px-3 py-2 text-xs font-bold text-slate-300 transition-all hover:border-slate-600 hover:text-white"
              title="Copy a payment link to share with co-riders"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Link2 size={14} className="text-cyan-400" />}
              {copiedLink ? 'Link Copied' : 'Share Link'}
            </button>
            <button
              onClick={() => setShowTripReceipt(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
              title="Preview, download and share the settlement receipt"
            >
              <Receipt size={14} />
              Receipt
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 transition-colors hover:border-slate-700">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Ride Fare</span>
            <span className="mt-1 block text-xl font-black text-white">{formatINR(baseFare)}</span>
            {promoDiscount > 0 && (
              <button
                onClick={handleRemovePromo}
                className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300"
                title="Remove the applied promo"
              >
                −{formatINR(promoDiscount)} promo · undo
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 transition-colors hover:border-slate-700">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Driver Tip</span>
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {[0, 20, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTip(amount)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-all active:scale-95 ${
                    tip === amount
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-slate-900 p-3.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-300">Net Payable</span>
            <span className="mt-1 block text-xl font-black text-cyan-400 transition-all duration-300">{formatINR(netTotal)}</span>
            <span className="text-[10px] font-mono text-slate-400">
              {splitMode === 'equal' ? 'Equal split' : splitMode === 'custom' ? 'Custom ratio' : 'Distance based'}
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-slate-900 p-3.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-300">Collected</span>
            <span className="mt-1 block text-xl font-black text-white">{formatINR(totalCollected)}</span>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {paidCount}/{enrichedRiders.length} paid · {formatINR(outstanding)} due
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <CheckCircle2 size={13} className={isSettled ? 'text-emerald-400' : 'text-slate-400'} />
              {isSettled ? 'Fully settled' : 'Collection progress'}
            </span>
            <span className="font-mono font-extrabold text-emerald-400">
              {formatINR(totalCollected)} / {formatINR(netTotal)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 transition-[width] duration-700 ease-out"
              style={{ width: `${percentCollected}%` }}
            />
          </div>
        </div>
      </div>

      {/* Split controls */}
      <div className="glass-panel space-y-3 rounded-3xl border border-slate-800 p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Split method
          </span>
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/70 p-1">
            {splitModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = splitMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSplitMode(mode.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon size={13} />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        {splitMode === 'custom' && customAllocationBroken && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 text-[11px] text-amber-300">
            <span className="flex items-center gap-1.5">
              <AlertTriangle size={13} />
              Ratios total {customPercentTotal}% — shares are weighted against the fare.
            </span>
            <button
              onClick={handleRebalancePercentages}
              className="rounded-lg bg-amber-500/20 px-2.5 py-1 font-bold text-amber-200 transition-colors hover:bg-amber-500/30"
            >
              Rebalance to 100%
            </button>
          </div>
        )}

        {splitMode === 'distance' && rideDistanceKm > 0 && (
          <p className="text-[11px] text-slate-400">
            Ride distance: <strong className="font-mono text-slate-200">{rideDistanceKm} km</strong> — enter each
            passenger&apos;s travelled segment below.
          </p>
        )}

        {Math.abs(allocationDelta) > 0.009 && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-[11px] text-rose-300">
            Allocation is off by {formatINR(allocationDelta)} — check the split inputs.
          </div>
        )}

        {promoApplied ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles size={12} /> Promo applied — {formatINR(promoDiscount)} off the fare
            </span>
            <button onClick={handleRemovePromo} className="text-emerald-200 hover:text-white" title="Remove promo">
              <X size={13} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Promo code (e.g. POOL44)"
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 font-mono text-xs uppercase text-white transition-colors focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-cyan-300 transition-colors hover:bg-slate-700"
            >
              Apply
            </button>
          </form>
        )}
      </div>

      {/* Passenger ledger */}
      <div className="glass-panel space-y-3 rounded-3xl border border-slate-800 p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            <PieChart size={13} className="text-cyan-400" />
            Passenger allocation
          </h3>
          <button
            onClick={() => setShowAddRider((prev) => !prev)}
            className="flex items-center gap-1 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-500/25"
          >
            <Plus size={13} />
            Add co-rider
          </button>
        </div>

        {showAddRider && (
          <div className="space-y-2.5 rounded-2xl border border-slate-700 bg-slate-900 p-3.5 animate-fadeIn">
            <strong className="block text-xs text-white">Add co-passenger</strong>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Name (e.g. Liam Smith)"
                value={newRiderName}
                onChange={(event) => setNewRiderName(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Phone or UPI handle (optional)"
                value={newRiderPhone}
                onChange={(event) => setNewRiderPhone(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddRider(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleAddRider}
                className="rounded-xl bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-cyan-400"
              >
                Add passenger
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {enrichedRiders.map((rider, index) => {
            const isPaid = rider.paymentStatus === 'Paid';
            return (
              <div
                key={rider.userId || index}
                className={`flex flex-col gap-3 rounded-2xl border p-3.5 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between ${
                  isPaid
                    ? 'border-emerald-500/25 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {rider.avatar ? (
                    <img
                      src={rider.avatar}
                      alt={rider.name}
                      className="h-10 w-10 shrink-0 rounded-xl object-cover ring-2 ring-slate-700"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-emerald-500/20 text-xs font-black text-cyan-200 ring-2 ring-slate-700">
                      {getInitials(rider.name)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-white">{rider.name}</span>
                      {rider.isVerified && <VerificationBadge type="Government ID" size="sm" />}
                      {isPaid && <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />}
                    </div>

                    {splitMode === 'custom' ? (
                      <div className="mt-1 flex items-center gap-2">
                        <label htmlFor={`pct-${index}`} className="text-[10px] font-bold uppercase text-slate-400">
                          Ratio
                        </label>
                        <input
                          id={`pct-${index}`}
                          type="number"
                          min="0"
                          max="100"
                          value={rider.percentage || 0}
                          onChange={(event) => handleUpdatePercentage(index, event.target.value)}
                          className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-0.5 text-center font-mono text-xs font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                        />
                        <span className="font-mono text-[11px] text-slate-500">%</span>
                      </div>
                    ) : splitMode === 'distance' ? (
                      <div className="mt-1 flex items-center gap-2">
                        <label htmlFor={`km-${index}`} className="text-[10px] font-bold uppercase text-slate-400">
                          Distance
                        </label>
                        <input
                          id={`km-${index}`}
                          type="number"
                          min="0"
                          step="0.1"
                          value={rider.distanceKm || 0}
                          onChange={(event) => handleUpdateDistance(index, event.target.value)}
                          className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-0.5 text-center font-mono text-xs font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                        />
                        <span className="font-mono text-[11px] text-slate-500">km</span>
                      </div>
                    ) : (
                      <span className="mt-0.5 block font-mono text-[11px] text-slate-400">
                        {rider.percentOfTotal.toFixed(1)}% of the fare
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-2.5 sm:justify-end sm:border-t-0 sm:pt-0">
                  <div className="sm:text-right">
                    <span className="text-lg font-black text-white tabular-nums">{formatINR(rider.share)}</span>
                    <span
                      className={`mt-0.5 flex items-center gap-1 text-[11px] font-bold ${
                        isPaid ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {isPaid ? `Paid ${rider.paidAt || ''}` : 'Payment due'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPaid ? (
                      <button
                        onClick={() => {
                          setActivePaymentIdx(index);
                          setPaidReceipt({
                            txnId: rider.txnId || 'TXN_YATRA_RECORD',
                            amount: rider.share,
                            riderName: rider.name,
                            method: rider.method || 'UPI / INSTANT',
                            timestamp: rider.paidAt || 'Settled',
                            date: new Date().toLocaleDateString('en-IN')
                          });
                        }}
                        className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700"
                      >
                        <Receipt size={13} className="text-cyan-400" />
                        Receipt
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActivePaymentIdx(index);
                          setPaidReceipt(null);
                          setPaymentMethod('razorpay');
                          setPaymentError('');
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-black text-slate-950 shadow-md shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
                      >
                        <CreditCard size={13} />
                        Pay share
                      </button>
                    )}

                    {ridersList.length > 1 && (
                      <button
                        onClick={() => handleRemoveRider(index)}
                        className="p-2 text-slate-500 transition-colors hover:text-red-400"
                        title="Remove passenger from split"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment modal */}
      {activePaymentRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel relative max-h-[92vh] w-full max-w-md space-y-4 overflow-y-auto rounded-3xl border border-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setActivePaymentIdx(null)}
              className="absolute right-4 top-4 rounded-xl bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              title="Close"
            >
              <X size={18} />
            </button>

            {!paidReceipt ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Smartphone size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Settle fare share</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Paying <strong className="text-white">{activePaymentRider.name}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 to-cyan-950/40 p-4">
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-slate-400">Amount due</span>
                    <span className="text-3xl font-black text-white tabular-nums">{formatINR(activePaymentRider.share)}</span>
                  </div>
                  <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-300">
                    {activePaymentRider.percentOfTotal.toFixed(0)}% of fare
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Payment method
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isActive = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          onClick={() => {
                            setPaymentMethod(method.id);
                            setPaymentError('');
                          }}
                          className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-xs font-bold transition-all ${
                            isActive
                              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-md ring-2 ring-cyan-500/30'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                          }`}
                          aria-pressed={isActive}
                        >
                          <Icon size={16} className={method.highlight ? 'text-cyan-400' : ''} />
                          {method.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {paymentMethod === 'razorpay' && (
                  <div className="space-y-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 p-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400"></span>
                        <strong className="text-xs font-bold text-white">Razorpay Checkout</strong>
                      </span>
                      <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-300">
                        Sandbox
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      Supports UPI, cards, NetBanking and wallets. Signature verified server-side.
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 font-mono text-[10px] text-slate-400">
                      <span>Key <strong className="text-cyan-400">{maskedGatewayKey}</strong></span>
                      <span className="text-emerald-400">HMAC-SHA256</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-white p-2 shadow-lg">
                      <QrCode size={64} className="text-slate-950" />
                    </div>
                    <span className="block break-all font-mono text-[10px] text-cyan-300">
                      upi://pay?pa=yatrago@icici&amp;am={activePaymentRider.share.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-400">Scan with GPay, PhonePe, Paytm or BHIM</p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-xs">
                    <span className="text-slate-300">Visa Platinum</span>
                    <span className="font-mono text-cyan-400">•••• 4829</span>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-400">YatraGo Wallet</span>
                      <strong className="text-sm text-white">
                        {formatINR(user?.walletBalance ?? 0)}
                      </strong>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400">
                      {(user?.walletBalance ?? 0) >= activePaymentRider.share ? 'Sufficient ✓' : 'Low balance'}
                    </span>
                  </div>
                )}

                {paymentError && (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-red-500/40 bg-red-950/60 p-3 text-xs text-red-300">
                    <span>{paymentError}</span>
                    <button onClick={() => setPaymentError('')} className="font-bold text-red-400 hover:text-white">
                      Dismiss
                    </button>
                  </div>
                )}

                <button
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></span>
                      Processing…
                    </>
                  ) : (
                    <>
                      Pay {formatINR(activePaymentRider.share)}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="space-y-4 py-1 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-white p-1.5 shadow-lg">
                    <img src={yatraGoLogo} alt="YatraGo" className="h-full w-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList?.add('img-fallback'); }} />
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/30">
                    <Check size={22} />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">Payment settled</h4>
                  <p className="mt-0.5 text-xs font-semibold text-emerald-400">Receipt {reference}</p>
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left font-mono text-xs">
                  {[
                    ['Transaction', paidReceipt.txnId],
                    ['Passenger', paidReceipt.riderName],
                    ['Method', paidReceipt.method],
                    ['Timestamp', `${paidReceipt.date} • ${paidReceipt.timestamp}`]
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <span className="text-slate-400">{label}</span>
                      <span className="truncate text-right text-slate-200">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-slate-800 pt-2">
                    <span className="text-slate-400">Amount paid</span>
                    <span className="text-sm font-extrabold text-emerald-400">{formatINR(paidReceipt.amount)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleDownloadReceipt(paidReceipt.riderName)}
                    className="flex flex-col items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-[10px] font-bold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-white"
                  >
                    <Download size={15} className="text-cyan-400" />
                    Download
                  </button>
                  <button
                    onClick={() => handleShareReceipt(paidReceipt.riderName)}
                    className="flex flex-col items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-[10px] font-bold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-white"
                  >
                    <Share2 size={15} className="text-emerald-400" />
                    Share
                  </button>
                  <button
                    onClick={() => handlePrintReceipt(paidReceipt.riderName)}
                    className="flex flex-col items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-[10px] font-bold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-white"
                  >
                    <Printer size={15} className="text-violet-400" />
                    Print
                  </button>
                </div>

                <button
                  onClick={() => setActivePaymentIdx(null)}
                  className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-black text-slate-950 transition-colors hover:bg-cyan-400"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Whole-trip receipt modal */}
      {showTripReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel relative max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-3xl border border-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setShowTripReceipt(false)}
              className="absolute right-4 top-4 rounded-xl bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              title="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/30 bg-white p-1.5">
                <img src={yatraGoLogo} alt="YatraGo" className="h-full w-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList?.add('img-fallback'); }} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Settlement receipt</h3>
                <p className="font-mono text-[10px] text-slate-400">{reference} • {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                <span className="block font-mono text-[9px] uppercase text-slate-500">Pickup</span>
                <span className="truncate text-slate-200">{ride?.pickup?.name || 'Not set'}</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                <span className="block font-mono text-[9px] uppercase text-slate-500">Drop-off</span>
                <span className="truncate text-slate-200">{ride?.destination?.name || 'Not set'}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800">
              {enrichedRiders.map((rider, index) => (
                <div
                  key={rider.userId || index}
                  className="flex items-center justify-between gap-2 border-b border-slate-800/70 px-3 py-2 text-xs last:border-b-0"
                >
                  <span className="truncate text-slate-200">{rider.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white tabular-nums">{formatINR(rider.share)}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        rider.paymentStatus === 'Paid'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-amber-500/15 text-amber-300'
                      }`}
                    >
                      {rider.paymentStatus === 'Paid' ? 'Paid' : 'Due'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Ride fare</span>
                <span className="font-mono">{formatINR(baseFare)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promo</span>
                  <span className="font-mono">−{formatINR(promoDiscount)}</span>
                </div>
              )}
              {tip > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Driver tip</span>
                  <span className="font-mono">+{formatINR(tip)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-black text-white">
                <span>Net payable</span>
                <span className="font-mono text-cyan-400">{formatINR(netTotal)}</span>
              </div>
              <div className="flex justify-between pt-1 text-[11px]">
                <span className="text-slate-400">Collected</span>
                <span className="font-mono text-emerald-400">{formatINR(totalCollected)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Outstanding</span>
                <span className="font-mono text-amber-400">{formatINR(outstanding)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDownloadReceipt(null)}
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-[10px] font-bold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-white"
              >
                <Download size={15} className="text-cyan-400" />
                Download
              </button>
              <button
                onClick={() => handleShareReceipt(null)}
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-[10px] font-bold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-white"
              >
                <Share2 size={15} className="text-emerald-400" />
                Share
              </button>
              <button
                onClick={() => handlePrintReceipt(null)}
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-[10px] font-bold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-white"
              >
                <Printer size={15} className="text-violet-400" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
