import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { roadmapAPI } from '../api/client';
import { RefreshCw, Zap, Check, Gift, Brain } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip" style={{ padding: '0.75rem 1rem', background: '#0d0d28', borderRadius: '8px' }}>
      <p style={{ color: '#94a3b8', marginBottom: '0.25rem', fontSize: '0.75rem' }}>{label}</p>
      <p style={{ color: '#a855f7', fontWeight: 700 }}>{payload[0].value} tasks completed</p>
    </div>
  );
};

const PIE_COLORS = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const MILESTONES = [
  { id: 1, title: 'First Steps', desc: 'Complete your first task', xp: 50, claimed: true, date: '2024-03-01', icon: '🚀' },
  { id: 2, title: 'Consistent Coder', desc: 'Maintain a 3-day streak', xp: 100, claimed: false, date: '2024-03-05', icon: '🔥' },
  { id: 3, title: 'Module Master', desc: 'Complete an entire week module', xp: 250, claimed: false, date: null, icon: '🧠' }
];

export default function Progress() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [milestones, setMilestones] = useState(MILESTONES);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const { data } = await roadmapAPI.getAll();
        if (data.roadmaps && data.roadmaps.length > 0) {
          setActiveRoadmap(data.roadmaps[0]);
        }
      } catch (err) {
        console.error("Failed to fetch roadmap progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, []);

  const claimMilestone = (id) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, claimed: true, date: new Date().toISOString().split('T')[0] } : m));
    toast.success('🎉 Milestone claimed! +XP awarded!');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <RefreshCw size={40} className="spin" color="#7c3aed" />
    </div>
  );

  if (!activeRoadmap) return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', margin: '2rem' }}>
      <Brain size={48} color="#7c3aed" style={{ marginBottom: '1.5rem' }} />
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>No Active Roadmap Found</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
        Progress Tracker requires an active learning path to monitor your velocity. Let's build your first career roadmap!
      </p>
      <button className="btn-primary" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</button>
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
    .map(([name, value], idx) => ({
      name,
      value: Math.round((value / activeRoadmap.weeks.reduce((sum, w) => sum + w.tasks.length, 0)) * 100) || 10,
      color: PIE_COLORS[idx % PIE_COLORS.length]
    }));

  const totalXP = milestones.filter(m => m.claimed).reduce((sum, m) => sum + m.xp, 0) + (tasksCompleted * 10);

  return (
    <div style={{ paddingBottom: '3rem', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>Progress Tracker</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Monitor your learning velocity and milestone achievements on path to {activeRoadmap.targetRole}</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Tasks Completed', value: tasksCompleted, color: '#7c3aed' },
          { label: 'XP Earned', value: totalXP.toLocaleString(), color: '#06b6d4' },
          { label: 'Milestones', value: `${milestones.filter(m => m.claimed).length}/${milestones.length}`, color: '#10b981' },
          { label: 'Avg Velocity', value: `${avgVelocity}/wk`, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Area Chart */}
        <div className="stat-card">
          <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem', marginBottom: '0.25rem' }}>Learning Velocity</h3>
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '1.25rem' }}>Tasks completed per week over your module timeline</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={velocityData}>
              <defs>
                <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 11 }} tickFormatter={w => w.replace('Week ', 'W')} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="tasks" stroke="#7c3aed" fill="url(#velGrad)" strokeWidth={2} dot={{ fill: '#a855f7', r: 4 }} activeDot={{ r: 6, fill: '#a855f7' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem', marginBottom: '0.25rem' }}>Skill Mastery</h3>
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Curriculum distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={skillPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {skillPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#0d0d28', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f8fafc' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
            {skillPieData.map(({ name, value, color }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ color: '#94a3b8', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                <span style={{ color: '#64748b', fontWeight: 600 }}>{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>Milestone Timeline</h3>
            <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Claim rewards for completing key achievements</p>
          </div>
          <div className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
            <Zap size={12} /> {totalXP.toLocaleString()} XP Total
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {milestones.map((m, i) => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              padding: '1rem 1.25rem', borderRadius: '12px',
              background: m.claimed ? 'rgba(16,185,129,0.06)' : m.date === null ? 'rgba(255,255,255,0.02)' : 'rgba(245,158,11,0.06)',
              border: `1px solid ${m.claimed ? 'rgba(16,185,129,0.2)' : m.date === null ? 'rgba(255,255,255,0.06)' : 'rgba(245,158,11,0.25)'}`,
              opacity: m.date === null ? 0.6 : 1,
            }}>
              <div style={{ fontSize: '1.5rem', minWidth: 36, textAlign: 'center' }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>{m.title}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{m.desc}</div>
                {m.date && <div style={{ color: '#475569', fontSize: '0.7rem', marginTop: '0.2rem' }}>{m.date}</div>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>+{m.xp} XP</div>
                {m.claimed ? (
                  <span className="badge badge-green" style={{ fontSize: '0.7rem' }}><Check size={10} /> Claimed</span>
                ) : m.date ? (
                  <button className="btn-cyan" onClick={() => claimMilestone(m.id)} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                    <Gift size={12} /> Claim
                  </button>
                ) : (
                  <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: '#475569', border: '1px solid rgba(255,255,255,0.08)' }}>Locked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
