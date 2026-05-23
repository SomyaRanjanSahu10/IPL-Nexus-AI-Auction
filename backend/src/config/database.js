const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnect...');
    });
    
    return conn;
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed.');
};

module.exports = { connectDB, disconnectDB };
