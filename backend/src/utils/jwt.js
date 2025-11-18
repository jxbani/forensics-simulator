import jwt from 'jsonwebtoken';

// ============================================================================
// JWT CONFIGURATION
// ============================================================================

/**
 * Get JWT secret from environment
 * IMPORTANT: JWT_SECRET must be set in production!
 * The fallback is only for development convenience
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  // In production, JWT_SECRET must be explicitly set
  if (process.env.NODE_ENV === 'production' && (!secret || secret === 'your-secret-key-change-in-production')) {
    console.error('[CRITICAL SECURITY ERROR] JWT_SECRET not properly configured in production!');
    console.error('Please set a strong, random JWT_SECRET in your environment variables.');
    throw new Error('JWT_SECRET must be configured in production');
  }

  // Development fallback with warning
  if (!secret || secret === 'your-secret-key-change-in-production') {
    console.warn('[WARNING] Using default JWT_SECRET. This is ONLY acceptable in development!');
    return 'your-secret-key-change-in-production';
  }

  return secret;
};

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ============================================================================
// JWT FUNCTIONS
// ============================================================================

/**
 * Generate JWT token for user authentication
 * @param {Object} payload - Data to encode in the token (user ID, role, etc.)
 * @returns {String} JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify and decode JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
