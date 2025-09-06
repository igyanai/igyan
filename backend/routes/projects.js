const express = require('express');
const Project = require('../models/project');
const Company = require('../models/company');
const Submission = require('../models/submission');
const {auth } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all projects with filters
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, companyId, difficulty, location } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = { status: 'active' };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    if (companyId) {
      filter.companyId = companyId;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (location && location !== 'All') {
      filter.location = location;
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(filter)
      .populate('companyId', 'companyName logo verified rating')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
});

// Get project categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Project.distinct('category');
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Project.countDocuments({ category, status: 'active' });
        return { name: category, count };
      })
    );

    res.json({
      success: true,
      categories: categoriesWithCounts
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('companyId', 'companyName logo verified rating location industry website');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
});

// Create new project (Company only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      duration,
      budget,
      skills,
      requirements,
      location,
      deadline
    } = req.body;

    const company = await Company.findById(req.user.companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const project = new Project({
      title,
      description,
      category,
      difficulty,
      duration,
      budget,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
      requirements,
      location,
      deadline: new Date(deadline),
      companyId: company._id,
      companyName: company.companyName,
      companyLogo: company.logo
    });

    await project.save();

    // Update company's project count
    company.projectsPosted += 1;
    await company.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// Update project (Company only)
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      companyId: req.user.companyId 
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or unauthorized'
      });
    }

    const {
      title,
      description,
      category,
      difficulty,
      duration,
      budget,
      skills,
      requirements,
      location,
      deadline,
      status
    } = req.body;

    // Update project fields
    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (difficulty) project.difficulty = difficulty;
    if (duration) project.duration = duration;
    if (budget) project.budget = budget;
    if (skills) project.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (requirements) project.requirements = requirements;
    if (location) project.location = location;
    if (deadline) project.deadline = new Date(deadline);
    if (status) project.status = status;

    await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// Delete project (Company only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      companyId: req.user.companyId 
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or unauthorized'
      });
    }

    // Delete associated submissions
    await Submission.deleteMany({ projectId: project._id });

    // Delete project
    await Project.findByIdAndDelete(project._id);

    // Update company's project count
    const company = await Company.findById(req.user.companyId);
    if (company.projectsPosted > 0) {
      company.projectsPosted -= 1;
      await company.save();
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

// Get company's projects
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const projects = await Project.find({ companyId })
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