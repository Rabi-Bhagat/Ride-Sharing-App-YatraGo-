# design.md — YatraGo Design System

The visual and interaction language for the YatraGo frontend. Use this as the source of truth when building or modifying UI. All values map directly to Tailwind utilities and custom classes in `frontend/src/index.css`.

---

## 1. Design Principles

1. **Dark-first, neon-accented.** A deep slate canvas with luminous cyan/emerald highlights gives the "smart mobility / cyber" feel. Light mode is not supported.
2. **Glassmorphism over flat fills.** Cards, panels, dropdowns, and HUDs use translucent slate with blur and hairline borders.
3. **Motion communicates state.** Entrances fade/slide, pages do a kinetic blur-in, SOS pulses red, live elements pulse green.
4. **Dense but scannable.** Cockpits and dashboards pack telemetry; hierarchy is created with mono labels, uppercase micro-headings, and color-coded accent chips.
5. **Zero-dead-end fallbacks.** Every visual feature (3D, maps, payments) has a graceful styled fallback — design those states, don't leave blanks.

---

## 2. Color System

### Base / surfaces
| Token | Hex / utility | Use |
|-------|---------------|-----|
| App background | `bg-slate-950` (`#030712` in body) | Page base |
| Elevated surface | `bg-slate-900` (`#0f172a`) | Cards, inputs, nav |
| Deep inset | `bg-slate-950` / `bg-slate-900/90` | Nested wells, HUDs |
| Border | `border-slate-800` (`#1e293b`) | Default hairlines |
| Border emphasis | `border-slate-700` | Hover / active edges |
| Text primary | `text-white` / `text-slate-100` | Headings, key values |
| Text secondary | `text-slate-300` | Body copy |
| Text muted | `text-slate-400` | Labels, captions |
| Text faint | `text-slate-500` | Meta, hints |

### Accent / semantic
| Meaning | Color | Tailwind | Notes |
|---------|-------|----------|-------|
| **Primary action / brand** | Cyan → Blue | `from-cyan-500 to-blue-600`, `text-cyan-400` | Buttons, active nav, links |
| **Savings / success / go** | Emerald | `emerald-400/500`, `text-emerald-400` | Pool discounts, "Online", paid, verified |
| **Explore / guider / 3D** | Violet | `violet-400/500` | Guider network, 3D previews |
| **Premium / caution / nitro** | Amber | `amber-400/500` | Premium tiers, warnings, boosts |
| **Danger / SOS / stop** | Rose/Red | `rose-500`, `red-500`, `red-400` | SOS, brake, destructive |
| **Info / finance** | Blue | `blue-400/500` | Cost splitting, receipts |

### Tints for chips/badges
Use `bg-{color}-500/10|15|20` + `text-{color}-300|400` + `border-{color}-500/30|40`. Example: `bg-emerald-500/20 text-emerald-300 border border-emerald-500/40`.

### Text selection & focus
- Selection: `selection:bg-cyan-500 selection:text-slate-950`.
- Focus: `focus:outline-none focus:border-cyan-400` on inputs.

---

## 3. Typography

- **Family**: `Plus Jakarta Sans` (300–800), loaded from Google Fonts; falls back to system UI. Applied globally via `body { font-family }`.
- **Mono**: Tailwind `font-mono` for labels, telemetry, IDs, prices-in-mono, keyboard hints.

### Scale (utility → use)
| Size | Classes | Use |
|------|---------|-----|
| Hero | `text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight` | Page/marketing headlines |
| Section | `text-xl sm:text-2xl font-black tracking-tight` | Section titles |
| Card title | `text-base font-black` / `text-sm font-bold` | Card headings |
| Body | `text-xs sm:text-sm text-slate-300/400 leading-relaxed` | Descriptive copy |
| Label (mono) | `text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400` | Eyebrows, section kickers |
| Micro | `text-[9px]–text-[11px] font-mono` | Badges, hints, timestamps |

**Convention**: pair a mono uppercase eyebrow (accent color) above a bold headline. Numbers and IDs use `font-mono font-bold`.

---

## 4. Spacing & Layout

- **Containers**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (Navbar uses `2xl:max-w-[1480px]`).
- **Page shell**: `<div className="space-y-12 animate-fadeIn text-slate-100">` for pages; sections separated by `space-y-4`–`space-y-12`.
- **Grids**: responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`; hero splits use `lg:grid-cols-12` (e.g., 5/7 split).
- **Gap**: `gap-2` tight controls, `gap-4` cards, `gap-6` major columns.
- **Vertical rhythm**: `space-y-3` inside cards, `space-y-6` between blocks.

### Radius
| Element | Radius |
|---------|--------|
| Pills / chips / small buttons | `rounded-full` / `rounded-xl` |
| Inputs, nav items, buttons | `rounded-xl` / `rounded-2xl` |
| Cards, dropdowns, HUDs | `rounded-2xl` / `rounded-3xl` |
| Feature panels, hero media | `rounded-3xl` |

### Elevation
- `shadow-sm` restrained controls
- `shadow-lg` floating pills
- `shadow-2xl` panels/modals
- Accent shadows: `shadow-cyan-500/20` (primary), `shadow-emerald-500/20` (success), `shadow-red-600/30` (SOS).

---

## 5. Elevation & Glass Surfaces

Defined in `index.css`:

```css
.glass-panel { background: rgba(15,23,42,.75); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.08); }
.glass-card  { background: rgba(30,41,59,.5);  backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.07); }
.glass-pill  { background: rgba(255,255,255,.05); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.1); }
```

Also common: `bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80` for dropdowns and modals. Navbar: `bg-slate-950/85 backdrop-blur-2xl border-b border-slate-800/80`.

Use glass for anything that floats over content (nav, dropdowns, HUD overlays, modals). Use opaque `bg-slate-900` for controls sitting on the base canvas.

---

## 6. Components

### Buttons
```jsx
/* Primary (cyan→blue gradient) */
className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"

