const express = require('express');
const Company = require('../models/company');
const Project = require('../models/project');
const Review = require('../models/review');

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const { search, industry, location, verified } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let filter = { isApproved: true };
    
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (industry && industry !== 'All') {
      filter.industry = industry;
    }
    
    if (location && location !== 'All') {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (verified === 'true') {
      filter.verified = true;
    }

    const companies = await Company.find(filter)
      .select('-password')
      .sort({ verified: -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add project counts
    const companiesWithCounts = await Promise.all(
      companies.map(async (company) => {
        const projectsCount = await Project.countDocuments({ 
          companyId: company._id, 
          status: { $in: ['active', 'in-progress', 'completed'] }
        });
        
        return {
          ...company.toObject(),
          projectsCount
        };
      })
    );

    const total = await Company.countDocuments(filter);

    res.json({
      success: true,
      companies: companiesWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
});

// Get single company
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findOne({ 
      _id: req.params.id, 
      isApproved: true 
    }).select('-password');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get company's projects
    const projects = await Project.find({ 
      companyId: company._id 
    }).sort({ createdAt: -1 });

    // Get company's reviews
    const reviews = await Review.find({ 
      targetId: company._id, 
      targetType: 'company' 
    })
    .populate('projectId', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      success: true,
      company: {
        ...company.toObject(),
        projectsCount: projects.length,
        projects,
        reviews
      }
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company',
      error: error.message
    });
  }
});

// Get company's projects
router.get('/:id/projects', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, category } = req.query;

    let filter = { companyId: id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (category && category !== 'All') {
      filter.category = category;
    }

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Get company projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company projects',
      error: error.message
    });
  }
});

module.exports = router;