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

    // Fetch from multiple sources for better coverage
    console.log(`📡 Fetching fresh jobs for role: ${role}...`);
    
    const fetchers = [
      axios.get('https://remotive.com/api/remote-jobs?limit=50', {
        headers: { 'Accept': 'application/json', 'User-Agent': 'CampusPath-AI/1.0' },
        timeout: 8000
      }),
      axios.get('https://www.arbeitnow.com/api/job-board-api', {
        headers: { 'Accept': 'application/json' },
        timeout: 8000
      })
    ];

    // Add JSearch (RapidAPI) if key is available
    const useRapid = process.env.RAPIDAPI_KEY && process.env.RAPIDAPI_KEY !== 'YOUR_RAPIDAPI_KEY_HERE';
    if (useRapid) {
      console.log(`💎 Including JSearch (RapidAPI) for "${role} in India"...`);
      fetchers.push(axios.get('https://jsearch.p.rapidapi.com/search', {
        params: { 
          query: `${role} in India`, // Targeted search for India
          num_pages: '1', 
          page: '1' 
        },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com'
        },
        timeout: 10000
      }));
    }

    const results = await Promise.allSettled(fetchers);
    let combinedJobs = [];

    // 1. Process Remotive (Result at index 0)
    if (results[0].status === 'fulfilled' && results[0].value.data.jobs) {
      console.log(`✅ Remotive: Found ${results[0].value.data.jobs.length} jobs`);
      combinedJobs = [...results[0].value.data.jobs];
    } else {
      console.error('❌ Remotive failed:', results[0].reason?.message || results[0].status);
    }

    // 2. Process Arbeitnow (Result at index 1)
    if (results[1].status === 'fulfilled' && results[1].value.data.data) {
      console.log(`✅ Arbeitnow: Found ${results[1].value.data.data.length} jobs`);
      const normalizedArbeit = results[1].value.data.data.map(job => ({
        id: `an-${job.slug}`,
        title: job.title,
        company_name: job.company_name,
        candidate_required_location: job.location || (job.remote ? 'Remote' : 'Unknown'),
        url: job.url,
        tags: job.tags || [],
        description: job.description,
        publication_date: new Date(job.created_at * 1000).toISOString(),
        salary: 'Competitive'
      }));
      combinedJobs = [...combinedJobs, ...normalizedArbeit];
    } else {
      console.error('❌ Arbeitnow failed:', results[1].reason?.message || results[1].status);
    }

    // 3. Process JSearch (Result at index 2, if it exists)
    if (useRapid && results[2]) {
      if (results[2].status === 'fulfilled' && results[2].value.data.data) {
        console.log(`✅ JSearch: Found ${results[2].value.data.data.length} jobs`);
        const normalizedJSearch = results[2].value.data.data.map(job => ({
          id: `js-${job.job_id}`,
          title: job.job_title,
          company_name: job.employer_name,
          candidate_required_location: job.job_city && job.job_country ? `${job.job_city}, ${job.job_country}` : 'Remote/Global',
          url: job.job_apply_link,
          tags: [job.job_employment_type, job.job_publisher].filter(Boolean),
          description: job.job_description,
          publication_date: job.job_posted_at_datetime_utc || new Date().toISOString(),
          salary: job.job_min_salary ? `${job.job_salary_currency || '$'}${job.job_min_salary} - ${job.job_max_salary}` : 'Competitive'
        }));
        combinedJobs = [...normalizedJSearch, ...combinedJobs];
      } else {
        console.error('❌ JSearch failed:', results[2].reason?.message || results[2].status);
        if (results[2].reason?.response?.data) {
          console.error('   Error Data:', JSON.stringify(results[2].reason.response.data));
        }
      }
    }

    if (combinedJobs.length === 0) throw new Error('No jobs found from any source. Check API keys and network.');

    cachedJobs = combinedJobs;
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