/* Secondary / ghost */
className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all"

/* Success (emerald solid) */
className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-xl shadow-emerald-500/20"

/* Danger / SOS */
className="rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"

/* Active toggle */
className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40"
```
- Primary CTAs use **dark text on bright gradient** (`text-slate-950`).
- Micro-interactions: `hover:scale-105 active:scale-95` on primary; icons `group-hover:translate-x-1`.

### Cards
- Base: `p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-{accent}-400 transition-all group`.
- Icon tile: `w-12 h-12 rounded-2xl bg-{accent}-500/10 text-{accent}-400 flex items-center justify-center group-hover:scale-110`.
- Badge top-right: mono micro pill with accent tint.

### Inputs
```jsx
className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
```
Icon-inset inputs use `pl-9/pl-10` with absolute icon at `left-3 text-cyan-400`.

### Badges / chips
Mono micro pill: `text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-{c}-500/20 text-{c}-300`. Verification badges via `VerificationBadge`.

### Nav / dropdowns
- Sticky header `z-40`; mega-dropdowns `absolute top-full mt-2 w-72/80 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-2xl shadow-2xl p-2.5 z-50 animate-fadeIn`.
- Menu rows: `p-2.5 rounded-xl hover:bg-slate-800/90 flex items-start gap-3 group` with a colored icon tile + bold title + muted description.
- Keyboard affordance: `⌘K`/`Ctrl+K` global search modal.

### Modals / overlays
- Backdrop: `fixed inset-0 z-50 bg-black/80 backdrop-blur-md`.
- Panel: `w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl animate-slideDown`.

### HUD / telemetry (3D scene & trackers)
- Capsule pills: `px-3 py-1.5 rounded-full bg-slate-950/85 border border-slate-800 backdrop-blur-xl shadow-lg`.
- Live indicator: `w-2 h-2 rounded-full bg-emerald-400 animate-pulse`.
- Dark base panels: `bg-slate-950/92 border border-slate-800 backdrop-blur-2xl rounded-2xl`.

---

## 7. Motion & Animation

Defined in `index.css` / `tailwind.config.js`:

| Utility | Effect | Use |
|---------|--------|-----|
| `animate-fadeIn` | opacity + 6px translate-up, .35s | Page/section entrance |
| `animate-slideDown` | opacity + -10px translate, .3s | Dropdowns, banners |
| `page-enter-kinetic` | scale .985 + blur(4px) → clear, .45s | Route/tab changes (App `<main key>`) |
| `animate-pulse` / green dot | live status |
| `sos-button-active` | `emergency-pulse` red ring, 1.5s infinite | SOS active |
| `animate-roadDash` | road stripe scroll, 1.2s linear | 3D road cues |
| `pulse-fast`, `glow` | tailwind config | Emphasis |

Rules:
- Every page root gets `animate-fadeIn`.
- Interactive elements transition with `transition-all` (150–300ms) and usually `hover:scale-105` / `active:scale-95`.
- Avoid animating large lists; animate container once.

---

## 8. Iconography

- `lucide-react` only. Default size `13–16` in controls, `20–32` in tiles/heroes.
- Accent icons take the semantic color (e.g., `IndianRupee text-emerald-400`, `AlertTriangle text-red-400`, `Compass text-violet-400`).
- Pair icon + label; avoid icon-only buttons without `title`.

---

## 9. Maps, 3D & Special Surfaces

- **Leaflet** is dark-filtered via `.leaflet-container` / `.leaflet-tile` overrides in `index.css` — keep tiles inverted/brightness-reduced. Popups styled dark.
- **Google Maps** loaded globally in `index.html`; autocomplete in booking cards.
- **3D (Three.js)**: `Interactive3DRideScene` — dark neon environment, ACES tone mapping, procedural asphalt/building textures, 4 weather modes (`neon`, `sunset`, `daylight`, `rain`), 4 camera modes (chase/POV/orbit/drone). Always wrap in `try/catch` and render the styled WebGL fallback panel + "Re-initialize 3D Engine" button.
- **Razorpay**: hosted checkout themed `#06b6d4`, dark backdrop `rgba(2,6,23,.85)`.

---

## 10. Responsive Behavior

- Mobile-first; breakpoints `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.
- Nav collapses to hamburger drawer under `lg` (`max-h-[85vh] overflow-y-auto`).
- Hero grids stack to single column below `lg`; 3D/HUD control rows wrap with `flex-wrap`.
- Hide dense desktop-only chrome on mobile (`hidden md:flex`, `hidden lg:inline`); expose equivalents in the drawer.
- Text truncation: `truncate max-w-[...]` for names/labels in tight pills.

---

## 11. Content & Voice

- Friendly, energetic, safety-forward: "Ride • Share • Explore", "Save up to 44%", "GPS LIVE".
- Use ₹ for all money, and show savings/discounts prominently in emerald.
- Emphasize verification ("ID Verified", "Government ID", "Gold Driver") and safety (SOS guardians).
- Microcopy stays short; technical/telemetry text uses mono uppercase.

---

## 12. Accessibility & Quality Checklist

- Provide `title` on icon-only controls and `aria-label` on the hamburger.
- Maintain contrast: bright gradient buttons use `text-slate-950`; body copy on dark uses `slate-300/400`.
- Don't convey state by color alone — pair with icon or label (e.g., "Online", "Paid ✓").
- Honor keyboard: ESC closes dropdowns/modals; `⌘K`/`Ctrl+K` opens search; `W/S`/arrows drive the 3D scene.
- Ensure focus is visible on inputs (`focus:border-cyan-400`).
