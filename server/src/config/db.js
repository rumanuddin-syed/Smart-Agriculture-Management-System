const mongoose = require('mongoose');

/**
 * Connect to MongoDB database.
 * Supports standard MONGO_URI (e.g. mongodb://localhost:27017/smart_agri or Mongo Atlas).
 * If MONGO_URI is omitted or fails to connect locally, it starts an in-memory Mongo server
 * so basic MERN developers can test immediately without setup hassle.
 */
const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    if (!uri || uri === 'memory') {
      console.log('ℹ️ No external MONGO_URI specified. Starting embedded MongoDB Memory Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('✅ In-Memory MongoDB running at:', uri);
    }

    const conn = await mongoose.connect(uri);
    console.log(`🌱 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('🔄 Fallback: Attempting in-memory database launch...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected Fallback: ${conn.connection.host}`);
    } catch (fallbackErr) {
      console.error('❌ Failed to start fallback MongoDB:', fallbackErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
