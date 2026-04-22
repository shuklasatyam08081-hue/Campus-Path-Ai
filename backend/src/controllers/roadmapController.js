const Roadmap = require('../models/Roadmap');
const Progress = require('../models/Progress');
const { analyzeGitHub, checkRepoExists } = require('../services/githubService');
const { generateRoadmap } = require('../services/geminiService');

const generateRoadmapController = async (req, res) => {
  const { githubUsername, targetRole, manualSkills } = req.body;
  if (!targetRole) return res.status(400).json({ success: false, message: 'targetRole is required' });

  let githubAnalysis = null;
  if (githubUsername) {
    try {
      githubAnalysis = await analyzeGitHub(githubUsername);
    } catch (e) {
      console.warn('GitHub analysis failed:', e.message);
      if (e.message.includes('not found')) {
        return res.status(404).json({ success: false, message: `GitHub username "${githubUsername}" not found.` });
      }
    }
  } else if (req.user.githubData) {
    // Use already cached data if no new username provided
    githubAnalysis = req.user.githubData;
    console.log('📦 Using cached GitHub data for roadmap generation');
  }

  let roadmapData;
  try {
    roadmapData = await generateRoadmap({
      targetRole,
      githubAnalysis,
      manualSkills,
      weeklyHours: req.user.weeklyHours || 10,
      proficiency: req.user.proficiency || 'Intermediate',
    });
  } catch (error) {
    return res.status(503).json({ success: false, message: error.message });
  }

  // Check if it was real AI or fallback
  const isAI = !roadmapData.weeks[0].topic.startsWith('Mastering ');

  const roadmap = await Roadmap.create({
    userId: req.user._id,
    targetRole,
    githubUsername: githubUsername || req.user.githubUsername,
    githubAnalysis,
    weeks: roadmapData.weeks,
    totalWeeks: roadmapData.totalWeeks,
    isAI,
  });

  // Initialize progress doc
  await Progress.findOneAndUpdate(
    { userId: req.user._id },
    { userId: req.user._id, roadmapId: roadmap._id },
    { upsert: true, new: true }
  );

  res.status(201).json({ success: true, roadmap, isAI });
};

const getRoadmaps = async (req, res) => {
  const roadmaps = await Roadmap.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, roadmaps });
};

const getRoadmap = async (req, res) => {
  const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id });
  if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
  res.json({ success: true, roadmap });
};

const updateTask = async (req, res) => {
  const { weekNumber, taskIndex, completed } = req.body;
  const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id });
  if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

  const week = roadmap.weeks.find(w => w.weekNumber === weekNumber);
  if (!week || !week.tasks[taskIndex]) return res.status(404).json({ success: false, message: 'Task not found' });

  week.tasks[taskIndex].completed = completed;
  if (completed) week.tasks[taskIndex].completedAt = new Date();

  // Recalculate completion %
  const totalTasks = roadmap.weeks.reduce((sum, w) => sum + w.tasks.length, 0);
  const completedTasks = roadmap.weeks.reduce((sum, w) => sum + w.tasks.filter(t => t.completed).length, 0);
  roadmap.completionPercentage = Math.round((completedTasks / totalTasks) * 100);
  roadmap.updatedAt = new Date();
  await roadmap.save();

  res.json({ success: true, roadmap });
};

const verifyMilestone = async (req, res) => {
  const { weekNumber } = req.body;
  const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id });
  
  if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
  if (!roadmap.githubUsername) return res.status(400).json({ success: false, message: 'GitHub username not provided for this roadmap' });

  const week = roadmap.weeks.find(w => w.weekNumber === weekNumber);
  if (!week) return res.status(404).json({ success: false, message: 'Week not found' });
  if (!week.expectedRepoName) return res.status(400).json({ success: false, message: 'No expected repository name for this week' });

  const verification = await checkRepoExists(roadmap.githubUsername, week.expectedRepoName);
  
  if (verification.exists && verification.valid) {
    week.isRepoVerified = true;
    
    // Automatically complete all tasks for this week if verified
    week.tasks.forEach(t => {
      if (!t.completed) {
        t.completed = true;
        t.completedAt = new Date();
      }
    });

    // Optionally complete all days as well
    if (week.days) {
      week.days.forEach(d => {
        d.completed = true;
      });
    }

    // Recalculate overall completion
    const totalTasks = roadmap.weeks.reduce((sum, w) => sum + w.tasks.length, 0);
    const completedTasks = roadmap.weeks.reduce((sum, w) => sum + w.tasks.filter(t => t.completed).length, 0);
    roadmap.completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    roadmap.updatedAt = new Date();
    await roadmap.save();
    
    return res.json({ success: true, verified: true, message: 'Repository verified successfully!', roadmap });
  } else if (verification.exists && !verification.valid) {
    return res.json({ 
      success: true, 
      verified: false, 
      message: `Invalid Repository: ${verification.reason}. Please add your project code and try again.` 
    });
  } else {
    return res.json({ 
      success: true, 
      verified: false, 
      message: `Repository not found! Please create a public repo at: ${roadmap.githubUsername}/${week.expectedRepoName}` 
    });
  }
};

module.exports = { generateRoadmapController, getRoadmaps, getRoadmap, updateTask, verifyMilestone };
