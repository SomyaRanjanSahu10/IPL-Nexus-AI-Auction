const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://ipl-nexus.vercel.app',
        /\.vercel\.app$/
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        // Allow viewers without auth
        socket.data.user = { role: 'viewer', name: 'Viewer' };
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).populate('team', 'name shortName primaryColor');
      
      if (!user) return next(new Error('User not found'));
      
      socket.data.user = user;
      next();
    } catch (error) {
      // Allow connection as viewer on auth failure
      socket.data.user = { role: 'viewer', name: 'Viewer' };
      next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`Socket connected: ${user?.name || 'Anonymous'} (${socket.id})`);

    // Join auction room
    socket.on('join:auction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
      socket.emit('joined:auction', { auctionId, userId: user?._id });
    });

    // Join team room
    socket.on('join:team', (teamId) => {
      if (user?.team?._id?.toString() === teamId || user?.role === 'admin') {
        socket.join(`team:${teamId}`);
      }
    });

    // Timer sync
    socket.on('timer:sync', (data) => {
      if (user?.role === 'admin') {
        socket.broadcast.emit('timer:update', data);
      }
    });

    // Bid event from client (alternative to REST)
    socket.on('bid:place', async (data) => {
      if (!user?._id) {
        return socket.emit('bid:error', { error: 'Authentication required' });
      }
      // The actual bid logic is handled via REST API
      // This can be used for additional real-time features
      socket.emit('bid:ack', { received: true });
    });

    // Chat message
    socket.on('chat:message', (data) => {
      io.emit('chat:message', {
        user: { name: user?.name, team: user?.team?.shortName },
        message: data.message,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${user?.name} - ${reason}`);
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { initSocket, getIO };
