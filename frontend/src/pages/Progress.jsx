import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { roadmapAPI, jobsAPI } from '../api/client';
import { RefreshCw, Zap, Check, Gift, Brain, Target, Compass, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
      <p className="text-muted-foreground text-xs font-bold mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-primary font-black text-sm">{payload[0].value} tasks completed</p>
    </div>
  );
};

const PIE_COLORS = ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];


export default function Progress() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const { data } = await roadmapAPI.getAll();
        if (data.roadmaps && data.roadmaps.length > 0) {
          const roadmap = data.roadmaps[0];
          setActiveRoadmap(roadmap);

          // Build dynamic milestones from roadmap progress
          const claimedSet = new Set((user?.milestones || []).filter(m => m.claimed).map(m => m.id));
          const tasksCompleted = roadmap.weeks.reduce((s, w) => s + w.tasks.filter(t => t.completed).length, 0);
          const weeksWithAllDone = roadmap.weeks.filter(w => w.tasks.length > 0 && w.tasks.every(t => t.completed));

          const dynamicMilestones = [
            { id: 'global_1', title: 'First Steps', desc: 'Complete your first task', xp: 50, icon: '🚀', ready: tasksCompleted >= 1, claimed: claimedSet.has('global_1') },
            { id: 'global_2', title: 'Consistent Coder', desc: `Maintain a 3-day streak (currently: ${user?.streak || 0} days)`, xp: 350, icon: '🔥', ready: (user?.streak || 0) >= 3, claimed: claimedSet.has('global_2') },
            { id: 'global_3', title: 'Module Master', desc: 'Complete an entire week module', xp: 250, icon: '🧠', ready: weeksWithAllDone.length >= 1, claimed: claimedSet.has('global_3') },
            ...roadmap.weeks.filter(w => w.isRepoVerified).slice(0, 5).map((w, i) => ({
              id: `week_${w.weekNumber}`,
              title: `${w.topic?.split(' ').slice(0,3).join(' ')} Specialist`,
              desc: `Verified GitHub repo for Week ${w.weekNumber}`,
              xp: 500 + (w.weekNumber * 50),
              icon: '🏆',
              ready: true,
              claimed: claimedSet.has(`week_${w.weekNumber}`)
            }))
          ];
          setMilestones(dynamicMilestones);
        }
      } catch (err) {
        console.error("Failed to fetch roadmap progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, [user]);

  const claimMilestone = async (id) => {
    try {
      const { data } = await jobsAPI.claimMilestone(id);
      setMilestones(prev => prev.map(m => m.id === id ? { ...m, claimed: true } : m));
      toast.success(`🎉 +${data.xpGained} XP! Streak: ${data.streak} days 🔥`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not claim milestone.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCw size={32} className="animate-spin text-primary" />
    </div>
  );

  if (!activeRoadmap) return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-panel mt-8 mx-4">
      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 border border-primary/20">
        <Brain size={40} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-4 font-sans tracking-tight">No Active Roadmap Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Progress Tracker requires an active learning path to monitor your velocity. Let's build your first career roadmap!
      </p>
      <button 
        className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
        onClick={() => window.location.href = '/dashboard'}
      >
        <Compass size={18} /> Go to Dashboard
      </button>
    </div>
  );

  // Dynamic Data Calculation Engine
  const totalWeeks = activeRoadmap.weeks.length;
  const tasksCompleted = activeRoadmap.weeks.reduce((sum, w) => sum + w.tasks.filter(t => t.completed).length, 0);
  const avgVelocity = (tasksCompleted / totalWeeks).toFixed(1);

  // Recharts Map
  const velocityData = activeRoadmap.weeks.map(w => ({
    week: `Week ${w.weekNumber}`,
    tasks: w.tasks.filter(t => t.completed).length
  }));

  // Generating pseudo-distribution based on roadmap skills or topics for the pie chart
  const skillDistributionMap = {};
  activeRoadmap.weeks.forEach(w => {
    const primarySkill = w.skills && w.skills[0] ? w.skills[0] : w.topic.split(' ')[0];
    if (primarySkill) {
      skillDistributionMap[primarySkill] = (skillDistributionMap[primarySkill] || 0) + w.tasks.length;
    }
  });

  const skillPieData = Object.entries(skillDistributionMap)
    .sort((a,b) => b[1] - a[1]) // Sort largest to smallest
    .slice(0, 5) // Top 5 skills
    .map(([name, value]) => ({
      name,
      value: Math.round((value / activeRoadmap.weeks.reduce((sum, w) => sum + w.tasks.length, 0)) * 100) || 10,
    }));

  // Use real XP from DB if available, else calculate from milestones + tasks
  const totalXP = user?.xp || (milestones.filter(m => m.claimed).reduce((sum, m) => sum + m.xp, 0) + (tasksCompleted * 10));

  return (
    <div className="animate-in fade-in duration-500 pb-12 space-y-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold font-sans text-foreground mb-2">Progress Tracker</h1>
        <p className="text-sm font-medium text-muted-foreground">Monitor your learning velocity and milestone achievements on path to <span className="text-foreground font-bold">{activeRoadmap.targetRole}</span></p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Tasks Completed', value: tasksCompleted, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total XP Earned', value: totalXP.toLocaleString(), color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Milestones', value: `${milestones.filter(m => m.claimed).length}/${milestones.length}`, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Avg Velocity', value: `${avgVelocity}/wk`, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
        ].map(({ label, value, color, bg }, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            key={label} 
            className="glass-panel p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] hover:bg-primary/5 transition-all duration-300 group"
          >
            <div className={`text-4xl font-black font-sans mb-2 ${color}`}>{value}</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        {/* Area Chart */}
        <div className="glass-panel p-6">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-lg font-bold text-foreground">Learning Velocity</h3>
              <p className="text-xs text-muted-foreground font-medium">Tasks completed per week over your module timeline</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold bg-muted px-3 py-1.5 rounded-lg text-foreground">
              <Target size={14} className="text-primary" /> Active Timeline
            </div>
          </div>
          
          <div className="-ml-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11, fontWeight: 600 }} tickFormatter={w => w.replace('Week ', 'W')} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tasks" stroke="var(--color-primary)" fill="url(#velGrad)" strokeWidth={3} dot={{ fill: 'var(--color-background)', stroke:'var(--color-primary)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: 'var(--color-primary)', stroke: 'var(--color-background)' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-panel p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground">Skill Mastery</h3>
            <p className="text-xs text-muted-foreground font-medium">Curriculum distribution</p>
          </div>
          
          <div className="h-[200px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={skillPieData} 
                  cx="50%" cy="50%" 
                  innerRadius={60} 
                  outerRadius={85} 
                  paddingAngle={5} 
                  dataKey="value"
                  stroke="none"
                >
                  {skillPieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <RechartsTooltip 
                  formatter={(v) => `${v}%`} 
                  contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', fontWeight: 'bold' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2.5 mt-auto">
            {skillPieData.map(({ name, value }, idx) => (
              <div key={name} className="flex items-center gap-3 text-sm">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="text-muted-foreground font-medium flex-1 truncate">{name}</span>
                <span className="text-foreground font-bold">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="glass-panel p-6 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Award className="text-primary" /> Milestone Timeline
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Claim rewards for completing key achievements</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-inner">
            <Zap size={14} className="animate-pulse" /> {totalXP.toLocaleString()} Total XP
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {milestones.map((m) => {
            const isClaimed = m.claimed;
            const isReady = !isClaimed && m.ready === true;
            const isLocked = !isClaimed && !m.ready;
            
            return (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                key={m.id} 
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5 rounded-2xl border transition-all ${
                  isClaimed ? 'bg-emerald-500/5 border-emerald-500/20' : 
                  isReady ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 
                  'bg-muted/30 border-border/50 opacity-60 grayscale-[50%]'
                }`}
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                  isClaimed ? 'bg-emerald-500/10' : 
                  isReady ? 'bg-primary/20' : 
                  'bg-foreground/5'
                }`}>
                  {m.icon}
                </div>
                
                <div className="flex-1">
                  <div className="font-bold text-foreground text-base mb-1">{m.title}</div>
                  <div className="text-muted-foreground text-sm font-medium">{m.desc}</div>
                  {m.date && <div className="text-primary text-[10px] uppercase tracking-wider font-bold mt-2">Earned {m.date}</div>}
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:gap-2 shrink-0">
                  <div className={`font-black text-lg ${isClaimed ? 'text-emerald-500' : isReady ? 'text-primary' : 'text-muted-foreground'}`}>
                    +{m.xp} XP
                  </div>
                  
                  {isClaimed ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <Check size={14} /> CLAIMED
                    </div>
                  ) : isReady ? (
                    <button 
                      onClick={() => claimMilestone(m.id)} 
                      className="flex items-center gap-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 px-5 py-2 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <Gift size={14} /> CLAIM REWARD
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-foreground/5 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-border">
                      LOCKED
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
