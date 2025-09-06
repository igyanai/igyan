const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Company = require('../../models/company');
const { auth, optionalAuth } = require('../../middleware/authMiddleware');
const { sendEmail } = require('../../utils/email');
const { setAuthCookies, clearAuthCookies } = require('../../utils/authUtils');

const router = express.Router();

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 3, 
  message: 'Too many attempts, please try again later.',
  skipSuccessfulRequests: true,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  message: 'Too many password reset requests, please try again later.',
});

const registerValidation = [
  body('companyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('contactPerson')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Contact person name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  body('industry')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Industry must be between 2 and 50 characters'),
  
  body('companySize')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Invalid company size'),
  
  body('agreedToTerms')
    .isBoolean()
    .custom(value => value === true)
    .withMessage('You must agree to the terms and conditions')
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Company Registration
router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      companyName, 
      email, 
      password, 
      contactPerson, 
      phone, 
      website, 
      location, 
      industry, 
      companySize, 
      description,
      agreedToTerms 
    } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
        errors: [{ param: 'email', msg: 'This email is already registered' }]
      });
    }

    // Create company
    const company = new Company({
      companyName,
      email,
      password,
      contactPerson,
      phone,
      website,
      location,
      industry,
      companySize,
      description,
      agreedToTerms,
      isApproved: false 
    });

    const emailVerificationToken = company.generateEmailVerificationToken();
    
    await company.save();

    try {
      await sendEmail({
        to: company.email,
        subject: 'Verify Your Company Email - I-GYAN.AI',
        template: 'companyEmailVerification',
        context: {
          companyName: company.companyName,
          contactPerson: company.contactPerson,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`
        }
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    // Notify admin about new company registration
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: 'New Company Registration - Approval Required',
        template: 'companyApprovalNotification',
        context: {
          companyName: company.companyName,
          contactPerson: company.contactPerson,
          email: company.email,
          approvalUrl: `${process.env.ADMIN_URL}/approve-company/${company._id}`
        }
      });
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Company registration successful! Please check your email to verify your account. Your registration is pending admin approval.',
      company: {
        id: company._id,
        companyName: company.companyName,
        email: company.email,
        contactPerson: company.contactPerson,
        phone: company.phone,
        website: company.website,
        location: company.location,
        industry: company.industry,
        companySize: company.companySize,
        description: company.description,
        isEmailVerified: company.isEmailVerified,
        isApproved: company.isApproved
      }
    });

  } catch (error) {
    next(error);
  }
});

// Company Login
router.post('/login', loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const company = await Company.findOne({ email }).select('+password +loginAttempts +lockUntil');
    
    if (!company) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if company is approved
    if (!company.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your company account is pending approval. Please wait for admin confirmation.'
      });
    }

    // Check if account is locked
    if (company.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check password
    const isMatch = await company.comparePassword(password);
    
    if (!isMatch) {
      await company.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!company.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Reset login attempts on successful login
    if (company.loginAttempts > 0) {
      await company.resetLoginAttempts();
    }

    // Update last login
    company.lastLogin = new Date();
    await company.save();

    // Generate tokens
    const accessToken = company.generateAccessToken();
    const refreshToken = company.generateRefreshToken();

    // Store refresh token
    await company.addRefreshToken(refreshToken);

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      message: 'Login successful!',
      company: {
        id: company._id,
        companyName: company.companyName,
        email: company.email,
        contactPerson: company.contactPerson,
        phone: company.phone,
        website: company.website,
        location: company.location,
        industry: company.industry,
        companySize: company.companySize,
        description: company.description,
        logo: company.logo,
        verified: company.verified,
        rating: company.rating,
        totalReviews: company.totalReviews,
        projectsPosted: company.projectsPosted,
        isEmailVerified: company.isEmailVerified,
        isApproved: company.isApproved,
        lastLogin: company.lastLogin
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get company profile
router.get('/me', auth, async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.companyId || req.user.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      company: {
        id: company._id,
        companyName: company.companyName,
        email: company.email,
        contactPerson: company.contactPerson,
        phone: company.phone,
        website: company.website,
        location: company.location,
        industry: company.industry,
        companySize: company.companySize,
        description: company.description,
        logo: company.logo,
        verified: company.verified,
        rating: company.rating,
        totalReviews: company.totalReviews,
        projectsPosted: company.projectsPosted,
        isEmailVerified: company.isEmailVerified,
        isApproved: company.isApproved,
        lastLogin: company.lastLogin,
        createdAt: company.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', optionalAuth, async (req, res, next) => {
  try {
    if (req.user && req.refreshToken) {
      const company = await Company.findById(req.user.companyId || req.user.id);
      if (company) {
        await company.removeRefreshToken(req.refreshToken);
      }
    }

    clearAuthCookies(res);

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret');
    
    const company = await Company.findById(decoded.companyId || decoded.id);
    if (!company) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Company not found'
      });
    }

    const tokenExists = company.refreshTokens.some(rt => rt.token === refreshToken);
    if (!tokenExists) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const newAccessToken = company.generateAccessToken();
    const newRefreshToken = company.generateRefreshToken();

    await company.removeRefreshToken(refreshToken);
    await company.addRefreshToken(newRefreshToken);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    next(error);
  }
});

// Forgot password
router.post('/forgot-password', forgotPasswordLimiter, [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const company = await Company.findOne({ email });
    
    if (!company) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const resetToken = company.generatePasswordResetToken();
    await company.save();

    try {
      await sendEmail({
        to: company.email,
        subject: 'Password Reset Request - I-GYAN.AI',
        template: 'passwordReset',
        context: {
          name: company.contactPerson,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
        }
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      company.passwordResetToken = undefined;
      company.passwordResetExpires = undefined;
      await company.save();
      
      return res.status(500).json({
        success: false,
        message: 'Error sending password reset email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    next(error);
  }
});

// Reset password
router.put('/reset-password/:token', strictAuthLimiter, [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token } = req.params;
    const { password } = req.body;

    const company = await Company.findByPasswordResetToken(token);
    
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    company.password = password;
    company.passwordResetToken = undefined;
    company.passwordResetExpires = undefined;
    company.loginAttempts = undefined;
    company.lockUntil = undefined;
    
    await company.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });

  } catch (error) {
    next(error);
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    const company = await Company.findByEmailVerificationToken(token);
    
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification token'
      });
    }

    company.isEmailVerified = true;
    company.emailVerificationToken = undefined;
    company.emailVerificationExpires = undefined;
    
    await company.save();

    res.json({
      success: true,
      message: 'Email verified successfully! Your account is pending admin approval.',
      company: {
        id: company._id,
        companyName: company.companyName,
        email: company.email,
        contactPerson: company.contactPerson,
        isEmailVerified: company.isEmailVerified,
        isApproved: company.isApproved
      }
    });

  } catch (error) {
    next(error);
  }
});

// Resend verification email
router.post('/resend-verification', auth, async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.companyId || req.user.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    if (company.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    const emailVerificationToken = company.generateEmailVerificationToken();
    await company.save();

    try {
      await sendEmail({
        to: company.email,
        subject: 'Verify Your Company Email - I-GYAN.AI',
        template: 'companyEmailVerification',
        context: {
          companyName: company.companyName,
          contactPerson: company.contactPerson,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`
        }
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Error sending verification email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully!'
    });

  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const company = await Company.findById(req.user.companyId || req.user.id).select('+password');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    if (!company.password) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change password for OAuth accounts'
      });
    }

    const isMatch = await company.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    company.password = newPassword;
    await company.save();

    res.json({
      success: true,
      message: 'Password changed successfully!'
    });

  } catch (error) {
    next(error);
  }
});

// Check approval status
router.get('/approval-status', auth, async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.companyId || req.user.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      isApproved: company.isApproved,
      isEmailVerified: company.isEmailVerified,
      message: company.isApproved ? 'Company is approved' : 'Company approval is pending'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;