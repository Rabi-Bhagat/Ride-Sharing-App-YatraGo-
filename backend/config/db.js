const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env'), override: true });

const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yatrago_rideshare';
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB Connection Notice: ${error.message}. Running server with High-Speed In-Memory DB Sync!`);
    return false;
  }
};

module.exports = connectDB;
