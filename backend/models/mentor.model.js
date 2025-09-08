// This file defines the Mongoose schema for a Mentor.
const mongoose = require('mongoose');

// The schema describes the fields and data types for each mentor document.
const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A mentor must have a name'],
    trim: true,
  },
  expertise: {
    type: String,
    required: [true, 'A mentor must have a field of expertise'],
  },
  bio: {
    type: String,
    required: [true, 'A mentor must have a bio'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Mentor = mongoose.model('Mentor', mentorSchema);

module.exports = Mentor;
