# 🚖 YatraGo - Smart Ride-Sharing & 3D Mobility Platform

A modern, high-performance full-stack ride-sharing and urban mobility web platform engineered with **React 18, Vite, Node.js, Express, MongoDB, Socket.io, Three.js WebGL**, and dual-engine maps (**Google Maps & Leaflet / OpenStreetMap**).

---

## 🌟 Key Features

1. **Smart Ride Request & Doorstep Dispatch**:
   - Instant cab hailing, scheduled reservations (up to 90 days), and vehicle selection (EV Sedan, EcoSUV, Superbike, AeroScooter).
   - Doorstep pickup autocomplete powered by Google Places and OpenStreetMap geocoding.

2. **Interactive 3D Route Preview & Digital Viewport (`Three.js`)**:
   - Real-time 3D vehicle simulation with 360° orbit camera, chase camera, cockpit POV, speed controls (W/S acceleration & braking), and day/night atmospheric weather rendering.

3. **Carpool & Shared Rides (Route Alignment Engine)**:
   - Dynamic waypoint pairing that matches verified commuters traveling along identical routes, slashing fares by up to **44%**.

4. **Automated Group Fare Splitting & UPI Checkout**:
   - Multi-rider split matrix with digital payment receipts (UPI, Card, Wallet), transaction IDs, and automated rider settlement tracking.

5. **Role-Based Workspaces & Portals**:
   - **Driver Partner Console**: Online/offline toggle, ride dispatch cards, boarding OTP verification, passenger drop-off, and weekly payout dashboard.
   - **Operations & Admin Center**: Fleet overview, user/driver license verification, fraud monitoring, and dynamic platform pricing rules.
   - **Local Guider Network**: Certified city guides for hire per hour to accompany tourists on historical city routes.

6. **24/7 Safety Network & 1-Click Emergency SOS**:
   - Emergency SOS trigger with 3-second safety countdown, emitting real-time GPS coordinates to nearby responders and trusted contacts.

7. **Real-Time Group Ride Chat (`Socket.io`)**:
   - In-ride multi-participant messaging drawer connecting rider, assigned driver, and local guide with verified badges.

---

## ⚡ Zero-Cost Quickstart (Run Without Any Paid Accounts)

> **Are all API credentials required to run YatraGo?**
> 
> **NO!** YatraGo is built with **zero-lockout fallbacks**. If you don't provide external API keys, the app automatically switches to built-in fallback engines (Leaflet / OpenStreetMap for navigation, in-memory database sync, simulated UPI/Card checkout, and in-app SOS broadcast).

