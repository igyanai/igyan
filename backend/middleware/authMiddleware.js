const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const auth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
 
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      req.user = {
        id: user._id,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified
      };

      req.refreshToken = req.cookies?.refreshToken;

      next();

    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
          expired: true
        });
      }

      if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid access token'
        });
      }

      throw tokenError;
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      // No token provided, but that's okay for optional auth
      req.refreshToken = req.cookies?.refreshToken;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive) {
        req.user = {
          id: user._id,
          email: user.email,
          userType: user.userType,
          isEmailVerified: user.isEmailVerified
        };
      }

      req.refreshToken = req.cookies?.refreshToken;
      next();

    } catch (tokenError) {
      // Token invalid or expired, but continue anyway for optional auth
      req.refreshToken = req.cookies?.refreshToken;
      next();
    }

  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); 
  }
};

// Middleware to check if email is verified
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required to access this resource',
      needsEmailVerification: true
    });
  }

  next();
};

// Middleware to check user type
const requireUserType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userTypes = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];
    
    if (!userTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required user type: ${userTypes.join(' or ')}`
      });
    }

    next();
  };
};

const authWithEmailVerification = [auth, requireEmailVerification];

const authWithUserType = (allowedTypes) => [auth, requireUserType(allowedTypes)];

const authWithEmailAndUserType = (allowedTypes) => [
  auth, 
  requireEmailVerification, 
  requireUserType(allowedTypes)
];

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.userType !== 'admin' && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

const attempts = new Map();
const createUserRateLimit = (windowMs, max) => {

  return (req, res, next) => {
    if (!req.user) {
      return next(); 
    }

    const userId = req.user.id;
    const now = Date.now();
    const userAttempts = attempts.get(userId) || [];

    // Remove expired attempts
    const validAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);

    if (validAttempts.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }

    // Add current attempt
    validAttempts.push(now);
    attempts.set(userId, validAttempts);

    next();
  };
};

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  
  for (const [userId, timestamps] of attempts.entries()) {
    const validTimestamps = timestamps.filter(timestamp => now - timestamp < 15 * 60 * 1000);
    if (validTimestamps.length > 0) {
      attempts.set(userId, validTimestamps);
    } else {
      attempts.delete(userId);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

module.exports = {
  auth,
  optionalAuth,
  requireEmailVerification,
  requireUserType,
  authWithEmailVerification,
  authWithUserType,
  authWithEmailAndUserType,
  requireAdmin,
  createUserRateLimit
};