const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
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
  location: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  companySize: {
    type: String,
    required: true,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    default: '🏢'
  },
  verified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  projectsPosted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

companySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

companySchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

companySchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ companyId: this._id });
  
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRating / reviews.length;
    this.totalReviews = reviews.length;
  } else {
    this.rating = 0;
    this.totalReviews = 0;
  }
  
  await this.save();
};

module.exports = mongoose.model('Company', companySchema);