For complete details on free tiers, see [CREDENTIALS.md](file:///c:/Users/Rabi%20Bhagat/Desktop/Ride%20Sharing%20app/CREDENTIALS.md).

### The 100% Free Setup (Only 2 Credentials Needed):

1. **`MONGO_URI`**: Free Forever via [MongoDB Atlas M0 Tier](https://cloud.mongodb.com) (512MB storage, no credit card required).
2. **`JWT_SECRET`**: Generate locally in 5 seconds via:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

## 🚀 Installation & Local Development

### 1. Clone & Install Dependencies

```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Files

Create your local `.env` files from the provided templates:

```powershell
# Copy backend template
cp backend/.env.example backend/.env

# Copy frontend template
cp frontend/.env.example frontend/.env
```

*(See [CREDENTIALS.md](file:///c:/Users/Rabi%20Bhagat/Desktop/Ride%20Sharing%20app/CREDENTIALS.md) for full explanations of every variable).*

#### Enabling "Continue with Google"

Google sign-in uses Google Identity Services and only works once you supply your own OAuth client ID:

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an **OAuth 2.0 Client ID → Web application**.
2. Add `http://localhost:3000` (and your production origin) under **Authorized JavaScript origins**.
3. Put the client ID in `.env` (repo root and/or `backend/.env`):
   ```powershell
   GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
   ```
4. Restart the backend. The button now opens Google's account chooser, and the picked account is verified server-side at `POST /api/auth/google`. Without a client ID the button shows a configuration message instead of signing anyone in.


### 3. Launch Development Servers

```powershell
# Terminal 1: Backend API & Socket Server (port 5000)
npm --prefix backend start

# Terminal 2: Frontend Client with Vite (port 3000)
npm --prefix frontend run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 🏗️ Architecture & Project Structure

```text
Ride Sharing app/
├── README.md                 # Project documentation
├── design.md                 # Design system reference
├── AGENTS.md                 # Engineering guide for AI agents
├── package.json              # Root scripts (dev / build / start)
├── backend/                  # Node.js + Express + Socket.io + Mongoose
│   ├── .env.example          # Sample environment variables
│   ├── server.js             # API + Socket + static SPA host
│   ├── config/db.js          # MongoDB connection with in-memory fallback
│   ├── models/               # User, Guider, Ride, Message, SosAlert, Partner
│   ├── routes/               # Auth, Rides, Guiders, Partners, SOS, Payments
│   ├── sockets/              # Socket.io handlers for real-time events
│   ├── utils/                # Auth helper, email service
│   └── seed.js               # Sample data seeding script
└── frontend/                 # React 18 + Vite + Tailwind + Three.js + Leaflet
    ├── .env.example          # Client environment variables
    ├── index.html            # Entry HTML (Google Maps + Leaflet CSS)
    ├── vite.config.js        # Vite build, chunking, API proxy, Maps key injection
    ├── tailwind.config.js    # Glassmorphism styling configuration
    ├── public/
    │   ├── hero-images/      # Optimized WebP hero slides
    │   └── hotel-images/     # Partner property artwork
    └── src/
        ├── App.jsx           # Main application routing and shell
        ├── components/       # UI components (Navbar, 3D scene, maps, chat…)
        ├── context/          # AuthContext & SocketContext
        ├── pages/            # Home, Book, Carpool, Split, Business, Portals…
        ├── data/             # Vehicle specs, 3D destinations, partner seed
        ├── utils/            # Razorpay checkout, receipts, Google auth
        └── logo/             # Brand mark
```

---

## 🧪 Production Build Verification

```powershell
npm run build          # builds frontend/dist
npm start              # serves API + built SPA on PORT (default 5000)
```

The Express server serves `frontend/dist` when it exists:

- Hashed assets (`*.js`, `*.css`, `*.webp`, `*.svg`) → `Cache-Control: immutable, max-age=1y`
- `index.html` and SPA routes → `no-cache`, so deploys take effect immediately
- Unknown non-API paths fall back to `index.html` (client-side routing)
- Responses are gzip-compressed; baseline security headers are applied

---

## 🚀 Deployment

### Option A — Single server (simplest)

```powershell
npm run install:all
npm run build
# set backend/.env (MONGO_URI, JWT_SECRET, RAZORPAY_*, etc.) then:
npm start
```

Deploy the repo to any Node host (Render, Railway, Fly.io, a VPS). The Express
server serves both the API and the built frontend on one port — no separate
static host is needed. Set `PORT` in the environment; most hosts do this for you.

### Option B — Split frontend / backend

- **Frontend** → Vercel / Netlify / Cloudflare Pages
  - Build command: `npm --prefix frontend run build`
  - Publish directory: `frontend/dist`
- **Backend** → Render / Railway
  - Start command: `node backend/server.js`
  - Then set `VITE_BACKEND_URL` on the frontend to the backend origin so API and
    socket calls resolve correctly.

### Environment variables to set before going live

| Location | Variable | Purpose |
|----------|----------|---------|
| backend | `MONGO_URI` | MongoDB Atlas connection string |
| backend | `JWT_SECRET` | Token signing — **must** be set in production |
| backend | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Live payments |
| backend | `SMTP_*` | OTP / email delivery |
| frontend | `VITE_GOOGLE_MAPS_API_KEY` | Google Maps (injected into `index.html` at build) |
| frontend | `VITE_BACKEND_URL` | Only needed for split hosting |

### Pre-launch checklist

- [ ] Set a strong `JWT_SECRET` (the code falls back to a dev value otherwise).
- [ ] Restrict the Google Maps key by HTTP referrer in Google Cloud Console.
- [ ] Switch Razorpay to live keys and verify one real transaction.
- [ ] Run `npm run seed` only against a database you intend to overwrite.
- [ ] Confirm `MONGO_URI` is reachable from the host (the app falls back to
      in-memory stores if it is not, which loses data on restart).

---

## 📄 License
MIT © 2026 YatraGo Technologies Inc.
