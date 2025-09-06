const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String,
    required: true,
    trim: true
  },
  portfolio: {
    type: String,
    trim: true
  },
  github: {
    type: String,
    trim: true
  },
  submissionFile: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in-review'],
    default: 'pending'
  },
  companyFeedback: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  isSelected: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

submissionSchema.index({ projectId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);