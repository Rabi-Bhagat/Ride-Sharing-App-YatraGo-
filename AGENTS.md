# AGENTS.md — YatraGo Engineering Guide

Guidance for AI coding agents and contributors working in this repository. Read this before making changes.

## 1. What This Project Is

**YatraGo** is a full-stack MERN ride-sharing and mobility platform. It combines cab hailing, carpool/stranger matching, automated fare splitting, a 3D ride simulator, verified local guiders, real-time group chat, and an emergency SOS system.

- **Backend**: Node.js + Express + Socket.io + Mongoose (MongoDB Atlas, with in-memory fallback).
- **Frontend**: React 18 + Vite + Tailwind CSS + Three.js (`@react-three/fiber` deps available, main scene is vanilla Three.js) + Leaflet + `socket.io-client`.
- **Payments**: Razorpay (India / INR, ₹) with HMAC-SHA256 signature verification.
- **Auth**: Custom PBKDF2 password hashing + hand-rolled HS256 JWT. No Passport/Auth0.

The app is designed with **zero-lockout fallbacks**: if MongoDB, Redis, external maps, or email credentials are missing, it degrades to in-memory/mock data instead of crashing. Do not remove fallbacks carelessly — they are a load-bearing product decision (see README "Zero-Cost Quickstart").

## 2. Repository Layout

```
Ride Sharing app/
├── package.json              # Root scripts: dev (concurrently backend+frontend), seed
├── .env                      # Root env (LOADED by backend via dotenv)
├── backend/
│   ├── server.js             # Express + Socket.io entry (port 5000)
│   ├── seed.js               # Populates MongoDB with demo users/rides/guiders/messages
│   ├── config/db.js          # Mongoose connect + fallback
│   ├── models/               # User, Ride, Guider, Message, SosAlert
│   ├── routes/               # authRoutes, rideRoutes, guiderRoutes, sosRoutes, paymentRoutes
│   ├── sockets/socketHandler.js
│   ├── utils/authHelper.js   # hash/verify password, sanitizeUser, JWT sign/verify
│   └── utils/emailService.js # Nodemailer OR native TLS SMTP fallback
└── frontend/
    ├── index.html            # Loads Google Maps, Leaflet CSS, Razorpay SDK, fonts
    ├── vite.config.js        # Dev server port 3000, proxies /api and /socket.io -> :5000
    ├── tailwind.config.js
    └── src/
        ├── App.jsx           # Hash-based router + global state (activeRide, pickup, destination)
        ├── main.jsx          # ReactDOM root
        ├── index.css         # Tailwind + glassmorphism utilities + keyframe animations
        ├── components/       # 25 reusable components (see map below)
        ├── pages/            # 12 route-level pages
        ├── context/          # AuthContext, SocketContext
        ├── data/mockData.js  # DESTINATIONS_3D, VEHICLE_TIERS
        └── utils/razorpayCheckout.js
```

## 3. Commands

Run from the **repo root** unless noted.

```powershell
# Install
npm --prefix backend install
npm --prefix frontend install

# Dev (runs both concurrently: backend :5000, frontend :3000)
npm run dev

# Individually
npm run backend          # node backend/server.js
npm run frontend         # vite dev server

# Seed MongoDB with demo data (DESTRUCTIVE: clears collections first)
npm run seed

# Production build / lint (frontend)
npm --prefix frontend run build
npm --prefix frontend run lint
```

There is **no test suite** and **no type checking** (plain JS/JSX). Validate by running the dev servers and exercising the UI.

## 4. Environment Variables

Backend loads `.env` from **both** `backend/.env` and the repo root `.env` (root takes precedence in practice). Key vars:

| Var | Purpose | Fallback behavior |
|-----|---------|-------------------|
| `MONGO_URI` | Mongo connection | Server runs with in-memory stores |
| `JWT_SECRET` | Token signing | Uses hardcoded fallback secret |
| `ADMIN_ACCESS_KEY` | Admin desk passphrase | `YatraGoAdmin@2026` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payments | `/api/create-order` returns 401 |
| `SMTP_*` | Email/OTP delivery | Logs "simulated" delivery |

Frontend uses `VITE_*` vars but many values (Google Maps key, Razorpay key) are hardcoded in `index.html` / `razorpayCheckout.js`. Be careful editing secrets — `.env` is gitignored.

