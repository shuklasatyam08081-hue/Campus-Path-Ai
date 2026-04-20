const axios = require('axios');

// Cache for 5 minutes to avoid hitting rate limits
let cachedJobs = null;
let cacheTime = null;
const CACHE_TTL = 5 * 60 * 1000;

const getJobs = async (req, res) => {
  const { role = 'developer', limit = 50 } = req.query;

  try {
    // Return cached jobs if fresh
    if (cachedJobs && cacheTime && Date.now() - cacheTime < CACHE_TTL) {
      const filtered = filterByRole(cachedJobs, role);
      return res.json({ success: true, jobs: filtered.slice(0, parseInt(limit)), total: filtered.length, cached: true });
    }

    // Fetch from Remotive API (server-side, no CORS issues)
    const { data } = await axios.get('https://remotive.com/api/remote-jobs?category=software-dev&limit=200', {
      headers: { 'Accept': 'application/json', 'User-Agent': 'CampusPath-AI/1.0' },
      timeout: 10000
    });

    if (!data.jobs) throw new Error('Invalid response from jobs API');

    cachedJobs = data.jobs;
    cacheTime = Date.now();

    const filtered = filterByRole(cachedJobs, role);
    res.json({ success: true, jobs: filtered.slice(0, parseInt(limit)), total: filtered.length, cached: false });
  } catch (error) {
    console.error('Jobs fetch error:', error.message);
    // Return fallback curated jobs if API fails
    res.json({ success: true, jobs: getFallbackJobs(role), total: getFallbackJobs(role).length, fallback: true });
  }
};

function filterByRole(jobs, role) {
  const keywords = role.toLowerCase().split(' ');
  return jobs.filter(job => {
    const title = job.title.toLowerCase();
    const desc = (job.description || '').toLowerCase().substring(0, 500);
    return keywords.some(kw => title.includes(kw) || desc.includes(kw));
  });
}

function getFallbackJobs(role) {
  return [
    { id: 'fb1', company_name: 'OpenAI', title: `Senior ${role}`, candidate_required_location: 'Remote', url: 'https://openai.com/careers', tags: ['AI', 'Python', 'React'], salary: '$130,000 - $200,000', publication_date: new Date().toISOString() },
    { id: 'fb2', company_name: 'Vercel', title: `${role} Engineer`, candidate_required_location: 'Remote', url: 'https://vercel.com/careers', tags: ['Next.js', 'TypeScript', 'Node.js'], salary: '$120,000 - $180,000', publication_date: new Date().toISOString() },
    { id: 'fb3', company_name: 'GitHub', title: `${role} II`, candidate_required_location: 'Remote', url: 'https://github.com/about/careers', tags: ['Git', 'Go', 'PostgreSQL'], salary: '$115,000 - $165,000', publication_date: new Date().toISOString() },
  ];
}

const claimMilestone = async (req, res) => {
  const { milestoneId } = req.body;
  const xpMap = { 
    'global_1': 200, 'global_2': 350, 'global_3': 150, 'global_4': 2000,
  };
  
  try {
    const user = req.user;
    
    // Check if already claimed
    const alreadyClaimed = user.milestones?.find(m => m.id === milestoneId && m.claimed);
    if (alreadyClaimed) return res.status(400).json({ success: false, message: 'Milestone already claimed' });

    // Calculate XP (week milestones use id like 'week_1')
    let xpGain = 50;
    if (xpMap[milestoneId]) {
      xpGain = xpMap[milestoneId];
    } else if (milestoneId.startsWith('week_')) {
      const weekNum = parseInt(milestoneId.replace('week_', '')) || 1;
      xpGain = 500 + (weekNum * 50);
    }

    // Update streak and lastActiveDate
    const today = new Date().toDateString();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let newStreak = user.streak || 0;
    if (lastActive === yesterday) newStreak += 1;
    else if (lastActive !== today) newStreak = 1;

    // Upsert milestone in array
    const { User } = require('mongoose').models;
    const UserModel = require('../models/User');
    
    const existingMilestoneIdx = (user.milestones || []).findIndex(m => m.id === milestoneId);
    
    if (existingMilestoneIdx >= 0) {
      user.milestones[existingMilestoneIdx].claimed = true;
      user.milestones[existingMilestoneIdx].claimedAt = new Date();
    } else {
      user.milestones = [...(user.milestones || []), { id: milestoneId, claimed: true, claimedAt: new Date() }];
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        $inc: { xp: xpGain },
        $set: {
          milestones: user.milestones,
          streak: newStreak,
          lastActiveDate: new Date()
        }
      },
      { new: true }
    );

    res.json({ success: true, xpGained: xpGain, newXP: updatedUser.xp, streak: newStreak, message: `+${xpGain} XP Earned!` });
  } catch (error) {
    console.error('Claim milestone error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getJobs, claimMilestone };
