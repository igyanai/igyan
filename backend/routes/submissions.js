const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Submission = require('../models/submission');
const Project = require('../models/project');
const User = require('../models/userModel');
const Company = require('../models/company');
const { auth } = require('../middleware/authMiddleware');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/submissions';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `submission-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.zip', '.rar', '.7z', '.tar', '.gz'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only compressed files (.zip, .rar, .7z, .tar, .gz) are allowed'), false);
    }
  }
});

// Submit project application
router.post('/', auth, upload.single('submissionFile'), async (req, res) => {
  try {
    const {
      projectId,
      coverLetter,
      portfolio,
      github
    } = req.body;

    // Check if project exists and is active
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This project is no longer accepting submissions'
      });
    }

    // Check if user already submitted
    const existingSubmission = await Submission.findOne({
      projectId,
      userId: req.user.userId
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted to this project'
      });
    }

    // Get user details
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create submission
    const submissionData = {
      projectId,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      coverLetter,
      portfolio,
      github
    };

    // Add file info if uploaded
    if (req.file) {
      submissionData.submissionFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }

    const submission = new Submission(submissionData);
    await submission.save();

    // Update project applicant count
    project.applicants = (project.applicants || 0) + 1;
    await project.save();

    // Get company details for notification
    const company = await Company.findById(project.companyId);
    
    // Send notification email to company
    if (company) {
      await sendEmail({
        to: company.email,
        subject: `New Application for ${project.title}`,
        html: `
          <h2>New Project Application Received</h2>
          <p>Dear ${company.contactPerson},</p>
          <p>You have received a new application for your project "<strong>${project.title}</strong>".</p>
          
          <h3>Applicant Details:</h3>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>University:</strong> ${user.university}</p>
          <p><strong>Course:</strong> ${user.course}</p>
          <p><strong>Year:</strong> ${user.year}</p>
          
          ${portfolio ? `<p><strong>Portfolio:</strong> <a href="${portfolio}">${portfolio}</a></p>` : ''}
          ${github ? `<p><strong>GitHub:</strong> <a href="${github}">${github}</a></p>` : ''}
          
          <h3>Cover Letter:</h3>
          <p>${coverLetter}</p>
          
          <p>Please log in to your dashboard to review the application and download the submission file.</p>
          
          <p>Best regards,<br>I-GYAN Team</p>
        `
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      submission: {
        id: submission._id,
        status: submission.status,
        submittedAt: submission.createdAt
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
});

// Get submissions for a project (Company only)
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project belongs to company
    const project = await Project.findOne({
      _id: projectId,
      companyId: req.user.companyId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or unauthorized'
      });
    }

    const submissions = await Submission.find({ projectId })
      .populate('userId', 'name email university course year skills portfolio github linkedin bio avatar rating totalReviews')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
});

// Update submission status (Company only)
router.put('/:submissionId/status', auth, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, feedback, rating } = req.body;

    const submission = await Submission.findById(submissionId)
      .populate('projectId')
      .populate('userId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Verify project belongs to company
    if (submission.projectId.companyId.toString() !== req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Update submission
    submission.status = status;
    if (feedback) submission.companyFeedback = feedback;
    if (rating) submission.rating = rating;

    // If accepted, mark as selected and close project
    if (status === 'accepted') {
      submission.isSelected = true;
      
      // Update project status
      const project = await Project.findById(submission.projectId._id);
      project.status = 'in-progress';
      project.selectedSubmission = submission._id;
      await project.save();

      // Reject other submissions
      await Submission.updateMany(
        { 
          projectId: submission.projectId._id, 
          _id: { $ne: submission._id } 
        },
        { status: 'rejected' }
      );

      // Update user's completed projects count
      const user = await User.findById(submission.userId._id);
      user.projectsCompleted += 1;
      await user.save();
    }

    await submission.save();

    // Send notification email to user
    const statusMessages = {
      accepted: 'Congratulations! Your submission has been accepted.',
      rejected: 'Thank you for your submission. Unfortunately, it was not selected this time.',
      'in-review': 'Your submission is currently under review.'
    };

    await sendEmail({
      to: submission.userEmail,
      subject: `Submission Update - ${submission.projectId.title}`,
      html: `
        <h2>Submission Status Update</h2>
        <p>Dear ${submission.userName},</p>
        <p>${statusMessages[status]}</p>
        
        <h3>Project Details:</h3>
        <p><strong>Project:</strong> ${submission.projectId.title}</p>
        <p><strong>Company:</strong> ${submission.projectId.companyName}</p>
        <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
        
        ${feedback ? `<h3>Company Feedback:</h3><p>${feedback}</p>` : ''}
        ${rating ? `<p><strong>Rating:</strong> ${rating}/5 stars</p>` : ''}
        
        <p>Thank you for using I-GYAN!</p>
        <p>Best regards,<br>I-GYAN Team</p>
      `
    });

    res.json({
      success: true,
      message: 'Submission status updated successfully',
      submission
    });
  } catch (error) {
    console.error('Update submission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission status',
      error: error.message
    });
  }
});

// Download submission file (Company only)
router.get('/:submissionId/download', auth, async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
      .populate('projectId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Verify project belongs to company
    if (submission.projectId.companyId.toString() !== req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!submission.submissionFile || !submission.submissionFile.path) {
      return res.status(404).json({
        success: false,
        message: 'No file attached to this submission'
      });
    }

    const filePath = path.resolve(submission.submissionFile.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(filePath, submission.submissionFile.originalName);
  } catch (error) {
    console.error('Download submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download submission',
      error: error.message
    });
  }
});

// Get user's submissions
router.get('/user/my-submissions', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.userId })
      .populate('projectId', 'title companyName companyLogo status deadline')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
});

module.exports = router;