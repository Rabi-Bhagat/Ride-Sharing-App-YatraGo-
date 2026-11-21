# YatraGo — Railway (backend) + Cloudflare Pages (frontend)

This is a split deployment:

- **Backend:** Railway → `https://<your-service>.up.railway.app`
- **Frontend:** Cloudflare Pages → `https://<your-project>.pages.dev`

> **About credentials:** I cannot create or hand you real credentials. Railway, Cloudflare, MongoDB Atlas, Google Cloud and Razorpay issue them from your own accounts. This file lists exactly where to get each value and exactly where to paste it.

---

## 0. Prerequisites

- GitHub repo containing this project.
- Accounts: [Railway](https://railway.app), [Cloudflare](https://dash.cloudflare.com), [MongoDB Atlas](https://cloud.mongodb.com), [Google Cloud Console](https://console.cloud.google.com), [Razorpay Dashboard](https://dashboard.razorpay.com).
- Node 18+ locally.

---

## 1. Backend on Railway

### 1.1 Create the service

1. Railway → **New Project** → **Deploy from GitHub repo** → select this repo.
2. Open the service → **Settings**:
   - **Root Directory:** `backend`
   - **Build Command:** leave empty (Nixpacks runs `npm install`)
   - **Start Command:** `npm start`
3. **Settings → Networking → Generate Domain** → copy the public URL. It looks like:
   `https://yatrago-production-abcd.up.railway.app`

`backend/railway.json` already sets:
- start command `npm start`
- health check `/api/health`
- restart on failure

### 1.2 Environment variables (Railway → Variables)

| Variable | Required | What to put |
|---|---|---|
| `NODE_ENV` | Yes | `production` |
| `MONGO_URI` | Recommended | MongoDB Atlas connection string (see 1.3). If omitted, in-memory data is used and resets on restart. |
| `JWT_SECRET` | Yes | 64+ random hex chars. Generate with the command below. |
| `ADMIN_ACCESS_KEY` | Yes | Your admin desk passphrase. Generate a strong random value. |
| `GOOGLE_CLIENT_ID` | For Google login | The **same** OAuth Web Client ID used for GIS (ends with `.apps.googleusercontent.com`). No client secret is needed for the token flow. |
| `RAZORPAY_KEY_ID` | For payments | Razorpay Dashboard → Account & Settings → API Keys. |
| `RAZORPAY_KEY_SECRET` | For payments | Same page (shown once). |
| `SMTP_HOST` | Optional | SMTP provider host (e.g. `smtp.gmail.com`). |
| `SMTP_PORT` | Optional | `587` (STARTTLS) or `465` (SSL). |
| `SMTP_USER` | Optional | SMTP username / email. |
| `SMTP_PASS` | Optional | SMTP password or app password. |
| `SMTP_FROM` | Optional | From name/address, e.g. `YatraGo <no-reply@yourdomain.com>`. |
| `PORT` | Do **not** set | Railway injects it automatically; `server.js` reads `process.env.PORT`. |

Generate secrets locally:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run it twice: once for `JWT_SECRET`, once for `ADMIN_ACCESS_KEY`.

### 1.3 MongoDB Atlas

1. Create a free cluster.
2. **Database Access** → add a user + password.
3. **Network Access** → Add IP → `0.0.0.0/0` (Railway has no static outbound IPs on the free tier).
4. **Connect → Drivers** → copy the connection string and replace `<password>` and the database name:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/yatrago?retryWrites=true&w=majority
```

Paste it as `MONGO_URI` in Railway.

### 1.4 Verify backend

Open:

```
https://<your-service>.up.railway.app/api/health
```

Expected:

```json
{ "status": "OK", "message": "YatraGo Ride-Sharing Engine Online" }
```

If Mongo cannot connect, the server still runs with in-memory stores.

---

## 2. Frontend on Cloudflare Pages

### 2.1 Create the Pages project

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select this repository.
3. Configure the build:

| Setting | Value |
|---|---|
| Framework preset | Vite (or None) |
| Root directory | `frontend` |
| Build command | `npm ci --include=dev && npm run build` |
| Build output directory | `dist` |
| Node version (env) | `NODE_VERSION=20` |

### 2.2 Cloudflare Pages environment variables

Set these under **Settings → Environment variables** (Production **and** Preview):

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://<your-service>.up.railway.app` |
| `VITE_SOCKET_URL` | `https://<your-service>.up.railway.app` |
| `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps browser key |
| `NODE_VERSION` | `20` |

These are **build-time** values: after changing them you must trigger a new deployment.

`frontend/.env.production.example` contains the same list for local production builds.

### 2.3 Deploy

Click **Save and Deploy**. First build runs `vite build` and publishes `frontend/dist`.

Your frontend URL:

```
https://<your-project>.pages.dev
```

The app uses hash routing (`/#home`), plus `frontend/public/_redirects` provides a fallback.

### 2.4 If the build fails in ~2 seconds

A 2-second failure is almost always a **root directory / build command mismatch** (or an old Node version). Pick exactly one of these two configurations — do not mix them.

> **Why `--include=dev` matters:** Cloudflare's build image sets `NODE_ENV=production`. Plain `npm ci` / `npm install` then **skips devDependencies**, and Vite, Tailwind and PostCSS live there. Without `--include=dev` the build dies immediately with `sh: vite: not found`.

**Configuration A (recommended)**

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npm ci --include=dev && npm run build` |
| Build output directory | `dist` |
| Environment | `NODE_VERSION=20` |

**Configuration B (repo root)**

| Setting | Value |
|---|---|
| Root directory | `/` (leave empty / repository root) |
| Build command | `bash cloudflare-build.sh` |
| Build output directory | `frontend/dist` |
| Environment | `NODE_VERSION=20` |

`cloudflare-build.sh` installs the frontend dependencies and builds them, so it works even when the root is the repository root.

**What the error usually means**

| Build log line | Cause | Fix |
|---|---|---|
| `sh: 1: vite: not found` | Most common: `NODE_ENV=production` made npm skip devDependencies (Vite), or root/deps are wrong | Use `npm ci --include=dev && npm run build` (Config A) or `bash cloudflare-build.sh` (Config B) |
| `npm ERR! Missing script: "build"` | Build ran in the wrong directory | Set Root directory to `frontend` |
| `You are using Node.js 16... Vite requires Node.js 18+` | Old build image Node | Add `NODE_VERSION=20` |
| `npm ci ... lockfileVersion@3` / lockfile error | npm too old for the v3 lockfile | Add `NODE_VERSION=20` |
| `Output directory "dist" not found` | Output path is relative to the Root directory | With Root `frontend` use `dist`; with repo root use `frontend/dist` |
| `Could not read package.json` | Root directory points somewhere without `package.json` | Root must be `frontend` (Config A) or repo root (Config B) |

The repo now includes `frontend/.node-version` (`20`) to reinforce the Node version. If you still see a failure, click **Copy build log** and read the first `ERROR` / `npm ERR!` line — that identifies which row above applies.

---

## 3. Post-deploy configuration (important)

### 3.1 Google Sign-In

Google Cloud Console → **APIs & Services → Credentials → OAuth 2.0 Client ID (Web)**:

- **Authorized JavaScript origins** must include:
  - `https://<your-project>.pages.dev`
  - your custom domain, if any (e.g. `https://yatrago.com`)
  - `http://localhost:3000` (for local development)
- You do **not** add the Railway backend URL here — the popup runs on the frontend origin.
- Copy the Client ID into Railway `GOOGLE_CLIENT_ID`.

If the origin is missing, sign-in shows an origin error; the app then falls back to a local Google session by design.

### 3.2 Google Maps

Google Cloud Console → enable **Maps JavaScript API**, **Places API**, **Directions API**, **Geocoding API**; billing must be enabled.

Restrict the browser key (Credentials → API key → Application restrictions → HTTP referrers):

```
https://<your-project>.pages.dev/*
https://your-custom-domain.com/*
http://localhost:3000/*
```

If the key is invalid/restricted, the app automatically falls back to Leaflet + OSRM.

### 3.3 Razorpay

Razorpay Dashboard → **Account & Settings → API Keys** → put the Key ID + Secret in Railway.

- Test keys start with `rzp_test_`; live keys with `rzp_live_`.
- No CORS/origin whitelist is needed for standard checkout.
- If you enable live payments, complete Razorpay KYC.

### 3.4 CORS / WebSockets

The backend currently allows any origin (`cors: { origin: '*' }`) for both Express and Socket.io, so the Pages → Railway calls work out of the box.

If you later restrict CORS, add:

```
https://<your-project>.pages.dev
https://your-custom-domain.com
```

Socket.io will connect to `VITE_SOCKET_URL` over `wss://` automatically.

---

## 4. Credentials checklist

| Credential | Where to get it | Where it goes |
|---|---|---|
| Railway service URL | Railway → Service → Settings → Networking → Generate Domain | `VITE_API_BASE_URL` and `VITE_SOCKET_URL` in Cloudflare |
| MongoDB user/password | MongoDB Atlas → Database Access | inside `MONGO_URI` in Railway |
| MongoDB connection string | Atlas → Connect → Drivers | Railway `MONGO_URI` |
| `JWT_SECRET` | generate with Node (command above) | Railway |
| `ADMIN_ACCESS_KEY` | generate with Node / choose a strong passphrase | Railway (and use it in the Admin desk) |
| Google OAuth Client ID | Google Cloud → Credentials → OAuth Client (Web) | Railway `GOOGLE_CLIENT_ID`; add Pages URL to authorized origins |
| Google Maps API key | Google Cloud → Credentials → API key | Cloudflare `VITE_GOOGLE_MAPS_API_KEY` |
| Razorpay Key ID / Secret | Razorpay Dashboard → API Keys | Railway `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` |
| SMTP username/password | Your email provider (Gmail App Password, Resend, SendGrid, etc.) | Railway `SMTP_*` |
| Cloudflare account / Git access | Cloudflare dashboard | Connect repo; no secret pasted into code |

> Never commit `.env`. Never put `JWT_SECRET`, `RAZORPAY_KEY_SECRET`, `MONGO_URI`, or SMTP passwords in any `VITE_*` variable — every `VITE_*` value is embedded in the public browser bundle.

---

## 5. Verification

1. `GET https://<railway>/api/health` → `{ "status": "OK" }`.
2. Open `https://<pages>.pages.dev` → sign-up/login works.
3. Book a ride → the API calls go to the Railway URL (check DevTools → Network).
4. Open chat → Socket.io connects to `wss://<railway>/socket.io` (DevTools → WS).
5. Google sign-in opens the account chooser; no origin error.
6. Ride map renders (Google Maps or Leaflet fallback).
7. Razorpay checkout opens in test mode.

Useful browser console check:

```js
localStorage.removeItem('yatrago_user');
localStorage.removeItem('yatrago_token');
location.reload();
```

---

## 6. Common errors

| Symptom | Cause | Fix |
|---|---|---|
| API 404 on `pages.dev/api/...` | `VITE_API_BASE_URL` not set at build time | Add it in Cloudflare env vars and redeploy |
| CORS error | Custom CORS allowlist missing the Pages domain | Keep `origin:'*'` or add the Pages URL |
| Socket won't connect | `VITE_SOCKET_URL` missing or wrong | Set it to the Railway HTTPS URL and redeploy |
| Google `origin_mismatch` | Pages domain missing from authorized JS origins | Add it in Google Cloud Console |
| Google Maps grey/error | Key restricted or APIs not enabled | Enable Maps JS/Places/Directions/Geocoding, fix referrers |
| Mongo timeout | Atlas IP allowlist | Allow `0.0.0.0/0` or Railway egress IPs |
| Razorpay 401 | Keys missing in Railway | Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` |
| Env change has no effect on frontend | Vite inlines `VITE_*` at build | Redeploy the Pages project |

---

## 7. Optional: CLI deploys

Railway:

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

Cloudflare Pages (Wrangler):

```bash
npm i -g wrangler
npm --prefix frontend run build
wrangler pages deploy frontend/dist --project-name yatrago
```

Dashboard-based Git deployment is recommended because it rebuilds automatically on every push.
