import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { roadmapAPI } from '../api/client';
import { Zap, Flame, Shield, Star, Award, Lock, ExternalLink, Download, RefreshCw, Brain } from 'lucide-react';

const PIE_COLORS = ['#06b6d4', '#10b981', '#ec4899', '#f97316', 'var(--primary)', '#3b82f6'];

export default function Achievements() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showPost, setShowPost] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { data } = await roadmapAPI.getAll();
        
        let dynamicBadges = [];
        let hasRoadmap = data.roadmaps && data.roadmaps.length > 0;
        
        // 1. Base Global Badges
        const baseBadges = [
          { id: 'global_1', name: 'Early Adopter', desc: 'Joined CampusPath AI in the first cohort.', icon: Zap, color: '#f59e0b', unlocked: true, date: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2024-03-01', xp: 200 },
          { id: 'global_2', name: '7-Day Streak', desc: 'Maintained 7 consecutive days of learning.', icon: Flame, color: '#ef4444', unlocked: (user?.streak || 0) >= 7, date: null, xp: 350 },
          { id: 'global_3', name: 'First Roadmap', desc: 'Generated your first AI-powered roadmap.', icon: Star, color: '#7c3aed', unlocked: hasRoadmap, date: hasRoadmap && data.roadmaps[0].createdAt ? new Date(data.roadmaps[0].createdAt).toLocaleDateString() : null, xp: 150 },
          { id: 'global_4', name: 'Job Getter', desc: 'Received and accepted a job offer.', icon: Award, color: 'var(--primary)', unlocked: false, xp: 2000 },
        ];

        // 2. Synthesize Contextual Badges based on Roadmap Modules
        if (hasRoadmap) {
          const roadmap = data.roadmaps[0];
          setActiveRoadmap(roadmap);

          roadmap.weeks.forEach((w, index) => {
            const totalTasks = w.tasks.length || 1;
            const completedTasks = w.tasks.filter(t => t.completed).length;
            const isFinished = w.isRepoVerified || (completedTasks === totalTasks && totalTasks > 0);
            
            // Clean module name
            let badgeTitle = w.topic.split(' ').slice(0, 3).join(' ').replace(/[^a-zA-Z0-9 ]/g, "");

            dynamicBadges.push({
              id: `week_${w.weekNumber}`,
              name: `${badgeTitle} Specialist`,
              desc: `Mastered the ${w.topic} module curriculum.`,
              icon: Shield,
              color: PIE_COLORS[index % PIE_COLORS.length],
              unlocked: isFinished,
              date: isFinished ? new Date().toLocaleDateString() : null, // Uses current date on unlock
              xp: 500 + (w.weekNumber * 50) // Progressive XP scaling
            });
          });
        }

        setBadges([...baseBadges, ...dynamicBadges]);
      } catch (err) {
        console.error("Failed to fetch roadmap for achievements engine:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, [user]);

  const generateSocialPost = (badge) => {
    if (badge.id === 'global_1') return `🚀 Just joined the CampusPath AI early adopter cohort! Taking my career into my own hands with an AI-driven learning path to track my velocity.\n\n#BuildInPublic #CampusPathAI #100DaysOfCode`;
    if (badge.id === 'global_3') return `🌟 Just generated my very first AI-guided curriculum on CampusPath AI!\n\nIt algorithmically excluded technologies I already know and built a precise pathway to reach my dream role.\n\nTime to build!\n\n#DeveloperJourney #AI #CampusPathAI`;
    if (badge.id.startsWith('week_')) return `🔥 Just unlocked the **${badge.name}** milestone on CampusPath AI!\n\nI've officially mastered the core fundamentals of ${badge.desc.replace('Mastered the ', '').replace(' module curriculum.', '')}.\n\nBuilt the projects, verified my codebase on GitHub via WebHook, and moving closer to my goal! Who says learning has to be boring?\n\n#CampusPathAI #LevelUp #TechJourney`;
    return `🏆 Proud to unlock the ${badge.name} badge on my personal tech roadmap!\n\n${badge.desc}\n\n#Developer #CampusPathAI`;
  };

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalXP = user?.xp || badges.filter(b => b.unlocked).reduce((s, b) => s + b.xp, 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <RefreshCw size={40} className="spin" color="var(--primary)" />
    </div>
  );

  return (
    <div style={{ paddingBottom: '3rem', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--foreground)' }}>Achievement Vault</h1>
          <p style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>Earn dynamic badges, collect XP, and prove your algorithmic expertise</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="badge badge-purple" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}>
            <Zap size={12} /> {totalXP.toLocaleString()} Total XP
          </div>
          <div className="badge badge-green" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}>
            {unlockedCount}/{badges.length} Earned
          </div>
        </div>
      </div>

      {(!activeRoadmap) && (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-glass)', borderRadius: '16px', marginBottom: '2rem' }}>
          <Brain size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--foreground)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Modules Detected</h3>
          <p style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>Generate an AI roadmap to dynamically construct module mastery badges!</p>
        </div>
      )}

      {/* Badge Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {badges.map(badge => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              onClick={() => {
                if (badge.unlocked) {
                  setSelectedBadge(badge);
                  setShowPost(false); // Reset post preview when changing badges
                }
              }}
              style={{
                padding: '1.75rem',
                borderRadius: '16px',
                background: badge.unlocked
                  ? `linear-gradient(135deg, ${badge.color}25, ${badge.color}15)`
                  : 'var(--bg-glass)',
                cursor: badge.unlocked ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                opacity: badge.unlocked ? 1 : 0.7,
                boxShadow: badge.unlocked ? `0 0 20px ${badge.color}30` : 'none',
                border: badge.unlocked ? `1px solid ${badge.color}40` : '1px solid var(--border)',
              }}
              onMouseEnter={e => badge.unlocked && (e.currentTarget.style.transform = 'translateY(-4px)', e.currentTarget.style.boxShadow = `0 8px 30px ${badge.color}30`)}
              onMouseLeave={e => badge.unlocked && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = `0 0 20px ${badge.color}20`)}
            >
              {/* Shimmer effect for unlocked */}
              {badge.unlocked && (
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent, ${badge.color}08, transparent)`, pointerEvents: 'none' }} className="shimmer" />
              )}

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 1rem',
                  background: badge.unlocked ? `${badge.color}25` : 'var(--bg-glass)',
                  border: badge.unlocked ? `2px solid ${badge.color}60` : '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: badge.unlocked ? `0 0 20px ${badge.color}40` : 'none',
                }}>
                  {badge.unlocked ? <Icon size={24} color={badge.color} /> : <Lock size={20} color="var(--muted-foreground)" />}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: badge.unlocked ? 'var(--foreground)' : 'var(--muted-foreground)', marginBottom: '0.35rem' }}>{badge.name}</div>
                <div style={{ fontSize: '0.75rem', color: badge.unlocked ? 'var(--primary)' : 'var(--muted-foreground)', fontWeight: 500, lineHeight: 1.5, marginBottom: '0.75rem' }}>{badge.desc}</div>
                <div style={{ fontSize: '0.75rem', color: badge.unlocked ? badge.color : 'var(--muted-foreground)', fontWeight: 800 }}>+{badge.xp} XP</div>
                {badge.date && badge.unlocked && <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', fontWeight: 600, marginTop: '0.25rem' }}>Unlocked: {badge.date}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Badge Actions */}
      {selectedBadge && (
        <div className="glass-panel" style={{ 
          padding: '2rem',
          background: `linear-gradient(135deg, ${selectedBadge.color}15, var(--card))`, 
          border: `1px solid ${selectedBadge.color}40`, 
          animation: 'fadeIn 0.3s ease-out',
          boxShadow: `0 10px 40px ${selectedBadge.color}20`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${selectedBadge.color}20`, border: `2px solid ${selectedBadge.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 25px ${selectedBadge.color}40` }}>
              <selectedBadge.icon size={28} color={selectedBadge.color} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{selectedBadge.name}</h3>
              <p style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{selectedBadge.desc}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => { setShowPost(true); toast.success('Social post template generated!'); }}
                style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ExternalLink size={14} /> Share on LinkedIn
              </button>
              <button className="btn-secondary" onClick={() => toast.info('PDF API Generation coming soon!')}
                style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={14} /> Certificate
              </button>
            </div>
          </div>

          {/* AI ExternalLink Post Preview */}
          {showPost && (
            <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '10px', background: 'var(--bg-glass)', border: '1px solid var(--border)', animation: 'fadeIn 0.4s ease-out' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>AI-GENERATED SHARE POST</div>
              <pre style={{ color: 'var(--primary)', fontSize: '0.8rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                {generateSocialPost(selectedBadge)}
              </pre>
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.75rem' }}>
                <button className="btn-primary" onClick={() => toast.success('Text copied to clipboard!')} style={{ fontSize: '0.75rem', padding: '0.4rem 0.875rem' }}>
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
