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
      const filtered = adaptiveFilter(cachedJobs, role);
      return res.json({ success: true, jobs: filtered.slice(0, parseInt(limit)), total: filtered.length, cached: true });
    }

    // Fetch from Remotive API - Broaden to all software development categories
    // We try to get a larger initial pool to ensure results after filtering
    console.log('📡 Fetching fresh jobs from Remotive...');
    const { data } = await axios.get('https://remotive.com/api/remote-jobs?limit=150', {
      headers: { 'Accept': 'application/json', 'User-Agent': 'CampusPath-AI/1.0' },
      timeout: 10000
    });

    if (!data.jobs || data.jobs.length === 0) throw new Error('Empty or invalid response from jobs API');

    cachedJobs = data.jobs;
    cacheTime = Date.now();

    const filtered = adaptiveFilter(cachedJobs, role);
    res.json({ success: true, jobs: filtered.slice(0, parseInt(limit)), total: filtered.length, cached: false });
  } catch (error) {
    console.error('Jobs fetch error:', error.message);
    // Return fallsback curated jobs if API fails or returns too few
    const fallback = getFallbackJobs(role);
    res.json({ success: true, jobs: fallback, total: fallback.length, fallback: true });
  }
};

function adaptiveFilter(jobs, role) {
  const primaryKeywords = role.toLowerCase().split(' ');
  let results = jobs.filter(job => {
    const title = job.title.toLowerCase();
    const desc = (job.description || '').toLowerCase().substring(0, 500);
    return primaryKeywords.some(kw => title.includes(kw) || desc.includes(kw));
  });

  // Adaptive Logic: If too few results, add broad "Developer" or "Software" results
  if (results.length < 15) {
    const broadKeywords = ['developer', 'software', 'engineer', 'web', 'fullstack', 'remote'];
    const additional = jobs.filter(job => {
      if (results.some(r => r.id === job.id)) return false; // Avoid duplicates
      const title = job.title.toLowerCase();
      return broadKeywords.some(kw => title.includes(kw));
    });
    results = [...results, ...additional.slice(0, 20)];
  }

  return results;
}

function getFallbackJobs(role) {
  const baseJobs = [
    { id: 'fb1', company_name: 'OpenAI', title: `Senior ${role} Engineer`, candidate_required_location: 'Remote', url: 'https://openai.com/careers', tags: ['AI', 'Python', 'React'], salary: '$130,000 - $200,000', publication_date: new Date().toISOString() },
    { id: 'fb2', company_name: 'Vercel', title: `${role} Specialist`, candidate_required_location: 'Remote', url: 'https://vercel.com/careers', tags: ['Next.js', 'TypeScript', 'Node.js'], salary: '$120,000 - $180,000', publication_date: new Date().toISOString() },
    { id: 'fb3', company_name: 'GitHub', title: `Platform Engineer (${role})`, candidate_required_location: 'Remote', url: 'https://github.com/about/careers', tags: ['Git', 'Go', 'PostgreSQL'], salary: '$115,000 - $165,000', publication_date: new Date().toISOString() },
    { id: 'fb4', company_name: 'Stripe', title: `Solutions Architect`, candidate_required_location: 'Remote', url: 'https://stripe.com/jobs', tags: ['API', 'Ruby', 'Fintech'], salary: '$140,000 - $210,000', publication_date: new Date().toISOString() },
    { id: 'fb5', company_name: 'Discord', title: `Backend Systems Engineer`, candidate_required_location: 'Remote', url: 'https://discord.com/jobs', tags: ['Rust', 'Distributed Systems'], salary: '$135,000 - $190,000', publication_date: new Date().toISOString() },
    { id: 'fb6', company_name: 'Docker', title: `Cloud Infrastructure Engineer`, candidate_required_location: 'Remote', url: 'https://www.docker.com/careers', tags: ['Docker', 'Kubernetes', 'Go'], salary: '$125,000 - $175,000', publication_date: new Date().toISOString() },
    { id: 'fb7', company_name: 'Notion', title: `Product Engineer`, candidate_required_location: 'Remote', url: 'https://www.notion.so/careers', tags: ['React', 'TypeScript', 'Postgres'], salary: '$130,000 - $185,000', publication_date: new Date().toISOString() },
    { id: 'fb8', company_name: 'Figma', title: `Graphics Software Engineer`, candidate_required_location: 'Remote', url: 'https://www.figma.com/careers', tags: ['C++', 'Wasm', 'WebGL'], salary: '$150,000 - $220,000', publication_date: new Date().toISOString() },
    { id: 'fb9', company_name: 'Airbnb', title: `Full Stack Engineer`, candidate_required_location: 'Remote', url: 'https://careers.airbnb.com', tags: ['React', 'Java', 'Ruby'], salary: '$145,000 - $200,000', publication_date: new Date().toISOString() },
    { id: 'fb10', company_name: 'Postman', title: `Developer Relations Engineer`, candidate_required_location: 'Remote', url: 'https://www.postman.com/careers', tags: ['APIs', 'JS', 'Communication'], salary: '$110,000 - $160,000', publication_date: new Date().toISOString() },
    { id: 'fb11', company_name: 'Netlify', title: `DX Engineer`, candidate_required_location: 'Remote', url: 'https://www.netlify.com/careers', tags: ['Serverless', 'Frameworks'], salary: '$120,000 - $170,000', publication_date: new Date().toISOString() },
    { id: 'fb12', company_name: 'Cloudflare', title: `Edge Computing Developer`, candidate_required_location: 'Remote', url: 'https://www.cloudflare.com/careers', tags: ['Workers', 'Rust', 'Security'], salary: '$140,000 - $205,000', publication_date: new Date().toISOString() }
  ];
  return baseJobs;
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
