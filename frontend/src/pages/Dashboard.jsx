import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { roadmapAPI, githubAPI } from '../api/client';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import {
  Zap, Target, Flame, Trophy, ArrowRight, RefreshCw, Brain,
  CheckCircle, Circle, BookOpen, Code, ExternalLink, Clock
} from 'lucide-react';
import ContributionHeatmap from '../components/GitHub/ContributionHeatmap';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Skeleton for loading state
function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5 pb-4">
      <div className="flex justify-between items-center">
        <div className="h-8 w-64 bg-muted rounded-lg" />
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-muted rounded-lg" />
          <div className="h-10 w-32 bg-muted rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
        <div className="h-[280px] bg-muted rounded-xl" />
        <div className="h-[280px] bg-muted rounded-xl" />
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildRadarFromRoadmap(roadmap, knownSkills) {
  const taughtSkills = {};
  roadmap.weeks.forEach((w) => {
    (w.skills || []).forEach(s => {
      taughtSkills[s] = (taughtSkills[s] || 0) + Math.round(100 / roadmap.weeks.length);
    });
  });

  if (!roadmap || !Array.isArray(roadmap.weeks) || roadmap.weeks.length === 0) return null;
  const entries = Object.entries(taughtSkills).slice(0, 6);
  if (entries.length < 3) return null;

  return entries.map(([skill, roadmapWeight]) => ({
    skill: skill.length > 12 ? skill.slice(0, 10) + '…' : skill,
    roadmap: Math.min(100, roadmapWeight),
    industry: 80 + Math.floor(Math.random() * 15),
  }));
}

