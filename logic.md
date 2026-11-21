# YatraGo — Application Logic Reference

This document describes the actual logic implemented across the YatraGo frontend and backend. It is the single reference for pricing, routing, auth, maps, theming, pooling, partner bookings, payments and fallbacks.

---

## 1. Architecture Overview

- **Frontend:** React 18 + Vite + Tailwind CSS, hash-based routing, Context API for auth/theme/socket/language. No Redux.
- **Backend:** Express + Socket.io + Mongoose (MongoDB Atlas optional).
- **Payments:** Razorpay (INR / paise) with HMAC-SHA256 signature verification.
- **Auth:** PBKDF2 password hashing + hand-built HS256 JWT + Google Identity Services + local fallbacks.
- **Maps:** Google Maps JS API when healthy, Leaflet/OpenStreetMap fallback, OSRM driving routes.
- **Design principle:** zero-lockout — missing DB, keys, network or OAuth config degrades to in-memory/mock behavior instead of crashing.

---

## 2. Routing & Navigation

### Hash router (`App.jsx`)
- `activeTab` is derived from `window.location.hash`; the tab is written back to the hash on change.
- Valid tabs: `home`, `book`, `stranger`, `cost-split`, `preview-3d`, `guiders`, `sos`, `chat`, `admin`, `driver`, `guide-portal`, `business`, plus auth: `login`, `signup`, `forgot`, `auth`.
- Unauthenticated users start at `login`.
- Protected tabs: `driver`, `guide-portal`, `admin`, `cost-split`, `chat`. Unauthenticated access opens the auth modal and redirects to `login`, then returns to the intended tab after sign-in.
- `handleNavigateWithTransition(tab, params)` is the only navigation entry point. It also seeds:
  - `pickupLocation` / `selectedDestination` (string or `{ name, lat, lng }`)
  - `activeRide.vehicleType`, `vehicleCategory`, `totalCost`, `distanceKm`, driver info
  - `explore3DView` (`google3d` / `simulator`)
- Global state lives in `MainApp`: `activeRide`, `pickupLocation`, `selectedDestination`, `selectedGuider`, `explore3DView`, `showProfileModal`, `activeTab`.

### Page transitions
- `<main>` is keyed by `activeTab` and uses `.page-enter-kinetic` (opacity + transform + blur).
- The animation ends with `transform: none; filter: none` so fixed-position modals are never trapped inside a transformed ancestor.

---

## 3. Authentication & Session

### Password login (`/api/auth/login`)
- Accepts email or phone.
- Passwords are PBKDF2-SHA512 hashes with a fixed salt; `verifyPassword` also accepts legacy plain demo values.
- Successful login returns `{ success, user, token, message }`; the frontend stores `yatrago_user` and `yatrago_token` in `localStorage`.
- Offline fallback: `alex.rivera@yatrago.com` signs in with a local demo profile.
- Post-login route resolution: pending redirect → role route (`driver` → driver portal, `guide` → guide portal, `admin` → admin desk, otherwise `book`).

### Registration (`/api/auth/register`)
- Validates name, email, 10-digit phone, password ≥ 6 chars.
- Server stores a hashed password and returns a sanitized user + JWT.
- Offline fallback fabricates a local user so sign-up still completes.

### Google sign-in
1. `AuthContext.loginWithGoogle(role)` calls `requestGoogleAccessToken()`.
2. `utils/googleAuth.js` loads Google Identity Services, fetches the client ID from `/api/auth/google/config`, and opens the account chooser (`prompt: select_account`, scopes `openid email profile`).
3. The access token is POSTed to `/api/auth/google`; the server verifies it against Google's `userinfo` endpoint, creates/links the user, and returns a YatraGo JWT.
4. Errors are classified: `cancelled`, `popup_blocked`, `origin_mismatch`, `invalid_client`, `no_token`.
5. **Zero-lockout fallback:** if Google cannot run in the current environment (unregistered origin, blocked popup, script failure, auth server 5xx/offline), a local Google-branded session is created and the user is signed in with a clear message. A deliberate cancel (`access_denied` / popup closed) does **not** sign in.

