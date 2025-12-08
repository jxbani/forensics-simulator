// ============================================================================
// IMPORTS
// ============================================================================
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

// Route imports
import authRoutes from './routes/authRoutes.js';
import levelRoutes from './routes/levelRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import toolRoutes from './routes/toolRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';

// Middleware imports
import {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  adminLimiter,
} from './middleware/rateLimiter.js';

// Service imports
import { initializeSocket } from './config/socket.js';
import dockerService from './services/dockerService.js';
import fileService from './services/fileService.js';

// ============================================================================
// CONFIGURATION
// ============================================================================
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

/**
 * Configure allowed origins for CORS
 * Supports multiple origins via ALLOWED_ORIGINS environment variable
 * Format: ALLOWED_ORIGINS=http://localhost:5173,https://example.com
 */
const getAllowedOrigins = () => {
  // Check if multiple origins are specified
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }

  // Single origin from FRONTEND_URL
  if (process.env.FRONTEND_URL) {
    return [process.env.FRONTEND_URL];
  }

  // Development fallback
  if (NODE_ENV === 'development') {
    return ['http://localhost:5173', 'http://localhost:3000'];
  }

  // Production: No fallback, must be explicitly configured
  return [];
};

const allowedOrigins = getAllowedOrigins();

/**
 * CORS configuration with security best practices
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin && NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.length === 0) {
      // No origins configured in production - reject
      if (NODE_ENV === 'production') {
        console.warn('[SECURITY] No CORS origins configured in production mode');
        return callback(new Error('CORS not configured'), false);
      }
      // Development fallback
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`[SECURITY] Blocked CORS request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Security headers with Helmet
 * Protects against common web vulnerabilities
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for Socket.IO
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin requests
}));

// CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (required for rate limiting behind reverse proxy/load balancer)
app.set('trust proxy', 1);

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Request logging middleware (development only)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================================================
// API ROUTES (with specific rate limiters)
// ============================================================================

// Authentication routes - strict rate limiting to prevent brute force
app.use('/api/auth', authLimiter, authRoutes);

// File upload routes - moderate rate limiting to prevent abuse
app.use('/api/files', uploadLimiter, fileRoutes);

// Admin routes - strict rate limiting for sensitive operations
app.use('/api/admin', adminLimiter, adminRoutes);

// Other API routes use general rate limiter (applied globally above)
app.use('/api/levels', levelRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/evidence', evidenceRoutes);

// ============================================================================
// SYSTEM ENDPOINTS
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Forensics Simulator API is running',
    timestamp: new Date().toISOString(),
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Digital Forensics Training Simulator API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile (protected)',
        updatePassword: 'PUT /api/auth/password (protected)',
      },
      levels: {
        getAll: 'GET /api/levels',
        getById: 'GET /api/levels/:id',
        getTasks: 'GET /api/levels/:id/tasks',
      },
      progress: {
        getProgress: 'GET /api/progress (protected)',
        submitAnswer: 'POST /api/progress/submit (protected)',
        useHint: 'PUT /api/progress/hint (protected)',
        completeLevel: 'POST /api/progress/complete-level (protected)',
      },
      achievements: {
        getAll: 'GET /api/achievements (protected)',
        award: 'POST /api/achievements (protected)',
      },
      leaderboard: {
        global: 'GET /api/leaderboard',
        byLevel: 'GET /api/leaderboard/level/:levelId',
        byDifficulty: 'GET /api/leaderboard/difficulty/:difficulty',
      },
      files: {
        upload: 'POST /api/files/upload (protected)',
        getUserFiles: 'GET /api/files (protected)',
        getFile: 'GET /api/files/:fileId (protected)',
        download: 'GET /api/files/:fileId/download (protected)',
        delete: 'DELETE /api/files/:fileId (protected)',
        stats: 'GET /api/files/stats (protected)',
        evidenceUpload: 'POST /api/files/evidence/upload (protected)',
        evidenceList: 'GET /api/files/evidence/list (protected)',
        evidenceDelete: 'DELETE /api/files/evidence/:filename (protected)',
        evidenceDownload: 'GET /api/files/evidence/download/:filename (protected)',
        evidenceHash: 'GET /api/files/evidence/hash/:filename (protected)',
      },
      tools: {
        available: 'GET /api/tools/available (protected)',
        start: 'POST /api/tools/start (protected)',
        stop: 'POST /api/tools/stop/:dockerId (protected)',
        list: 'GET /api/tools/list (protected)',
        status: 'GET /api/tools/status/:dockerId (protected)',
      },
      admin: {
        users: 'GET /api/admin/users (admin)',
        userDetails: 'GET /api/admin/users/:userId (admin)',
        updateUserRole: 'PUT /api/admin/users/:userId/role (admin only)',
        deleteUser: 'DELETE /api/admin/users/:userId (admin only)',
        resetPassword: 'PUT /api/admin/users/:userId/password (admin only)',
        createLevel: 'POST /api/admin/levels (admin)',
        updateLevel: 'PUT /api/admin/levels/:levelId (admin)',
        deleteLevel: 'DELETE /api/admin/levels/:levelId (admin only)',
        createTask: 'POST /api/admin/levels/:levelId/tasks (admin)',
        updateTask: 'PUT /api/admin/tasks/:taskId (admin)',
        deleteTask: 'DELETE /api/admin/tasks/:taskId (admin only)',
        analytics: 'GET /api/admin/analytics (admin)',
        progress: 'GET /api/admin/progress (admin)',
        activity: 'GET /api/admin/activity (admin)',
      },
    },
    documentation: 'See API_DOCUMENTATION.md for detailed API documentation',
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// ============================================================================
// BACKGROUND SERVICES
// ============================================================================

/**
 * Check Docker availability on startup
 * Logs a warning if Docker is not available but does not prevent server startup
 */
async function checkDockerOnStartup() {
  try {
    await dockerService.checkDockerConnection();
  } catch (error) {
  }
}

/**
 * Initialize periodic cleanup jobs for Docker containers and old files
 * Runs every hour to maintain system health and free up resources
 */
function initializeCleanupJobs() {
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

  setInterval(async () => {
    try {
      // Clean up idle Docker containers (older than 2 hours)
      try {
        await dockerService.cleanupIdleContainers();
      } catch (error) {
        console.error('[Cleanup] Error cleaning up Docker containers:', error.message);
      }

      // Clean up old files (older than 7 days)
      try {
        await fileService.cleanupOldFiles();
      } catch (error) {
        console.error('[Cleanup] Error cleaning up old files:', error.message);
      }
    } catch (error) {
      console.error('[Cleanup] Unexpected error during cleanup:', error);
    }
  }, CLEANUP_INTERVAL);

  // Run initial cleanup on startup (after a short delay)
  setTimeout(async () => {
    try {
      await dockerService.cleanupIdleContainers();
      await fileService.cleanupOldFiles();
    } catch (error) {
      console.error('[Cleanup] Error during initial cleanup:', error.message);
    }
  }, 5000); // Wait 5 seconds after server start
}

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  Forensics Simulator API Server                       ║
║  Status: Running                                       ║
║  Port: ${PORT.toString().padEnd(48)}║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(42)}║
║  URL: http://localhost:${PORT.toString().padEnd(31)}║
║  WebSocket: Enabled                                    ║
╚════════════════════════════════════════════════════════╝
  `);

  // Check Docker availability
  checkDockerOnStartup();

  // Initialize cleanup jobs
  initializeCleanupJobs();
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});
