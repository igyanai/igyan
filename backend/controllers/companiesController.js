const Company = require('../models/company.model.js');

// Get all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({
      name: 1
    });
    res.json(companies);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

// Get a single company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }
    res.json(company);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

// Create a new company
exports.createCompany = async (req, res) => {
  const company = new Company(req.body);
  try {
    const newCompany = await company.save();
    res.status(201).json(newCompany);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};

// Update a company
exports.updateCompany = async (req, res) => {
  try {
    const updatedCompany = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!updatedCompany) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }
    res.json(updatedCompany);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};

// Delete a company
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }
    res.json({
      message: 'Company deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};
