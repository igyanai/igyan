const express = require('express');
const Review = require('../models/review');
const User = require('../models/userModel');
const Company = require('../models/company');
const Project = require('../models/project');
const Submission = require('../models/submission');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

// Submit review
router.post('/', auth, async (req, res) => {
  try {
    const {
      targetId,
      targetType,
      projectId,
      rating,
      comment
    } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Verify reviewer has worked on this project
    let canReview = false;
    let reviewerName = '';
    let reviewerId = '';
    let reviewerType = '';

    if (req.user.type === 'user') {
      // User reviewing company
      const submission = await Submission.findOne({
        projectId,
        userId: req.user.userId,
        status: 'accepted'
      });
      
      if (submission && targetType === 'company' && targetId === project.companyId.toString()) {
        canReview = true;
        const user = await User.findById(req.user.userId);
        reviewerName = user.name;
        reviewerId = user._id;
        reviewerType = 'user';
      }
    } else if (req.user.type === 'company') {
      // Company reviewing user
      const submission = await Submission.findOne({
        projectId,
        userId: targetId,
        status: 'accepted'
      });
      
      if (submission && targetType === 'user' && project.companyId.toString() === req.user.companyId) {
        canReview = true;
        const company = await Company.findById(req.user.companyId);
        reviewerName = company.companyName;
        reviewerId = company._id;
        reviewerType = 'company';
      }
    }

    if (!canReview) {
      return res.status(403).json({
        success: false,
        message: 'You can only review after completing a project together'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      reviewerId,
      targetId,
      projectId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this user/company for this project'
      });
    }

    // Create review
    const review = new Review({
      reviewerId,
      reviewerType,
      reviewerName,
      targetId,
      targetType,
      projectId,
      rating,
      comment,
      isVerified: true // Since we verified the relationship above
    });

    await review.save();

    // Update target's rating
    if (targetType === 'user') {
      const user = await User.findById(targetId);
      await user.updateRating();
    } else {
      const company = await Company.findById(targetId);
      await company.updateRating();
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ 
      targetId: userId, 
      targetType: 'user' 
    })
    .populate('projectId', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Review.countDocuments({ 
      targetId: userId, 
      targetType: 'user' 
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// Get reviews for a company
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ 
      targetId: companyId, 
      targetType: 'company' 
    })
    .populate('projectId', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Review.countDocuments({ 
      targetId: companyId, 
      targetType: 'company' 
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get company reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

module.exports = router;