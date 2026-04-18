import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { roadmapAPI, githubAPI } from '../api/client';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Zap, Target, Flame, Trophy, ArrowRight, RefreshCw, Brain,
  CheckCircle, Circle, BookOpen, Code, ExternalLink, Clock
} from 'lucide-react';
import ContributionHeatmap from '../components/GitHub/ContributionHeatmap';

// ── Helpers ─────────────────────────────────────────────────────────────────

// Pulse animation for peak contribution days
const PULSE_STYLE = `
  @keyframes pulse-neon {
    0% { box-shadow: 0 0 5px var(--border-glow); }
    50% { box-shadow: 0 0 20px var(--border-glow); }
    100% { box-shadow: 0 0 5px var(--border-glow); }
  }
`;

// Pulse animation for peak contribution days

/** Build radar data from the roadmap's skill coverage vs known baseline */
function buildRadarFromRoadmap(roadmap, knownSkills) {
  // Aggregate all skills taught in the roadmap
  const taughtSkills = {};
  roadmap.weeks.forEach((w, wi) => {
    (w.skills || []).forEach(s => {
      taughtSkills[s] = (taughtSkills[s] || 0) + Math.round(100 / roadmap.weeks.length);
    });
  });

  // Build 6-point radar: roadmap coverage vs "you need this" industry bar
  const entries = Object.entries(taughtSkills).slice(0, 6);
  if (entries.length < 3) return null; // not enough skills to show radar

  return entries.map(([skill, roadmapWeight]) => ({
    skill: skill.length > 12 ? skill.slice(0, 10) + '…' : skill,
    roadmap: Math.min(100, roadmapWeight),
    industry: 80 + Math.floor(Math.random() * 15), // industry benchmark
  }));
}





const MISSIONS = [
  'Complete the Docker fundamentals module and build a containerized app',
  'Write 3 unit tests for your existing project using Jest',
  'Set up a basic CI/CD pipeline using GitHub Actions',
  'Read the official TypeScript handbook sections on generics',
  'Deploy your portfolio to Vercel and share the link',
];

// ── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [missionIdx] = useState(() => Math.floor(Math.random() * MISSIONS.length));
  const [expandedWeek, setExpandedWeek] = useState(null);
 
  // Inject custom styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = PULSE_STYLE;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    roadmapAPI.getAll().then(r => setRoadmaps(r.data.roadmaps || [])).catch(() => {});
  }, []);

  const activeRoadmap = roadmaps[0] || null;
  const readiness = activeRoadmap?.completionPercentage ?? 0;

  const tasksDone = activeRoadmap
    ? activeRoadmap.weeks.reduce((s, w) => s + w.tasks.filter(t => t.completed).length, 0)
    : 0;
  const tasksLeft = activeRoadmap
    ? activeRoadmap.weeks.reduce((s, w) => s + w.tasks.filter(t => !t.completed).length, 0)
    : 0;

  // Real daily mission: first incomplete task from the roadmap
  const dailyMission = activeRoadmap
    ? activeRoadmap.weeks.find(w => w.tasks.some(t => !t.completed))
        ?.tasks.find(t => !t.completed)?.text || MISSIONS[missionIdx]
    : MISSIONS[missionIdx];

  // Current active week (first with incomplete tasks)
  const activeWeek = activeRoadmap?.weeks.find(w => w.tasks.some(t => !t.completed));

  // Radar data — from roadmap skills or GitHub analysis
  const knownSkills = [
    ...(user?.githubAnalysis?.frameworks || []),
    ...(user?.githubAnalysis?.languages?.map(l => l.language) || []),
    ...(user?.techStack || []),
  ];

  const radarData = activeRoadmap
    ? buildRadarFromRoadmap(activeRoadmap, knownSkills)
    : null;

  const github = user?.githubData || null;

  const stats = [
    { label: 'Readiness Score', value: `${readiness}%`, icon: Target, color: 'var(--c6)', sub: activeRoadmap ? `${activeRoadmap.targetRole} track` : 'Generate a roadmap' },
    { label: 'Total Stars', value: `${github?.totalStars || 0}`, icon: Trophy, color: 'var(--c5)', sub: 'GitHub Repos' },
    { label: 'Total Commits', value: `${github?.totalCommits || 0}`, icon: Flame, color: 'var(--c6)', sub: 'Activity Level' },
    { label: 'Languages', value: `${github?.languages?.length || 0}`, icon: Code, color: 'var(--c5)', sub: 'Tech Diversity' },
  ];

  const [syncing, setSyncing] = useState(false);
  const { updateUser } = useAuth();
  
  const syncGithub = async () => {
    if (!user?.githubUsername) { toast.error('Please connect GitHub first'); return; }
    setSyncing(true);
    try {
      const { data } = await githubAPI.analyze(user.githubUsername);
      updateUser({ githubData: data.data, lastGithubSync: new Date() });
      toast.success('GitHub metrics synced successfully!');
    } catch (err) {
      toast.error('Sync failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSyncing(false);
    }
  };

  const generateRoadmap = async () => {
    if (!user?.targetRole) { toast.error('Please complete onboarding first.'); navigate('/onboarding'); return; }
    setGenerating(true);
    toast.info('🤖 Analyzing your GitHub & generating AI roadmap...');
    try {
      await roadmapAPI.generate({ githubUsername: user.githubUsername, targetRole: user.targetRole, manualSkills: user.techStack });
      toast.success('🎯 Personalized roadmap generated!');
      const r = await roadmapAPI.getAll();
      setRoadmaps(r.data.roadmaps || []);
      navigate('/roadmap');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Roadmap generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', backgroundAttachment: 'fixed' }}>


      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.5rem, 4vw, 1.75rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Developer'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            {activeRoadmap
              ? `${activeRoadmap.targetRole} Track · ${activeRoadmap.totalWeeks} weeks`
              : `${user?.targetRole || 'Fullstack'} Engineer Track · ${user?.weeklyHours || 10}h/week`}
            
            {user?.lastGithubSync && (
              <span className="hide-mobile" style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '0.5rem' }}>
                (Synced {new Date(user.lastGithubSync).toLocaleDateString()})
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
          <button 
            className="btn-secondary" 
            onClick={syncGithub} 
            disabled={syncing}
            style={{ padding: '0.6rem 0.8rem', gap: '0.4rem', flex: 1, justifyContent: 'center' }}
          >
            <RefreshCw size={14} className={syncing ? 'spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync GitHub'}
          </button>
          <button className="btn-primary" onClick={generateRoadmap} disabled={generating} style={{ flex: 1, justifyContent: 'center' }}>
            {generating
              ? <><RefreshCw size={16} className="spin" /> Generating...</>
              : <><Brain size={16} /> {activeRoadmap ? 'Regenerate' : 'Generate Roadmap'}</>}
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="dash-stats-grid">
        {stats.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
              </div>
              <div style={{ width: 40, height: 40, background: 'var(--bg-glass)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
            </div>
            <p style={{ fontSize: '0.73rem', color, fontWeight: 500 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Row 2: Gauge + Radar ── */}
      <div className="dash-two-col">

        {/* Career Readiness Gauge */}
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
          <div style={{ alignSelf: 'flex-start', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.2rem' }}>Career Readiness</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {activeRoadmap ? `${activeRoadmap.targetRole} role · ${tasksDone}/${tasksDone + tasksLeft} tasks complete` : 'Generate a roadmap to start tracking'}
            </p>
          </div>
          <svg width="200" height="130" viewBox="0 0 200 130">
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--c3)" />
                <stop offset="100%" stopColor="var(--c7)" />
              </linearGradient>
            </defs>
            <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="var(--border-subtle)" strokeWidth="14" strokeLinecap="round" />
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round"
              strokeDasharray={`${readiness * 2.51} 251`}
              style={{ filter: 'drop-shadow(0 0 10px var(--shadow-glow))', transition: 'stroke-dasharray 1.2s ease' }}
            />
            <text x="100" y="98" textAnchor="middle" fill="var(--text-primary)" fontSize="32" fontWeight="800" fontFamily="Space Grotesk">{readiness}%</text>
            <text x="100" y="118" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" letterSpacing="2" opacity="0.6">HIRE READY</text>
          </svg>
          <div style={{ display: 'flex', gap: '3rem', marginTop: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{tasksDone}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>Tasks Done</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>{tasksLeft}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>Remaining</div>
            </div>
            {activeRoadmap && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#7c3aed' }}>{activeRoadmap.totalWeeks}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>Weeks Total</div>
              </div>
            )}
          </div>
        </div>

        {/* Skill Radar */}
        <div className="stat-card" style={{ minHeight: 280, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.2rem' }}>Skill Profile vs Industry</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
            {radarData ? `Skills covered by your ${activeRoadmap.targetRole} roadmap` : `${user?.targetRole || 'Fullstack'} role requirements`}
          </p>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height={200} minWidth={220}>
              <RadarChart data={radarData || [
                { skill: 'React', roadmap: 35, industry: 90 },
                { skill: 'Node.js', roadmap: 30, industry: 85 },
                { skill: 'TypeScript', roadmap: 25, industry: 80 },
                { skill: 'Docker', roadmap: 15, industry: 75 },
                { skill: 'Testing', roadmap: 30, industry: 85 },
                { skill: 'Design', roadmap: 20, industry: 80 },
              ]} margin={{ top: 5, right: 25, bottom: 5, left: 25 }}>
                <PolarGrid stroke="var(--border-subtle)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <Radar name={radarData ? 'Roadmap Coverage' : 'Your Level'} dataKey="roadmap" stroke="var(--c3)" fill="var(--c3)" fillOpacity={0.4} strokeWidth={2} />
                <Radar name="Industry" dataKey="industry" stroke="var(--c5)" fill="var(--c5)" fillOpacity={0.1} strokeDasharray="5 5" strokeWidth={1.5} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-glass)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: 12, fontSize: '0.75rem' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--accent-primary)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 20, height: 3, background: 'var(--accent-primary)', borderRadius: 2 }} />
              {radarData ? 'Roadmap' : 'You'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 20, height: 2, background: 'linear-gradient(90deg, var(--accent-secondary) 50%, transparent 50%)', backgroundSize: '6px 2px' }} />
              Industry
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Heatmap + Mission ── */}
      <div className="dash-heatmap-row">

        {/* High-Fidelity GitHub Heatmap (Synced via Proxy) */}
        <div style={{ padding: '0.25rem', overflow: 'hidden' }}>
          <ContributionHeatmap username={user?.githubUsername || 'Shubham-k-yadav'} />
        </div>



        {/* AI Daily Mission (Sidecar) */}
        <div className="stat-card" style={{ background: 'var(--bg-card)', border: 'none', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 36, height: 36, background: 'var(--gradient-vibrant)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-glow)' }}>
              <Brain size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Roadmap Mission</h3>
              <p style={{ color: 'var(--accent-primary)', fontSize: '0.7rem', fontWeight: 600 }}>PRIORITY: HIGH</p>
            </div>
          </div>

          <div style={{ background: 'var(--bg-glass)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '0.875rem', minHeight: 60 }}>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
              {dailyMission}
            </p>
          </div>

          {/* Current week project brief */}
          {activeWeek?.projectBrief && (
            <div style={{ background: 'rgba(6,182,212,0.06)', borderRadius: 8, padding: '0.625rem 0.875rem', marginBottom: '0.875rem' }}>
              <p style={{ color: '#22d3ee', fontSize: '0.7rem', fontWeight: 600, margin: '0 0 0.25rem' }}>🏗️ This Week's Project</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>{activeWeek.projectBrief}</p>
            </div>
          )}

          <div style={{ background: 'rgba(124,58,237,0.08)', borderRadius: 8, padding: '0.5rem 0.875rem', marginBottom: '0.875rem' }}>
            <p style={{ color: 'var(--accent-primary)', fontSize: '0.7rem', fontWeight: 600, margin: 0 }}>
              ⚡ Complete this to earn 150 XP + unlock Week {(activeWeek?.weekNumber || 0) + 1}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button className="btn-primary" onClick={() => navigate('/roadmap')} style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.6rem 1rem' }}>
              <Zap size={14} /> View Roadmap
            </button>
            <button className="btn-secondary" onClick={() => { setExpandedWeek(null); roadmapAPI.getAll().then(r => setRoadmaps(r.data.roadmaps || [])).catch(() => {}); }} style={{ fontSize: '0.8rem', padding: '0.6rem 0.875rem' }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Roadmap DNA — Real Week Cards ── */}
      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--white)', fontSize: '1rem' }}>Roadmap DNA</h3>
              {activeRoadmap?.isAI && (
                <span style={{ 
                  fontSize: '0.6rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px',
                  background: 'rgba(162, 89, 222, 0.2)', color: 'var(--c5)',
                  textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: 'var(--shadow-glow)'
                }}>
                  ✨ AI Verified
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {activeRoadmap
                ? `${activeRoadmap.targetRole} · ${activeRoadmap.totalWeeks} weeks · click a card for details`
                : 'Your personalized learning sequence'}
            </p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/roadmap')} style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
            Full Roadmap <ArrowRight size={14} />
          </button>
        </div>

        {activeRoadmap ? (
          <>
            {/* Horizontal week cards */}
            <div style={{ display: 'flex', gap: '0.875rem', overflowX: 'auto', paddingBottom: '0.75rem' }}>
              {activeRoadmap.weeks.map(week => {
                const completed = week.tasks.filter(t => t.completed).length;
                const progress = week.tasks.length > 0 ? Math.round((completed / week.tasks.length) * 100) : 0;
                const status = progress === 100 ? 'done' : progress > 0 ? 'active' : 'upcoming';
                const statusColor = status === 'done' ? '#ffffff' : status === 'active' ? 'var(--c6)' : 'var(--c4)';
                const isExpanded = expandedWeek === week.weekNumber;
                return (
                  <div
                    key={week.weekNumber}
                    onClick={() => setExpandedWeek(isExpanded ? null : week.weekNumber)}
                    style={{
                      minWidth: 200, maxWidth: 220, padding: '1rem',
                      borderRadius: '12px', flexShrink: 0, cursor: 'pointer',
                      background: isExpanded
                        ? 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(15,17,23,0.5))'
                        : status === 'done'
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))'
                        : status === 'active'
                        ? 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(15,17,23,0.3))'
                        : 'var(--bg-glass)',
                      transition: 'all 0.2s',
                      boxShadow: isExpanded ? '0 0 20px rgba(168,85,247,0.25)' : status === 'active' ? '0 0 12px rgba(168,85,247,0.15)' : 'none',
                    }}
                    onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.62rem', color: '#475569', fontWeight: 700, letterSpacing: '0.08em' }}>WEEK {week.weekNumber}</span>
                      <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 4, background: `${statusColor}20`, color: statusColor }}>
                        {status === 'done' ? '✓ Done' : status === 'active' ? '▶ Active' : '○ Next'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem', lineHeight: 1.35 }}>{week.topic}</p>

                    {/* Skills tags */}
                    {week.skills?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '0.6rem' }}>
                        {week.skills.slice(0, 3).map(s => (
                          <span key={s} style={{ fontSize: '0.58rem', padding: '0.15rem 0.4rem', borderRadius: 4, background: 'rgba(124,58,237,0.12)', color: '#a855f7' }}>
                            {s}
                          </span>
                        ))}
                        {week.skills.length > 3 && (
                          <span style={{ fontSize: '0.58rem', padding: '0.15rem 0.4rem', borderRadius: 4, color: '#475569' }}>+{week.skills.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Progress bar */}
                    <div style={{ height: 6, borderRadius: 4, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, borderRadius: 4, background: status === 'done' ? 'var(--gradient-border)' : 'var(--gradient-vibrant)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--c5)', opacity: 0.7, marginTop: '0.35rem' }}>{progress}% · {completed}/{week.tasks.length} tasks</p>
                  </div>
                );
              })}
            </div>

            {/* Expanded week detail panel */}
            {expandedWeek !== null && (() => {
              const week = activeRoadmap.weeks.find(w => w.weekNumber === expandedWeek);
              if (!week) return null;
              return (
                <div style={{ marginTop: '1.25rem', padding: '1.5rem', borderRadius: 14, background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(15,17,23,0.4))', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.3rem' }}>WEEK {week.weekNumber} DETAIL</div>
                      <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '0.4rem' }}>{week.topic}</h4>
                      {week.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>{week.description}</p>}
                    </div>
                    {week.estimatedHours && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                        <Clock size={13} /> {week.estimatedHours}h this week
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>

                    {/* Tasks */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <CheckCircle size={14} color="#10b981" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>TASKS ({week.tasks.filter(t => t.completed).length}/{week.tasks.length})</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {week.tasks.map((task, ti) => (
                          <div key={ti} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', padding: '0.5rem 0.75rem', borderRadius: 8, background: task.completed ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${task.completed ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                            {task.completed
                              ? <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
                              : <Circle size={14} color="#475569" style={{ flexShrink: 0, marginTop: 1 }} />}
                            <span style={{ fontSize: '0.8rem', color: task.completed ? '#64748b' : '#e2e8f0', lineHeight: 1.5, textDecoration: task.completed ? 'line-through' : 'none' }}>
                              {task.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources + Project */}
                    <div>
                      {week.resources?.length > 0 && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <BookOpen size={14} color="#06b6d4" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>RESOURCES</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                            {week.resources.map((res, ri) => (
                              <a key={ri} href={res.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.75rem', borderRadius: 8, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.12)', textDecoration: 'none', color: '#22d3ee', fontSize: '0.78rem', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,182,212,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(6,182,212,0.06)'}
                              >
                                <ExternalLink size={11} style={{ flexShrink: 0 }} />
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{res.title}</span>
                                <span style={{ fontSize: '0.6rem', color: '#475569', flexShrink: 0, textTransform: 'uppercase' }}>{res.type}</span>
                              </a>
                            ))}
                          </div>
                        </>
                      )}

                      {week.projectBrief && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Code size={14} color="#a855f7" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>PROJECT BRIEF</span>
                          </div>
                          <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                            <p style={{ color: '#c4b5fd', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>{week.projectBrief}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', gap: '1rem', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: 'var(--bg-glass)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={28} color="var(--accent-primary)" />
            </div>
            <div>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.925rem', marginBottom: '0.4rem', fontWeight: 600 }}>No Roadmap Generated</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Click "Generate AI Roadmap" above to create your personalised career path.</p>
            </div>
            <button className="btn-primary" onClick={generateRoadmap} disabled={generating} style={{ marginTop: '0.5rem' }}>
              <Brain size={16} /> Generate My Roadmap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
