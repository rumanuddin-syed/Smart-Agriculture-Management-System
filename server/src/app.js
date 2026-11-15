require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const cropRoutes = require('./routes/cropRoutes');
const diseaseRoutes = require('./routes/diseaseRoutes');
const nearbyRoutes = require('./routes/nearbyRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crop-recommendation', cropRoutes);
app.use('/api/disease-detection', diseaseRoutes);
app.use('/api/nearby', nearbyRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Smart Agriculture Management API Phase 1' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File size exceeds maximum upload limit of 10MB.' });
  }
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'An unexpected error occurred!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
