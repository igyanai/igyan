const express = require('express');
const learnerRoutes = require('./learnerAuth');
const mentorRoutes = require('./mentorAuth');
const companyRoutes = require('./companyAuth');
const passport = require('passport');
const User = require('../../models/userModel');
const { setAuthCookies } = require('../../utils/authUtils');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.use('/learner', learnerRoutes);
router.use('/mentor', mentorRoutes);
router.use('/company', companyRoutes);

router.get('/me', async (req, res, next) => {
  try {
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No access token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');

    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
      rating: user.rating,
      totalReviews: user.totalReviews,
      projectsCompleted: user.projectsCompleted,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    if (user.userType === 'learner') {
      Object.assign(userData, {
        university: user.university,
        course: user.course,
        year: user.year,
        skills: user.skills,
        portfolio: user.portfolio,
        github: user.github,
        linkedin: user.linkedin,
        bio: user.bio
      });
    } else if (user.userType === 'mentor') {
      Object.assign(userData, {
        experience: user.experience,
        expertise: user.expertise,
        bio: user.bio,
        portfolio: user.portfolio,
        github: user.github,
        linkedin: user.linkedin,
        website: user.website
      });
    }

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        expired: true
      });
    }
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret');
    
    const User = require('../../models/userModel');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      const { clearAuthCookies } = require('../../utils/authUtils');
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    if (!tokenExists) {
      const { clearAuthCookies } = require('../../utils/authUtils');
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);

    const { setAuthCookies } = require('../../utils/authUtils');
    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      const { clearAuthCookies } = require('../../utils/authUtils');
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (refreshToken) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret');
        
        const User = require('../../models/userModel');
        const user = await User.findById(decoded.id);
        if (user) {
          await user.removeRefreshToken(refreshToken);
        }
      } catch (error) {
        console.error('Error removing refresh token:', error);
      }
    }

    const { clearAuthCookies } = require('../../utils/authUtils');
    clearAuthCookies(res);

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    next(error);
  }
});

// Google login
router.get('/google',
  (req, res, next) => {
    const role = req.query.role || 'learner'; 
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: role
    })(req, res, next);
  }
);

// Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      
      const role = req.query.state || req.authInfo?.state || 'learner';
      console.log('[OAUTH CALLBACK] Processing role:', role);
      
      let user = req.user;

      if (!user || user.userType !== role) {
        const existingUser = await User.findOne({ email: req.user.email });

        if (existingUser && existingUser.userType !== role) {
          console.log('[OAUTH CALLBACK] Role mismatch - existing:', existingUser.userType, 'requested:', role);
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=account_type_mismatch`);
        }

        if (!existingUser) {
          console.log('[OAUTH CALLBACK] Creating new user with role:', role);
          user = new User({
            name: req.user.name,
            email: req.user.email,
            userType: role,
            isEmailVerified: true,
            avatar: req.user.avatar
          });
          await user.save();
        } else {
          console.log('[OAUTH CALLBACK] Using existing user:', existingUser.userType);
          user = existingUser;
        }
      }

      // Generate tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      await user.addRefreshToken(refreshToken);

      user.lastLogin = new Date();
      await user.save();

      // Set cookies
      setAuthCookies(res, accessToken, refreshToken);

      console.log('[OAUTH CALLBACK] Redirecting with role:', role, 'user type:', user.userType);
      res.redirect(`${process.env.FRONTEND_URL}/?googleAuth=success&role=${user.userType}`);

    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
    }
  }
);

module.exports = router;
