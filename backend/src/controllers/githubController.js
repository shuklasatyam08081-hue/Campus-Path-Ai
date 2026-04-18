const User = require('../models/User');
const { analyzeGitHub, getContributionHeatmap } = require('../services/githubService');

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
  if (!username) return res.status(400).json({ success: false, message: 'Username required' });
  
  try {
    const data = await getContributionHeatmap(username);
    res.json({ success: true, data });
  } catch (error) {
    console.error('GitHub heatmap controller error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { analyzeUser, getHeatmap };
