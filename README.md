# Ride-Sharing-App-YatraGo-

# 🏎️ YatraGo - Next-Gen Full-Stack MERN Ride Sharing Platform

> **Hackathon Submission Ready** | Built with React, Node.js, Express, MongoDB, Socket.io, Three.js WebGL & Google Maps / Leaflet.

YatraGo is a full-stack, highly responsive ride-sharing web application engineered for modern urban mobility. It combines real-time socket tracking, 3D WebGL destination previews, AI-assisted stranger ride pooling, automated in-app cost splitting, verified user/guider profiles, real-time group chat, and localized emergency SOS safety broadcasts.

---

## ✨ Features & Hackathon Showcase Highlights

1. **Interactive 3D WebGL Destination Preview (`Three.js`)**:
   - Preview volumetric 3D cityscapes (Downtown Cyber Hub, Oceanfront Resort, Historic Plaza, Alpine Ridge) with 360° Orbit camera controls, sky atmosphere toggles (Neon Night, Sunset, Day, Cyber Fog), and interactive landmark pins.

2. **Stranger Ride Combining (Smart Pooling Engine)**:
   - Match pairing algorithm that evaluates route alignment ($96\%$ match score), detour time, and cost savings ($44\%$ total discount per rider).

3. **In-App Automated Cost Splitting & Live Payment Gateway Simulator**:
   - Multi-passenger fare matrix supporting equal or custom ratio splits.
   - Live interactive payment simulator (UPI / Credit Card / Apple Pay) generating instant digital payment receipts and marking rider status as `PAID`.

4. **Verified User Profiles & Local Travel Guiders Directory**:
   - Verification Checkmark Badge ($\checkmark$) indicating government ID verification and $98\%$ trust score.
   - Dedicated local travel guider network directory with language spoken filters, specialties, and 1-click "Add Guider to Ride" options.

5. **Localized Emergency SOS Alert Broadcast**:
   - High-visibility emergency SOS system with a 3-second safety countdown to prevent accidental triggers.
   - Emits real-time Socket.io telemetry (GPS coordinates: `37.7749° N, 122.4194° W`) to nearby radius response units and emergency contacts.

6. **Real-Time Group Chat (`Socket.io`)**:
   - Live multi-participant messaging drawer connecting co-riders, driver, and local guiders with verified profile badges and preset quick safety status chips.

---

## 🏗️ Architecture & Project Structure

```text
Ride Sharing app/
├── backend/                  # Node.js + Express + Socket.io + Mongoose
│   ├── server.js             # API & Socket Server entry point
│   ├── config/db.js          # MongoDB connection with in-memory fallback
│   ├── models/               # User, Guider, Ride, Message, SosAlert Schemas
│   ├── routes/               # Auth, Rides, Guiders, SOS REST endpoints
│   └── sockets/              # Socket.io handlers for real-time events
└── frontend/                 # React + Vite + Tailwind CSS + Three.js + Leaflet
    ├── index.html            # Entry HTML with Leaflet CSS & Google Fonts
    ├── vite.config.js        # Vite build & API proxy setup
    ├── tailwind.config.js    # Glassmorphism styling configuration
    └── src/
        ├── App.jsx           # Main orchestrator with Hackathon Demo Bar
        ├── components/       # Feature modules (MapView, ThreeDestinationPreview, etc.)
        ├── context/          # AuthContext & SocketContext
        └── data/             # 3D presets, vehicles & guider directory
```

---

