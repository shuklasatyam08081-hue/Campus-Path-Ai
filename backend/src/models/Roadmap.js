const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const resourceSchema = new mongoose.Schema({
  title: { type: String },
  url: { type: String },
  type: { type: String, enum: ['docs', 'tutorial', 'repo', 'project', 'video'], default: 'docs' },
});

const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  topic: { type: String, required: true },
  subtopic: { type: String },
  description: { type: String },
  docLink: { type: String },
  videoLink: { type: String },
  completed: { type: Boolean, default: false },
});

const weekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  topic: { type: String, required: true },
  description: { type: String },
  skills: [{ type: String }],
  tasks: [taskSchema],
  days: [daySchema], // NEW: 7-day breakdown
  expectedRepoName: { type: String }, // NEW: GitHub repo slug to verify
  isRepoVerified: { type: Boolean, default: false }, // NEW: Automated check result
  resources: [resourceSchema],
  projectBrief: { type: String },
  estimatedHours: { type: Number, default: 10 },
});

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true },
  githubUsername: { type: String },
  githubAnalysis: { type: Object },
  isAI: { type: Boolean, default: false },
  weeks: [weekSchema],
  totalWeeks: { type: Number },
  completionPercentage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
