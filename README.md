# 🚖 YatraGo — Smart Ride-Sharing & 3D Mobility Platform

> A full-stack MERN mobility platform that combines everyday cab hailing with stranger carpooling, automated fare splitting, interactive 3D map exploration, verified local guiders, a partner-business marketplace, real-time group chat and a one-tap emergency SOS network.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Why YatraGo](#-why-yatrago)
3. [Feature Set](#-feature-set)
4. [Technical Specifications](#-technical-specifications)
5. [Technology Stack](#-technology-stack)
6. [Project Architecture](#-project-architecture)
7. [Data Models](#-data-models)
8. [API Reference](#-api-reference)
9. [Real-Time Events](#-real-time-events)
10. [Design System](#-design-system)
11. [Installation & Running](#-installation-running)
12. [Environment Variables](#-environment-variables)
13. [Deployment](#-deployment)
14. [Project Metrics](#-project-metrics)
15. [Engineering Conventions](#-engineering-conventions)
16. [Known Limitations](#-known-limitations)
17. [Future Scope](#-future-scope)
18. [Resume / Portfolio Summary](#-resume-portfolio-summary)
19. [License](#-license)

---

## 📌 Project Overview

**YatraGo** is a production-shaped ride-sharing and urban mobility web application. Unlike a single-purpose cab app, it layers several complementary mobility services onto one platform:

| Capability | What it does |
|---|---|
| **Ride hailing** | Book a car, bike, scooter or shuttle between any two points |
| **Stranger pooling** | Match with verified co-riders on overlapping routes for up to ~44% savings |
| **Fare splitting** | Split the bill equally, by custom ratio, or by distance travelled |
| **3D exploration** | Explore destinations on Google 3D satellite maps, a Three.js highway simulator, or volumetric city scenes |
| **Local guiders** | Book certified city guides to accompany trips |
| **Partner marketplace** | Hotels, shops and restaurants promote themselves via commission-based promo codes |
| **Group chat** | Real-time Socket.io messaging between rider, driver and guider |
| **Emergency SOS** | 3-second countdown broadcast with live GPS to responders |

### The core engineering principle: **zero-lockout fallbacks**

Every external dependency has a graceful degradation path. The app is designed so it **runs and demos with no paid API keys and no database**:

- No MongoDB → in-memory stores keep the API functional (data resets on restart)
- No Google Maps key → falls back automatically to Leaflet + OpenStreetMap
- No Razorpay credentials → payment endpoints return a clear, handled error state
- No SMTP credentials → OTP delivery logs as "simulated" instead of crashing
- WebGL unavailable → the 3D scene shows a styled fallback panel with a re-initialise button

This makes the project genuinely cloneable and demo-able by anyone, which was a deliberate design decision rather than an accident.

---

## 🎯 Why YatraGo

Most student ride-sharing projects stop at "book a cab". YatraGo was built to demonstrate *product thinking plus systems depth*:

- **Cost is a first-class concern.** Pooling, splitting and promo codes all attack the same problem — urban mobility is expensive — from different angles.
- **Real money handling.** Razorpay integration with server-side HMAC-SHA256 signature verification, not a fake "payment successful" toast.
- **Real safety feature.** The SOS system broadcasts geolocation over sockets and persists alerts, rather than being a decorative red button.
- **Real fallbacks.** The app degrades instead of breaking, which is what actually matters in production.

---

## ✨ Feature Set

### 1. Ride Booking & Dispatch (`book`)

- Pickup and destination search with autocomplete (Google Places, with Nominatim/OpenStreetMap fallback)
- **Live GPS detection** via the browser Geolocation API with reverse geocoding
- 7 vehicle tiers across cars (`Eco Sedan`, `Premium SUV`, `Electric Shuttle`, `Guider Co-Ride`) and bikes (`HyperBike 1200R`, `AeroScooter EV`, `Moto Classic`)
- **Real haversine distance calculation** between coordinates — fares are derived from actual trip distance, not hardcoded
- Scheduled reservations up to 90 days ahead
- **Live transit track** that consumes real `driver_location_update` socket events, computes speed from consecutive GPS fixes, and smoothly animates the vehicle along the route
- Interactive map — tap to set pickup or destination

### 2. Stranger Pooling (`stranger`)

- Route-alignment matching against candidate co-riders
- Displays route overlap percentage, detour cost and per-rider savings
- AI-style interest matching as an alternative matching mode
- Verified-profile badges on all matched riders

### 3. Fare Splitting & Settlement (`cost-split`)

- Three split algorithms: **Equal (1/N)**, **Custom ratio (%)**, **By distance (km)**
- **Paise-accurate allocation** — shares are distributed so they always sum *exactly* to the total, with remainders allocated correctly (verified against 2, 3 and 7-rider cases)
- Promo discount handling with validation and an undo path
- Group collection progress tracking with paid/pending state per rider
- **Downloadable, shareable and printable receipts** — generated as self-contained branded HTML with print styles
- Razorpay checkout with server-side signature verification

### 4. 3D Map & Destination Explorer (`preview-3d`)

Three distinct view modes:

- **Google 3D Satellite** — search any location worldwide, tilt to 45°, satellite/hybrid/vector layers
- **3D Highway Simulator** — Three.js scene with chase/POV/orbit/drone cameras, nitro boost, speed controls and Web Audio engine synthesis
- **Volumetric Cities** — stylised Three.js destination scenes

Includes **13 curated destinations** (San Francisco, Paris, Tokyo, Dubai, Sydney, Singapore, Agra and six Nepal landmarks) plus **Nepal-focused quick presets**.

### 5. Local Guider Network (`guiders`)

- Verified travel-guider directory with languages, specialties, hourly rates and ratings
- Guider co-ride vehicle tier that adds a guide to the booking

### 6. Business & Promo Hub (`business`)

A full partner marketplace, not a static page:

- **13 seeded partners** across hotels, shops and restaurants, with real Nepali locations
- Category filters and text search across name, city, area and promo code
- **Hotel booking flow** — photo gallery, room types (bed, capacity, size, breakfast), date range picker, guest count, and a live charges breakdown (nightly rate × nights, promo discount, 13% VAT, service fee, total)
- **Promo redemption** validated server-side, with a local fallback so codes still work offline
- **Business onboarding form** — hotels/shops/restaurants apply to join, choosing whether a *traveller* or *shopkeeper* is listing, and which role (**admin**, **developer** or **promoter**) should manage the listing
- Commission tiers: Starter 8% / Growth 10% / Enterprise 12%
- Pending listings are clearly marked and cannot be booked until approved

### 7. Real-Time Group Chat (`chat`)

- Socket.io room-based messaging scoped per ride
- Message persistence to MongoDB with in-memory fallback
- Unread counters that correctly ignore your own messages
- Verified participant badges

### 8. Emergency SOS (`sos`)

- 3-second safety countdown before broadcast (prevents accidental triggers)
- Live GPS coordinates broadcast to all connected clients
- Alert persistence with `ACTIVE` / `RESPONDED` / `RESOLVED` lifecycle
- Emergency contact management

### 9. Authentication & Accounts

- Email/password registration with **PBKDF2-SHA512** password hashing
- Hand-rolled **HS256 JWT** signing and verification (no Passport/Auth0)
- Google sign-in (optional, with graceful fallback)
- OTP / reset-code flow with email delivery or simulated fallback
- Profile management, avatar upload, role switching and verification badges
- Roles: `traveler`, `rider`, `driver`, `guide`/`guider`, `admin`

### 10. Role-Based Workspaces

- **Driver Portal** — online/offline toggle, dispatch cards, boarding OTP, trip completion, earnings
- **Admin Dashboard** — fleet overview, user/licence verification, fraud monitoring, pricing rules, admin passphrase gate
- **Guider Portal** — tour listing and booking management

---

## 🔧 Technical Specifications

| Specification | Value |
|---|---|
| **Architecture** | Decoupled SPA + REST API + WebSocket server |
| **Frontend** | React 18.3, Vite 5.4, Tailwind CSS 3.4 |
| **Backend** | Node.js ≥18, Express 4.22, Socket.io 4.7 |
| **Database** | MongoDB via Mongoose 8.24 (Atlas or local), with in-memory fallback |
| **Authentication** | Custom PBKDF2-SHA512 + HS256 JWT |
| **Payments** | Razorpay (INR), HMAC-SHA256 server-side verification |
| **Mapping** | Google Maps JS API + Leaflet 1.9 / OpenStreetMap dual-engine |
| **3D Rendering** | Three.js 0.164 via `@react-three/fiber` / `drei` |
| **Realtime** | Socket.io with polling→WebSocket upgrade |
| **Routing** | Hash-based client routing (no React Router dependency) |
| **State Management** | React Context (Auth, Socket) + prop-drilled page state |
| **Styling** | Tailwind utility-first + custom glassmorphism utilities |
| **Icons** | lucide-react |
| **Build output** | Code-split chunks (react / three / maps / socket / vendor), ~3 MB total |
| **Compression** | gzip via Express `compression` middleware |
| **Caching** | Immutable 1-year cache on hashed assets, `no-cache` on HTML |

### Responsive behaviour

- Mobile-first with breakpoints at `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`
- Navbar collapses to a full-screen drawer below `lg`
- Hero grids stack to a single column below `lg`
- All dense HUD rows wrap rather than overflow

### Accessibility

- Keyboard-navigable throughout with visible `:focus-visible` rings
- `⌘K` / `Ctrl+K` opens global search; `ESC` closes dropdowns and modals
- `W`/`S` and arrow keys drive the 3D scene
- Status is never conveyed by colour alone — always paired with an icon or label
- `prefers-reduced-motion` disables all decorative animation
- Skip-to-content link for screen-reader and keyboard users

---

## 🛠 Technology Stack

### Frontend

| Package | Version | Purpose |
|---|---|---|
| react / react-dom | 18.3.1 | UI framework |
| vite | 5.4.21 | Build tool and dev server |
| tailwindcss | 3.4.3 | Utility-first styling |
| three | 0.164.1 | 3D rendering engine |
| @react-three/fiber | 8.16.6 | React renderer for Three.js |
| @react-three/drei | 9.105.6 | Three.js helpers |
| leaflet / react-leaflet | 1.9.4 / 4.2.1 | OpenStreetMap fallback mapping |
| socket.io-client | 4.7.5 | Real-time messaging |
| lucide-react | 0.378.0 | Icon system |
| clsx / tailwind-merge | 2.x | Conditional class composition |

### Backend

| Package | Version | Purpose |
|---|---|---|
| express | 4.22.3 | HTTP API framework |
| mongoose | 8.24.4 | MongoDB ODM |
| socket.io | 4.7.5 | WebSocket server |
| razorpay | 2.9.8 | Payment gateway SDK |
| nodemailer | 10.6.0 | Transactional email / OTP |
| dotenv | 16.4.5 | Environment configuration |
| cors | 2.8.5 | Cross-origin resource sharing |
| compression | 1.x | gzip/deflate response compression |

### External services (all optional)

| Service | Used for | Fallback |
|---|---|---|
| MongoDB Atlas | Persistence | In-memory stores |
| Google Maps Platform | Maps, Places, Geocoding | Leaflet + OpenStreetMap + Nominatim |
| Razorpay | Payments | Handled error state |
| SMTP provider | Email / OTP | Logged as simulated |
| Google OAuth | Social sign-in | Password auth only |

---

## 🏗 Project Architecture

### High-level topology

```text
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (Client)                       │
│  React 18 SPA · Vite · Tailwind · Three.js · Leaflet        │
│                                                             │
│  ┌────────────┬────────────┬────────────┬────────────────┐  │
│  │  Pages     │ Components │  Context   │     Utils      │  │
│  │ (13 routes)│  (29 UI)   │Auth/Socket │receipt/razorpay│  │
│  └────────────┴────────────┴────────────┴────────────────┘  │
└───────────┬─────────────────────────────┬───────────────────┘
            │ HTTPS (REST /api/*)         │ WSS (socket.io)
            ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   NODE.JS SERVER (Express)                  │
│                                                             │
│  ┌──────────────────────┐   ┌───────────────────────────┐   │
│  │    REST Routes       │   │   Socket.io Handler       │   │
│  │ auth · rides         │   │ join_ride · send_message  │   │
│  │ guiders · partners   │   │ driver_location · SOS     │   │
│  │ sos · payments       │   └───────────────────────────┘   │
│  └──────────┬───────────┘                                   │
│             │ Mongoose ODM                                  │
│             ▼                                               │
│  ┌──────────────────────┐   ┌───────────────────────────┐   │
│  │  MongoDB (Atlas)     │◄──│  In-memory fallback store │   │
│  │  persistent data     │   │  (used when DB offline)   │   │
│  └──────────────────────┘   └───────────────────────────┘   │
│                                                             │
│  Static SPA host: serves frontend/dist with SPA fallback    │
└─────────────────────────────────────────────────────────────┘
```

### Request flow — booking a ride

```text
User taps "Book Ride"
  → YatraGoRideRequestCard computes distance (haversine) and fare
  → App.handleBookRide() POSTs /api/rides/book
  → rideRoutes validates and persists (Mongo or memory)
  → activeRide state updates, tab switches to cost-split
  → User pays: openRazorpayCheckout()
      → POST /api/create-order (server creates Razorpay order)
      → Razorpay modal opens
      → on success: POST /api/verify-payment
      → server verifies HMAC-SHA256 signature
      → receipt generated client-side (download / share / print)
```

### Real-time flow — ride tracking

```text
Driver device emits  driver_location { lat, lng }
  → socketHandler broadcasts driver_location_update to ride room
  → LiveTransitTrack receives fix
      → projects GPS onto pickup→destination vector (progress %)
      → computes speed from consecutive fixes (haversine)
      → animates vehicle chip with 1s linear transitions
      → falls back to time-based simulation if no fixes arrive
```

### Frontend structure

```text
frontend/src/
├── App.jsx                  # Router shell, global ride/location state
├── main.jsx                 # React root + providers
├── index.css                # Tailwind layers, glass utilities, keyframes
├── context/
│   ├── AuthContext.jsx      # login/register/JWT/profile/fallbacks
│   └── SocketContext.jsx    # socket lifecycle, messages, SOS broadcast
├── pages/                   # 13 route-level screens
│   ├── HomePage.jsx
│   ├── BookRidePage.jsx
│   ├── StrangerMatcherPage.jsx
│   ├── CostSplitterPage.jsx
│   ├── BusinessHubPage.jsx
│   ├── ThreeDestinationPage.jsx
│   ├── GuiderDirectoryPage.jsx
│   ├── GroupChatPage.jsx
│   ├── EmergencySosPage.jsx
│   ├── AdminDashboardPage.jsx
│   ├── DriverPortalPage.jsx
│   ├── GuidePortalPage.jsx
│   └── AuthPage.jsx
├── components/              # 29 reusable components
├── data/
│   ├── mockData.js          # 13 destinations + 7 vehicle tiers
│   └── partnerSeed.js       # 13 partner businesses with rooms
├── utils/
│   ├── razorpayCheckout.js  # order creation + signature verification
│   ├── receipt.js           # HTML receipt render/download/share/print
│   └── googleAuth.js        # Google sign-in helper
└── logo/                    # brand mark
```

### Backend structure

```text
backend/
├── server.js                # Express + Socket.io + static SPA host
├── config/db.js             # Mongo connection with fallback signal
├── models/                  # 6 Mongoose schemas
│   ├── User.js  Ride.js  Guider.js
│   ├── Partner.js  Message.js  SosAlert.js
├── routes/                  # 6 REST route modules
├── sockets/socketHandler.js # real-time event handlers
├── utils/
│   ├── authHelper.js        # PBKDF2, JWT, sanitizeUser, validators
│   └── emailService.js      # Nodemailer or native TLS SMTP fallback
└── seed.js                  # demo data seeding (destructive)
```

### Routing model

The app uses **hash-based routing** rather than React Router:

```
#home  #book  #stranger  #cost-split  #business
#preview-3d  #guiders  #chat  #sos
#driver  #guide-portal  #admin
#login  #signup  #forgot  #auth
```

Protected tabs (`driver`, `guide-portal`, `admin`, `cost-split`, `chat`) redirect unauthenticated users to the auth modal and return them to the intended destination after login.

---

## 🗄 Data Models

### User

| Field | Type | Notes |
|---|---|---|
| `name`, `email`, `password` | String | Email unique, lowercased |
| `phone`, `googleId`, `authProvider` | String | Google sign-in support |
| `role` | Enum | `traveler`, `rider`, `driver`, `guide`, `guider`, `admin` |
| `isVerified` | Boolean | Drives verification badges |
| `verificationBadgeType` | Enum | `Government ID`, `Top Guider`, `Gold Driver` |
| `rating`, `tripsCompleted` | Number | Reputation metrics |
| `emergencyContacts` | Array | `{ name, phone, relation }` |
| `walletBalance`, `upiId` | Number / String | In-app wallet |

### Ride

| Field | Type | Notes |
|---|---|---|
| `pickup` / `destination` | Object | `name`, `lat`, `lng` (+ `preview3DId`) |
| `riders` | Array | Per-rider `costShare`, `paymentStatus` |
| `driver` | Object | `name`, `vehicle`, `rating`, live `lat`/`lng` |
| `guider` | Object | Attached guide with fee |
| `vehicleType` / `vehicleCategory` | String / Enum | `car`, `bike`, `pool`, `shuttle` |
| `status` | Enum | `Requested` → `Matched` → `In Progress` → `Completed` / `Cancelled` |
| `isStrangerCombined`, `strangerSavingsPercentage` | Boolean / Number | Pooling state |
| `totalCost`, `distanceKm`, `etaMinutes` | Number | Trip economics |
| `costSplits` | Array | `{ riderName, amount, percentage, status }` |

### Partner

| Field | Type | Notes |
|---|---|---|
| `name`, `category` | String / Enum | `hotel`, `shop`, `restaurant` |
| `city`, `area`, `address` | String | Location |
| `promoCode`, `discountPercent` | String / Number | Traveller-facing offer |
| `commissionPercent`, `tier` | Number / Enum | `starter`, `growth`, `enterprise` |
| `rooms` | Array | `{ name, pricePerNight, capacity, bed, size, breakfast }` |
| `amenities`, `images` | Array | Hotel detail |
| `taxesPercent`, `serviceFee`, `checkIn`, `checkOut` | Mixed | Booking charges |
| `managedBy` | Enum | `admin`, `developer`, `promoter` |
| `listedBy` | Enum | `traveller`, `shopkeeper` |
| `status` | Enum | `active`, `pending`, `rejected` |

### Message & SosAlert

`Message` stores `rideId`, sender identity/role, `text` and timestamp for chat history.

`SosAlert` stores user identity, GPS `location`, `status` (`ACTIVE`/`RESPONDED`/`RESOLVED`), `broadcastRadiusKm` and dispatched responders.

---

## 🔌 API Reference

Base URL: `/api`

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Password login → JWT |
| GET | `/auth/google/config` | Is Google sign-in configured? |
| POST | `/auth/google` | Google sign-in |
| GET | `/auth/me` | Current user profile |
| PUT | `/auth/me` | Update profile |
| POST | `/auth/change-password` | Change password |
| POST | `/auth/forgot-password` \| `/reset-password` | Password reset |
| POST | `/auth/send-reset-code` \| `/send-otp` | Send OTP |
| POST | `/auth/verify-reset-code` | Verify OTP |
| POST | `/auth/upload-avatar` | Upload profile photo |
| POST | `/auth/verify-admin` | Admin passphrase check |
| GET | `/auth/verify-token` | Validate JWT |

### Rides

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/rides/active` | Current active ride |
| GET | `/rides` | List rides |
| POST | `/rides/book` | Create a booking |
| GET | `/rides/stranger-matches` | Pooling candidates |
| POST | `/rides/combine-stranger` | Accept a pool match |
| POST | `/rides/split-cost` | Calculate split |
| GET | `/rides/:rideId/messages` | Chat history |

### Guiders, Partners, SOS & Payments

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/guiders` · `/guiders/:id` | Guider directory / detail |
| GET | `/partners` | List partners (`?category=&city=&search=`) |
| POST | `/partners/register` | Business onboarding |
| POST | `/partners/redeem` | Validate promo code |
| GET | `/partners/stats` | Marketplace aggregates |
| POST | `/sos/trigger` | Broadcast SOS |
| GET | `/sos/active` | Active alerts |
| POST | `/sos/resolve/:id` | Resolve alert |
| GET | `/config` | Public Razorpay key id |
| POST | `/create-order` | Create Razorpay order |
| POST | `/verify-payment` | Verify HMAC-SHA256 signature |
| GET | `/health` | Health check |

All endpoints return a consistent shape: `{ success: boolean, ...payload }`.

---

## 📡 Real-Time Events

### Client → Server

| Event | Payload | Purpose |
|---|---|---|
| `join_ride` | `rideId` | Join a ride room |
| `send_message` | `{ rideId, message }` | Send chat message |
| `driver_location` | `{ rideId, lat, lng }` | Stream driver position |
| `combine_ride_request` | `{ rideId, strangerInfo }` | Notify pool acceptance |
| `trigger_sos` | `sosData` | Broadcast emergency |

### Server → Client

| Event | Purpose |
|---|---|
| `new_message` | Chat message delivered |
| `driver_location_update` | Live driver position (drives the transit track) |
| `stranger_match_accepted` | Pool partner joined |
| `sos_broadcast_alert` | Incoming emergency broadcast |
| `room_notice` | Room activity notice |

---

## 🎨 Design System

Defined in `design.md`, implemented in `index.css` and `tailwind.config.js`.

- **Direction:** dark-first, neon-accented "smart mobility / cyber" aesthetic. No light mode.
- **Surface:** `slate-950` canvas, glassmorphic panels with blur and hairline borders.
- **Accents:** cyan→blue (primary action), emerald (savings/success), violet (explore/3D), amber (premium/caution), rose/red (SOS/danger).
- **Typography:** Plus Jakarta Sans (300–800); `font-mono` for telemetry, IDs and prices.
- **Radii:** `xl`–`3xl`, generous rounding on cards and panels.
- **Motion:** fade/slide entrances, kinetic page blur-in, staggered card reveals, pulsing live indicators, SOS pulse rings — all disabled under `prefers-reduced-motion`.
- **Utilities:** `.glass-panel`, `.glass-card`, `.glass-pill`, `.animate-fadeIn`, `.animate-stagger-in`, `.animate-modalRise`, `.animate-roadDash`.

---

## 🚀 Installation & Running

### Prerequisites

- Node.js **≥ 18**
- npm
- MongoDB Atlas URI *(optional — app runs without it)*
- Any API keys *(optional — all have fallbacks)*

### Quick start

```bash
# 1. Install everything
npm run install:all

# 2. (Optional) configure environment
cp .env.example backend/.env
# edit backend/.env with MONGO_URI, JWT_SECRET, RAZORPAY_*, SMTP_*

# 3. Run both servers
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health check | http://localhost:5000/api/health |

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Run backend + frontend concurrently |
| `npm run backend` | Backend only |
| `npm run frontend` | Frontend only |
| `npm run build` | Build production frontend to `frontend/dist` |
| `npm start` | Serve API **and** built SPA from one port |
| `npm run serve` | Build then start |
| `npm run seed` | Seed demo data — ⚠️ **destructive**, clears collections |

### Demo credentials

Seeded accounts live in `backend/routes/authRoutes.js` (`defaultAccounts`), e.g. `alex.rivera@yatrago.com` / `password123`. Do not add new secrets to source — use environment variables.

---

## 🔐 Environment Variables

### Backend (`.env`)

| Variable | Required | Fallback behaviour |
|---|---|---|
| `PORT` | No | `5000` |
| `MONGO_URI` | No | In-memory stores (data lost on restart) |
| `JWT_SECRET` | **Yes in production** | Hardcoded dev secret |
| `ADMIN_ACCESS_KEY` | No | Dev default |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | For payments | `/api/create-order` returns 401 |
| `SMTP_HOST` / `PORT` / `USER` / `PASS` / `FROM` | No | Logs "simulated" delivery |
| `GOOGLE_CLIENT_ID` | No | Google sign-in disabled |

### Frontend (`frontend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | No | Injected into `index.html` at build time |
| `VITE_RAZORPAY_KEY_ID` | No | Public key id only |
| `VITE_BACKEND_URL` | Split hosting only | Leave blank for same-origin |
| `VITE_APP_ENV` | No | Environment label |

> `.env` files are gitignored. `.env.example` templates are committed.

---

## 🚢 Deployment

### Option A — Single server (recommended, simplest)

```bash
npm run install:all
npm run build
npm start
```

Express serves the API and the built SPA on one port. Works on Render, Railway, Fly.io, a VPS, or any Node host. Set `PORT` in the host environment.

### Option B — Split hosting

- **Frontend** → Vercel / Netlify / Cloudflare Pages
  - Build: `npm --prefix frontend run build`
  - Publish: `frontend/dist`
- **Backend** → Render / Railway
  - Start: `node backend/server.js`
  - Set `VITE_BACKEND_URL` on the frontend to the backend origin

### Production behaviour

- Hashed assets served with `Cache-Control: public, max-age=31536000, immutable`
- `index.html` and SPA routes served `no-cache` so deploys are immediate
- Unknown non-API paths fall back to `index.html`
- Responses gzip-compressed
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`

### Pre-launch checklist

- [ ] Set a strong `JWT_SECRET` (otherwise the dev fallback is used)
- [ ] Restrict the Google Maps key by HTTP referrer in Google Cloud Console
- [ ] Switch Razorpay to live keys and verify one real transaction
- [ ] Confirm `MONGO_URI` is reachable from the host
- [ ] Never run `npm run seed` against production data

---

## 📊 Project Metrics

| Metric | Value |
|---|---|
| Backend files | 18 JavaScript files, ~2,965 lines |
| Frontend files | 51 JS/JSX files, ~19,566 lines |
| Route-level pages | 13 |
| Reusable components | 29 |
| Mongoose models | 6 |
| REST endpoints | 40+ |
| Socket events | 10 |
| Curated 3D destinations | 13 |
| Vehicle tiers | 7 |
| Seeded partner businesses | 13 |
| Production bundle | ~3 MB (code-split, 98% smaller images) |

---

## 📐 Engineering Conventions

### Backend

- **CommonJS** (`require` / `module.exports`) throughout
- Every route returns `{ success: boolean, ... }`
- **Always guard Mongo access**: check `mongoose.connection.readyState === 1` before treating the DB as available
- **Always return users through `sanitizeUser()`** — strips `password`, `__v` and empty avatars
- Money is **INR (₹)**; Razorpay amounts are in **paise** (rupees × 100)
- Payment signature verification uses `crypto.timingSafeEqual` — never weaken to `===`
- In-memory fallbacks (`memoryUsers`, `activeRide`, `memoryPartners`, `activeSosBroadcasts`) are load-bearing; do not remove them

### Frontend

- Function components and hooks only — no class components
- Tailwind utility-first; avoid inline styles except computed values
- Icons exclusively from `lucide-react`
- All API calls use relative `/api/...` paths with `.catch()` — the app must not crash when the backend is offline
- Navigation flows through `handleNavigateWithTransition`; deep components receive callbacks rather than calling `setActiveTab`
- New tabs must be added to the `activeTab` allowlist **and** the hash listener in `App.jsx`
- Wrap Three.js code in `try/catch` with a styled fallback panel
- Every page root carries `animate-fadeIn`

---

## ⚠️ Known Limitations

Honest notes about the current state:

1. **Demo data in places.** Chat history, emergency contacts and some rider lists use seeded sample data rather than live records.
2. **In-memory fallback is not persistent.** Without `MONGO_URI`, all data resets when the server restarts.
3. **No automated test suite.** Validation is manual plus build and route smoke checks. Adding Vitest/Jest is the highest-value next step.
4. **No rate limiting.** Auth and payment endpoints would benefit from `express-rate-limit` before public launch.
5. **JWT is hand-rolled.** It works and is correctly signed, but a maintained library (`jsonwebtoken`) is the safer long-term choice.
6. **Single-server socket scaling.** Socket.io is not backed by a Redis adapter, so horizontal scaling would need one.
7. **Some large components.** `Interactive3DRideScene` (~1,860 lines) and `YatraGoRideRequestCard` (~1,230 lines) would benefit from splitting.
8. **Hash routing only.** No SSR or SEO-friendly deep links; migrating to React Router plus prerendering would help discoverability.

---

## 🔮 Future Scope

### Near term (highest value first)

1. **Automated testing** — Vitest + React Testing Library for components, Supertest for API, and a CI workflow on push.
2. **Rate limiting & hardening** — `express-rate-limit`, `helmet`, input schema validation (Zod/Joi), and refresh-token rotation.
3. **Real-time scalability** — Redis adapter for Socket.io, plus pub/sub for multi-instance deployments.
4. **Component decomposition** — split the largest components into focused subcomponents and hooks.

### Medium term

5. **Native mobile apps** — React Native client sharing the same API and auth.
6. **Live ride matching at scale** — geospatial indexes (`2dsphere`) and a matching queue instead of in-memory route comparison.
7. **Route optimisation** — real Directions API paths with traffic-aware ETAs replacing interpolated preview lines.
8. **Admin approvals UI** — full workflow to review, approve and reject pending partner listings.
9. **Analytics dashboard** — revenue, pooling adoption, retention and commission reporting for admins.
10. **Multi-currency & i18n** — move beyond INR; add Nepali and Hindi locales.

### Longer term

11. **Offline-first PWA** — service worker caching for route previews and receipts.
12. **AI trip planning** — itinerary suggestions combining rides, guiders and partner stays.
13. **Driver onboarding KYC** — document upload, verification queue and licence expiry tracking.
14. **Corporate accounts** — team billing, expense export and policy controls for the Business Hub.
15. **Accessibility audit** — WCAG 2.2 AA certification with automated axe checks in CI.

---

## 💼 Resume / Portfolio Summary

**YatraGo — Full-Stack Ride-Sharing & 3D Mobility Platform**

> Built a production-shaped MERN mobility platform spanning ride hailing, stranger carpooling, automated fare splitting, a 3D map explorer, a partner-business marketplace and an emergency SOS system — ~22,500 lines across 69 files, with zero-lockout fallbacks so it runs without paid API keys or a database.

**Selected highlights to discuss:**

- **Financial correctness** — engineered paise-accurate fare allocation that guarantees shares sum exactly to the total across equal, percentage and distance-based splits, with remainder distribution verified against 2/3/7-rider cases.
- **Payment security** — integrated Razorpay with server-side HMAC-SHA256 signature verification using constant-time comparison, rather than trusting client-side success callbacks.
- **Real-time systems** — built a Socket.io layer streaming driver GPS that the client projects onto the route vector to derive live progress and speed, with a graceful time-based fallback.
- **Resilience engineering** — designed dual-engine mapping (Google Maps → Leaflet), database fallbacks (MongoDB → in-memory), and simulated service adapters so every subsystem degrades instead of failing.
- **Performance work** — cut image payload 63 MB → 1.2 MB (98%) via WebP conversion, and split the bundle into react/three/maps/socket/vendor chunks, reducing the main bundle from 755 KB to 528 KB.
- **Production readiness** — added gzip compression, immutable asset caching, security headers, SPA fallback routing, and a documented single-command deploy path.

---

## 📄 License

MIT © 2026 YatraGo Technologies Inc.

---

<div align="center">

**YatraGo** — *Ride · Share · Explore*

Built with React 18, Node.js, MongoDB, Socket.io and Three.js

</div>
