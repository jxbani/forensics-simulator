import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import prisma from './database.js';

let io;

/**
 * Get allowed origins for Socket.IO CORS
 * Matches the same configuration as server.js
 */
const getAllowedOrigins = () => {
  // Check if multiple origins are specified
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }

  // Single origin from FRONTEND_URL
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return ['http://localhost:5173', 'http://localhost:3000'];
  }

  // Production: strict mode
  return false;
};

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
export const initializeSocket = (httpServer) => {
  const allowedOrigins = getAllowedOrigins();

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);

      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    // Join user-specific room
    socket.join(`user:${socket.user.id}`);

    // Join role-specific room
    socket.join(`role:${socket.user.role || 'USER'}`);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Forensics Simulator',
      userId: socket.user.id,
      username: socket.user.username,
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.user.username}:`, error);
    });

    // Register event handlers
    registerLeaderboardHandlers(socket);
    registerProgressHandlers(socket);
    registerCollaborationHandlers(socket);
  });

  return io;
};

/**
 * Leaderboard event handlers
 */
const registerLeaderboardHandlers = (socket) => {
  // Subscribe to leaderboard updates
  socket.on('leaderboard:subscribe', (data = {}) => {
    const { type = 'global', id } = data;

    if (type === 'global') {
      socket.join('leaderboard:global');
    } else if (type === 'level' && id) {
      socket.join(`leaderboard:level:${id}`);
    } else if (type === 'difficulty' && id) {
      socket.join(`leaderboard:difficulty:${id}`);
    }

    socket.emit('leaderboard:subscribed', { type, id });
  });

  // Unsubscribe from leaderboard
  socket.on('leaderboard:unsubscribe', (data = {}) => {
    const { type = 'global', id } = data;

    if (type === 'global') {
      socket.leave('leaderboard:global');
    } else if (type === 'level' && id) {
      socket.leave(`leaderboard:level:${id}`);
    } else if (type === 'difficulty' && id) {
      socket.leave(`leaderboard:difficulty:${id}`);
    }
  });
};

/**
 * Progress tracking event handlers
 */
const registerProgressHandlers = (socket) => {
  // Subscribe to progress updates for a level
  socket.on('progress:subscribe', (data) => {
    const { levelId } = data;
    if (levelId) {
      socket.join(`progress:level:${levelId}`);
      socket.emit('progress:subscribed', { levelId });
    }
  });

  // Unsubscribe from progress updates
  socket.on('progress:unsubscribe', (data) => {
    const { levelId } = data;
    if (levelId) {
      socket.leave(`progress:level:${levelId}`);
    }
  });

  // Get live progress stats
  socket.on('progress:get-stats', async () => {
    try {
      const stats = await prisma.progress.findMany({
        where: { userId: socket.user.id },
        include: {
          user: {
            select: { username: true },
          },
        },
      });

      socket.emit('progress:stats', stats);
    } catch (error) {
      socket.emit('error', { message: 'Failed to fetch progress stats' });
    }
  });
};

/**
 * Collaboration event handlers
 */
const registerCollaborationHandlers = (socket) => {
  // Join collaboration room
  socket.on('collab:join', async (data) => {
    const { roomId, levelId } = data;

    if (!roomId || !levelId) {
      return socket.emit('error', { message: 'Invalid collaboration room data' });
    }

    // Join the collaboration room
    socket.join(`collab:${roomId}`);

    // Notify others in the room
    socket.to(`collab:${roomId}`).emit('collab:user-joined', {
      userId: socket.user.id,
      username: socket.user.username,
      timestamp: new Date(),
    });

    // Send current room members to the joining user
    const sockets = await io.in(`collab:${roomId}`).fetchSockets();
    const members = sockets.map((s) => ({
      userId: s.user.id,
      username: s.user.username,
    }));

    socket.emit('collab:joined', {
      roomId,
      levelId,
      members,
    });
  });

  // Leave collaboration room
  socket.on('collab:leave', (data) => {
    const { roomId } = data;

    if (roomId) {
      socket.leave(`collab:${roomId}`);
      socket.to(`collab:${roomId}`).emit('collab:user-left', {
        userId: socket.user.id,
        username: socket.user.username,
        timestamp: new Date(),
      });
    }
  });

  // Share progress with collaborators
  socket.on('collab:share-progress', (data) => {
    const { roomId, taskId, progress } = data;

    if (roomId) {
      socket.to(`collab:${roomId}`).emit('collab:progress-shared', {
        userId: socket.user.id,
        username: socket.user.username,
        taskId,
        progress,
        timestamp: new Date(),
      });
    }
  });

  // Send message to collaboration room
  socket.on('collab:message', (data) => {
    const { roomId, message } = data;

    if (roomId && message) {
      io.to(`collab:${roomId}`).emit('collab:message-received', {
        userId: socket.user.id,
        username: socket.user.username,
        message,
        timestamp: new Date(),
      });
    }
  });

  // Share hint usage
  socket.on('collab:hint-used', (data) => {
    const { roomId, taskId } = data;

    if (roomId) {
      socket.to(`collab:${roomId}`).emit('collab:hint-notification', {
        userId: socket.user.id,
        username: socket.user.username,
        taskId,
        timestamp: new Date(),
      });
    }
  });
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit leaderboard update
 */
export const emitLeaderboardUpdate = (type, id, data) => {
  if (!io) return;

  if (type === 'global') {
    io.to('leaderboard:global').emit('leaderboard:updated', data);
  } else if (type === 'level') {
    io.to(`leaderboard:level:${id}`).emit('leaderboard:updated', data);
  } else if (type === 'difficulty') {
    io.to(`leaderboard:difficulty:${id}`).emit('leaderboard:updated', data);
  }
};

/**
 * Emit progress update
 */
export const emitProgressUpdate = (userId, levelId, data) => {
  if (!io) return;

  // Emit to user's personal room
  io.to(`user:${userId}`).emit('progress:updated', data);

  // Emit to level subscribers
  io.to(`progress:level:${levelId}`).emit('progress:level-updated', {
    userId,
    ...data,
  });
};

/**
 * Emit answer submission event
 */
export const emitAnswerSubmitted = (userId, taskId, result) => {
  if (!io) return;

  io.to(`user:${userId}`).emit('answer:submitted', {
    taskId,
    ...result,
  });
};

/**
 * Emit level completion event
 */
export const emitLevelCompleted = (userId, levelId, result) => {
  if (!io) return;

  io.to(`user:${userId}`).emit('level:completed', {
    levelId,
    ...result,
  });

  // Also emit to leaderboard subscribers
  emitLeaderboardUpdate('global', null, { reason: 'level_completed' });
  emitLeaderboardUpdate('level', levelId, { reason: 'level_completed' });
};

/**
 * Emit admin notification
 */
export const emitAdminNotification = (message, data = {}) => {
  if (!io) return;

  io.to('role:ADMIN').emit('admin:notification', {
    message,
    data,
    timestamp: new Date(),
  });
};

export default { initializeSocket, getIO };
