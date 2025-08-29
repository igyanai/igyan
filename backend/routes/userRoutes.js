const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/userModel');
const { auth } = require('../middleware/authMiddleware');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  
  body('website')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL with http:// or https://'),
  
  body('experience')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Experience must be one of: beginner, intermediate, advanced, expert'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  
  body('interests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be between 1 and 50 characters'),
  
  body('social.linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),
  
  body('social.twitter')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid Twitter URL'),
  
  body('social.github')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid GitHub URL'),
];

router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        interests: user.interests,
        location: user.location,
        website: user.website,
        social: user.social,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    next(error);
  }
});

router.put('/profile', auth, profileUpdateValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Extract allowed fields for update
    const allowedUpdates = [
      'name', 'bio', 'skills', 'experience', 'interests', 
      'location', 'website', 'social'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update user with new data
    Object.keys(updates).forEach(key => {
      user[key] = updates[key];
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        interests: user.interests,
        location: user.location,
        website: user.website,
        social: user.social,
        preferences: user.preferences,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    next(error);
  }
});

router.post('/avatar', auth, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      try {
        await deleteFromCloudinary(user.avatar);
      } catch (deleteError) {
        console.error('Error deleting old avatar:', deleteError);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new avatar to Cloudinary
    const avatarUrl = await uploadToCloudinary(req.file.buffer, {
      folder: 'avatars',
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    // Update user avatar
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully!',
      avatar: avatarUrl
    });

  } catch (error) {
    next(error);
  }
});

router.delete('/avatar', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.avatar) {
      return res.status(400).json({
        success: false,
        message: 'No avatar to remove'
      });
    }

    // Delete avatar from Cloudinary
    try {
      await deleteFromCloudinary(user.avatar);
    } catch (deleteError) {
      console.error('Error deleting avatar:', deleteError);
      
    }

    // Remove avatar from user
    user.avatar = null;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar removed successfully!'
    });

  } catch (error) {
    next(error);
  }
});

router.put('/preferences', auth, [
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be a boolean'),
  
  body('notifications.marketing')
    .optional()
    .isBoolean()
    .withMessage('Marketing notification preference must be a boolean'),
  
  body('privacy.profileVisibility')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Profile visibility must be either public or private')
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

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (req.body.notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...req.body.notifications
      };
    }

    if (req.body.privacy) {
      user.preferences.privacy = {
        ...user.preferences.privacy,
        ...req.body.privacy
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully!',
      preferences: user.preferences
    });

  } catch (error) {
    next(error);
  }
});

router.get('/stats', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate account age
    const accountAge = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
    
    // Get profile completion percentage
    const profileFields = ['name', 'bio', 'skills', 'experience', 'interests', 'location', 'avatar'];
    const completedFields = profileFields.filter(field => {
      const value = user[field];
      return value && (Array.isArray(value) ? value.length > 0 : value.trim().length > 0);
    });
    
    const profileCompletion = Math.round((completedFields.length / profileFields.length) * 100);

    res.json({
      success: true,
      stats: {
        accountAge,
        profileCompletion,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        memberSince: user.createdAt,
        totalSkills: user.skills ? user.skills.length : 0,
        totalInterests: user.interests ? user.interests.length : 0
      }
    });

  } catch (error) {
    next(error);
  }
});

router.post('/deactivate', auth, [
  body('password')
    .notEmpty()
    .withMessage('Password is required to deactivate account'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
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

    const { password, reason } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password for non-OAuth users
    if (user.password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }

    // Deactivate account
    user.isActive = false;
    
    // Clear all refresh tokens
    user.refreshTokens = [];
    
    // Log deactivation reason if provided
    if (reason) {
      // You might want to save this to a separate collection for analytics
      console.log(`Account deactivated - User: ${user.email}, Reason: ${reason}`);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    next(error);
  }
});

router.get('/public/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is public
    if (user.preferences.privacy.profileVisibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    // Return only public information
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        userType: user.userType,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        interests: user.interests,
        location: user.location,
        website: user.website,
        social: user.social,
        memberSince: user.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;