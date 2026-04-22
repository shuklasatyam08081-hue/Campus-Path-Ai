import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { roadmapAPI } from '../api/client';
import { 
  Zap, Flame, Shield, Star, Award, Lock, 
  ExternalLink, Download, RefreshCw, Brain, 
  Trophy, Target, Sparkles, Copy, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Achievements() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({
    roadmapProgress: 0,
    githubImpact: 0,
    otherXP: 0,
    nextMilestoneProgress: 0,
    nextMilestoneName: "Rising Star"
  });

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { data } = await roadmapAPI.getAll();
        let dynamicBadges = [];
        let hasRoadmap = data.roadmaps && data.roadmaps.length > 0;
        
        let completedWeeks = 0;
        let totalWeeks = 0;

        const baseBadges = [
          { id: 'global_1', name: 'Alpha Pioneer', desc: 'Joined the CampusPath AI initial cohort.', icon: Zap, color: '#f59e0b', unlocked: true, date: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2024-03-01', xp: 200 },
          { id: 'global_2', name: 'Inferno Streak', desc: 'Maintained 7 consecutive days of code.', icon: Flame, color: '#ef4444', unlocked: (user?.streak || 0) >= 7, date: null, xp: 350 },
          { id: 'global_3', name: 'Visionary', desc: 'Architected your first AI learning path.', icon: Star, color: '#7c3aed', unlocked: hasRoadmap, date: hasRoadmap && data.roadmaps[0].createdAt ? new Date(data.roadmaps[0].createdAt).toLocaleDateString() : null, xp: 150 },
          { id: 'global_4', name: 'Elite Hired', desc: 'Secured a professional position.', icon: Trophy, color: '#10b981', unlocked: false, xp: 2000 },
        ];

        if (hasRoadmap) {
          const roadmap = data.roadmaps[0];
          setActiveRoadmap(roadmap);
          totalWeeks = roadmap.weeks.length;

          roadmap.weeks.forEach((w, index) => {
            const isFinished = w.isRepoVerified || (w.tasks && w.tasks.every(t => t.completed) && w.tasks.length > 0);
            if (isFinished) completedWeeks++;

            let badgeTitle = w.topic.split(' ').slice(0, 2).join(' ');

            dynamicBadges.push({
              id: `week_${w.weekNumber}`,
              name: `${badgeTitle} Specialist`,
              desc: `Completed the ${w.topic} module.`,
              icon: Shield,
              color: '#0969da',
              unlocked: isFinished,
              date: isFinished ? new Date().toLocaleDateString() : null,
              xp: 500 + (w.weekNumber * 50)
            });
          });
        }

        const roadmapPerc = totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0;
        const githubPerc = user?.githubData ? Math.min(100, (user.githubData.publicRepos * 5) + (user.githubData.totalStars * 10)) : 0;
        
        let nextM = "Rising Star";
        let nextMPerc = 0;
        if (roadmapPerc < 30) { nextM = "Foundation Master"; nextMPerc = (roadmapPerc / 30) * 100; }
        else if (roadmapPerc < 70) { nextM = "Core Architect"; nextMPerc = ((roadmapPerc - 30) / 40) * 100; }
        else { nextM = "Career Ready"; nextMPerc = ((roadmapPerc - 70) / 30) * 100; }

        setStats({
          roadmapProgress: roadmapPerc,
          githubImpact: githubPerc,
          otherXP: user?.xp > 0 ? 100 : 0,
          nextMilestoneName: nextM,
          nextMilestoneProgress: Math.min(100, Math.round(nextMPerc))
        });

        setBadges([...baseBadges, ...dynamicBadges]);
      } catch (err) {
        console.error("Failed to fetch achievements:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, [user]);

  const generateSocialPost = (badge) => {
    return `🏆 Milestone Unlocked: **${badge.name}** rank on CampusPath AI! 🚀`;
  };

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalXP = user?.xp || badges.filter(b => b.unlocked).reduce((s, b) => s + b.xp, 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
        <RefreshCw size={32} className="text-primary" />
      </motion.div>
    </div>
  );

  return (
    <div className="relative max-w-7xl mx-auto space-y-10 py-6 px-4 overflow-hidden">
      {/* Background Mesh Blobs for Color */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-chart-4/10 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Vibrant Header Section */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-border/60 pb-10">
        <div className="space-y-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest"
          >
            <Sparkles size={12} className="animate-pulse" /> Global Legacy
          </motion.div>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-none">
            Achievement <span className="text-primary">Vault</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-lg">
            Your professional milestones, algorithmically tracked and beautifully visualized.
          </p>
        </div>

        <div className="flex gap-4">
           <div className="glass-panel px-6 py-4 rounded-xl flex items-center gap-4 border-chart-4/20 shadow-xl shadow-chart-4/5 bg-gradient-to-br from-card to-chart-4/5">
             <div className="p-2.5 rounded-lg bg-chart-4/20 text-chart-4 shadow-inner">
               <Zap size={20} fill="currentColor" />
             </div>
             <div>
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Total XP</div>
               <div className="text-xl font-black text-foreground tabular-nums">{totalXP.toLocaleString()}</div>
             </div>
           </div>
           <div className="glass-panel px-6 py-4 rounded-xl flex items-center gap-4 border-emerald-500/20 shadow-xl shadow-emerald-500/5 bg-gradient-to-br from-card to-emerald-500/5">
             <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-500 shadow-inner">
               <Target size={20} />
             </div>
             <div>
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Earned</div>
               <div className="text-xl font-black text-foreground tabular-nums">{unlockedCount}/{badges.length}</div>
             </div>
           </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Colorful Badge Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/50">Unlocked Milestones</h2>
            <div className="h-px flex-1 bg-border/40 mx-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {badges.map((badge, idx) => {
              const Icon = badge.icon;
              const isUnlocked = badge.unlocked;
              return (
                <motion.div
                  key={badge.id}
                  whileHover={isUnlocked ? { y: -6, scale: 1.02 } : {}}
                  onClick={() => isUnlocked && setSelectedBadge(badge)}
                  className={clsx(
                    "group relative flex flex-col p-6 rounded-2xl border transition-all cursor-pointer overflow-hidden",
                    isUnlocked 
                      ? "border-border shadow-lg hover:shadow-2xl" 
                      : "bg-muted/10 border-border/40 opacity-40 grayscale"
                  )}
                  style={{ 
                    background: isUnlocked 
                      ? `linear-gradient(135deg, var(--color-card), ${badge.color}08)` 
                      : 'var(--color-card)',
                    borderColor: isUnlocked ? `${badge.color}30` : 'var(--color-border)'
                  }}
                >
                  {/* Neon Glow on Hover */}
                  {isUnlocked && (
                    <div className="absolute -bottom-10 -right-10 w-24 h-24 blur-[40px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full" 
                         style={{ backgroundColor: badge.color }} />
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className={clsx(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:rotate-6",
                        isUnlocked ? "bg-card border-2" : "bg-muted/40 border-2 border-transparent"
                      )}
                      style={{ 
                        borderColor: isUnlocked ? `${badge.color}50` : 'transparent',
                        boxShadow: isUnlocked ? `0 8px 25px ${badge.color}25` : 'none',
                        color: isUnlocked ? badge.color : 'var(--muted-foreground)'
                      }}
                    >
                      {isUnlocked ? <Icon size={28} /> : <Lock size={24} className="text-muted-foreground/30" />}
                    </div>
                    {isUnlocked && (
                      <div className="px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 text-[9px] font-black tracking-widest text-muted-foreground uppercase">
                        #{idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className={clsx("font-black text-xs uppercase tracking-tight", isUnlocked ? "text-foreground" : "text-muted-foreground")}>
                      {badge.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed line-clamp-2">
                      {isUnlocked ? badge.desc : "Complete previous steps to unlock"}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-border/40 flex justify-between items-center">
                    <div className="text-[10px] font-black tracking-tight flex items-center gap-1" style={{ color: isUnlocked ? badge.color : 'var(--muted-foreground)' }}>
                      {isUnlocked ? <><Sparkles size={10} /> +{badge.xp} XP</> : '---'}
                    </div>
                    {isUnlocked && (
                      <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Analytics Side Panel */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/50 px-2">Data Science</h2>
          
          <div className="glass-panel p-8 rounded-2xl border border-border/60 shadow-2xl space-y-10 bg-gradient-to-b from-card to-muted/5">
            <AnimatePresence mode="wait">
              {selectedBadge ? (
                <motion.div 
                  key={selectedBadge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div 
                      className="w-24 h-24 rounded-[2rem] flex items-center justify-center border-4 shadow-2xl relative"
                      style={{ 
                        backgroundColor: `${selectedBadge.color}10`,
                        borderColor: `${selectedBadge.color}40`,
                        boxShadow: `0 20px 50px ${selectedBadge.color}20`
                      }}
                    >
                      <selectedBadge.icon size={48} style={{ color: selectedBadge.color }} />
                      <div className="absolute -top-2 -right-2 bg-chart-4 p-1.5 rounded-full shadow-lg border-2 border-card">
                        <Star size={14} fill="white" color="white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Mastery Unlocked</div>
                      <h3 className="text-2xl font-black text-foreground tracking-tighter">{selectedBadge.name}</h3>
                    </div>
                  </div>

                  <div className="p-5 bg-muted/30 rounded-xl border border-border/40 text-xs text-center font-medium leading-loose text-muted-foreground italic">
                    "{selectedBadge.desc}"
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(generateSocialPost(selectedBadge));
                        toast.success('Ready to post!');
                      }}
                      className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Copy size={16} /> Share Achievement
                    </button>
                    <button 
                      onClick={() => toast.info('Certificate export is live.')}
                      className="w-full h-12 bg-muted border border-border rounded-xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={16} /> Export JSON Proof
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedBadge(null)}
                    className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-foreground text-center"
                  >
                    Back to overview
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-10">
                  {/* Vibrant Gradient Progress Bar */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Profile Composition</span>
                      <span className="text-xs font-black text-foreground tracking-tighter">{totalXP.toLocaleString()} XP</span>
                    </div>
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary via-purple-500 to-emerald-500 shadow-lg shadow-primary/20 transition-all duration-1000" 
                           style={{ width: `${Math.max(stats.roadmapProgress, 10)}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                        <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Roadmap</div>
                        <div className="text-sm font-black text-primary">{Math.round(stats.roadmapProgress)}%</div>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                        <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Impact</div>
                        <div className="text-sm font-black text-emerald-500">{Math.round(stats.githubImpact)}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Milestone Progress */}
                  <div className="pt-8 border-t border-border/40">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 text-center">Next Frontier</h4>
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/10 border border-border/60 flex items-center gap-5 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center border border-border shadow-lg z-10">
                        <Trophy size={20} className="text-chart-4" />
                      </div>
                      <div className="flex-1 z-10">
                        <div className="text-xs font-black text-foreground uppercase tracking-tight">{stats.nextMilestoneName}</div>
                        <div className="w-full h-1.5 bg-border rounded-full mt-2.5 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.nextMilestoneProgress}%` }}
                            className="h-full bg-gradient-to-r from-chart-4 to-orange-500 shadow-sm" 
                          />
                        </div>
                      </div>
                      <div className="text-[11px] font-black text-primary z-10">{stats.nextMilestoneProgress}%</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[9px] text-muted-foreground leading-relaxed text-center font-medium italic">
                      Achieving milestones increases your profile velocity and algorithmic score.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}
