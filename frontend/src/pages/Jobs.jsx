import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { roadmapAPI } from '../api/client';
import { Briefcase, Search, MapPin, Zap, ArrowUp, Tag, TrendingUp, RefreshCw, Brain } from 'lucide-react';

const matchColor = (pct) => pct >= 90 ? '#10b981' : pct >= 75 ? 'var(--accent-primary)' : '#f59e0b';

export default function Jobs() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [jobPool, setJobPool] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);

  // Extract baseline user skills for dynamic match engine grading
  const github = user?.githubData || {};
  const userSkills = new Set([
    ...(github.languages?.map(l => l.language.toLowerCase()) || []),
    ...(github.frameworks?.map(f => f.toLowerCase()) || []),
    ...(user?.techStack?.map(s => s.toLowerCase()) || [])
  ]);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        let roadmapSkills = [];
        let searchKeyword = user?.targetRole || 'developer';
        
        // Ensure roadmap context if it exists
        const { data: roadmapData } = await roadmapAPI.getAll();
        if (roadmapData.roadmaps && roadmapData.roadmaps.length > 0) {
          const roadmap = roadmapData.roadmaps[0];
          setActiveRoadmap(roadmap);
          searchKeyword = roadmap.targetRole || searchKeyword;
          
          roadmap.weeks.forEach(w => {
            if (w.skills) roadmapSkills.push(...w.skills);
          });
        }
        
        // Push newly acquired roadmap skills to matching set
        roadmapSkills.forEach(s => userSkills.add(s.toLowerCase()));

        // --- FETCH REAL REMOTE JOBS ---
        setLoading(true);
        
        let response = await fetch(`https://remotive.com/api/remote-jobs?category=software-dev&limit=100`);
        let resData = await response.json();

        if (resData.jobs) {
          const formattedJobs = resData.jobs.map(job => ({
            id: job.id,
            url: job.url,
            company: job.company_name,
            role: job.title,
            location: job.candidate_required_location || 'Remote',
            tags: job.tags || [],
            salary: job.salary ? job.salary.replace(/USD|EUR|GBP/gi, '').trim() : 'Competitive Equity',
            posted: new Date(job.publication_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            hot: (Date.now() - new Date(job.publication_date).getTime() < 86400000 * 3) // Hot if < 3 days old
          }));
          
          setJobPool(formattedJobs);
        }

      } catch (err) {
        console.error("Failed to fetch Remotive Job Board:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRealData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateMatch = (tags) => {
    // Aggressive grading mechanism
    if (!userSkills.size) return 0; 
    let matches = 0;
    tags.forEach(t => {
      const lowerT = t.toLowerCase();
      // Partial matching since tag strings on real APIs can contain commas
      for (const skill of userSkills) {
        if (lowerT.includes(skill) || skill.includes(lowerT)) {
          matches++;
          break;
        }
      }
    });
    
    const percentage = Math.round((matches / (tags.length || 1)) * 100);
    // Inflate slightly to account for generalized job descriptions, max 100
    return Math.min(percentage + 30, 100); 
  };

  const REAL_JOBS = jobPool
    .map(j => ({ ...j, match: calculateMatch(j.tags) }))
    .sort((a, b) => b.match - a.match);

  const filtered = REAL_JOBS.filter(j =>
    j.role.toLowerCase().includes(query.toLowerCase()) ||
    j.company.toLowerCase().includes(query.toLowerCase()) ||
    j.location.toLowerCase().includes(query.toLowerCase()) ||
    j.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  const handleApply = (job) => {
    toast.info(`Redirecting safely to ${job.company} portal...`);
    window.open(job.url, '_blank');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCw size={40} className="spin" color="var(--accent-primary)" />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: "'Space Grotesk', sans-serif" }}>Polling live global remote board...</p>
    </div>
  );

  return (
    <div style={{ paddingBottom: '3rem', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Job Match Engine</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Aggregating 100% active remote tech opportunities mapped to your developer profile</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input-field" placeholder="Search live roles, verified companies, tags..." value={query}
          onChange={e => setQuery(e.target.value)} style={{ paddingLeft: '2.5rem', maxWidth: 480 }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Live Remote Openings', value: filtered.length, color: 'var(--accent-primary)', icon: Briefcase },
          { label: 'Avg Profile Match', value: `${Math.round(filtered.reduce((s, j) => s + j.match, 0) / (filtered.length || 1))}%`, color: '#10b981', icon: TrendingUp },
          { label: '🔥 Recently Active', value: filtered.filter(j => j.hot).length, color: '#f59e0b', icon: Zap },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, background: 'var(--bg-glass)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Job Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map(job => {
          const color = matchColor(job.match);
          return (
            <div key={job.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              {/* Company Avatar */}
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: 'var(--gradient-vibrant)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: 'white', textTransform: 'uppercase'
              }}>
                {job.company[0]}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: '60%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.role}</h3>
                      {job.hot && <span className="badge badge-orange" style={{ fontSize: '0.65rem', flexShrink: 0 }}>🔥 FRESH</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{job.company}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={12} /> {job.location}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.salary}</span>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: 'auto' }}>
                    <div style={{ position: 'relative', width: 56, height: 56 }}>
                      <svg width="56" height="56" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border-subtle)" strokeWidth="5" />
                        <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={`${(job.match / 100) * 138} 138`} strokeDashoffset="34.5"
                          style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
                        />
                        <text x="28" y="32" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="800">{job.match}%</text>
                      </svg>
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>MATCH</div>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                  {job.tags.slice(0, 7).map(tag => (
                    <span key={tag} className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{tag}</span>
                  ))}
                  {job.tags.length > 7 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{job.tags.length - 7} more</span>}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto', alignSelf: 'center' }}>Posted {job.posted}</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-primary" onClick={() => handleApply(job)} style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
                    <Zap size={13} /> Apply Globally
                  </button>
                  <button className="btn-secondary" onClick={() => handleApply(job)} style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
                    <ArrowUp size={13} /> View Portal
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
