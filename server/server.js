const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware Configuration
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/laundry_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB via Mongoose'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Laundry Backend API is active.' });
});

// API Routes
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

// Catch-all route handler for 404
app.use((req, res) => {
  res.status(404).json({ message: 'Requested route not found' });
});

// Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Laundry backend running on http://localhost:${PORT}`);
});
// Add inside backend/server.js
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);