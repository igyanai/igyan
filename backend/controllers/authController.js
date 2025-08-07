const jwt = require('jsonwebtoken');
const Student = require('../models/studentModel.js');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.registerStudent = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const studentExists = await Student.findOne({ email });
    if (studentExists) return res.status(400).json({ message: 'Student already exists' });

    const student = await Student.create({ name, email, password });
    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      token: generateToken(student._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;
  try {
    const student = await Student.findOne({ email });
    if (student && (await student.matchPassword(password))) {
      res.status(200).json({
        _id: student._id,
        name: student.name,
        email: student.email,
        token: generateToken(student._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
