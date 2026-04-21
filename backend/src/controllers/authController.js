const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const { generateToken } = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({
      success: true,
      token: generateToken(user._id),
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

const getMe = async (req, res, next) => {
  res.json({ success: true, user: req.user });
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'githubUsername', 'targetRole', 'weeklyHours', 'techStack',
      'proficiency', 'programmingLanguages', 'careerUrgency', 'onboardingComplete', 'avatar'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    
    // Sync githubUsername to roadmaps if it was updated
    if (updates.githubUsername !== undefined) {
      await Roadmap.updateMany({ userId: req.user._id }, { githubUsername: updates.githubUsername });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile Update Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Profile update failed' });
  }
};

module.exports = { register, login, getMe, updateProfile };
