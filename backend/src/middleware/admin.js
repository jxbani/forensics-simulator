/**
 * Admin authorization middleware
 * Ensures user has appropriate admin privileges
 */

/**
 * Require ADMIN or MODERATOR role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR') {
    return res.status(403).json({
      error: 'Admin access required',
      requiredRole: 'ADMIN or MODERATOR',
      currentRole: req.user.role || 'USER'
    });
  }

  next();
};

/**
 * Require ADMIN role only (more restrictive)
 */
export const requireAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Administrator access required',
      requiredRole: 'ADMIN',
      currentRole: req.user.role || 'USER'
    });
  }

  next();
};

/**
 * Check if user is admin (for conditional logic, doesn't block)
 */
export const isAdmin = (req) => {
  return req.user && (req.user.role === 'ADMIN' || req.user.role === 'MODERATOR');
};

/**
 * Check if user is admin only
 */
export const isAdminOnly = (req) => {
  return req.user && req.user.role === 'ADMIN';
};
