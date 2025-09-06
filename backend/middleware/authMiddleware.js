const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Company = require('../models/company');
const { clearAuthCookies } = require('../utils/authUtils');

const auth = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    let user = null;

    if (decoded.userId) {
      // User token (learner or mentor)
      user = await User.findById(decoded.userId);
      if (user) {
        req.user = {
          id: user._id,
          type: 'user',
          userType: user.userType,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive
        };
      }
    } else if (decoded.companyId) {
      // Company token
      const company = await Company.findById(decoded.companyId);
      if (company) {
        req.user = {
          id: company._id,
          companyId: company._id,
          type: 'company',
          email: company.email,
          isEmailVerified: company.isEmailVerified,
          isApproved: company.isApproved,
          isActive: company.isActive
        };
        user = company;
      }
    }

    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isActive) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    if (req.user.type === 'company' && !user.isApproved) {
      if (!req.route.path.includes('approval-status') && !req.route.path.includes('logout')) {
        return res.status(403).json({
          success: false,
          message: 'Company account is pending approval'
        });
      }
    }

    if (req.cookies && req.cookies.refreshToken) {
      req.refreshToken = req.cookies.refreshToken;
    }

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Optional authentication middleware (doesn't require authentication)
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    let user = null;

    if (decoded.userId) {
      user = await User.findById(decoded.userId);
      if (user) {
        req.user = {
          id: user._id,
          type: 'user',
          userType: user.userType,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive
        };
      }
    } else if (decoded.companyId) {
      const company = await Company.findById(decoded.companyId);
      if (company) {
        req.user = {
          id: company._id,
          companyId: company._id,
          type: 'company',
          email: company.email,
          isEmailVerified: company.isEmailVerified,
          isApproved: company.isApproved,
          isActive: company.isActive
        };
        user = company;
      }
    }

    if (req.cookies && req.cookies.refreshToken) {
      req.refreshToken = req.cookies.refreshToken;
    }

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next();
    }

    console.error('Optional auth middleware error:', error);
    next();
  }
};

const authorize = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userType = req.user.type === 'company' ? 'company' : req.user.userType;
    
    if (!allowedTypes.includes(userType)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required'
    });
  }

  if (req.user.type === 'company' && !req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Company approval required'
    });
  }

  next();
};

module.exports = {
  auth,
  optionalAuth,
  authorize,
  requireVerification
};