import React, { useState } from 'react';
import { 
  DollarSign, PieChart, Users, CheckCircle2, Clock, Send, 
  ShieldCheck, Sparkles, CreditCard, Smartphone, Check, ArrowRight, 
  X, Plus, Trash2, QrCode, Receipt, Share2, Copy, Percent, Navigation, Sliders
} from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import { useAuth } from '../context/AuthContext';
import yatraGoLogo from '../logo/YatraGo Roadway Logo.png';

export default function CostSplitter({ ride }) {
  const { user } = useAuth();

  // Initial base cost from active ride or default standard pool fare
  const initialBaseCost = ride?.totalCost || 33.00;
  const isStrangerDiscounted = ride?.isStrangerCombined || false;

  // Split Modes: 'equal', 'custom', 'distance'
  const [splitMode, setSplitMode] = useState('equal');

  // Tip and Promo states
  const [tip, setTip] = useState(3.00);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(isStrangerDiscounted ? 8.00 : 0);
  const [promoApplied, setPromoApplied] = useState(isStrangerDiscounted);

  // Riders state
  const [ridersList, setRidersList] = useState(
    ride?.riders && ride.riders.length > 0
      ? ride.riders
      : [
          {
            userId: 'usr_1',
            name: user?.name || 'Alex Rivera',
            avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            isVerified: true,
            percentage: 50,
            distanceKm: 12,
            paymentStatus: 'Paid',
            paidAt: '10:42 PM via UPI'
          },
          {
            userId: 'usr_2',
            name: 'Sarah Jenkins (Co-Rider)',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
            isVerified: true,
            percentage: 50,
            distanceKm: 8,
            paymentStatus: 'Pending',
            paidAt: null
          }
        ]
  );

  // Add Co-Rider Form
  const [showAddRider, setShowAddRider] = useState(false);
  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderPhone, setNewRiderPhone] = useState('');

  // Payment Gateway Modal State
  const [activePaymentModalRider, setActivePaymentModalRider] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'wallet', 'apple'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareToast, setShareToast] = useState(null);

  // Financial Calculations
  const grossTotal = Math.max(0, initialBaseCost - promoDiscount) + tip;

  // Calculate individual cost share based on split mode
  const getRiderShare = (rider) => {
    if (splitMode === 'equal') {
      return (grossTotal / ridersList.length).toFixed(2);
    } else if (splitMode === 'custom') {
      const pct = rider.percentage || (100 / ridersList.length);
      return ((grossTotal * pct) / 100).toFixed(2);
    } else {
      // By Distance Km proportion
      const totalKm = ridersList.reduce((acc, r) => acc + (r.distanceKm || 10), 0) || 1;
      const riderKm = rider.distanceKm || 10;
      return ((grossTotal * riderKm) / totalKm).toFixed(2);
    }
  };

  // Payment Collection Stats
  const paidCount = ridersList.filter(r => r.paymentStatus === 'Paid').length;
  const totalCollected = ridersList.reduce((acc, r) => {
    return r.paymentStatus === 'Paid' ? acc + parseFloat(getRiderShare(r)) : acc;
  }, 0);
  const percentCollected = Math.min(100, Math.round((totalCollected / (grossTotal || 1)) * 100));

  // Add a new co-passenger
  const handleAddRider = () => {
    if (!newRiderName.trim()) return;
    const newRider = {
      userId: 'usr_' + Date.now(),
      name: newRiderName.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      percentage: Math.round(100 / (ridersList.length + 1)),
      distanceKm: 10,
      paymentStatus: 'Pending',
      phone: newRiderPhone || '+1 (555) 000-0000'
    };

    const updatedList = [...ridersList, newRider];
    // Rebalance custom percentages
    const equalPct = Math.round(100 / updatedList.length);
    const rebalanced = updatedList.map(r => ({ ...r, percentage: equalPct }));
    setRidersList(rebalanced);
    setNewRiderName('');
    setNewRiderPhone('');
    setShowAddRider(false);
  };

  // Remove co-passenger
  const handleRemoveRider = (idx) => {
    if (ridersList.length <= 1) return;
    const filtered = ridersList.filter((_, i) => i !== idx);
    const equalPct = Math.round(100 / filtered.length);
    const rebalanced = filtered.map(r => ({ ...r, percentage: equalPct }));
    setRidersList(rebalanced);
  };

  // Update custom percentage
  const handleUpdatePercentage = (idx, newPct) => {
    const val = Math.max(0, Math.min(100, parseInt(newPct) || 0));
    setRidersList(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], percentage: val };
      return copy;
    });
  };

  // Update distance
  const handleUpdateDistance = (idx, newKm) => {
    const val = Math.max(1, parseInt(newKm) || 1);
    setRidersList(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], distanceKm: val };
      return copy;
    });
  };

  // Apply Promo
  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    if (promoCode.toUpperCase() === 'POOL44' || promoCode.toUpperCase() === 'VELO20') {
      setPromoDiscount(8.00);
      setPromoApplied(true);
      setShareToast('Promo Code applied! $8.00 pool discount deducted.');
      setTimeout(() => setShareToast(null), 3000);
    } else {
      setShareToast('Invalid promo code. Try POOL44 or VELO20.');
      setTimeout(() => setShareToast(null), 3000);
    }
  };

  // Execute Simulated Payment
  const handleExecutePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const txnId = 'TXN_VELO_' + Math.floor(100000 + Math.random() * 900000);
      const paidShare = getRiderShare(activePaymentModalRider);

      setPaymentReceipt({
        txnId,
        amount: paidShare,
        riderName: activePaymentModalRider.name,
        method: paymentMethod.toUpperCase(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString()
      });

      // Update rider status to Paid
      setRidersList(prev => prev.map(r => 
        r.name === activePaymentModalRider.name 
          ? { ...r, paymentStatus: 'Paid', paidAt: `Just now via ${paymentMethod.toUpperCase()}` } 
          : r
      ));
    }, 1200);
  };

  // Copy Split Link
  const handleCopySplitLink = () => {
    navigator.clipboard.writeText(`https://velocita.app/split/${ride?.id || 'ride_live_772'}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative">
      
      {/* Toast Notification */}
      {shareToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-xl animate-bounce">
          {shareToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Smart Fare Splitter & Settlement Hub</h2>
              <p className="text-xs text-slate-400">
                Automated multi-rider cost allocation, live UPI payment collection, and instant receipts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySplitLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700/80 transition-all"
            title="Copy payment link to share with WhatsApp or Messages"
          >
            {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-cyan-400" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Split Link'}</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Ride Fare</span>
          <span className="text-2xl font-black text-white">${initialBaseCost.toFixed(2)}</span>
          {promoDiscount > 0 && (
            <span className="text-[10px] text-emerald-400 block font-semibold mt-0.5">
              -${promoDiscount.toFixed(2)} Promo Applied
            </span>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Driver Tip</span>
          <div className="flex items-center gap-1.5 mt-1.5">
            {[0, 2, 5, 8].map((amt) => (
              <button
                key={amt}
                onClick={() => setTip(amt)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  tip === amt
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Settle Total</span>
          <span className="text-2xl font-black text-cyan-400">${grossTotal.toFixed(2)}</span>
          <span className="text-[10px] text-slate-400 block font-mono">{ridersList.length} Active Co-Riders</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30">
          <span className="text-[10px] uppercase font-bold text-emerald-300 block">Settled Collection</span>
          <span className="text-2xl font-black text-white">${totalCollected.toFixed(2)}</span>
          <span className="text-[10px] text-emerald-400 block font-bold font-mono">
            {paidCount} of {ridersList.length} Paid ({percentCollected}%)
          </span>
        </div>
      </div>

      {/* Progress Bar of Collection */}
      <div className="space-y-1.5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Group Collection Progress</span>
          </span>
          <span className="font-mono text-emerald-400 font-extrabold">
            ${totalCollected.toFixed(2)} / ${grossTotal.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-500" 
            style={{ width: `${percentCollected}%` }}
          />
        </div>
      </div>

      {/* Split Mode Selector Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Fare Allocation Algorithm
          </span>
          
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'equal', label: 'Equal Split (1/N)', icon: Users },
              { id: 'custom', label: 'Custom Ratio (%)', icon: Percent },
              { id: 'distance', label: 'By Distance (Km)', icon: Navigation }
            ].map(m => {
              const Icon = m.icon;
              const isActive = splitMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSplitMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon size={13} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Promo Code Input Bar */}
        {!promoApplied && (
          <form onSubmit={handleApplyPromo} className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              placeholder="Promo or Voucher Code (e.g. POOL44)..."
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 flex-1 font-mono uppercase"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700"
            >
              Apply Discount
            </button>
          </form>
        )}
      </div>

      {/* Co-Riders Fare Breakdown List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <PieChart size={14} className="text-cyan-400" />
            <span>Passenger Allocation & Payment Matrix</span>
          </h3>

          <button
            onClick={() => setShowAddRider(!showAddRider)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-all"
          >
            <Plus size={13} />
            <span>Add Co-Rider</span>
          </button>
        </div>

        {/* Inline Add Co-Rider Dialog */}
        {showAddRider && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3 animate-fadeIn">
            <strong className="text-xs text-white block">Add Co-Passenger to Fare Split</strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Co-Rider Name (e.g. Liam Smith)"
                value={newRiderName}
                onChange={(e) => setNewRiderName(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="Phone or UPI handle"
                value={newRiderPhone}
                onChange={(e) => setNewRiderPhone(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddRider(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRider}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md"
              >
                Add Passenger
              </button>
            </div>
          </div>
        )}

        {/* Riders Rows */}
        <div className="space-y-2.5">
          {ridersList.map((rider, idx) => {
            const riderShare = getRiderShare(rider);
            const isPaid = rider.paymentStatus === 'Paid';

            return (
              <div
                key={rider.userId || idx}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                {/* Rider Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={rider.avatar}
                    alt={rider.name}
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">{rider.name}</span>
                      {rider.isVerified && <VerificationBadge type="Government ID" size="sm" />}
                    </div>

                    {/* Mode-specific detail controllers */}
                    {splitMode === 'equal' && (
                      <span className="text-[11px] text-slate-400 font-mono block">
                        Equal Share: {Math.round(100 / ridersList.length)}% of total
                      </span>
                    )}

                    {splitMode === 'custom' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Split Ratio:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={rider.percentage || 0}
                          onChange={(e) => handleUpdatePercentage(idx, e.target.value)}
                          className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-cyan-300 font-mono font-bold text-center"
                        />
                        <span className="text-xs text-slate-400 font-mono">%</span>
                      </div>
                    )}

                    {splitMode === 'distance' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Trip Distance:</span>
                        <input
                          type="number"
                          min="1"
                          value={rider.distanceKm || 10}
                          onChange={(e) => handleUpdateDistance(idx, e.target.value)}
                          className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-cyan-300 font-mono font-bold text-center"
                        />
                        <span className="text-xs text-slate-400 font-mono">km</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount Due & Payment Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xl font-black text-white">${riderShare}</span>
                    <div className="flex items-center gap-1 text-[11px] sm:justify-end mt-0.5">
                      {isPaid ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 size={13} /> {rider.paidAt || 'Paid'}
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-bold">
                          <Clock size={13} /> Settle Due
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isPaid ? (
                      <button
                        onClick={() => {
                          setActivePaymentModalRider(rider);
                          setPaymentReceipt(null);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
                      >
                        <CreditCard size={14} />
                        <span>Pay Share</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActivePaymentModalRider(rider);
                          setPaymentReceipt({
                            txnId: 'TXN_VELO_EXIST_' + Math.floor(100000 + Math.random() * 900000),
                            amount: riderShare,
                            riderName: rider.name,
                            method: 'UPI / INSTANT',
                            timestamp: rider.paidAt || 'Settled',
                            date: new Date().toLocaleDateString()
                          });
                        }}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                      >
                        <Receipt size={14} className="text-cyan-400" />
                        <span>View Slip</span>
                      </button>
                    )}

                    {ridersList.length > 1 && (
                      <button
                        onClick={() => handleRemoveRider(idx)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
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

      {/* Interactive Payment Gateway Simulator Modal */}
      {activePaymentModalRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl p-6 relative space-y-5">
            <button
              onClick={() => setActivePaymentModalRider(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            {!paymentReceipt ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Smartphone size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Instant Fare Settlement</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Settling share for passenger <strong className="text-white">{activePaymentModalRider.name}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Amount to Authorize</span>
                    <span className="text-3xl font-black text-white">${getRiderShare(activePaymentModalRider)}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    Live Escrow
                  </span>
                </div>

                {/* Gateway Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Choose Payment Gateway
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi', label: 'UPI / QR', icon: QrCode },
                      { id: 'card', label: 'Card', icon: CreditCard },
                      { id: 'wallet', label: 'Velocita Wallet', icon: DollarSign }
                    ].map(m => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                            paymentMethod === m.id
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <Icon size={16} />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Gateway Detail Preview */}
                {paymentMethod === 'upi' && (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-2">
                    <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                      <QrCode size={80} className="text-slate-950" />
                    </div>
                    <span className="text-[11px] font-mono text-cyan-300 block">
                      upi://pay?pa=velocita@icici&pn=RideShare&am={getRiderShare(activePaymentModalRider)}
                    </span>
                    <p className="text-[10px] text-slate-400">Scan using GPay, PhonePe, Paytm, or BHIM</p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Visa Platinum</span>
                      <span className="font-mono text-cyan-400">•••• 4829</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Card on file with instant 3DS bank verification</p>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Velocita Wallet Balance</span>
                      <strong className="text-white text-sm">${(user?.walletBalance || 145.50).toFixed(2)}</strong>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Sufficient Funds ✓</span>
                  </div>
                )}

                <button
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>Authenticating Bank Gateway...</span>
                  ) : (
                    <>
                      <span>Confirm & Authorize ${getRiderShare(activePaymentModalRider)}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </>
            ) : (
              /* Digital Invoice Slip with YatraGo Official Branding */
              <div className="space-y-4 text-center py-1 animate-fadeIn">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-cyan-500/30 p-1.5 shadow-lg flex items-center justify-center">
                    <img src={yatraGoLogo} alt="YatraGo" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-4 ring-emerald-500/30">
                    <Check size={22} />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-black text-white">Payment Authorized & Settled</h4>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">Official YatraGo Settle Receipt</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-left space-y-2 font-mono divide-y divide-slate-800">
                  <div className="flex justify-between pb-1.5">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="text-cyan-400 font-bold">{paymentReceipt.txnId}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 pb-1.5">
                    <span className="text-slate-400">Passenger:</span>
                    <span className="text-white font-bold">{paymentReceipt.riderName}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 pb-1.5">
                    <span className="text-slate-400">Method:</span>
                    <span className="text-slate-200">{paymentReceipt.method}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 pb-1.5">
                    <span className="text-slate-400">Net Amount Paid:</span>
                    <span className="text-emerald-400 font-extrabold text-sm">${paymentReceipt.amount}</span>
                  </div>
                  <div className="flex justify-between pt-1.5">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-slate-400">{paymentReceipt.date} • {paymentReceipt.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShareToast('Receipt copied to clipboard!');
                      setTimeout(() => setShareToast(null), 2500);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Share2 size={14} />
                    <span>Share Receipt</span>
                  </button>
                  <button
                    onClick={() => setActivePaymentModalRider(null)}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
