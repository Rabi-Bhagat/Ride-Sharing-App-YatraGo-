import React, { useState, useEffect, useMemo } from 'react';
import {
  Store, Hotel, UtensilsCrossed, ShoppingBag, Tag, Search, MapPin,
  Percent, BadgeCheck, Star, ArrowRight, X, Check, TrendingUp,
  Handshake, Briefcase, Loader2, Sparkles, Phone, Mail, ShieldCheck
} from 'lucide-react';

const CATEGORY_META = {
  hotel: { label: 'Hotels & Stays', icon: Hotel, tile: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', chip: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' },
  shop: { label: 'Shops & Gear', icon: ShoppingBag, tile: 'bg-violet-500/15 text-violet-400 border-violet-500/30', chip: 'bg-violet-500/15 text-violet-300 border-violet-500/40' },
  restaurant: { label: 'Restaurants', icon: UtensilsCrossed, tile: 'bg-amber-500/15 text-amber-400 border-amber-500/30', chip: 'bg-amber-500/15 text-amber-300 border-amber-500/40' }
};

const FILTERS = [
  { id: 'all', label: 'All Partners', icon: Store },
  { id: 'hotel', label: 'Hotels', icon: Hotel },
  { id: 'shop', label: 'Shops', icon: ShoppingBag },
  { id: 'restaurant', label: 'Restaurants', icon: UtensilsCrossed }
];

const PARTNER_TIERS = [
  { id: 'starter', label: 'Starter', commission: 8, blurb: 'List your business & issue one promo code.' },
  { id: 'growth', label: 'Growth', commission: 10, blurb: 'Priority placement plus campaign boosts.' },
  { id: 'enterprise', label: 'Enterprise', commission: 12, blurb: 'Dedicated promoter & co-branded offers.' }
];

const formatPercent = (value) => `${Number(value) || 0}%`;

