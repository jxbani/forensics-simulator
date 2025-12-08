import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware for Production-Grade Security
 *
 * Implements configurable rate limiting to protect against:
 * - Brute force attacks (especially on auth endpoints)
 * - API abuse and excessive requests
 * - DDoS attacks
 *
 * Configuration is environment-based for flexibility across deployments
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Parse rate limit window from environment variable
 * Default: 15 minutes
 */
const getRateLimitWindow = () => {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10);
  return isNaN(windowMs) ? 15 * 60 * 1000 : windowMs;
};

/**
 * Get max requests for general API
 * Default: 100 requests per window
 */
const getGeneralMaxRequests = () => {
  const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10);
  return isNaN(max) ? 100 : max;
};

/**
 * Get max requests for auth endpoints
 * Default: 5 requests per window (stricter for security)
 */
const getAuthMaxRequests = () => {
  const max = parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10);
  return isNaN(max) ? 5 : max;
};

/**
 * Get max requests for file upload endpoints
 * Default: 10 requests per window (moderate limit)
 */
const getUploadMaxRequests = () => {
  const max = parseInt(process.env.RATE_LIMIT_UPLOAD_MAX, 10);
  return isNaN(max) ? 10 : max;
};

// ============================================================================
// RATE LIMIT HANDLERS
// ============================================================================

/**
 * Custom message handler for rate limit exceeded
 */
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: req.rateLimit.resetTime,
  });
};

/**
 * Skip function to exclude health check and monitoring endpoints
 */
const skipHealthCheck = (req) => {
  // Skip rate limiting for health check endpoints
  return req.path === '/health' || req.path === '/api';
};

// ============================================================================
// RATE LIMITERS
// ============================================================================

/**
 * General API rate limiter
 * Applied to all API routes except those with specific limiters
 */
export const generalLimiter = rateLimit({
  windowMs: getRateLimitWindow(),
  max: getGeneralMaxRequests(),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: rateLimitHandler,
  skip: skipHealthCheck,
  // Use IP address as key
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Protects against brute force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: getRateLimitWindow(),
  max: getAuthMaxRequests(),
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: `Maximum ${getAuthMaxRequests()} attempts allowed per ${getRateLimitWindow() / 60000} minutes. Please try again later.`,
      retryAfter: req.rateLimit.resetTime,
    });
  },
  // Use IP address as key
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
});

/**
 * Moderate rate limiter for file upload endpoints
 * Prevents excessive file uploads while allowing legitimate use
 */
export const uploadLimiter = rateLimit({
  windowMs: getRateLimitWindow(),
  max: getUploadMaxRequests(),
  message: 'Too many file uploads. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Upload rate limit exceeded',
      message: `Maximum ${getUploadMaxRequests()} file uploads allowed per ${getRateLimitWindow() / 60000} minutes. Please try again later.`,
      retryAfter: req.rateLimit.resetTime,
    });
  },
  // Use IP address as key
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
});

/**
 * Very strict rate limiter for admin endpoints
 * Extra protection for sensitive administrative operations
 */
export const adminLimiter = rateLimit({
  windowMs: getRateLimitWindow(),
  max: 30, // Lower limit for admin operations
  message: 'Too many admin requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Admin rate limit exceeded',
      message: 'Too many administrative requests. Please try again later.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
  // Use IP address as key
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  adminLimiter,
};