### OTP login
- `loginWithOtp(phoneOrEmail, otp, role)` creates a verified local session for the selected role. It is intentionally simulated.

### Password reset
- `send-reset-code` → 6-digit code (email or simulated log delivery).
- `verify-reset-code` gates the new-password form.
- `forgot-password` accepts either the previous password or the verification code, then stores a new hash.

### Profile updates
- `updateUserProfile`, `uploadProfilePhoto`, `toggleVerification`, `switchRole` update local state immediately and sync to `/api/auth/me` (PUT) or `/api/auth/upload-avatar`, with silent local fallback.

---

## 4. Theme System (Dark / Light)

- `ThemeContext` stores `yatrago_theme` (`dark` | `light`) in `localStorage`.
- Applies `.dark` / `.light` on `<html>`, sets `data-theme` and `color-scheme`.
- `index.html` applies the saved theme before first paint to prevent a flash.
- The app is authored with dark slate utilities; `index.css` remaps the slate/white palette under `html.light` using attribute selectors (backgrounds, text, borders, gradients, glass, inputs, scrollbars, Leaflet popups).
- `.modal-overlay` forces a dim backdrop in light mode.
- Toggle UI: sliding `ThemeSwitch` in the header and in the mobile drawer (`role="switch"`, `aria-checked`).
- Motion respects `prefers-reduced-motion`.

---

## 5. Fare Engine (`frontend/src/utils/fare.js`)

### Published benchmark (8 km reference)

| Class | Ola/Uber estimate | YatraGo solo | YatraGo shared (3 riders) | Savings |
|---|---|---|---|---|
| Bike | ₹64 – ₹76 | ₹64 (₹59 at ₹4/km saver) | N/A | up to 22% |
| Mini / Hatchback | ₹162 – ₹194 | ₹158 | ~₹58 / person | 15–20% solo · 65%+ shared |
| Sedan | ₹260 – ₹274 | ₹227 | ~₹83 / person | 15–20% solo · 68%+ shared |

### Model constants

```
REFERENCE_KM      = 8
SHARED_RIDERS     = 3
SHARED_SURCHARGE  = 1.10   // pooling/detour fee applied before dividing

bike:  base 8,   perKm 7,   saverBase 27, saverPerKm 4,  competitor ₹64–₹76,   shared: none
mini:  base 38,  perKm 15,                               competitor ₹162–₹194, shared: 3 riders
sedan: base 43,  perKm 23,                               competitor ₹260–₹274, shared: 3 riders
```

### Formulas

```
scale            = distanceKm / REFERENCE_KM
solo             = round( (base + perKm × distanceKm) × multiplier )
saverSolo        = round( (saverBase + saverPerKm × distanceKm) × multiplier )
competitorMin    = round( competitorMinRef × scale )
competitorMax    = round( competitorMaxRef × scale )
sharedPerPerson  = round( (solo × 1.10) / 3 )        // cars only
sharedTotal      = sharedPerPerson × 3
savingsSolo %    = round( (competitorMax − solo) / competitorMax × 100 )
savingsShared %  = round( (competitorMin − sharedPerPerson) / competitorMin × 100 )
```

At 8 km this reproduces the table exactly:

- Bike: `8 + 7×8 = 64`; saver `27 + 4×8 = 59`.
- Mini: `38 + 15×8 = 158`; shared `round(158×1.10/3) = 58`.
- Sedan: `43 + 23×8 = 227`; shared `round(227×1.10/3) = 83`.

### Tier → fare class mapping

