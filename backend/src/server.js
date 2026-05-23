require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket/socketManager');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info(`🚀 IPL Nexus Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🤖 GROK AI: ${process.env.GROK_API_KEY ? 'Connected' : 'Not configured'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});
