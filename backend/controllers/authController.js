const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel.js');
const { sendEmail } = require('../utils/email'); 

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("req.body:", req.body);
    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email });
    if (user) {
      console.log("User already exists response triggered");
      return res.status(400).json({ 
        success:false,
        message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const emailverificationToken = crypto.randomBytes(32).toString('hex');

    user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      isEmailVerified: false,
      emailverificationToken,
      emailverificationTokenExpires: Date.now() + 3600000 
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailverificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Please Verify Your Email - I-GYAN.AI',
      template: 'emailVerification', 
      context: {
        name: user.name,
        verificationUrl,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@i-gyan.ai'
      }
    });

    res.status(201).json({ 
      success:true,
      message: 'User registered. Please check your email to verify your account.' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
       success:false,
      message: 'Server error' });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({
      emailverificationToken: token,
      emailverificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
         success:false,
        message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailverificationToken = undefined;
    user.emailverificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ 
       success:true,
      message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
       success:false,
      message: 'Server error' });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success:false,
        message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success:false,
        message: 'Invalid email or password' });
    }

    // 🚨 Email verification check
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        success:true,
        message: 'Please verify your email before logging in.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(200).json({
      success:true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success:false,message: 'Server error' });
  }
};

// Resend Verification Email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success:false,message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({success:true, message: 'Email is already verified' });
    }

    // Generate new token
    const emailverificationToken = crypto.randomBytes(32).toString('hex');
    user.emailverificationToken = emailverificationToken;
    user.emailverificationTokenExpires = Date.now() + 3600000; 
    await user.save();

    // Send email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailverificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Please Verify Your Email - I-GYAN.AI',
      template: 'emailVerification',
      context: {
        name: user.name,
        verificationUrl,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@i-gyan.ai'
      }
    });

    res.status(200).json({ success:true,message: 'Verification email resent' });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({success:false, message: 'Server error' });
  }
};
