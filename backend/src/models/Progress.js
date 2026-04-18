const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  count: { type: Number, default: 0 },
});

const milestoneSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  xpReward: { type: Number, default: 100 },
  claimed: { type: Boolean, default: false },
  claimedAt: { type: Date },
  unlockedAt: { type: Date, default: Date.now },
});

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' },
  weeklyActivity: [activitySchema],
  milestones: [milestoneSchema],
  totalTasksCompleted: { type: Number, default: 0 },
  weeklyVelocity: [{ week: String, tasks: Number }],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Progress', progressSchema);
