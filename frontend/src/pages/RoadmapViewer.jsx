import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { roadmapAPI } from '../api/client';
import { 
  Globe, Layout, Code, Server, Database, ShieldCheck, Cloud, Award, 
  Check, ChevronRight, ExternalLink, BookOpen, Play, X, RefreshCw, Map, Brain, Github, Video 
} from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_COLORS = { done: 'var(--accent-primary)', active: 'var(--accent-primary)', upcoming: 'var(--bg-card)' };

// Topic to Icon Mapping
const getTopicIcon = (topic) => {
  const t = topic.toLowerCase();
  if (t.includes('internet') || t.includes('web')) return <Globe size={24} />;
  if (t.includes('html') || t.includes('css') || t.includes('ui') || t.includes('frontend')) return <Layout size={24} />;
  if (t.includes('javascript') || t.includes('js') || t.includes('react') || t.includes('typescript')) return <Code size={24} />;
  if (t.includes('backend') || t.includes('node') || t.includes('api') || t.includes('server')) return <Server size={24} />;
  if (t.includes('database') || t.includes('sql') || t.includes('mongo')) return <Database size={24} />;
  if (t.includes('test')) return <ShieldCheck size={24} />;
  if (t.includes('deploy') || t.includes('cloud') || t.includes('devops')) return <Cloud size={24} />;
  return <Award size={24} />;
};