export default function BusinessPromoHub({ onNavigate }) {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const [promoInput, setPromoInput] = useState('');
  const [redeemState, setRedeemState] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const [showApply, setShowApply] = useState(false);
  const [application, setApplication] = useState({
    name: '',
    category: 'hotel',
    city: '',
    area: '',
    promoCode: '',
    discountPercent: 10,
    contactEmail: '',
    contactPhone: '',
    managedBy: 'admin'
  });
  const [applyState, setApplyState] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/partners')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.success && Array.isArray(data.partners)) {
          setPartners(data.partners);
        } else {
          setLoadError('Partner marketplace is unavailable right now.');
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not reach the partner marketplace. Check your connection.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return partners.filter((partner) => {
      if (category !== 'all' && partner.category !== category) return false;
      if (!term) return true;
      return [partner.name, partner.city, partner.area, partner.promoCode]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [partners, category, query]);

  const stats = useMemo(() => {
    const byCategory = partners.reduce((acc, partner) => {
      acc[partner.category] = (acc[partner.category] || 0) + 1;
      return acc;
    }, {});
    return {
      total: partners.length,
      hotels: byCategory.hotel || 0,
      shops: byCategory.shop || 0,
      restaurants: byCategory.restaurant || 0,
      bestDiscount: partners.reduce((max, partner) => Math.max(max, partner.discountPercent || 0), 0)
    };
  }, [partners]);

  const handleRedeem = async (event) => {
    event.preventDefault();
    const code = promoInput.trim();
    if (!code) return;

    setIsRedeeming(true);
    setRedeemState(null);
    try {
      const res = await fetch('/api/partners/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRedeemState({ ok: true, message: data.message, partner: data.partner, discountPercent: data.discountPercent });
      } else {
        setRedeemState({ ok: false, message: data.message || 'That promo code could not be redeemed.' });
      }
    } catch (error) {
      setRedeemState({ ok: false, message: 'Could not verify the promo code while offline.' });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleApply = async (event) => {
    event.preventDefault();
    if (!application.name.trim() || !application.category) {
      setApplyState({ ok: false, message: 'Business name and category are required.' });
      return;
    }

    setIsSubmitting(true);
    setApplyState(null);
    try {
      const res = await fetch('/api/partners/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApplyState({ ok: true, message: data.message });
        setApplication({
          name: '',
          category: 'hotel',
          city: '',
          area: '',
          promoCode: '',
          discountPercent: 10,
          contactEmail: '',
          contactPhone: '',
          managedBy: 'admin'
        });
      } else {
        setApplyState({ ok: false, message: data.message || 'Application could not be submitted.' });
      }
    } catch (error) {
      setApplyState({ ok: false, message: 'Could not reach the onboarding service.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-80 rounded-full bg-emerald-500/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              <Handshake size={12} />
              YatraGo Business Network
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Shop, Stay &amp; Dine — with partner promos
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              Hotels, shops and restaurants partner with YatraGo admins, developers and promoters to reach travellers.
              Businesses pay commission on bookings; travellers redeem promo codes for instant discounts.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { icon: Hotel, label: `${stats.hotels} hotels`, tint: 'text-cyan-400' },
                { icon: ShoppingBag, label: `${stats.shops} shops`, tint: 'text-violet-400' },
                { icon: UtensilsCrossed, label: `${stats.restaurants} restaurants`, tint: 'text-amber-400' },
                { icon: Percent, label: `Up to ${formatPercent(stats.bestDiscount)} off`, tint: 'text-emerald-400' }
              ].map(({ icon: Icon, label, tint }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-1 text-[10px] font-semibold text-slate-300"
                >
                  <Icon size={11} className={tint} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowApply(true)}
            className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3.5 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 sm:text-sm"
          >
            <Briefcase size={16} />
            List your business
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Promo redemption */}
      <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              <Tag size={12} />
              Traveller promo
            </span>
            <p className="mt-1 text-xs text-slate-300">Have a partner code? Redeem it before you check out.</p>
          </div>

          <form onSubmit={handleRedeem} className="flex w-full items-center gap-2 sm:w-auto">
            <input
              type="text"
              value={promoInput}
              onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
              placeholder="e.g. NEPALSTAY20"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs uppercase tracking-wide text-white transition-colors focus:border-emerald-400 focus:outline-none sm:w-52"
              aria-label="Partner promo code"
            />
            <button
              type="submit"
              disabled={isRedeeming}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-slate-950 transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-60"
            >
              {isRedeeming ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Redeem
            </button>
          </form>
        </div>

        {redeemState && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-xs animate-fadeIn ${
              redeemState.ok
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
            }`}
            role="status"
          >
            {redeemState.ok ? <BadgeCheck size={15} className="mt-0.5 shrink-0" /> : <X size={15} className="mt-0.5 shrink-0" />}
            <div>
              <strong className="block">{redeemState.message}</strong>
              {redeemState.ok && (
                <span className="mt-0.5 block text-[11px] opacity-90">
                  Show this code at {redeemState.partner?.name} in {redeemState.partner?.city} to claim your discount.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = category === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setCategory(filter.id)}
                aria-pressed={isActive}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={13} />
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search partner, city or code"
            aria-label="Search partners"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white transition-colors focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Partner grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/50 py-16">
          <Loader2 size={26} className="animate-spin text-cyan-400" />
          <span className="font-mono text-xs text-slate-400">Loading partner network…</span>
        </div>
      ) : loadError ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/30 p-6 text-center">
          <p className="text-sm font-bold text-rose-200">{loadError}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-10 text-center">
          <Store size={26} className="mx-auto text-slate-500" />
          <p className="mt-2 text-sm font-bold text-white">No partners match that search</p>
          <p className="mt-1 text-xs text-slate-400">Try a different category or clear the search.</p>
          <button
            onClick={() => {
              setQuery('');
              setCategory('all');
            }}
            className="mt-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 transition-colors hover:border-cyan-500/50"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((partner) => {
            const meta = CATEGORY_META[partner.category] || CATEGORY_META.shop;
            const Icon = meta.icon;
            return (
              <article
                key={partner._id}
                className="group flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-600 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-transform group-hover:scale-105 ${meta.tile}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.chip}`}>
                    {meta.label}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate text-sm font-black text-white">{partner.name}</h3>
                    {partner.isVerified && <BadgeCheck size={13} className="shrink-0 text-emerald-400" />}
                  </div>
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin size={11} />
                    {partner.area ? `${partner.area}, ` : ''}{partner.city}
                  </span>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{partner.description}</p>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1 font-bold text-amber-300">
                    <Star size={11} className="fill-amber-300" />
                    {Number(partner.rating || 0).toFixed(1)}
                  </span>
                  <span className="text-slate-500">({partner.reviewCount || 0} reviews)</span>
                  <span className="ml-auto flex items-center gap-1 text-slate-400">
                    <TrendingUp size={11} className="text-cyan-400" />
                    {formatPercent(partner.commissionPercent)} commission
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
                  <div>
                    <span className="block font-mono text-[9px] uppercase text-slate-500">Promo code</span>
                    <span className="font-mono text-xs font-black tracking-wide text-emerald-300">{partner.promoCode || '—'}</span>
                  </div>
                  <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2 py-1 text-[11px] font-black text-emerald-300">
                    {formatPercent(partner.discountPercent)} off
                  </span>
                </div>

                <button
                  onClick={() => {
                    setPromoInput(partner.promoCode || '');
                    setRedeemState(null);
                  }}
                  className="mt-0.5 flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2 text-xs font-bold text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
                >
                  <Tag size={12} />
                  Use this promo
                </button>
              </article>
            );
          })}
        </div>
      )}

      {/* Commission model */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-black text-white">
            <Percent size={16} className="text-cyan-400" />
            How the partnership works
          </h2>
          <span className="font-mono text-[10px] uppercase text-slate-500">Commission-based promotion</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PARTNER_TIERS.map((tier) => (
            <div
              key={tier.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition-colors hover:border-cyan-500/40"
            >
              <div className="flex items-center justify-between">
                <strong className="text-sm font-black text-white">{tier.label}</strong>
                <span className="font-mono text-xs font-bold text-cyan-400">{tier.commission}%</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{tier.blurb}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
          <ShieldCheck size={13} className="mt-0.5 shrink-0 text-emerald-400" />
          Partners are reviewed by YatraGo admins before listings go live. Developers integrate the promo API and
          promoters run the local campaigns — every booking earns the business reach and YatraGo a fair commission.
        </p>
      </div>

      {/* Application modal */}
      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel relative max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-3xl border border-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setShowApply(false)}
              className="absolute right-4 top-4 rounded-xl bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              title="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400">
                <Briefcase size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">List your business</h3>
                <p className="text-[11px] text-slate-400">Hotels, shops & restaurants — join the promo network.</p>
              </div>
            </div>

            {applyState?.ok ? (
              <div className="space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center animate-fadeIn">
                <BadgeCheck size={26} className="mx-auto text-emerald-400" />
                <p className="text-sm font-black text-emerald-200">{applyState.message}</p>
                <p className="text-[11px] text-emerald-300/80">
                  Our admin team reviews new partners before the listing and promo code go live.
                </p>
                <button
                  onClick={() => setShowApply(false)}
                  className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-black text-slate-950 transition-colors hover:bg-cyan-400"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Business name *</span>
                    <input
                      value={application.name}
                      onChange={(event) => setApplication((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Himalayan Grand Hotel"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Category *</span>
                    <select
                      value={application.category}
                      onChange={(event) => setApplication((prev) => ({ ...prev, category: event.target.value }))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="hotel">Hotel / Stay</option>
                      <option value="shop">Shop / Gear</option>
                      <option value="restaurant">Restaurant / Cafe</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block font-mono text-[10px] uppercase text-slate-400">City</span>
                    <input
                      value={application.city}
                      onChange={(event) => setApplication((prev) => ({ ...prev, city: event.target.value }))}
                      placeholder="Kathmandu"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Area / Street</span>
                    <input
                      value={application.area}
                      onChange={(event) => setApplication((prev) => ({ ...prev, area: event.target.value }))}
                      placeholder="Durbar Marg"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Promo code</span>
                    <input
                      value={application.promoCode}
                      onChange={(event) => setApplication((prev) => ({ ...prev, promoCode: event.target.value.toUpperCase() }))}
                      placeholder="NEPALSTAY20"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs uppercase text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Traveller discount %</span>
                    <input
                      type="number"
                      min="0"
                      max="90"
                      value={application.discountPercent}
                      onChange={(event) => setApplication((prev) => ({ ...prev, discountPercent: event.target.value }))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Contact email</span>
                    <input
                      type="email"
                      value={application.contactEmail}
                      onChange={(event) => setApplication((prev) => ({ ...prev, contactEmail: event.target.value }))}
                      placeholder="stay@hotel.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Contact phone</span>
                    <input
                      value={application.contactPhone}
                      onChange={(event) => setApplication((prev) => ({ ...prev, contactPhone: event.target.value }))}
                      placeholder="+977 1 420 0001"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Who manages this listing?</span>
                  <div className="flex gap-2">
                    {['admin', 'developer', 'promotor'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setApplication((prev) => ({ ...prev, managedBy: role }))}
                        className={`flex-1 rounded-xl border px-2 py-1.5 text-[11px] font-bold capitalize transition-all ${
                          application.managedBy === role
                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                            : 'border-slate-700 bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </label>

                {applyState && !applyState.ok && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-2.5 text-[11px] text-rose-200">
                    {applyState.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Submit partnership request
                    </>
                  )}
                </button>

                <p className="flex items-center justify-center gap-1.5 text-center font-mono text-[10px] text-slate-500">
                  <Phone size={10} /> Reviewed by admins • <Mail size={10} /> reply within 2 business days
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
