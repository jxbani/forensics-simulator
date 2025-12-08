import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/database.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 *
 * Usage: app.get('/protected', authenticate, handler)
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Authorization header must be in format: Bearer <token>'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify and decode JWT token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    next();
  } catch (error) {
    if (error.message === 'Invalid or expired token') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't fail if not
 *
 * Usage: app.get('/optional-auth', optionalAuth, handler)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};
