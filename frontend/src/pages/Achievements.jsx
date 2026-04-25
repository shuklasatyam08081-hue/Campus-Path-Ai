import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { roadmapAPI } from '../api/client';
import {
  Zap, Flame, Shield, Star, Trophy, Target,
  Lock, RefreshCw, Sparkles, Copy, ChevronRight,
  ShieldCheck, Brain, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Achievements() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({
    roadmapProgress: 0,
    githubImpact: 0,
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
          { id: 'global_1', name: 'Alpha Pioneer', desc: 'Joined the CampusPath AI initial cohort.', icon: Zap, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', unlocked: true, xp: 200 },
          { id: 'global_2', name: 'Inferno Streak', desc: 'Maintained 7 consecutive days of code.', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', unlocked: (user?.streak || 0) >= 7, xp: 350 },
          { id: 'global_3', name: 'Visionary', desc: 'Architected your first AI learning path.', icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', unlocked: hasRoadmap, xp: 150 },
          { id: 'global_4', name: 'Elite Hired', desc: 'Secured a professional position.', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', unlocked: false, xp: 2000 },
        ];

        if (hasRoadmap) {
          const roadmap = data.roadmaps[0];
          totalWeeks = roadmap.weeks.length;

          roadmap.weeks.forEach((w) => {
            const isFinished = w.isRepoVerified || (w.tasks && w.tasks.every(t => t.completed) && w.tasks.length > 0);
            if (isFinished) completedWeeks++;

            let badgeTitle = w.topic.split(' ').slice(0, 2).join(' ');

            dynamicBadges.push({
              id: `week_${w.weekNumber}`,
              name: `${badgeTitle} Specialist`,
              desc: `Completed the ${w.topic} module.`,
              icon: Shield,
              color: 'text-blue-600',
              bg: 'bg-blue-600/10',
              border: 'border-blue-600/20',
              unlocked: isFinished,
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
          nextMilestoneName: nextM,
          nextMilestoneProgress: Math.min(100, Math.round(nextMPerc))
        });

        setBadges([...baseBadges, ...dynamicBadges]);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, [user]);

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalXP = user?.xp || badges.filter(b => b.unlocked).reduce((s, b) => s + b.xp, 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <RefreshCw size={24} className="animate-spin text-primary opacity-50" />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-5 pb-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Achievements</h1>
          <p className="text-sm text-muted-foreground font-medium">
            {unlockedCount} Milestones Unlocked · Rank: {stats.nextMilestoneName}
          </p>
        </div>
        <div className="bg-card border border-border px-4 py-2 rounded-lg flex items-center gap-3 shadow-sm">
          <Zap size={16} className="text-primary" />
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">{totalXP.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">XP</span>
          </div>
        </div>
      </div>

      {/* Stats Dashboard Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Badges Unlocked</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-foreground">{unlockedCount}</p>
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck size={18} />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Readiness</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-foreground">{Math.round(stats.roadmapProgress)}%</p>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Target size={18} />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm md:col-span-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Next Milestone: {stats.nextMilestoneName}</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${stats.nextMilestoneProgress}%` }} />
              </div>
            </div>
            <span className="text-xs font-bold text-foreground">{stats.nextMilestoneProgress}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Badges Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const Icon = badge.icon;
              const isUnlocked = badge.unlocked;
              return (
                <div
                  key={badge.id}
                  onClick={() => isUnlocked && setSelectedBadge(badge)}
                  className={`bg-card border p-4 rounded-xl shadow-sm transition-all cursor-pointer group flex flex-col h-[160px] ${isUnlocked ? "border-border hover:border-primary/50" : "border-border/40 opacity-40 grayscale"
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isUnlocked ? `${badge.bg} ${badge.border} ${badge.color}` : 'bg-muted border-border text-muted-foreground'}`}>
                      {isUnlocked ? <Icon size={20} /> : <Lock size={18} />}
                    </div>
                    {isUnlocked && <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">Unlocked</span>}
                  </div>
                  <h4 className="text-sm font-bold text-foreground mb-1 truncate">{badge.name}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{isUnlocked ? badge.desc : "Complete core requirements to unlock."}</p>
                  <div className="mt-auto pt-3 border-t border-border flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase ${isUnlocked ? badge.color : 'text-muted-foreground'}`}>{isUnlocked ? `+${badge.xp} XP` : '---'}</span>
                    <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Badge Detail */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm sticky top-5">
            <AnimatePresence mode="wait">
              {selectedBadge ? (
                <motion.div key={selectedBadge.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${selectedBadge.bg} ${selectedBadge.border} ${selectedBadge.color} shadow-sm`}>
                      <selectedBadge.icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{selectedBadge.name}</h3>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Awarded Achievement</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <p className="text-sm font-medium text-foreground italic leading-relaxed text-center">"{selectedBadge.desc}"</p>
                  </div>
                  <div className="space-y-2">
                    <button onClick={() => toast.success('Payload copied to clipboard.')} className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
                      <Copy size={14} /> Share Achievement
                    </button>
                    <button onClick={() => setSelectedBadge(null)} className="w-full py-2 bg-muted text-foreground text-xs font-bold rounded-lg border border-border hover:bg-muted/80 transition-all">
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                    <Award size={32} className="text-muted-foreground opacity-30" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Select a Milestone</h3>
                    <p className="text-[11px] text-muted-foreground max-w-[200px] mt-1">Click on an unlocked achievement to view technical details and sharing options.</p>
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
