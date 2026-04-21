const User = require('../models/User');
const { analyzeGitHub, getContributionHeatmap } = require('../services/githubService');
const { reviewRepository } = require('../services/reviewService');

const analyzeUser = async (req, res) => {
  const { username } = req.params;
  if (!username) return res.status(400).json({ success: false, message: 'Username required' });
  
  try {
    const data = await analyzeGitHub(username);
    
    // Persist to user record if they are the owner
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        githubData: data,
        lastGithubSync: new Date(),
        githubUsername: username
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('GitHub analysis controller error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHeatmap = async (req, res) => {
  const { username } = req.params;
  const { year } = req.query;
  if (!username) return res.status(400).json({ success: false, message: 'Username required' });
  
  try {
    const data = await getContributionHeatmap(username, year);
    res.json({ success: true, data });
  } catch (error) {
    console.error('GitHub heatmap controller error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleReview = async (req, res) => {
  const { username: manualUser, repoName: manualRepo, repoUrl } = req.body;
  
  let targetUser = manualUser;
  let targetRepo = manualRepo;

  // Handle URL parsing if provided
  if (repoUrl) {
    try {
      // Regex to match github.com/owner/repo
      const match = repoUrl.match(/(?:github\.com\/)([^\/]+)\/([^\/\.\?#]+)/);
      if (match) {
        targetUser = match[1];
        targetRepo = match[2];
      } else {
        return res.status(400).json({ success: false, message: 'Invalid GitHub URL format.' });
      }
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Failed to parse repository URL.' });
    }
  }

  if (!targetUser || !targetRepo) {
    return res.status(400).json({ success: false, message: 'Please provide a valid GitHub URL or both Username and Repo Name.' });
  }
  
  try {
    console.log(`🔍 Processing review for: ${targetUser}/${targetRepo}...`);
    const analysis = await reviewRepository(targetUser, targetRepo);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('GitHub review controller error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { analyzeUser, getHeatmap, handleReview };
