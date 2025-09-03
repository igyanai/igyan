// This file contains the business logic for the mentor API endpoints.
const Mentor = require('../models/Mentor');

// Handler for getting all mentors
exports.getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.status(200).json({
      status: 'success',
      results: mentors.length,
      data: {
        mentors,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Handler for creating a new mentor
exports.createMentor = async (req, res) => {
  try {
    const newMentor = await Mentor.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        mentor: newMentor,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Handler for getting a single mentor by ID
exports.getMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({
        status: 'fail',
        message: 'No mentor found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        mentor,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
