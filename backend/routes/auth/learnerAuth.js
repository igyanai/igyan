const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../../models/userModel');
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
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
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
  
  body('university')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('University name must be between 2 and 100 characters'),
  
  body('course')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Course name must be between 2 and 100 characters'),
  
  body('year')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('Year must be between 1 and 6'),
  
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

// Learner Registration
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

    const { name, email, password, university, course, year, skills, portfolio, github, linkedin, bio, agreedToTerms } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
        errors: [{ param: 'email', msg: 'This email is already registered' }]
      });
    }

    // Create learner
    const user = new User({
      name,
      email,
      password,
      userType: 'learner',
      university,
      course,
      year,
      skills: skills || [],
      portfolio,
      github,
      linkedin,
      bio,
      agreedToTerms
    });

    // Generate email verification token
    const emailVerificationToken = user.generateEmailVerificationToken();
    
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - I-GYAN.AI',
        template: 'emailVerification',
        context: {
          name: user.name,
          verificationUrl: `${process.env.BACKEND_URL}/api/auth/learner/verify-email/${emailVerificationToken}`
        }
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Learner registration successful! Please check your email to verify your account.',
    });

  } catch (error) {
    next(error);
  }
});

// Learner Login
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

    // Find learner and include password for comparison
    const user = await User.findOne({ email, userType: 'learner' }).select('+password +loginAttempts +lockUntil');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token
    await user.addRefreshToken(refreshToken);

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        university: user.university,
        course: user.course,
        year: user.year,
        skills: user.skills,
        portfolio: user.portfolio,
        github: user.github,
        linkedin: user.linkedin,
        bio: user.bio,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        rating: user.rating,
        totalReviews: user.totalReviews,
        projectsCompleted: user.projectsCompleted,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
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
    const user = await User.findOne({ email, userType: 'learner' });
    
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request - I-GYAN.AI',
        template: 'passwordReset',
        context: {
          name: user.name,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
        }
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
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

    const user = await User.findByPasswordResetToken(token);
    
    if (!user || user.userType !== 'learner') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = undefined;
    user.lockUntil = undefined;
    
    await user.save();

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

    const user = await User.findByEmailVerificationToken(token);
    
    if (!user || user.userType !== 'learner') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save();

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await user.addRefreshToken(refreshToken);
    
    setAuthCookies(res, accessToken, refreshToken);

    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?emailVerified=1&role=${user.userType}`);

  } catch (error) {
    next(error);
  }
});

// Resend verification email
router.post('/resend-verification', auth, async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id, userType: 'learner' });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Learner not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    const emailVerificationToken = user.generateEmailVerificationToken();
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - I-GYAN.AI',
        template: 'emailVerification',
        context: {
          name: user.name,
          verificationUrl: `${process.env.BACKEND_URL}/api/auth/learner/verify-email/${emailVerificationToken}`
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

    const user = await User.findOne({ _id: req.user.id, userType: 'learner' }).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Learner not found'
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change password for OAuth accounts'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully!'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;