| Tier id | Fare class | Multiplier |
|---|---|---|
| `eco` | sedan | 1.0 |
| `premium` | sedan | 1.25 |
| `shuttle` | mini | 1.0 |
| `guider` | sedan | 1.12 |
| `moto` | bike | 1.15 |
| `scooter` | bike | 0.90 |
| `moto_express` | bike | 1.0 |
| `premier` | sedan | 1.0 |
| `comfort` | mini | 1.0 |
| `xl` | sedan | 1.35 |
| `auto` | mini | 0.80 |
| `moto_classic` | bike | 1.0 |
| `hyperbike` | bike | 1.20 |
| `moto_fast` | bike | 1.05 |
| `pool_sedan` | sedan | 1.0 |
| `pool_xl` | sedan | 1.20 |

### Where it is applied

- **Book Ride page (`RideBooking.jsx`):**
  - Every tier card price is `getTierFare(tierId, distanceKm).solo`.
  - Car tiers show “Shared ₹X/person”.
  - The CTA total is `solo + guider fee`.
- **Home request card (`YatraGoRideRequestCard.jsx`):**
  - Ride mode shows solo fare; Pool mode shows per-person shared fare.
  - Pool bookings send `sharedTotal` as `fare`, so the cost splitter divides it into exact per-person shares.
- The engine still computes `competitorMin/Max` and `savingsSolo/savingsShared`, but those comparison values are **not displayed** in the ride UI.
- **Cost splitter:** consumes `activeRide.totalCost` (solo or shared total) and splits it; shared totals therefore divide to the published per-person prices.

---

## 6. Ride Booking Flow

1. User enters pickup/destination (autocomplete via Nominatim, preset coordinates, or map taps).
2. Distance:
   - Haversine crow-flight distance × 1.28 road factor (urban), rounded to 0.1 km.
   - Trips over 1200 km use raw crow-flight distance.
   - Fallback presets provide deterministic distances for offline use.
3. ETA: `max(3, round(distanceKm × 1.5))` minutes.
4. Vehicle selection (bike / car categories) drives the fare class and price.
5. Optional local guider adds `hourlyRate` (default ₹350).
6. `onBookRide` posts to `/api/rides/book` with pickup, destination, vehicle, distance, guider, totalCost and rider info.
7. `activeRide` is updated locally and the app routes to `cost-split`.
8. Backend returns `{ success, ride }`; failures are ignored and the local ride remains usable.

---

## 7. Pooling & Cost Splitting

### Stranger pooling
- Matches riders on route alignment; `isStrangerCombined` marks pooled rides.
- Pool UI advertises 44% savings; shared fare math uses the 3-rider table.
- Pooling success updates `activeRide` and opens the fare splitter.

### Cost splitter (`CostSplitter.jsx`)
- Base fare = `ride.totalCost`.
- Promo `POOL44` / `VELO20` deducts ₹80 (pool rides start discounted).
- Optional tip.
- `netTotal = max(0, baseFare − promo) + tip`.
- Split modes:
  - **Equal:** every rider gets weight 1.
  - **Custom:** weights are rider percentages.
  - **By distance:** weights are each rider's travelled km.
- All shares are allocated in **paise** so they sum exactly to the total; remainders are distributed one paise at a time.
- Payment per rider: Razorpay (verified) or simulated UPI / card / wallet.
- Receipts can be downloaded, shared and printed.

---

## 8. Maps

### Engine selection
- `index.html` defines `window.gm_authFailure`; Google calls it when the key is invalid, restricted or unbilled.
- `MapView` and `Google3DMapSearch` listen for `yatrago:gmaps-auth-failure` and fall back to Leaflet within ~3.5 s if the API is missing.
- The Google map is only rendered while `useGoogleMaps && googleMapsReady`.

### Leaflet fallback
- Street mode: OpenStreetMap tiles.
- 3D/satellite mode: Esri World Imagery.
- Route: OSRM driving geometry (`router.project-osrm.org`), with an immediate straight-line preview. Failure keeps the preview line.
- `ChangeLeafletBounds` fits both endpoints.
- Light theme disables the dark tile filter; satellite tiles keep natural colors.

### Interactions
- Tap map to set pickup/destination; mode toggles after the first pick.
- Draggable Google markers and `dragend` reverse geocoding.
- Reverse geocoding tries Google Geocoder first, then Nominatim.
- Geolocation + reverse geocode for “My location”.