## 5. Architecture & Data Flow

### Routing
`App.jsx` uses **hash-based routing** (`window.location.hash`), not React Router. Valid tabs:
`home`, `book`, `stranger`, `cost-split`, `preview-3d`, `guiders`, `sos`, `chat`, `admin`, `driver`, `guide-portal`, plus auth: `login`, `signup`, `forgot`, `auth`.

- Unauthenticated users start at `login`.
- Protected tabs (`driver`, `guide-portal`, `admin`, `cost-split`, `chat`) trigger `openAuthModal('login', targetTab)`.
- `handleNavigateWithTransition(targetTab, params)` is the single navigation entry point passed to pages/components as `onNavigate` / `setActiveTab`. It also seeds `pickup`/`destination`/vehicle state.

### Global state
Held in `MainApp` (App.jsx): `activeRide`, `pickupLocation`, `selectedDestination`, `selectedGuider`, `showProfileModal`, `activeTab`. There is **no Redux/Zustand** — state is prop-drilled. Contexts only cover auth and sockets.

### Auth flow (`AuthContext.jsx`)
- Exposes `login`, `register`, `loginWithGoogle` (simulated), `loginWithOtp` (simulated), `logout`, `forgotPassword`, `sendResetCode`, `changePassword`, `updateUserProfile`, `uploadProfilePhoto`, `fetchWithAuth`, `switchRole`, `toggleVerification`.
- Persists `user` + `token` to `localStorage` (`yatrago_user`, `yatrago_token`).
- Every method has an **offline fallback** that fabricates a local user if the API is unreachable.
- Roles: `traveler`, `rider`, `driver`, `guide`/`guider`, `admin`.

### Socket flow (`SocketContext.jsx`)
- Connects to `window.location.origin` (Vite proxies `/socket.io` to :5000).
- Auto-joins room `ride_101`.
- Events in: `new_message`, `stranger_match_accepted`, `sos_broadcast_alert`.
- Events out: `join_ride`, `send_message`, `trigger_sos`, `combine_ride_request`, `driver_location`.

### Backend route map
| Mount | File | Notes |
|-------|------|-------|
| `/api/auth` | authRoutes.js | register, login, change-password, forgot/reset-password, send-reset-code, me (GET/PUT), upload-avatar, verify-admin, verify-token |
| `/api/rides` | rideRoutes.js | active, list, book, stranger-matches, combine-stranger, split-cost, `/:rideId/messages` |
| `/api/guiders` | guiderRoutes.js | list, `/:id` |
| `/api/sos` | sosRoutes.js | trigger, active, resolve/:id |
| `/api/payment` **and** `/api` | paymentRoutes.js | config, create-order, verify-payment (mounted twice intentionally) |

All routes prefer MongoDB but fall back to module-level in-memory state (`memoryUsers`, `activeRide`, `activeSosBroadcasts`, `mockGuiders`).

## 6. Critical Conventions

### Backend
- **CommonJS** (`require`/`module.exports`), not ESM.
- Routes are async and return `{ success: boolean, ... }`. Errors return appropriate HTTP status + `message`.
- Always guard Mongo usage with `mongoose.connection.readyState === 1` before treating DB as available.
- `sanitizeUser()` strips `password`/`__v` and empty Unsplash avatars — always return users through it.
- Money is in **INR (₹)**. Razorpay amounts are in **paise** (multiply rupees × 100).
- Spring `authHelper.js`: passwords use PBKDF2+SHA512 with a fixed salt; JWT is hand-built base64url HMAC-SHA256. Keep `verifyPassword` supporting both hashed and plain demo values.

### Frontend
- Function components + hooks only. No class components.
- **Styling is Tailwind utility-first** with custom `.glass-panel` / `.glass-card` / `.glass-pill` and keyframe utilities from `index.css`. Avoid inline styles except computed values (colors, transforms).
- Icons come from `lucide-react`.
- Import images via `../logo/yatrago-logo.png`.
- Every page wraps content in `<div className="... animate-fadeIn">`; App adds `page-enter-kinetic` on tab change.
- Components accept `onNavigate` or `onBook*` callbacks — do not call `setActiveTab` directly from deep components; thread the callback from `App.jsx`.
- Handle WebGL failure: `Interactive3DRideScene` catches init errors and shows a fallback UI. Preserve that pattern for any new Three.js code.
- All network calls to backend use relative `/api/...` paths (Vite proxy handles the host). Add `.catch()` — the app must not crash when backend is offline.

