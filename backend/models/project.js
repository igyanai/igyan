const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  budget: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  requirements: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    enum: ['Remote', 'On-site', 'Hybrid']
  },
  deadline: {
    type: Date,
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  companyLogo: {
    type: String,
    default: '🏢'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'in-progress', 'completed'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  applicants: {
    type: Number,
    default: 0
  },
  selectedSubmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  },
  maxSubmissions: {
    type: Number,
    default: 50
  }
}, {
  timestamps: true
});

// Index for search functionality
projectSchema.index({ 
  title: 'text', 
  description: 'text', 
  category: 'text',
  skills: 'text'
});

module.exports = mongoose.model('Project', projectSchema);