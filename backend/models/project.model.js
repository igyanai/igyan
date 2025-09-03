const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  description: String,
  category: {
    type: String,
    required: true,
  },
  difficulty: String,
  duration: String,
  budget: String,
  skills: [String],
  applicants: {
    type: Number,
    default: 0
  },
  deadline: Date,
  location: String,
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  requirements: String,
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
