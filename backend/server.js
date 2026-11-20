const express = require('express');
const http = require('http');
const cors = require('cors');
const compression = require('compression');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Robustly load .env from backend directory or project root.
// override:true makes the project .env authoritative over any stale shell/global vars.
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true });

const connectDB = require('./config/db');
const setupSocketHandlers = require('./sockets/socketHandler');

const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const guiderRoutes = require('./routes/guiderRoutes');
const sosRoutes = require('./routes/sosRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const partnerRoutes = require('./routes/partnerRoutes');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Basic security headers for hosting. Content-Security-Policy is intentionally
// permissive for the external map/payment/font hosts this app depends on.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');
  next();
});

// Lightweight gzip/deflate for API + static responses (no extra dependency).
app.use(compression());

// Initialize Database Connection and Auto-seed if empty
connectDB().then(async (connected) => {
  if (connected) {
    try {
      const User = require('./models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        console.log('MongoDB is empty. Running auto-seeding...');
        const seed = require('./seed');
        await seed();
        console.log('Auto-seed complete.');
      }
    } catch (e) {
      console.warn('Auto-seed skipped:', e.message);
    }
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/guiders', guiderRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', paymentRoutes); // Supports direct /api/create-order and /api/verify-payment

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'YatraGo Ride-Sharing Engine Online', timestamp: new Date() });
});

// API 404 handler — unmatched API routes return JSON, never HTML
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Serve the built frontend (if present) so `npm start` runs the whole site from PORT.
// Dev still uses Vite on :3000; this only activates after `npm --prefix frontend run build`.
const clientDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(clientDist)) {
  // Hashed build assets can be cached forever; index.html must never be cached
  // so a new deploy is picked up immediately.
  app.use(
    express.static(clientDist, {
      setHeaders: (res, filePath) => {
        if (/\.(js|css|webp|png|jpg|jpeg|svg|woff2?)$/.test(filePath)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    })
  );
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Centralized error handler — keeps the API response shape consistent
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Unhandled API error:', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 YatraGo Backend & Socket.io Server running on port ${PORT}`);
});
