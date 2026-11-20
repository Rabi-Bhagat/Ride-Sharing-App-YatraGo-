import React, { useState, useMemo } from 'react';
import { X, MapPin, Star, BadgeCheck, BedDouble, Users, Utensils, Wifi, Car, Calendar, ChevronLeft, ChevronRight, Check, Tag, Receipt, Download, ShieldCheck, Loader2, Building2, Sparkles, AlertCircle } from 'lucide-react';
import { openRazorpayCheckout } from '../utils/razorpayCheckout';
import { downloadReceipt, shareReceipt, printReceipt, formatINR } from '../utils/receipt';

const LABEL_TO_ICON = {
  'Free WiFi': Wifi,
  'WiFi': Wifi,
  'Airport pickup': Car,
  'Bike hire': Car,
  'Cycle hire': Car,
  'Free kayaking': Sparkles
};

const toISODate = (date) => date.toISOString().slice(0, 10);

const addDays = (isoDate, days) => {
  const base = new Date(`${isoDate}T00:00:00`);
  base.setDate(base.getDate() + days);
  return toISODate(base);
};

const nightsBetween = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const diff = Math.round((end - start) / 86400000);
  return diff > 0 ? diff : 0;
};

const formatDate = (isoDate) => {
  if (!isoDate) return '—';
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export default function PartnerBookingModal({ partner, onClose, onViewPromo }) {
  const today = toISODate(new Date());
  const [checkIn, setCheckIn] = useState(addDays(today, 1));
  const [checkOut, setCheckOut] = useState(addDays(today, 3));
  const [guests, setGuests] = useState(2);
  const [roomId, setRoomId] = useState(partner?.rooms?.[0]?.id || null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const rooms = partner?.rooms || [];
  const images = partner?.images?.length ? partner.images : [];
  const selectedRoom = rooms.find((room) => room.id === roomId) || rooms[0] || null;
  const nights = nightsBetween(checkIn, checkOut);

  const charges = useMemo(() => {
    const nightlyRate = selectedRoom?.pricePerNight || 0;
    const roomTotal = nightlyRate * nights;
    const discount = appliedPromo ? Math.round(roomTotal * (appliedPromo.discountPercent / 100) * 100) / 100 : 0;
    const taxable = Math.max(0, roomTotal - discount);
    const taxes = Math.round(taxable * ((partner?.taxesPercent || 0) / 100) * 100) / 100;
    const serviceFee = nights > 0 ? partner?.serviceFee || 0 : 0;
    const total = Math.round((taxable + taxes + serviceFee) * 100) / 100;
    return { nightlyRate, roomTotal, discount, taxes, serviceFee, total };
  }, [selectedRoom, nights, appliedPromo, partner?.taxesPercent, partner?.serviceFee]);

  const bookingRef = useMemo(
    () => `YG-${String(partner?._id || 'stay').slice(-4).toUpperCase()}-${Date.now().toString().slice(-5)}`,
    [partner?._id]
  );

  const applyPromo = (event) => {
    event.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    const partnerCode = String(partner?.promoCode || '').toUpperCase();
    if (partnerCode && code === partnerCode) {
      setAppliedPromo({ code, discountPercent: partner.discountPercent || 0 });
      return;
    }

    // Also accept any other active partner code, so travellers can compare offers.
    if (onViewPromo) {
      const offer = onViewPromo(code);
      if (offer) {
        setAppliedPromo({ code, discountPercent: offer.discountPercent || 0, partnerName: offer.partnerName });
        return;
      }
    }

    setPromoError(`"${code}" is not valid for this stay.`);
  };

  const handlePay = () => {
    if (!selectedRoom || nights <= 0) {
      setPayError('Choose a valid check-in and check-out date.');
      return;
    }
    setPayError('');
    setIsPaying(true);

    openRazorpayCheckout({
      amountInRupees: charges.total,
      riderName: 'YatraGo Traveller',
      description: `${partner.name} — ${selectedRoom.name} (${nights} night${nights > 1 ? 's' : ''})`,
      rideId: bookingRef,
      onSuccess: (verifyData, razorpayRes) => {
        setIsPaying(false);
        setConfirmation({
          txnId: razorpayRes?.razorpay_payment_id || `pay_${Date.now()}`,
          orderId: razorpayRes?.razorpay_order_id || '',
          amount: charges.total,
          method: 'RAZORPAY (VERIFIED)',
          issuedAt: new Date().toISOString()
        });
      },
      onFailure: (message) => {
        setIsPaying(false);
        setPayError(message || 'Payment could not be completed.');
      },
      onDismiss: () => setIsPaying(false)
    });
  };

  const receiptModel = () => ({
    reference: bookingRef,
    issuedAt: confirmation?.issuedAt,
    rideId: bookingRef,
    route: {
      from: partner?.name,
      to: `${selectedRoom?.name} • ${nights} night${nights > 1 ? 's' : ''}`
    },
    vehicle: partner?.category === 'hotel' ? 'Hotel stay' : 'Partner booking',
    driverName: partner?.address || partner?.city,
    fare: charges.roomTotal,
    promo: charges.discount,
    tip: 0,
    netTotal: charges.total,
    collected: charges.total,
    outstanding: 0,
    riders: [
      {
        name: `Guest (${guests})`,
        share: charges.total,
        percentage: 100,
        status: 'Paid',
        method: confirmation?.method || 'Razorpay',
        txnId: confirmation?.txnId
      }
    ]
  });

  if (!partner) return null;

  // Guard: only businesses with real room inventory can be booked.
  if (!partner.rooms?.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/88 p-4 backdrop-blur-md animate-fadeIn">
        <div className="glass-panel w-full max-w-sm space-y-3 rounded-3xl border border-slate-800 p-6 text-center shadow-2xl">
          <Building2 size={28} className="mx-auto text-slate-500" />
          <h3 className="text-sm font-black text-white">Booking not available</h3>
          <p className="text-xs text-slate-400">
            {partner.name} does not have room inventory listed yet. Use its promo code instead.
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-black text-slate-950 transition-colors hover:bg-cyan-400"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/88 p-3 backdrop-blur-md animate-fadeIn sm:p-6">
      <div className="glass-panel relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-800 shadow-2xl animate-modalRise">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-xl bg-slate-950/80 p-2 text-slate-400 backdrop-blur transition-colors hover:bg-slate-800 hover:text-white"
          title="Close booking"
        >
          <X size={18} />
        </button>

        {confirmation ? (
          /* ---------------- Confirmation ---------------- */
          <div className="space-y-5 p-6 animate-fadeIn sm:p-8">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/25">
                <Check size={24} />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-white">Stay confirmed</h3>
              <p className="mt-1 text-xs text-emerald-400">{bookingRef}</p>
            </div>

            <div className="mx-auto max-w-md space-y-2 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs">
              {[
                ['Property', partner.name],
                ['Room', selectedRoom?.name],
                ['Check-in', `${formatDate(checkIn)} from ${partner.checkIn}`],
                ['Check-out', `${formatDate(checkOut)} by ${partner.checkOut}`],
                ['Guests', `${guests} guest${guests > 1 ? 's' : ''} • ${nights} night${nights > 1 ? 's' : ''}`],
                ['Payment ID', confirmation.txnId]
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-right font-semibold text-slate-200">{value}</span>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-slate-800 pt-2">
                <span className="text-slate-400">Total paid</span>
                <span className="text-sm font-black text-emerald-400">{formatINR(confirmation.amount)}</span>
              </div>
            </div>

            <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
              <button
                onClick={() => downloadReceipt(receiptModel())}
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-[10px] font-bold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-white"
              >
                <Download size={15} className="text-cyan-400" />
                Download
              </button>
              <button
                onClick={() => shareReceipt(receiptModel())}
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-[10px] font-bold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-white"
              >
                <Receipt size={15} className="text-emerald-400" />
                Share
              </button>
              <button
                onClick={() => printReceipt(receiptModel())}
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-[10px] font-bold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-white"
              >
                <ShieldCheck size={15} className="text-violet-400" />
                Print
              </button>
            </div>

            <button
              onClick={onClose}
              className="mx-auto block rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-black text-slate-950 transition-colors hover:bg-cyan-400"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* ---------------- Gallery ---------------- */}
            <div className="relative h-56 w-full overflow-hidden bg-slate-900 sm:h-72">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={`${partner.name} photo ${activeImage + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList?.add('img-fallback'); }} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <Building2 size={44} className="text-slate-600" />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="flex items-center gap-1.5 text-lg font-black text-white sm:text-xl">
                      {partner.name}
                      {partner.isVerified && <BadgeCheck size={15} className="text-emerald-400" />}
                    </h2>
                    <span className="flex items-center gap-1 text-[11px] text-slate-300">
                      <MapPin size={11} />
                      {partner.address || `${partner.area}, ${partner.city}`}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-[11px] font-bold text-amber-300">
                    <Star size={11} className="fill-amber-300" />
                    {Number(partner.rating || 0).toFixed(1)} · {partner.reviewCount || 0} reviews
                  </span>
                </div>
              </div>

              {images.length > 1 && (
                <div className="absolute bottom-16 right-4 flex items-center gap-1">
                  <button
                    onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                    className="rounded-lg bg-slate-950/70 p-1.5 text-slate-300 backdrop-blur hover:text-white"
                    title="Previous photo"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                    className="rounded-lg bg-slate-950/70 p-1.5 text-slate-300 backdrop-blur hover:text-white"
                    title="Next photo"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <p className="text-xs leading-relaxed text-slate-400">{partner.description}</p>

              {/* Amenities */}
              {partner.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {partner.amenities.map((amenity) => {
                    const Icon = LABEL_TO_ICON[amenity] || Check;
                    return (
                      <span
                        key={amenity}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1 text-[10px] font-semibold text-slate-300"
                      >
                        <Icon size={11} className="text-emerald-400" />
                        {amenity}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Dates & guests */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <label className="block">
                  <span className="mb-1 flex items-center gap-1 font-mono text-[9px] uppercase text-slate-400">
                    <Calendar size={9} /> Check-in
                  </span>
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(event) => {
                      setCheckIn(event.target.value);
                      if (event.target.value >= checkOut) setCheckOut(addDays(event.target.value, 1));
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 flex items-center gap-1 font-mono text-[9px] uppercase text-slate-400">
                    <Calendar size={9} /> Check-out
                  </span>
                  <input
                    type="date"
                    value={checkOut}
                    min={addDays(checkIn, 1)}
                    onChange={(event) => setCheckOut(event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 flex items-center gap-1 font-mono text-[9px] uppercase text-slate-400">
                    <Users size={9} /> Guests
                  </span>
                  <select
                    value={guests}
                    onChange={(event) => setGuests(Number(event.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={count}>
                        {count} guest{count > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-2.5 py-2">
                  <span className="block font-mono text-[9px] uppercase text-slate-400">Nights</span>
                  <span className="text-xs font-black text-cyan-400">{nights || '—'}</span>
                </div>
              </div>

              {/* Room types */}
              <div className="space-y-2">
                <h3 className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <BedDouble size={12} className="text-cyan-400" />
                  Select a room
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {rooms.map((room) => {
                    const isActive = selectedRoom?.id === room.id;
                    return (
                      <button
                        key={room.id}
                        onClick={() => setRoomId(room.id)}
                        aria-pressed={isActive}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-3 text-left transition-all ${
                          isActive
                            ? 'border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-500/30'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="flex items-center gap-1.5 text-xs font-black text-white">
                            {room.name}
                            {isActive && <Check size={11} className="text-cyan-400" />}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1"><BedDouble size={9} />{room.bed}</span>
                            <span className="flex items-center gap-1"><Users size={9} />Up to {room.capacity}</span>
                            <span>{room.size}</span>
                            {room.breakfast && (
                              <span className="flex items-center gap-1 text-emerald-400">
                                <Utensils size={9} />Breakfast
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-white">{formatINR(room.pricePerNight)}</span>
                          <span className="block font-mono text-[9px] text-slate-500">per night</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Promo */}
              <div className="space-y-2">
                {appliedPromo ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Tag size={12} />
                      {appliedPromo.code} applied — {appliedPromo.discountPercent}% off
                      {appliedPromo.partnerName ? ` (${appliedPromo.partnerName})` : ''}
                    </span>
                    <button
                      onClick={() => setAppliedPromo(null)}
                      className="text-emerald-300 hover:text-white"
                      title="Remove promo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={applyPromo} className="flex items-center gap-2">
                    <input
                      value={promoCode}
                      onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                      placeholder={partner.promoCode ? `Try ${partner.promoCode}` : 'Promo code'}
                      className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs uppercase text-white focus:border-emerald-400 focus:outline-none"
                      aria-label="Promo code"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-black text-slate-950 transition-colors hover:bg-emerald-400"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoError && <p className="text-[11px] text-rose-300">{promoError}</p>}
              </div>

              {/* Charges */}
              <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>
                    {formatINR(charges.nightlyRate)} × {nights} night{nights === 1 ? '' : 's'}
                  </span>
                  <span className="font-mono">{formatINR(charges.roomTotal)}</span>
                </div>
                {charges.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Promo discount</span>
                    <span className="font-mono">−{formatINR(charges.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>Taxes &amp; VAT ({partner.taxesPercent || 0}%)</span>
                  <span className="font-mono">{formatINR(charges.taxes)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Service fee</span>
                  <span className="font-mono">{formatINR(charges.serviceFee)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-black text-white">
                  <span>Total</span>
                  <span className="font-mono text-cyan-400">{formatINR(charges.total)}</span>
                </div>
              </div>

              {payError && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-[11px] text-rose-200 animate-slideDown" role="alert">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-rose-100">Payment could not start</strong>
                    <span className="mt-0.5 block">{payError}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={isPaying || nights <= 0 || !selectedRoom}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                {isPaying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Opening Razorpay…
                  </>
                ) : (
                  <>
                    Pay {formatINR(charges.total)} &amp; confirm
                    <Check size={16} />
                  </>
                )}
              </button>

              <p className="text-center font-mono text-[10px] text-slate-500">
                Check-in {partner.checkIn} • Check-out {partner.checkOut} • Free cancellation up to 24h
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
