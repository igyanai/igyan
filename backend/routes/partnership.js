const express = require('express');
const Partnership = require('../models/partnership');
const Company = require('../models/company');
const { sendEmail } = require('../utils/email');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();
const jwt = require('jsonwebtoken');

// Submit partnership request
router.post('/request', async (req, res) => {
  try {
    const {
      companyName,
      contactEmail,
      contactPerson,
      phone,
      website,
      companySize,
      industry,
      partnershipType,
      projectRequirements,
      location,
      description
    } = req.body;

    // Check if partnership request already exists
    const existingRequest = await Partnership.findOne({ contactEmail });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Partnership request already exists for this email'
      });
    }

    // Create partnership request
    const partnership = new Partnership({
      companyName,
      contactEmail,
      contactPerson,
      phone,
      website,
      companySize,
      industry,
      partnershipType,
      projectRequirements,
      location,
      description
    });

    await partnership.save();
    const token = jwt.sign(
      { id: partnership._id },
      process.env.PARTNERSHIP_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const approvalLink = `${process.env.FRONTEND_URL}/partnership/approve?token=${token}`;
    const rejectionLink = `${process.env.FRONTEND_URL}/partnership/reject?token=${token}`;


    // Send notification email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@igyan.com',
      subject: 'New Partnership Request',
      html: `
            <h2>New Partnership Request</h2>
    <p><strong>Company Name:</strong> ${companyName}</p>
    <p><strong>Contact Email:</strong> ${contactEmail}</p>
    <p><strong>Contact Person:</strong> ${contactPerson}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Website:</strong> ${website || 'N/A'}</p>
    <p><strong>Location:</strong> ${location}</p>
    <p><strong>Company Size:</strong> ${companySize}</p>
    <p><strong>Industry:</strong> ${industry}</p>
    <p><strong>Partnership Type:</strong> ${partnershipType}</p>
    <p><strong>Project Requirements:</strong><br>${projectRequirements}</p>
    <p><strong>Description:</strong><br>${description || 'N/A'}</p>
    <p>
      <a href="${approvalLink}" style="padding: 10px 20px; background-color: green; color: white; text-decoration: none;">Approve</a>
      &nbsp;
      <a href="${rejectionLink}" style="padding: 10px 20px; background-color: red; color: white; text-decoration: none;">Reject</a>
    </p>
    <p>Please review and approve/reject this request in the admin panel.</p>
      `
    });

    // Send confirmation email to company
    await sendEmail({
      to: contactEmail,
      subject: 'Partnership Request Received - I-GYAN',
      html: `
        <h2>Thank you for your partnership request!</h2>
        <p>Dear ${contactPerson},</p>
        <p>We have received your partnership request for ${companyName}. Our team will review your application and get back to you within 2-3 business days.</p>
        <p>We appreciate your interest in partnering with I-GYAN!</p>
        <p>Best regards,<br>I-GYAN Team</p>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Partnership request submitted successfully. You will receive a confirmation email shortly.',
      partnership: {
        id: partnership._id,
        companyName: partnership.companyName,
        status: partnership.status
      }
    });
  } catch (error) {
    console.error('Partnership request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit partnership request',
      error: error.message
    });
  }
});

// Admin: Get all partnership requests
router.get('/admin/requests', auth, async (req, res) => {
  try {
    const partnerships = await Partnership.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      partnerships
    });
  } catch (error) {
    console.error('Get partnerships error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partnership requests',
      error: error.message
    });
  }
});

// Admin: Approve partnership request
router.post('/admin/approve/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, tempPassword } = req.body;

    const partnership = await Partnership.findById(id);
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: 'Partnership request not found'
      });
    }

    // Create company account
    const company = new Company({
      companyName: partnership.companyName,
      email: partnership.contactEmail,
      password: tempPassword || 'TempPass123!',
      contactPerson: partnership.contactPerson,
      phone: partnership.phone,
      website: partnership.website,
      location: partnership.location,
      industry: partnership.industry,
      companySize: partnership.companySize,
      description: partnership.description || `${partnership.companyName} - ${partnership.industry} company`,
      isApproved: true,
      verified: true
    });

    await company.save();

    // Update partnership status
    partnership.status = 'approved';
    partnership.adminNotes = adminNotes;
    partnership.approvedBy = req.user.adminName || 'Admin';
    partnership.approvedAt = new Date();
    partnership.companyId = company._id;
    await partnership.save();

    // Send approval email to company
    await sendEmail({
      to: partnership.contactEmail,
      subject: 'Partnership Approved - Welcome to I-GYAN!',
      html: `
        <h2>Congratulations! Your partnership has been approved!</h2>
        <p>Dear ${partnership.contactPerson},</p>
        <p>We're excited to welcome ${partnership.companyName} to the I-GYAN platform!</p>
        
        <h3>Your Company Account Details:</h3>
        <p><strong>Email:</strong> ${partnership.contactEmail}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword || 'TempPass123!'}</p>
        
        <p><strong>Important:</strong> Please log in and change your password immediately for security.</p>
        
        <p>You can now:</p>
        <ul>
          <li>Post projects and find talented students</li>
          <li>Manage applications and submissions</li>
          <li>Build your company profile</li>
          <li>Connect with our community</li>
        </ul>
        
        <p>Welcome aboard!</p>
        <p>Best regards,<br>I-GYAN Team</p>
      `
    });

    res.json({
      success: true,
      message: 'Partnership approved and company account created',
      company: {
        id: company._id,
        companyName: company.companyName,
        email: company.email
      }
    });
  } catch (error) {
    console.error('Partnership approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve partnership',
      error: error.message
    });
  }
});

// Admin: Reject partnership request
router.post('/admin/reject/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, rejectionReason } = req.body;

    const partnership = await Partnership.findById(id);
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: 'Partnership request not found'
      });
    }

    // Update partnership status
    partnership.status = 'rejected';
    partnership.adminNotes = adminNotes;
    await partnership.save();

    // Send rejection email to company
    await sendEmail({
      to: partnership.contactEmail,
      subject: 'Partnership Request Update - I-GYAN',
      html: `
        <h2>Partnership Request Update</h2>
        <p>Dear ${partnership.contactPerson},</p>
        <p>Thank you for your interest in partnering with I-GYAN.</p>
        <p>After careful review, we are unable to approve your partnership request at this time.</p>
        ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
        <p>We encourage you to reapply in the future as your company grows and evolves.</p>
        <p>Best regards,<br>I-GYAN Team</p>
      `
    });

    res.json({
      success: true,
      message: 'Partnership request rejected'
    });
  } catch (error) {
    console.error('Partnership rejection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject partnership',
      error: error.message
    });
  }
});

module.exports = router;