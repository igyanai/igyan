const mongoose = require('mongoose');

const partnershipSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  companySize: {
    type: String,
    required: true,
    enum: ['Startup (1-50 employees)', 'SME (51-500 employees)', 'Large (500+ employees)']
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  partnershipType: {
    type: String,
    required: true,
    enum: ['Project-based Hiring', 'Internship Program', 'Talent Pipeline', 'Mentorship Program']
  },
  projectRequirements: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: String,
    trim: true
  },
  approvedAt: {
    type: Date
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Partnership', partnershipSchema);