---

## 9. Partner, Promo & Hotel Booking Logic

### Partner directory (`BusinessPromoHub.jsx`)
- Loads `/api/partners`, merges `PARTNER_SEED` details (images, rooms, amenities) when API records lack them.
- Offline fallback uses `PARTNER_SEED`.
- Filters: All / Hotels / Shops / Restaurants, plus text search over name/city/area/promo code.
- Stats: totals by category and best discount.

### Listing application
- Requires business name + category.
- Fields: city, area, promo code, discount %, contact email/phone, `listedBy` (traveller / shopkeeper), `managedBy` (admin / developer / promoter).
- Posts to `/api/partners/register`; server normalizes `managedBy` and stores `status: pending`, `isVerified: false`, 10% starter commission.
- Offline fallback inserts a local pending partner and returns success.
- Success screen shows the SMS/email destination, delivery status and a verification timeline.
- The modal is portaled to `document.body` and background scroll is locked.

### Promo redemption
- `POST /api/partners/redeem` looks up the code and computes the discount.
- Offline fallback checks local partners/seed.
- Hotels open a booking modal; shops/restaurants prefill their promo code.

### Hotel booking (`PartnerBookingModal.jsx`)
- Requires room inventory.
- Nights = checkOut − checkIn.
- Charges:
  - `roomTotal = nightlyRate × nights`
  - `discount = roomTotal × promo%`
  - `taxes = (roomTotal − discount) × taxesPercent`
  - `serviceFee` when nights > 0
  - `total = roomTotal − discount + taxes + serviceFee`
- Promo validates against the partner's own code or another active partner code.
- Payment via Razorpay; confirmation shows booking reference, nights, guests, payment ID and receipt actions.
- Portaled to `document.body`, internal scroll, scroll lock and top reset.

---

## 10. Payments (Razorpay)

- Client creates an order via `/api/create-order` with amount in **paise** (`rupees × 100`, minimum ₹1).
- Backend returns `key_id`, `order_id`, `amount`, `currency`.
- Razorpay checkout prefill normalizes Indian phone numbers to 10 digits.
- On success, the client posts order/payment/signature to `/api/verify-payment`.
- The server verifies HMAC-SHA256 with `crypto.timingSafeEqual` (never plain `===`), plus length checks.
- Failure/dismiss callbacks surface messages; the action never crashes when Razorpay is unconfigured (`/api/create-order` returns 401).

---

## 11. SOS

- 3-second countdown before dispatch.
- Triggers `/api/sos/trigger`, stores an active broadcast, and emits `sos_broadcast_alert` over Socket.io.
- Active alerts can be listed and resolved (`/api/sos/active`, `/api/sos/resolve/:id`).
- Offline fallback keeps an in-memory broadcast.

---

## 12. Email / OTP

- `utils/emailService.js` uses Nodemailer if SMTP is configured; otherwise native TLS SMTP; otherwise logs “simulated” delivery.
- Reset codes and alerts therefore work in demo mode even with no mail credentials.

---

## 13. Chat & Sockets

- `SocketContext` connects to the same origin (`/socket.io` proxied to :5000).
- Auto-joins `ride_101`.
- Incoming: `new_message`, `stranger_match_accepted`, `sos_broadcast_alert`.
- Outgoing: `join_ride`, `send_message`, `trigger_sos`, `combine_ride_request`, `driver_location`.
- Unread counts are cleared on the chat tab and on logout.

---

## 14. 3D & Motion

- **Home ambient field (`HomeAmbient.jsx`):** fixed, pointer-events-none layer behind the home content with 80 deterministic twinkling mini-stars, 22 floating glass bubbles with drift, and soft aurora orbs. Pure CSS animation; stops under `prefers-reduced-motion`; colors adapt to light mode.
- **Home interactions:** hero glow/grid, tilt cards, shine sweeps, staggered entrances, stats strip and gradient headings.
- **3D route map:** lazy `MapView` (Google/Leaflet).
- **3D simulator / destination preview:** `Interactive3DRideScene` and `ThreeDestinationPreview` with WebGL error fallback.
- All animations honor reduced-motion and are CSS-driven where possible.

