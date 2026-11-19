# 🔑 YatraGo - Credentials & Free Setup Guide

> **Quick Answer to: "Are all credentials required to run the web app?"**
> 
> **NO! Absolutely NOT.**  
> YatraGo has **built-in zero-lockout fallbacks** across all modules. If you do not provide external API keys, the app **automatically switches to built-in simulated engines** (Leaflet / OpenStreetMap for navigation, in-memory sync for database, interactive mock UPI/Card checkout for payments, and Socket.io for live SOS alerts).
> 
> You can run and test **100% of the features right now** without paying a single rupee.

---

## ⚡ The Quickest 100% Free Setup (Takes 2 Minutes)

To run YatraGo with **permanent data saving** (saved rides, user accounts, and driver approvals), you only need **2 free credentials**:

| Priority | Credential | Provider | Cost | Credit Card Needed? | Setup Time | What it Powers |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| 🟢 **Must-Have** | `MONGO_URI` | [MongoDB Atlas](https://cloud.mongodb.com) | **Free Forever** | **NO** | 2 mins | Saves users, ride history, driver KYC & chat |
| 🟢 **Must-Have** | `JWT_SECRET` | Local Command | **Free** | **NO** | 5 secs | Generates secure user login tokens |
| 🟢 **Must-Have** | `ADMIN_ACCESS_KEY` | Custom Text | **Free** | **NO** | 5 secs | Passphrase to open Operations & Admin Portal |

*(Notice: Maps, Payments, and SOS alerts all have built-in free fallbacks!)*

---

## 📊 Credential Tiers & Availability Matrix

| Credential | Free Tier Status | Credit Card Required? | Fallback If Left Empty |
| :--- | :---: | :---: | :--- |
| **`MONGO_URI`** | ✅ 512 MB Free Forever (M0 Tier) | ❌ No | In-memory memoryUsers & mock ride state |
| **`JWT_SECRET`** | ✅ 100% Free (Generated locally) | ❌ No | Uses default internal development secret |
| **`ADMIN_ACCESS_KEY`** | ✅ 100% Free (Your choice) | ❌ No | Defaults to `YatraGo_Admin_2026` |
| **`VITE_GOOGLE_MAPS_API_KEY`** | 🟡 $200 Free Recurring Monthly Credit | ⚠️ Needs Google Cloud Account | **Falls back to 100% Free OpenStreetMap + Leaflet** *(Pre-loaded key already in `index.html`!)* |
| **`RAZORPAY_KEY_ID` & `SECRET`** | ✅ 100% Free Test Mode (`rzp_test_...`) | ❌ No | **Built-in interactive simulated UPI & Card payment gateway** |
| **`GEMINI_API_KEY`** | ✅ 100% Free (Generous requests/min) | ❌ No | Built-in smart commute algorithm matches co-riders |
| **`CLOUDINARY_KEYS`** | ✅ 25 GB Free Storage Tier | ❌ No | In-app local image previews & data URLs |
| **`TWILIO_KEYS` (SMS)** | 🟡 Free Trial ($15 credit) | ⚠️ Phone verification | **In-app real-time SOS broadcast console with live GPS coordinates** |
| **`STRIPE_KEYS`** | ✅ 100% Free Developer Sandbox | ❌ No | Built-in simulated card payment modal |

---

## 🛠️ How to Get the 3 Essential Free Credentials

### 1. MongoDB Atlas (`MONGO_URI`) — 100% Free Forever
1. Open [cloud.mongodb.com](https://cloud.mongodb.com) and sign up with Google or Email (no card needed).
2. Click **Create Deployment** and choose the **M0 Free Tier** (512MB shared cluster).
3. Under **Security ➔ Quickstart**:
   - Create a username and password (e.g. `yatrago_user` / `YourPassword123`).
   - Under **Where would you like to connect from**, choose **My Local Environment** and add IP `0.0.0.0/0` (Allow access from anywhere).
4. Click **Connect ➔ Drivers ➔ Node.js** and copy your URI:
   ```env
   MONGO_URI=mongodb+srv://yatrago_user:YourPassword123@cluster0.xxxxx.mongodb.net/yatrago?retryWrites=true&w=majority
   ```

---

### 2. JWT Secret (`JWT_SECRET`) — Instant Local Key
You do not need any website. Simply generate a secure random string right in your terminal:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the generated 64-character string and paste it into `backend/.env`:
```env
JWT_SECRET=f3a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9
```

---

### 3. Admin Passphrase (`ADMIN_ACCESS_KEY`) — Any Text
Choose any secret passphrase you want for accessing the Operations & Admin desk:
```env
ADMIN_ACCESS_KEY=YatraGo_Admin_2026
```

---

## 🎁 Optional Free Tiers You Can Add Anytime

### 4. Razorpay Test Mode (Real UPI QR & Card Sandbox)
* **Cost**: ₹0 (Free forever in Test Mode).
* **Credit Card Needed**: NO.
* **How to get**:
  1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com).
  2. Toggle to **Test Mode** in the top navigation.
  3. Go to **Account & Settings ➔ API Keys ➔ Generate Key**.
  4. Paste into `backend/.env` and `frontend/.env`:
     ```env
     # backend/.env
     RAZORPAY_KEY_ID=rzp_test_U20lIYd7onOUg4
     RAZORPAY_KEY_SECRET=QZicfnT2P9rwtUb2xbzCdWXS

     # frontend/.env
     VITE_RAZORPAY_KEY_ID=rzp_test_U20lIYd7onOUg4
     ```

---

### 5. Google AI Studio (Gemini API for Smart Matching)
* **Cost**: $0 (Free tier with high limits for personal & developer projects).
* **Credit Card Needed**: NO.
* **How to get**:
  1. Open [aistudio.google.com](https://aistudio.google.com).
  2. Click **Get API Key ➔ Create API Key**.
  3. Paste into `backend/.env`:
     ```env
     GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     ```

---

### 6. Cloudinary (Driver License & KYC Document Storage)
* **Cost**: Free Tier (25 GB monthly bandwidth & storage).
* **Credit Card Needed**: NO.
* **How to get**:
  1. Register at [cloudinary.com](https://cloudinary.com).
  2. Copy **Cloud Name**, **API Key**, and **API Secret** from your dashboard.
  3. Paste into `backend/.env`:
     ```env
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=123456789012345
     CLOUDINARY_API_SECRET=your_cloudinary_secret
     ```

---

## 📄 Ready-to-Copy `.env` Files (Free Setup)

### File: `backend/.env`
Create or edit `backend/.env` with this ready-to-run free setup:

```env
# ==============================================================================
# YATRAGO BACKEND - 100% FREE STARTER CONFIG
# ==============================================================================

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# 1. MongoDB Atlas Free M0 URI (or mongodb://127.0.0.1:27017/yatrago)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/yatrago?retryWrites=true&w=majority

# 2. JWT Security
JWT_SECRET=f3a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9
JWT_EXPIRES_IN=7d
ADMIN_ACCESS_KEY=YatraGo_Admin_2026

# 3. Optional Free Enhancements (Leave blank if you don't have them yet)
RAZORPAY_KEY_ID=rzp_test_U20lIYd7onOUg4
RAZORPAY_KEY_SECRET=QZicfnT2P9rwtUb2xbzCdWXS
GEMINI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

---

### File: `frontend/.env`
Create or edit `frontend/.env`:

```env
# ==============================================================================
# YATRAGO FRONTEND - 100% FREE STARTER CONFIG
# ==============================================================================

# Backend proxy (leave blank during development)
VITE_BACKEND_URL=

# Optional custom Google Maps key (app already has default key + free Leaflet fallback)
VITE_GOOGLE_MAPS_API_KEY=

# Razorpay Test Key ID
VITE_RAZORPAY_KEY_ID=rzp_test_U20lIYd7onOUg4

VITE_APP_ENV=development
```

---

## 🚀 How to Run the App Right Now

1. **Launch the Backend API**:
   ```powershell
   npm --prefix backend start
   ```
2. **Launch the Frontend Client**:
   ```powershell
   npm --prefix frontend run dev
   ```
3. Open your browser at **`http://localhost:3000`**. Everything is fully operational!
