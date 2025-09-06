const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reviewerType: {
    type: String,
    enum: ['user', 'company'],
    required: true
  },
  reviewerName: {
    type: String,
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    enum: ['user', 'company'],
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

reviewSchema.index({ 
  reviewerId: 1, 
  targetId: 1, 
  projectId: 1 
}, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);