const INSIGHTS = [
  { text: 'Completing your Docker module will put you in the top 10% of junior candidates.', category: 'Market Value', icon: Zap },
  { text: 'Focusing on Generics this week will solve 40% of your current TypeScript errors.', category: 'Skill Boost', icon: Brain },
  { text: 'Senior roles in your area are increasingly requiring PostgreSQL expertise.', category: 'Career Trend', icon: Target },
  { text: 'Your commit velocity is 20% higher than last week. Keep it up!', category: 'Momentum', icon: Flame },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [missionIdx] = useState(() => Math.floor(Math.random() * INSIGHTS.length));
  const [expandedWeek, setExpandedWeek] = useState(null);

  useEffect(() => {
    setLoadingRoadmaps(true);
    roadmapAPI.getAll()
      .then(r => setRoadmaps(r?.data?.roadmaps || []))
      .catch((err) => { console.error('Dashboard fetch error:', err); })
      .finally(() => setLoadingRoadmaps(false));
  }, []);

  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);

  if (loadingRoadmaps) return <DashboardSkeleton />;

  const activeRoadmap = Array.isArray(roadmaps) ? roadmaps[0] : null;
  const readiness = activeRoadmap?.completionPercentage ?? 0;

  const tasksDone = (activeRoadmap && activeRoadmap.weeks)
    ? activeRoadmap.weeks.reduce((s, w) => s + (w.tasks || []).filter(t => t.completed).length, 0)
    : 0;
  const tasksLeft = (activeRoadmap && activeRoadmap.weeks)
    ? activeRoadmap.weeks.reduce((s, w) => s + (w.tasks || []).filter(t => !t.completed).length, 0)
    : 0;

  const dailyInsight = INSIGHTS[missionIdx];

  const activeWeek = activeRoadmap && Array.isArray(activeRoadmap.weeks)
    ? activeRoadmap.weeks.find(w => Array.isArray(w.tasks) && w.tasks.some(t => !t.completed))
    : null;

  const knownSkills = [
    ...(user?.githubAnalysis?.frameworks || []),
    ...(user?.githubAnalysis?.languages?.map(l => l.language) || []),
    ...(user?.techStack || []),
  ];

  const radarData = activeRoadmap ? buildRadarFromRoadmap(activeRoadmap, knownSkills) : null;
  const github = user?.githubData || null;

  const stats = [
    { label: 'Readiness Score', value: `${readiness || 0}%`, icon: Target, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', sub: activeRoadmap ? `${activeRoadmap.targetRole || 'In progress'}` : 'Generate path' },
    { label: 'Total Stars', value: `${github?.totalStars || 0}`, icon: Trophy, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', sub: 'GitHub Repos' },
    { label: 'Total Commits', value: `${github?.totalCommits || 0}`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', sub: 'Activity Level' },
    { label: 'Languages', value: `${github?.languages?.length || 0}`, icon: Code, color: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-blue-600/20', sub: 'Tech Diversity' },
  ];

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

  return (
    <div className="animate-in fade-in duration-500 space-y-5 pb-4">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Developer'} <span className="text-xl">👋</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            {activeRoadmap
              ? `${activeRoadmap.targetRole} Track · ${activeRoadmap.totalWeeks} weeks`
              : `${user?.targetRole || 'Fullstack'} Engineer Track · ${user?.weeklyHours || 10}h/week`}
            {user?.lastGithubSync && (
              <span className="hidden sm:inline-block text-[10px] font-bold border border-border px-2 py-0.5 rounded bg-muted uppercase tracking-wider">
                Synced {new Date(user.lastGithubSync).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <button
            onClick={syncGithub}
            disabled={syncing}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border hover:bg-muted text-xs font-bold text-foreground transition-all disabled:opacity-70 shadow-sm rounded-lg"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin text-primary' : 'text-muted-foreground'} />
            {syncing ? 'Syncing...' : 'Sync GitHub'}
          </button>
          <button
            onClick={generateRoadmap}
            disabled={generating}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all disabled:opacity-70 disabled:pointer-events-none rounded-lg"
          >
            {generating ? (
              <><RefreshCw size={14} className="animate-spin" /> Generating...</>
            ) : (
              <><Brain size={14} /> {activeRoadmap ? 'Regenerate' : 'Generate AI Roadmap'}</>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, border, sub }, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={label}
            className="bg-card border border-border p-4 rounded-xl shadow-sm hover:border-primary/50 transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg} border ${border} ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground truncate">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Row 2: Gauge & Radar */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
        {/* Career Readiness Gauge */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[280px]">
          <div className="w-full mb-6">
            <h3 className="font-bold text-foreground text-base mb-1">Career Readiness</h3>
            <p className="text-[11px] text-muted-foreground">
              {activeRoadmap ? `${activeRoadmap.targetRole} path` : 'Link path to start tracking'}
            </p>
          </div>

          <div className="relative w-[180px] h-[120px] mb-4">
            <svg width="180" height="120" viewBox="0 0 200 130">
              <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="var(--color-border)" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
              <path
                d="M 20 110 A 80 80 0 0 1 180 110"
                fill="none" stroke="var(--color-primary)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${readiness * 2.51} 251`}
                className="transition-all duration-1000 ease-out"
              />
              <text x="100" y="98" textAnchor="middle" fill="currentColor" fontSize="34" fontWeight="800" fontFamily="sans-serif">{readiness}%</text>
              <text x="100" y="118" textAnchor="middle" fill="var(--color-primary)" fontSize="10" letterSpacing="1" fontWeight="700">READINESS</text>
            </svg>
          </div>

          <div className="flex gap-4 w-full justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{tasksDone}</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Done</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{tasksLeft}</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Remaining</div>
            </div>
          </div>
        </div>

        {/* Skill Radar */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col min-h-[280px]">
          <h3 className="font-bold text-foreground text-base mb-1">Technical Profile</h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Skill indexing vs Industry Benchmarks
          </p>
          <div className="flex-1 -mx-4">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <RadarChart
                data={radarData || [
                  { skill: 'React', roadmap: 35, industry: 90 },
                  { skill: 'Node.js', roadmap: 30, industry: 85 },
                  { skill: 'TypeScript', roadmap: 25, industry: 80 },
                  { skill: 'Docker', roadmap: 15, industry: 75 },
                  { skill: 'Testing', roadmap: 30, industry: 85 },
                  { skill: 'Design', roadmap: 20, industry: 80 },
                ]}
                margin={{ top: 5, right: 30, bottom: 5, left: 30 }}
              >
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--color-foreground)', fontSize: 10, fontWeight: 600 }} />
                <Radar name="Coverage" dataKey="roadmap" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.3} strokeWidth={2} />
                <Radar name="Industry" dataKey="industry" stroke="var(--color-muted-foreground)" fill="var(--color-muted-foreground)" fillOpacity={0.05} strokeDasharray="3 3" strokeWidth={1} />
                <RechartsTooltip
                  contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '11px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
              <div className="w-3 h-3 bg-primary/40 rounded-full" /> Roadmap
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
              <div className="w-3 h-1 border-t border-dashed border-muted-foreground" /> Industry
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Heatmap + Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">

        {/* Heatmap Area */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm overflow-hidden min-h-[220px] flex flex-col justify-center">
          <h3 className="font-bold text-foreground text-sm mb-1 uppercase tracking-wider text-muted-foreground">Contribution DNA</h3>
          <div className="-ml-3 mt-4 overflow-x-auto no-scrollbar">
            <ContributionHeatmap username={user?.githubUsername || 'Shubham-k-yadav'} />
          </div>
        </div>

        {/* AI Career Navigator */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col group hover:border-primary/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm group-hover:scale-110 transition-transform">
                <Brain size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">AI Navigator</h3>
                <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Career Guidance</p>
              </div>
            </div>
            <div className="px-2 py-1 bg-muted rounded text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Live</div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg mb-4 border border-border relative z-10 flex-1 hover:bg-muted transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <dailyInsight.icon size={14} className="text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{dailyInsight.category}</span>
            </div>
            <p className="text-[13px] font-semibold text-foreground leading-relaxed">
              {dailyInsight.text}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
            <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-[9px] font-bold text-emerald-500 uppercase mb-0.5">Velocity</p>
              <p className="text-xs font-bold text-foreground">+12% Up</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <p className="text-[9px] font-bold text-blue-500 uppercase mb-0.5">Next Win</p>
              <p className="text-xs font-bold text-foreground">3 Modules Left</p>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-border flex gap-2">
            <button onClick={() => navigate('/roadmap')} className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95">
              Refine My Path <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Roadmap DNA Grid */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground text-base">Roadmap Sequence</h3>
              {activeRoadmap?.isAI && (
                <span className="text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  AI Build
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {activeRoadmap ? `${activeRoadmap.targetRole} · ${activeRoadmap.totalWeeks} Weeks` : 'Personalized curriculum'}
            </p>
          </div>
          <button onClick={() => navigate('/roadmap')} className="text-xs font-bold bg-muted hover:bg-muted/80 text-foreground px-4 py-1.5 rounded-lg border border-border flex items-center gap-1.5 transition-all">
            Full Detail <ArrowRight size={14} />
          </button>
        </div>

        {activeRoadmap ? (
          <div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
              {Array.isArray(activeRoadmap.weeks) && activeRoadmap.weeks.map(week => {
                const taskCount = Array.isArray(week.tasks) ? week.tasks.length : 0;
                const completed = taskCount > 0 ? week.tasks.filter(t => t.completed).length : 0;
                const progress = taskCount > 0 ? Math.round((completed / taskCount) * 100) : 0;
                const status = progress === 100 ? 'done' : progress > 0 ? 'active' : 'upcoming';
                const isExpanded = expandedWeek === week.weekNumber;

                return (
                  <motion.div
                    key={week.weekNumber}
                    onClick={() => setExpandedWeek(isExpanded ? null : week.weekNumber)}
                    className={twMerge(
                      clsx(
                        "min-w-[220px] max-w-[240px] p-4 rounded-xl cursor-pointer border transition-all relative overflow-hidden",
                        isExpanded
                          ? "ring-2 ring-primary border-transparent shadow-md"
                          : status === 'done'
                            ? "bg-background border-border hover:border-border/80"
                            : status === 'active'
                              ? "bg-primary/5 border-primary/30"
                              : "bg-muted/30 border-border"
                      )
                    )}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black tracking-widest text-muted-foreground uppercase opacity-70">Week {week.weekNumber}</span>
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        status === 'done' ? "bg-primary" : status === 'active' ? "bg-blue-500 animate-pulse" : "bg-border"
                      )} />
                    </div>

                    <h4 className="font-bold text-foreground text-xs mb-3 truncate leading-snug">{week.topic}</h4>

                    <div className="mt-4">
                      <div className="h-1 w-full bg-border rounded-full overflow-hidden mb-1.5">
                        <div className={clsx("h-full rounded-full transition-all duration-1000", status === 'done' ? 'bg-primary' : 'bg-blue-500')} style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                        <span>{progress}%</span>
                        <span>{completed}/{taskCount} Done</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Expanded Panel */}
            <AnimatePresence>
              {expandedWeek && (() => {
                const week = Array.isArray(activeRoadmap.weeks) ? activeRoadmap.weeks.find(w => w.weekNumber === expandedWeek) : null;
                if (!week) return null;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-4 bg-muted border border-border rounded-xl p-5 mt-4 overflow-hidden shadow-inner"
                  >
                    {/* Tasks List */}
                    <div>
                      <h4 className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest mb-4">
                        <CheckCircle size={14} /> Weekly Checklist
                      </h4>
                      <div className="space-y-1.5">
                        {Array.isArray(week.tasks) && week.tasks.map((task, i) => (
                          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border bg-background/50 border-border shadow-sm`}>
                            {task.completed ? <CheckCircle size={14} className="text-primary shrink-0 mt-0.5" /> : <Circle size={14} className="text-muted-foreground shrink-0 mt-0.5 opacity-50" />}
                            <span className={`text-[13px] font-medium ${task.completed ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'}`}>{task.text || 'Untitled Task'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sidebar of details */}
                    <div className="space-y-5">
                      {week.resources?.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 text-[10px] font-bold text-foreground uppercase tracking-widest mb-3">
                            <BookOpen size={14} /> Study Material
                          </h4>
                          <div className="space-y-1.5">
                            {Array.isArray(week.resources) && week.resources.map((res, i) => (
                              <a key={i} href={res.url || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border hover:bg-muted transition-colors text-xs font-semibold text-foreground group">
                                <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary shrink-0" />
                                <span className="truncate">{res.title || 'Resource'}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {week.projectBrief && (
                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                          <h4 className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Technical Brief</h4>
                          <p className="text-[11px] text-foreground leading-relaxed opacity-90">{week.projectBrief}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Brain size={24} className="text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">Roadmap Inactive</h3>
            <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
              Generate a personalized AI curriculum to begin your engineering journey.
            </p>
            <button onClick={generateRoadmap} className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-sm hover:opacity-90">
              Deploy AI Pilot
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

function Compass(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}
