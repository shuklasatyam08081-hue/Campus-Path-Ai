const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6 },
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  githubUsername: { type: String, default: '' },
  avatar: { type: String, default: '' },
  targetRole: { type: String, default: 'Fullstack' },
  weeklyHours: { type: Number, default: 10 },
  techStack: [{ type: String }],
  proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  programmingLanguages: [{ type: String }],
  careerUrgency: { type: String, enum: ['Exploring', 'Active', 'Urgent'], default: 'Active' },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  badges: [{ type: String }],
  milestones: [{
    id: String,
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date, default: null }
  }],
  onboardingComplete: { type: Boolean, default: false },
  githubData: { type: Object, default: null },
  lastGithubSync: { type: Date, default: null },
  portfolioData: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now },

});

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
