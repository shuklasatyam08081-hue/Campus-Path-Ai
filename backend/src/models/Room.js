const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  category: {
    type: String,
    enum: ['Fullstack', 'Frontend', 'Backend', 'DSA', 'DevOps', 'AI', 'Other'],
    default: 'Other'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Room', roomSchema);
