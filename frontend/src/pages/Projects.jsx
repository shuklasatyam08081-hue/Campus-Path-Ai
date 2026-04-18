import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { roadmapAPI } from '../api/client';
import { RefreshCw, GitBranch, ExternalLink, Play, Zap, Filter, Brain, Check } from 'lucide-react';

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
    <div className="text-center p-16 bg-card border border-border rounded-2xl mx-8 shadow-sm">
      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Brain size={32} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-4">No Active Roadmap Found</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Project Forge generates coding projects based on your AI learning path. Generate a roadmap to unlock your projects.
      </p>
      <button className="btn-primary" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</button>
    </div>
  );

  return (
    <div className="pb-12 animate-in fade-in duration-300">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Forge</h1>
          <p className="text-muted-foreground text-sm mt-1">AI portfolio projects mapped directly to your {activeRoadmap.targetRole} track</p>
        </div>
        <div className="flex gap-2 flex-wrap bg-muted/50 p-1 rounded-lg border border-border">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filter === f 
                ? 'bg-background shadow-sm border border-border text-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: projects.length, color: 'text-foreground' },
          { label: 'Completed', value: projects.filter(p => p.status === 'Completed').length, color: 'text-emerald-500' },
          { label: 'Upcoming', value: projects.filter(p => p.status === 'Upcoming').length, color: 'text-sky-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
            <div className={`text-3xl font-black ${color} mb-1`}>{value}</div>
            <div className="text-muted-foreground text-xs uppercase tracking-wider font-bold">{label}</div>
          </div>
        ))}
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(project => {
          const { badge, bar } = STATUS_STYLES[project.status];
          return (
            <div key={project.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${badge} text-[10px] uppercase font-bold tracking-wider`}>{project.status}</span>
                    <span className="badge badge-gray text-[10px] uppercase font-bold tracking-wider">Week {project.week}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-lg truncate pr-2 group-hover:text-primary transition-colors">{project.title}</h3>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1 line-clamp-2">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1.5 mb-6 min-h-[24px]">
                {project.stack.map(tech => (
                  <span key={tech} className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Build Velocity Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-semibold text-foreground">Tasks Completed</span>
                  <span className="text-xs font-bold" style={{ color: bar }}>{project.progress}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${project.progress}%`, backgroundColor: bar }} 
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {project.status === 'Completed' ? (
                  <>
                    <button className="flex-1 btn-secondary text-xs flex items-center justify-center gap-2 py-2" onClick={() => window.open(`https://github.com/${user.githubUsername}/${project.repoName}`, '_blank')}>
                      <GitBranch size={14} /> View Repo
                    </button>
                    <button className="flex-1 btn-green text-xs flex items-center justify-center gap-2 py-2" onClick={() => toast.success('Launch verification triggered!')}>
                      <Check size={14} /> Verified
                    </button>
                  </>
                ) : project.status === 'In Progress' ? (
                  <button className="flex-1 btn-primary text-xs flex items-center justify-center gap-2 py-2 w-full" onClick={() => toast.info('Navigating to specific week walkthrough...')}>
                    <Play size={14} /> Resume Week {project.week}
                  </button>
                ) : (
                  <button className="flex-1 btn-secondary text-xs flex items-center justify-center gap-2 py-2 w-full opacity-50" disabled>
                    <Zap size={14} /> Unlock Week {project.week}
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
