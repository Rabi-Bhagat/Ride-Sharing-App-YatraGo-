const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');

// Robustly load .env from backend directory or project root
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db');
const setupSocketHandlers = require('./sockets/socketHandler');

const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const guiderRoutes = require('./routes/guiderRoutes');
const sosRoutes = require('./routes/sosRoutes');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// Initialize Database Connection and Auto-seed if empty
connectDB().then(async (connected) => {
  if (connected) {
    try {
      const User = require('./models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        console.log('MongoDB is empty. Running auto-seeding...');
        // require('./seed') would run the seed script
        const seed = require('./seed');
      }
    } catch (e) {
      // ignore
    }
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/guiders', guiderRoutes);
app.use('/api/sos', sosRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'YatraGo Ride-Sharing Engine Online', timestamp: new Date() });
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
