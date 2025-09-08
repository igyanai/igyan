const Project = require('../models/project.model.js');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

// Create a new project
exports.createProject = async (req, res) => {
  const project = new Project(req.body);
  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!updatedProject) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }
    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }
    res.json({
      message: 'Project deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};