### Design system
See `design.md` for colors, typography, spacing, and component patterns. Summary: dark slate (`slate-950`) base, cyan→blue gradients as primary action, emerald for savings/success, violet for guider/explore, amber for premium, rose/red for SOS/danger. Rounded `xl`–`3xl`, generous glassmorphism, `Plus Jakarta Sans`.

## 7. Component & Page Map

**Pages** (`src/pages/`): `HomePage`, `BookRidePage`, `StrangerMatcherPage`, `CostSplitterPage`, `ThreeDestinationPage`, `GuiderDirectoryPage`, `EmergencySosPage`, `GroupChatPage`, `AdminDashboardPage`, `DriverPortalPage`, `GuidePortalPage`, `AuthPage`.

**Key components** (`src/components/`):
- `Navbar` — mega-dropdown nav, wallet, SOS, chat, profile. Uses `useAuth` + `useSocket`.
- `YatraGoRideRequestCard` — hero booking widget (pickup/dropoff autocomplete).
- `Interactive3DRideScene` — vanilla Three.js driving sim (chase/cockpit/orbit/drone cams, nitro, Web Audio engine synth). Heavy; isolated in a `useEffect`.
- `CostSplitter` — fare split matrix + Razorpay checkout.
- `StrangerMatcher` — route-alignment matching UI.
- `GroupChat` — socket-backed chat drawer.
- `EmergencySosModal` / `EmergencySosPage` — 3-second countdown SOS.
- `UserProfile`, `UserAvatar`, `VerificationBadge`, `HeroImageSlider`, `ScenicRoutesGallery`, `VehicleFleetShowcase`, `MapView`, `Google3DMapSearch`, `ThreeDestinationPreview`, `YatraGoAiAssistant`, `YatraGoFooter`, `YatraGoFaqSection`, `YatraGoReserveSection`, `YatraGoAirportIntercityHub`, `AiTravelMatchmaker`, `GuiderProfiles`, `ErrorBoundary`.

## 8. Gotchas / Rules of Thumb

1. **Don't delete fallbacks.** In-memory user/ride/SOS stores and simulated email/SMS are intentional so the app runs with only `MONGO_URI` + `JWT_SECRET`.
2. **DB guards everywhere.** Check `readyState` before Mongo calls to avoid throwing when offline.
3. **Hash routing.** New tabs must be added to the `activeTab` allowlist in `App.jsx` **and** the hash listener, or deep links break.
4. **Two payment mounts.** `/api/payment/*` and bare `/api/*` both serve payment routes. Keep the frontend using `/api/create-order` and `/api/verify-payment`.
5. **Signature verification is security-critical.** `verify-payment` uses `crypto.timingSafeEqual` — never weaken to `===` on hex strings or skip length checks.
6. **Sanitize user output.** Never return raw Mongoose docs containing `password`.
7. **Demo credentials** exist in `authRoutes.js` `defaultAccounts` (e.g. `alex.rivera@yatrago.com` / `password123`). Do not leak new secrets into source; prefer env vars.
8. **Seeding is destructive** (`deleteMany({})`). Never run `npm run seed` against production data.
9. **Three.js scene re-inits** when `timeOfDay` changes (effect dependency). If you add controls, sync refs (`animRef.current`) rather than re-running the whole scene.
10. **Windows dev environment.** Paths contain spaces; quote them. Use PowerShell-compatible commands.

## 9. Adding a Feature — Checklist

- [ ] Backend: add model (if new entity) in `models/`, route in `routes/`, mount in `server.js`, guard DB access.
- [ ] Frontend: add page in `pages/`, register tab in `App.jsx` allowlist + hash listener + render branch.
- [ ] Wire navigation through `handleNavigateWithTransition` (respect protected tabs).
- [ ] Use existing `{ success, ... }` response shape and `sanitizeUser`.
- [ ] Style with Tailwind + design tokens from `design.md`.
- [ ] Provide offline fallback and `.catch()` on all fetches.
- [ ] Verify by running `npm run dev` and testing login → book → split → chat flow.