function ZigZagStep({ week, index, status, onSelect, side }) {
  const isActive = status === 'active';
  const isDone = status === 'done';

  const cardContent = (
    <motion.div 
      initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      className={`zigzag-card ${side}`}
      onClick={() => onSelect(week, index)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase' }}>Week {week.weekNumber}</span>
        {isDone && <Check size={14} color="#10b981" />}
      </div>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{week.topic}</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {week.description}
      </p>
    </motion.div>
  );

  return (
    <div className="zigzag-step">
      <div className="zigzag-side left">
        {side === 'left' && cardContent}
      </div>

      <motion.div 
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        className={`zigzag-node ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
        onClick={() => onSelect(week, index)}
        style={{ cursor: 'pointer' }}
      >
        <div className="zigzag-icon-container" style={{ fontWeight: 900, fontSize: '1.25rem' }}>
          {index + 1}
        </div>
      </motion.div>

      <div className="zigzag-side right">
        {side === 'right' && cardContent}
      </div>
    </div>
  );
}

function ZigZagRoadmap({ weeks, onSelect }) {
  if (!weeks || weeks.length === 0) return null;

  // Path SVG logic (S-Curves) - SYNCED WITH GRID
  const stepHeight = 200; 
  const topPadding = 100; 
  const startY = topPadding + (stepHeight / 2); // Center of the first grid cell
  const totalHeight = topPadding + (weeks.length * stepHeight);

  return (
    <div className="zigzag-container">
      {/* Background SVG Path */}
      <svg 
        className="zigzag-path-svg" 
        style={{ width: '100%', height: totalHeight, top: 0, left: 0, transform: 'none' }} 
        viewBox={`0 0 1000 ${totalHeight}`} 
        fill="none"
      >
        <path 
          d={`M 500 ${startY} ${weeks.slice(0, -1).map((_, i) => {
            const nextY = startY + ((i + 1) * stepHeight);
            const midY = startY + (i * stepHeight) + stepHeight/2;
            const xOffset = i % 2 === 0 ? 120 : -120;
            return `Q ${500 + xOffset} ${midY} 500 ${nextY}`;
          }).join(' ')}`} 
          stroke="rgba(168, 85, 247, 0.15)" 
          strokeWidth="8" 
          strokeLinecap="round"
        />
        <path 
          d={`M 500 ${startY} ${weeks.slice(0, -1).map((_, i) => {
            const nextY = startY + ((i + 1) * stepHeight);
            const midY = startY + (i * stepHeight) + stepHeight/2;
            const xOffset = i % 2 === 0 ? 120 : -120;
            return `Q ${500 + xOffset} ${midY} 500 ${nextY}`;
          }).join(' ')}`} 
          stroke="url(#pathGradient)" 
          strokeWidth="4"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="50%" stopColor="var(--accent-secondary)" />
            <stop offset="100%" stopColor="var(--accent-primary)" />
          </linearGradient>
        </defs>
      </svg>

      {weeks.map((week, index) => {
        const completedTasks = (week.tasks || []).filter(t => t.completed).length;
        const progress = week.tasks?.length > 0 ? (completedTasks / week.tasks.length) * 100 : 0;
        const status = progress === 100 ? 'done' : index === 0 || (weeks[index-1] && (weeks[index-1].tasks || []).filter(t=>t.completed).length > 0) ? 'active' : 'upcoming';

        return (
          <ZigZagStep 
            key={index}
            week={week}
            index={index}
            status={status}
            onSelect={onSelect}
            side={index % 2 === 0 ? 'left' : 'right'}
          />
        );
      })}
    </div>
  );
}
export default function RoadmapViewer() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    try {
      const r = await roadmapAPI.getAll();
      const rm = r.data.roadmaps?.[0];
      if (rm) {
        setRoadmap(rm);
        setWeeks(rm.weeks);
      } else {
        setWeeks([]);
      }
    } catch (err) {
      toast.error('Failed to fetch roadmap data.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  useEffect(() => {
    // Note: buildGraph removed in favor of SnakeRoadmap component
  }, [weeks]);

  const generateRoadmap = async () => {
    if (!user?.targetRole) { toast.error('Please complete onboarding first.'); navigate('/onboarding'); return; }
    setGenerating(true);
    toast.info('🤖 Generating your AI roadmap...');
    try {
      await roadmapAPI.generate({ githubUsername: user.githubUsername, targetRole: user.targetRole });
      toast.success('🎯 Roadmap generated!');
      fetchRoadmap();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><RefreshCw className="spin" /></div>;

  if (weeks.length === 0) {
    return (
      <div style={{ height: 'calc(100vh - 8rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'var(--bg-glass)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Map size={32} color="var(--accent-primary)" />
        </div>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Roadmap Yet</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>Your personalized career path hasn't been mapped. Generate one now using AI.</p>
        </div>
        <button className="btn-primary" onClick={generateRoadmap} disabled={generating}>
          {generating ? <><RefreshCw size={18} className="spin" /> Generating...</> : <><Brain size={18} /> Generate AI Roadmap</>}
        </button>
      </div>
    );
  }

  const toggleTask = async (weekIndex, taskIndex) => {
    const newWeeks = weeks.map((w, wi) => wi !== weekIndex ? w : {
      ...w,
      tasks: w.tasks.map((t, ti) => ti !== taskIndex ? t : { ...t, completed: !t.completed }),
    });
    setWeeks(newWeeks);
    if (roadmap) {
      try {
        await roadmapAPI.updateTask(roadmap._id, {
          weekNumber: weeks[weekIndex].weekNumber,
          taskIndex,
          completed: !weeks[weekIndex].tasks[taskIndex].completed,
        });
        toast.success('Task updated!');
      } catch { toast.error('Sync failed'); }
    }
  };

  const handleVerify = async (weekNumber) => {
    if (!roadmap) return;
    setVerifying(true);
    try {
      const res = await roadmapAPI.verifyMilestone(roadmap._id, weekNumber);
      if (res.data.verified) {
        toast.success(res.data.message || 'Milestone verified successfully!');
        fetchRoadmap(); // Refresh everything
      } else {
        toast.info(res.data.message || 'Repository not found yet. Make sure the name matches perfectly.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification check failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.5rem, 4vw, 1.75rem)', fontWeight: 700, color: 'var(--text-primary)' }}>Learning Roadmap</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {user?.targetRole || 'Fullstack'} Engineer track · {weeks.length} weeks
          </p>
        </div>
        <div className="hide-mobile" style={{ gap: '0.75rem', alignItems: 'center' }}>
          {[{ color: '#10b981', label: 'Completed' }, { color: 'var(--accent-primary)', label: 'In Progress' }, { color: 'var(--text-muted)', label: 'Upcoming' }].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-subtle)', position: 'relative', background: 'var(--bg-secondary)' }}>
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, pointerEvents: 'none' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)', margin: 0, opacity: 0.3 }}>SKILL TRIP</h3>
          </div>
          
          <div style={{ height: '100%', overflowY: 'auto' }} className="custom-scrollbar">
            <ZigZagRoadmap weeks={weeks} onSelect={(w) => setSelected(w)} />
          </div>

        {/* Detail Drawer */}
        {selected && (
          <div className="roadmap-detail-drawer custom-scrollbar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 700 }}>WEEK {selected.weekNumber}</span>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>{selected.topic}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{selected.estimatedHours}h estimated</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>{selected.description}</p>

            {/* Skills */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>SKILLS COVERED</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(selected.skills || []).map(s => (
                  <span key={s} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* GitHub Challenge */}
            {selected.expectedRepoName && (
              <div style={{ marginBottom: '2rem', padding: '1rem', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Github size={18} color="var(--accent-secondary)" />
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>GITHUB PROJECT CHALLENGE</h4>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  To complete this week, create a public GitHub repository named exactly:
                </p>
                <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginBottom: '1rem', fontFamily: 'monospace', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                  {selected.expectedRepoName}
                </div>
                {selected.isRepoVerified ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.825rem', fontWeight: 600 }}>
                    <Check size={16} /> Verified & Completed
                  </div>
                ) : (
                  <button 
                    onClick={() => handleVerify(selected.weekNumber)} 
                    disabled={verifying}
                    className="btn-cyan" 
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {verifying ? 'Checking GitHub...' : 'Verify Repository'}
                  </button>
                )}
              </div>
            )}

            {/* Day by Day Plan (If available) */}
            {selected.days && selected.days.length > 0 ? (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.08em' }}>7-DAY LEARNING PLAN</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selected.days.map((day, di) => (
                    <div 
                      key={di}
                      onClick={() => setSelectedDay(day)}
                      style={{
                        padding: '1rem', borderRadius: '10px', cursor: 'pointer',
                        background: 'var(--bg-glass)',
                        transition: 'all 0.2s', display: 'flex', gap: '1rem'
                      }}
                    >
                      <div style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.75rem', width: '3.5rem' }}>DAY {day.dayNumber}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.2rem' }}>{day.topic}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{day.subtopic}</div>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" style={{ alignSelf: 'center' }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Legacy Tasks fallback for old roadmaps
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>TASKS</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(selected.tasks || []).map((task, ti) => {
                    const weekIndex = weeks.findIndex(w => w.weekNumber === selected.weekNumber);
                    return (
                      <div
                        key={ti}
                        onClick={() => toggleTask(weekIndex, ti)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                          padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                          background: task.completed ? 'rgba(16,185,129,0.08)' : 'var(--bg-glass)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                          background: task.completed ? '#10b981' : 'var(--border-subtle)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {task.completed && <Check size={10} color="white" />}
                        </div>
                        <span style={{ fontSize: '0.825rem', color: task.completed ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: task.completed ? 'line-through' : 'none', lineHeight: 1.5 }}>{task.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Learning Center Modal (For Day specifics) */}
        {selectedDay && (
          <div className="learning-modal-overlay">
            <div className="learning-modal-content glass-card">
              <button 
                onClick={() => setSelectedDay(null)} 
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--bg-glass)', border: 'none', color: 'var(--text-primary)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
              
              <div style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>DAY {selectedDay.dayNumber}</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{selectedDay.topic}</h2>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', opacity: 0.8, marginBottom: '1.5rem' }}>{selectedDay.subtopic}</h3>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                {selectedDay.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Embedded Video */}
                {selectedDay.videoLink ? (
                  <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '1rem' }}><Video size={16} color="#ef4444" /> VIDEO LESSON</h4>
                    <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                      <iframe 
                        width="100%" height="100%" 
                        src={selectedDay.videoLink.includes('watch?v=') ? selectedDay.videoLink.replace('watch?v=', 'embed/') : selectedDay.videoLink} 
                        title="YouTube video player" style={{ border: 'none' }} 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No video available for this topic.</div>
                )}

                {/* Documentation Link */}
                {selectedDay.docLink && (
                  <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '1rem' }}><BookOpen size={16} color="var(--accent-secondary)" /> OFFICIAL DOCUMENTATION</h4>
                    <a href={selectedDay.docLink} target="_blank" rel="noreferrer" className="btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={18} /> Read the Official Guide
                      </div>
                      <ExternalLink size={16} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