---

## 15. Navbar Logic

- Desktop nav appears at `xl` (≥1280 px); below that the mobile drawer is used.
- Items never wrap (`shrink-0`, `whitespace-nowrap`); labels shorten below 2xl.
- Brand tagline and full profile details appear at ≥1650 px.
- Wide search capsule appears at ≥1800 px; a compact search icon covers 1400–1799 px; `Ctrl/Cmd+K` always opens search.
- Opening any nav popover closes the others (`closeNavMenus`).
- Workspaces popover is right-anchored; all popovers are scrollable and viewport-capped.
- Search overlay uses `z-[80]`; nav popovers `z-[60]`; wallet/profile `z-[70]`.

---

## 16. API Surface

| Mount | Purpose |
|---|---|
| `/api/auth` | register, login, change/forgot/reset password, reset codes, me (GET/PUT), upload-avatar, verify-admin, verify-token, google config/sign-in |
| `/api/rides` | active, list, book, stranger-matches, combine-stranger, split-cost, `/:rideId/messages` |
| `/api/guiders` | list, `/:id` |
| `/api/partners` | list, register, redeem, stats |
| `/api/sos` | trigger, active, resolve/:id |
| `/api/payment` and `/api` | config, create-order, verify-payment (intentionally mounted twice) |
| `/api/health` | liveness |

All API responses use `{ success: boolean, ... }`. Users are always returned through `sanitizeUser()` (no password/`__v`).

---

## 17. Zero-Lockout Fallbacks

| Missing thing | Behavior |
|---|---|
| MongoDB | In-memory users/rides/SOS/partners |
| JWT_SECRET | Built-in fallback secret |
| Google OAuth config / origin | Local Google-branded session |
| Google Maps key/billing | Leaflet + OSRM |
| Razorpay keys | Order endpoint 401 → UI error, no crash |
| SMTP | Simulated email delivery |
| Backend offline | Auth/profile/partner/ride local fallbacks |
| Nominatim/OSRM offline | Preset coordinates/distances, straight-line route |

---

## 18. Environment & Commands

Backend variables: `MONGO_URI`, `JWT_SECRET`, `ADMIN_ACCESS_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SMTP_*`, `GOOGLE_CLIENT_ID`, `NODE_ENV`, `NODE_VERSION`. Do not set `PORT`; Railway and Render inject it.

Frontend build variables (Vite inlines them at build time):
- `VITE_API_BASE_URL` — Railway/Render backend URL. Empty in local dev so `/api` uses the Vite proxy.
- `VITE_SOCKET_URL` — Socket.io backend URL; defaults to `VITE_API_BASE_URL`.
- `VITE_GOOGLE_MAPS_API_KEY` — browser Maps key injected into `index.html`.

All frontend network calls go through `frontend/src/utils/api.js` (`apiFetch`/`apiUrl`), and sockets connect to `SOCKET_URL || window.location.origin`. This is what makes split hosting (Cloudflare Pages + Railway) work. Deployment steps live in `DEPLOYMENT.md`.

```powershell
npm run dev                         # backend :5000 + Vite :3000
npm --prefix frontend run build     # production build
npm --prefix frontend run lint      # ESLint (if installed)
npm run seed                        # DESTRUCTIVE demo seed
```

---

## 19. Feature Checklist

- [ ] Backend route mounted and DB-guarded.
- [ ] Frontend tab added to the `activeTab` allowlist and hash listener.
- [ ] Navigation routed through `handleNavigateWithTransition`.
- [ ] Prices/times derived from the fare engine, not hardcoded.
- [ ] Offline fallback + `.catch()` on every request.
- [ ] Fixed modals portaled to `document.body` or free of transformed ancestors.
- [ ] Light-theme overrides verified.
- [ ] Reduced-motion and WebGL failure paths preserved.
