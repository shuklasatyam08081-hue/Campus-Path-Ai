import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { roadmapAPI } from '../api/client';
import { RefreshCw, GitBranch, ExternalLink, Play, Zap, Filter, Brain } from 'lucide-react';

export default function Projects() {
  const { user } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState('All');
  const FILTERS = ['All', 'In Progress', 'Completed', 'Upcoming'];

  const [loading, setLoading] = useState(true);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    const fetchProjectsData = async () => {
      try {
        const { data } = await roadmapAPI.getAll();
        if (data.roadmaps && data.roadmaps.length > 0) {
          const roadmap = data.roadmaps[0];
          setActiveRoadmap(roadmap);
          
          // Map backend roadmap weeks into "Projects"
          const mappedProjects = roadmap.weeks.map(w => {
            const totalTasks = w.tasks.length || 1;
            const completedTasks = w.tasks.filter(t => t.completed).length;
            const progress = Math.round((completedTasks / totalTasks) * 100);
            
            let status = 'Upcoming';
            if (w.isRepoVerified || progress === 100) status = 'Completed';
            else if (progress > 0) status = 'In Progress';
            else if (w.weekNumber === 1 || roadmap.weeks[w.weekNumber - 2]?.isRepoVerified) status = 'In Progress'; // Unlock logic

            return {
              id: w.weekNumber,
              title: (w.expectedRepoName || "").replace('cp-', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || `Week ${w.weekNumber} Challenge`,
              description: w.projectBrief || `Develop a ${w.topic} focused module for your portfolio.`,
              status,
              week: w.weekNumber,
              stack: (w.skills && w.skills.slice(0, 4)) || [w.topic.split(' ')[0]],
              progress,
              repoName: w.expectedRepoName,
              isVerified: w.isRepoVerified
            };
          });
          
          setProjects(mappedProjects);
        }
      } catch (err) {
        console.error("Failed to fetch roadmap projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectsData();
  }, []);

  const filtered = filter === 'All' ? projects : projects.filter(p => p.status === filter);
  
  const STATUS_STYLES = {
    'Completed': { badge: 'badge-green', bar: '#10b981' },
    'In Progress': { badge: 'badge-purple', bar: '#7c3aed' },
    'Upcoming': { badge: 'badge-cyan', bar: '#06b6d4' },
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
        Project Forge generates coding projects based on your AI learning path. Generate a roadmap to unlock your projects.
      </p>
      <button className="btn-primary" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</button>
    </div>
  );

  return (
    <div style={{ paddingBottom: '3rem', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>Project Forge</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>AI portfolio projects mapped directly to your {activeRoadmap.targetRole} track</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                background: filter === f ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? 'white' : '#94a3b8', transition: 'all 0.2s',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Projects', value: projects.length, color: '#7c3aed' },
          { label: 'Completed', value: projects.filter(p => p.status === 'Completed').length, color: '#10b981' },
          { label: 'Upcoming', value: projects.filter(p => p.status === 'Upcoming').length, color: '#06b6d4' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Project Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(project => {
          const { badge, bar } = STATUS_STYLES[project.status];
          return (
            <div key={project.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className={`badge ${badge}`} style={{ fontSize: '0.65rem' }}>{project.status}</span>
                    <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>Week {project.week}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>{project.title}</h3>
                </div>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.825rem', lineHeight: 1.6, marginBottom: '1.25rem', minHeight: '3.2rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {project.description}
              </p>

              {/* Tech Stack */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem', minHeight: '22px' }}>
                {project.stack.map(tech => (
                  <span key={tech} className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{tech}</span>
                ))}
              </div>

              {/* Build Velocity Bar */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#475569' }}>Tasks Completed</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{project.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div style={{ height: '100%', borderRadius: 3, width: `${project.progress}%`, background: `linear-gradient(90deg, ${bar}, ${bar}99)`, transition: 'width 1.5s ease', boxShadow: `0 0 6px ${bar}66` }} />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {project.status === 'Completed' ? (
                  <>
                    <button className="btn-secondary" onClick={() => window.open(`https://github.com/${user.githubUsername}/${project.repoName}`, '_blank')}
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}>
                      <GitBranch size={14} /> View Repo
                    </button>
                    <button className="btn-green" onClick={() => toast.success('Launch verification triggered!')}
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}>
                      <Check size={14} /> Verified
                    </button>
                  </>
                ) : project.status === 'In Progress' ? (
                  <button className="btn-primary" onClick={() => toast.info('Navigating to specific week walkthrough...')}
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}>
                    <Play size={14} /> Resume Week {project.week}
                  </button>
                ) : (
                  <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem', opacity: 0.5 }} disabled>
                    <Zap size={14} /> Unlock by completing Week {project.week - 1}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
