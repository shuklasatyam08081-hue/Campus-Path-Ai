import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { roadmapAPI } from '../api/client';
import {
  Globe, Layout, Code, Server, Database, ShieldCheck, Cloud, Award,
  Check, ChevronRight, ExternalLink, BookOpen, Play, X, RefreshCw, Map, Brain, Github, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ThreeSkillTree from '../components/ThreeSkillTree';

const getTopicIcon = (topic) => {
  const t = topic?.toLowerCase() || '';
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
      viewport={{ once: true, margin: "-50px" }}
      className={`glass-panel p-5 cursor-pointer hover:border-primary/50 transition-all hover:scale-[1.02] active:scale-95 ${isActive ? 'ring-2 ring-primary/50 bg-primary/5 shadow-lg shadow-primary/10' :
        isDone ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80' :
          'opacity-60 grayscale-[30%]'
        }`}
      onClick={() => onSelect(week, index)}
    >
      <div className="flex justify-between items-center mb-2">
        <span className={twMerge(
          "text-[10px] font-black tracking-widest uppercase",
          isDone ? "text-emerald-500" : isActive ? "text-primary" : "text-muted-foreground"
        )}>
          Week {week.weekNumber}
        </span>
        {isDone && <Check size={16} className="text-emerald-500" />}
      </div>
      <h4 className="text-sm font-bold text-foreground mb-2 leading-snug line-clamp-2">{week.topic}</h4>
      <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">
        {week.description}
      </p>
    </motion.div>
  );

  return (
    <div className="relative flex justify-center items-center h-[200px] w-full max-w-4xl mx-auto z-10 group">

      {/* Left side content slot */}
      <div className="absolute left-0 w-[calc(50%-4rem)] md:w-[calc(50%-6rem)] flex justify-end">
        {side === 'left' && cardContent}
      </div>

      {/* Center Node */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        onClick={() => onSelect(week, index)}
        className={twMerge(
          "w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-black text-lg md:text-xl relative z-20 cursor-pointer shadow-xl transition-all border-4 bg-card",
          isDone ? 'border-emerald-500 text-emerald-500 shadow-emerald-500/20' :
            isActive ? 'border-primary text-primary shadow-primary/40 scale-110' :
              'border-border text-muted-foreground'
        )}
      >
        {isDone ? <Check size={24} strokeWidth={4} /> : index + 1}
      </motion.div>

      {/* Right side content slot */}
      <div className="absolute right-0 w-[calc(50%-4rem)] md:w-[calc(50%-6rem)] flex justify-start">
        {side === 'right' && cardContent}
      </div>
    </div>
  );
}

function ZigZagRoadmap({ weeks, onSelect }) {
  if (!weeks || weeks.length === 0) return null;

  const stepHeight = 200;
  const topPadding = 100;
  const startY = topPadding + (stepHeight / 2);
  const totalHeight = topPadding + (weeks.length * stepHeight);

  return (
    <div className="relative w-full overflow-hidden no-scrollbar" style={{ height: totalHeight }}>
      {/* Background SVG Path */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 1000 ${totalHeight}`}
        fill="none"
        preserveAspectRatio="xMidYMin slice"
      >
        <path
          d={`M 500 ${startY} ${weeks.slice(0, -1).map((_, i) => {
            const nextY = startY + ((i + 1) * stepHeight);
            const midY = startY + (i * stepHeight) + stepHeight / 2;
            const xOffset = i % 2 === 0 ? 120 : -120;
            return `Q ${500 + xOffset} ${midY} 500 ${nextY}`;
          }).join(' ')}`}
          stroke="var(--color-primary)"
          strokeOpacity="0.15"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M 500 ${startY} ${weeks.slice(0, -1).map((_, i) => {
            const nextY = startY + ((i + 1) * stepHeight);
            const midY = startY + (i * stepHeight) + stepHeight / 2;
            const xOffset = i % 2 === 0 ? 120 : -120;
            return `Q ${500 + xOffset} ${midY} 500 ${nextY}`;
          }).join(' ')}`}
          stroke="var(--color-primary)"
          strokeOpacity="0.5"
          strokeWidth="3"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative w-full pt-[100px]">
        {weeks.map((week, index) => {
          const completedTasks = (week.tasks || []).filter(t => t.completed).length;
          const progress = week.tasks?.length > 0 ? (completedTasks / week.tasks.length) * 100 : 0;
          const status = progress === 100 ? 'done' : index === 0 || (weeks[index - 1] && (weeks[index - 1].tasks || []).filter(t => t.completed).length > 0) ? 'active' : 'upcoming';

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
  const [viewMode, setViewMode] = useState('list'); // 'list' or '3d'

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

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="animate-spin text-primary" size={32} /></div>;

  if (weeks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Map size={40} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3 font-sans tracking-tight">No Roadmap Yet</h2>
        <p className="text-muted-foreground font-medium mb-8">Your personalized career path hasn't been mapped. Generate one now using AI.</p>
        <button
          className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
          onClick={generateRoadmap}
          disabled={generating}
        >
          {generating ? <><RefreshCw size={18} className="animate-spin" /> Generating...</> : <><Brain size={18} /> Generate AI Roadmap</>}
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
        fetchRoadmap();
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
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold font-sans text-foreground mb-1">Learning Roadmap</h1>
          <p className="text-primary text-sm font-medium">
            {user?.targetRole || 'Fullstack'} Engineer track · {weeks.length} weeks
          </p>
        </div>
          {/* Legend & View Toggles */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-4 items-center">
              {[
                { color: 'bg-emerald-500', label: 'Completed' },
                { color: 'bg-primary', label: 'In Progress' },
                { color: 'bg-muted-foreground', label: 'Upcoming' }
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  {label}
                </div>
              ))}
            </div>
            
            <div className="flex bg-muted border border-border rounded-xl p-1 shadow-inner h-fit">
               <button 
                 onClick={() => setViewMode('list')}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
               >
                 <Layout size={14} /> List
               </button>
               <button 
                 onClick={() => setViewMode('3d')}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === '3d' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
               >
                 <RefreshCw size={14} /> 3D DNA
               </button>
            </div>
          </div>
      </div>

      <div className="flex-1 relative rounded-3xl border border-border bg-card/40 backdrop-blur-md overflow-hidden shadow-inner flex">

        {/* Main Content Area */}
        <div className="flex-1 h-full relative">
          <AnimatePresence mode="wait">
            {viewMode === '3d' ? (
              <motion.div 
                key="3d" 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.1 }}
                className="absolute inset-0 z-0"
              >
                <ThreeSkillTree 
                  roadmap={{ weeks }} 
                  activeWeek={weeks.findIndex(w => w.weekNumber === selected?.weekNumber)} 
                  onSelectWeek={(idx) => {
                    setSelected(weeks[idx]);
                    setViewMode('list');
                  }} 
                />
              </motion.div>
            ) : (
              <motion.div 
                key="list" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto no-scrollbar relative"
              >
                <div className="absolute top-8 left-8 z-10 pointer-events-none">
                  <h3 className="text-5xl font-black text-primary/5 tracking-tighter">SKILL PATH</h3>
                </div>
                <ZigZagRoadmap weeks={weeks} onSelect={(w) => setSelected(w)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detail Sidebar / Drawer */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute md:static top-0 right-0 w-full md:w-[400px] h-full bg-background/95 md:bg-card border-l border-border shadow-2xl overflow-y-auto no-scrollbar z-50 flex flex-col"
            >
              <div className="p-6 sticky top-0 bg-background/95 md:bg-card z-10 border-b border-border/50 backdrop-blur-md flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-primary mb-1 block">Week {selected.weekNumber}</span>
                  <h2 className="text-lg font-bold text-foreground leading-tight">{selected.topic}</h2>
                  <p className="text-xs text-muted-foreground font-medium mt-1">{selected.estimatedHours}h estimated</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-8 flex-1">
                <p className="text-sm text-foreground/80 font-medium leading-relaxed">{selected.description}</p>

                {/* Skills */}
                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Skills Covered</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selected.skills || []).map(s => (
                      <span key={s} className="px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* GitHub Challenge */}
                {selected.expectedRepoName && (
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 shadow-inner">
                    <div className="flex items-center gap-2 mb-3">
                      <Github size={18} className="text-primary" />
                      <h4 className="text-xs font-black text-primary uppercase tracking-widest">Project Challenge</h4>
                    </div>
                    <p className="text-xs text-primary/80 font-medium leading-relaxed mb-4">
                      Create a public GitHub repository named exactly:
                    </p>
                    <div className="bg-background border border-border p-3 rounded-xl font-mono text-xs text-foreground font-bold shadow-sm mb-4 break-all">
                      {selected.expectedRepoName}
                    </div>
                    {selected.isRepoVerified ? (
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 py-2.5 rounded-xl border border-emerald-500/20">
                        <Check size={16} /> Verified & Completed
                      </div>
                    ) : (
                      <button
                        onClick={() => handleVerify(selected.weekNumber)}
                        disabled={verifying}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                      >
                        {verifying ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                        {verifying ? 'Checking GitHub...' : 'Verify Repository'}
                      </button>
                    )}
                  </div>
                )}

                {/* Tasks / Days */}
                {selected.days && selected.days.length > 0 ? (
                  <div>
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">7-Day Learning Plan</h4>
                    <div className="space-y-2">
                      {selected.days.map((day, di) => (
                        <div
                          key={di}
                          onClick={() => setSelectedDay(day)}
                          className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary/50 cursor-pointer group shadow-sm transition-all"
                        >
                          <div className="text-xs font-black text-primary uppercase shrink-0 w-12">Day {day.dayNumber}</div>
                          <div className="flex-1 truncate">
                            <div className="text-sm font-bold text-foreground truncate">{day.topic}</div>
                            <div className="text-xs text-muted-foreground truncate font-medium">{day.subtopic}</div>
                          </div>
                          <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Checklist</h4>
                    <div className="space-y-2">
                      {(selected.tasks || []).map((task, ti) => {
                        const weekIndex = weeks.findIndex(w => w.weekNumber === selected.weekNumber);
                        return (
                          <div
                            key={ti}
                            onClick={() => toggleTask(weekIndex, ti)}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${task.completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-background hover:bg-muted border-border hover:border-border/80 shadow-sm'
                              }`}
                          >
                            <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/30'
                              }`}>
                              {task.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className={`text-sm font-medium leading-snug ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground/90'
                              }`}>
                              {task.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Single Day Modal */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-12"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-4xl max-h-full flex flex-col bg-card border border-border shadow-2xl rounded-3xl overflow-hidden relative"
              >
                <div className="p-6 md:p-8 flex-1 overflow-y-auto no-scrollbar">
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors z-10 shadow-sm"
                  >
                    <X size={20} />
                  </button>

                  <div className="text-xs font-black tracking-widest text-primary uppercase mb-2">Day {selectedDay.dayNumber}</div>
                  <h2 className="text-3xl font-extrabold text-foreground mb-1 tracking-tight pr-12">{selectedDay.topic}</h2>
                  <h3 className="text-lg font-bold text-muted-foreground mb-8 pr-12">{selectedDay.subtopic}</h3>

                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                    <div className="space-y-6 text-foreground/80 font-medium leading-relaxed">
                      <p>{selectedDay.description}</p>
                    </div>

                    <div className="space-y-6">
                      {selectedDay.videoLink ? (
                        <div className="p-4 rounded-2xl bg-black border border-border shadow-inner">
                          <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3"><Video size={14} /> Video Lesson</h4>
                          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/10">
                            <iframe
                              width="100%" height="100%"
                              src={selectedDay.videoLink.includes('watch?v=') ? selectedDay.videoLink.replace('watch?v=', 'embed/') : selectedDay.videoLink}
                              title="YouTube Lesson"
                              className="border-none"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs font-medium text-muted-foreground text-center">
                          No video available for this topic.
                        </div>
                      )}

                      {selectedDay.docLink && (
                        <a
                          href={selectedDay.docLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary hover:text-primary/90 transition-colors group shadow-inner"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen size={18} />
                            <div>
                              <div className="text-xs font-black uppercase tracking-widest leading-none mb-1">Official Guide</div>
                              <div className="text-sm font-bold">Read Docs</div>
                            </div>
                          </div>
                          <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
