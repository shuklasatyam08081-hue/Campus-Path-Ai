import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../api/client';
import {
  Monitor, Smartphone, FileText, Palette, Download, Eye,
  RefreshCw, Github, ExternalLink, Sparkles, Layout, Settings,
  Globe, Share2, Rocket, Code, Terminal, Check, User, Briefcase,
  Mail, Linkedin, Link as LinkIcon, Plus, Trash2, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPLATES = [
  { id: 'cyber', icon: Terminal, label: 'Cyberpunk', desc: 'Neon accents and dark mode DNA' },
  { id: 'bento', icon: Layout, label: 'Bento Grid', desc: 'Modern tile-based visual story' },
  { id: 'minimal', icon: Monitor, label: 'Minimalist', desc: 'Clean, typography-focused layout' },
];

const ACCENTS = [
  { name: 'Indigo', hex: '#6366f1', glow: 'rgba(99,102,241,0.5)' },
  { name: 'Emerald', hex: '#10b981', glow: 'rgba(16,185,129,0.5)' },
  { name: 'Rose', hex: '#f43f5e', glow: 'rgba(244,63,94,0.5)' },
  { name: 'Cyan', hex: '#06b6d4', glow: 'rgba(6,182,212,0.5)' },
  { name: 'Amber', hex: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
];

export default function PortfolioBuilder() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [template, setTemplate] = useState('cyber');
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [publishing, setPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activeTab, setActiveTab] = useState('hero');

  // Load initial data if exists
  useEffect(() => {
    if (user?.portfolioData) {
      setPortfolioData(user.portfolioData.content);
      setTemplate(user.portfolioData.template || 'cyber');
      const savedAccent = ACCENTS.find(a => a.name === user.portfolioData.accentName);
      if (savedAccent) setAccent(savedAccent);
    }
  }, [user]);

  // Fully Editable Portfolio State
  const [portfolioData, setPortfolioData] = useState({
    hero: {
      name: user?.name || 'Developer Name',
      role: user?.targetRole || 'Fullstack Engineer',
      tagline: 'Building digital experiences that matter.',
      ctaPrimary: 'View Projects',
      ctaSecondary: 'Hire Me',
      profileImage: null,
    },
    about: {
      bio: `I am a passionate developer with expertise in building scalable applications. My approach focuses on clean code and user-centric problem solving.`,
      experience: '2+ Years',
      niche: 'SaaS & Fintech',
    },
    skills: {
      frontend: ['React', 'Next.js', 'Tailwind CSS'],
      backend: ['Node.js', 'PostgreSQL', 'Redis'],
      tools: ['Git', 'Docker', 'AWS'],
    },
    projects: [
      { name: 'AI Roadmap Architect', desc: 'A MERN stack application that uses Gemini AI to build learning paths.', tech: 'React, Node, Gemini', link: '#', github: '#' },
      { name: 'Crypto Pulse', desc: 'Real-time cryptocurrency tracking dashboard with live charts.', tech: 'TypeScript, Recharts', link: '#', github: '#' },
    ],
    experience: [
      { company: 'Tech Corp', role: 'Fullstack Intern', duration: '2023 - Present', desc: 'Building high-performance APIs and sleek frontends.' }
    ],
    contact: {
      email: user?.email || 'hello@dev.com',
      linkedin: 'linkedin.com/in/username',
      github: user?.githubUsername || 'github.com/username',
    }
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioData(prev => ({
          ...prev,
          hero: { ...prev.hero, profileImage: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await authAPI.updatePortfolio({
        portfolioData: {
          template,
          accentName: accent.name,
          accentHex: accent.hex,
          content: portfolioData
        }
      });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Professional Portfolio Published! 🚀');
      }
    } catch (err) {
      toast.error('Failed to publish portfolio.');
    } finally {
      setPublishing(false);
    }
  };

  // Helper functions for dynamic lists
  const addItem = (section, item) => {
    setPortfolioData(prev => ({
      ...prev,
      [section]: [...prev[section], item]
    }));
  };

  const removeItem = (section, index) => {
    setPortfolioData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const addSkill = (category) => {
    const skill = prompt('Enter skill name:');
    if (skill) {
      setPortfolioData(prev => ({
        ...prev,
        skills: { ...prev.skills, [category]: [...prev.skills[category], skill] }
      }));
    }
  };

  const removeSkill = (category, index) => {
    setPortfolioData(prev => ({
      ...prev,
      skills: { ...prev.skills, [category]: prev.skills[category].filter((_, i) => i !== index) }
    }));
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted/30 text-muted-foreground hover:bg-muted'
        }`}
    >
      <Icon size={14} /> {label}
    </button>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border/60 pb-8">
        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">
            <Sparkles size={12} className="animate-pulse" /> Identity Architect
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Portfolio Builder</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePublish} disabled={publishing} className="btn-primary px-8 py-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest relative overflow-hidden">
            {publishing ? <RefreshCw size={16} className="animate-spin" /> : <Rocket size={16} />}
            {publishing ? 'Deploying...' : 'Publish Portfolio'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-8">
        {/* Sidebar Controls */}
        <div className="space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar pr-2">

          {/* Template & Theme Selector */}
          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Palette size={16} className="text-primary" /> Visual Engine
              </h3>
              <div className="flex gap-2">
                {ACCENTS.map(a => (
                  <button key={a.name} onClick={() => setAccent(a)} className={`w-6 h-6 rounded-full transition-all ${accent.name === a.name ? 'scale-125 ring-2 ring-white shadow-lg' : ''}`} style={{ background: a.hex }} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)} className={`p-3 rounded-xl border text-center transition-all ${template === t.id ? 'border-primary bg-primary/5' : 'border-border opacity-60'}`}>
                  <t.icon size={18} className={`mx-auto mb-2 ${template === t.id ? 'text-primary' : ''}`} />
                  <div className="text-[8px] font-black uppercase tracking-tighter">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs for Content */}
          <div className="flex flex-wrap gap-2">
            <TabButton id="hero" label="Hero" icon={Rocket} />
            <TabButton id="about" label="About" icon={User} />
            <TabButton id="skills" label="Skills" icon={Code} />
            <TabButton id="projects" label="Projects" icon={Briefcase} />
            <TabButton id="experience" label="Exp" icon={GraduationCap} />
            <TabButton id="contact" label="Contact" icon={Mail} />
          </div>

          {/* Tab Content Panel */}
          <div className="glass-panel p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'hero' && (
                <motion.div key="hero" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="flex items-center gap-6 mb-6 p-4 bg-muted/20 rounded-2xl border border-dashed border-border">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-muted border border-border flex items-center justify-center group">
                      {portfolioData.hero.profileImage ? (
                        <img src={portfolioData.hero.profileImage} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <User size={32} className="text-muted-foreground opacity-30" />
                      )}
                      <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Plus size={20} className="text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-foreground mb-1">Profile Image</div>
                      <div className="text-[10px] text-muted-foreground font-medium max-w-[150px]">Recommend square aspect ratio for best results.</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Hero Name</label>
                    <input type="text" value={portfolioData.hero.name} onChange={e => setPortfolioData({ ...portfolioData, hero: { ...portfolioData.hero, name: e.target.value } })} className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Role / Specialization</label>
                    <input type="text" value={portfolioData.hero.role} onChange={e => setPortfolioData({ ...portfolioData, hero: { ...portfolioData.hero, role: e.target.value } })} className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Catchy Tagline</label>
                    <textarea rows={2} value={portfolioData.hero.tagline} onChange={e => setPortfolioData({ ...portfolioData, hero: { ...portfolioData.hero, tagline: e.target.value } })} className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:border-primary outline-none resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Primary CTA</label>
                      <input type="text" value={portfolioData.hero.ctaPrimary} onChange={e => setPortfolioData({ ...portfolioData, hero: { ...portfolioData.hero, ctaPrimary: e.target.value } })} className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2 text-xs font-bold focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Secondary CTA</label>
                      <input type="text" value={portfolioData.hero.ctaSecondary} onChange={e => setPortfolioData({ ...portfolioData, hero: { ...portfolioData.hero, ctaSecondary: e.target.value } })} className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2 text-xs font-bold focus:border-primary outline-none" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'about' && (
                <motion.div key="about" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Professional Bio</label>
                    <textarea rows={4} value={portfolioData.about.bio} onChange={e => setPortfolioData({ ...portfolioData, about: { ...portfolioData.about, bio: e.target.value } })} className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:border-primary outline-none resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Experience Level</label>
                      <input type="text" value={portfolioData.about.experience} onChange={e => setPortfolioData({ ...portfolioData, about: { ...portfolioData.about, experience: e.target.value } })} className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2 text-sm font-bold focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Niche Vector</label>
                      <input type="text" value={portfolioData.about.niche} onChange={e => setPortfolioData({ ...portfolioData, about: { ...portfolioData.about, niche: e.target.value } })} className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2 text-sm font-bold focus:border-primary outline-none" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'skills' && (
                <motion.div key="skills" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  {['frontend', 'backend', 'tools'].map(cat => (
                    <div key={cat} className="space-y-2">
                      <label className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{cat} Stack</label>
                      <div className="flex flex-wrap gap-2">
                        {portfolioData.skills[cat].map((s, i) => (
                          <span key={i} className="px-3 py-1 rounded-lg bg-muted text-[10px] font-bold border border-border flex items-center gap-2 group">
                            {s}
                            <button onClick={() => removeSkill(cat, i)} className="text-rose-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                          </span>
                        ))}
                        <button onClick={() => addSkill(cat)} className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter border border-primary/20 border-dashed hover:bg-primary/20">
                          <Plus size={10} className="inline mr-1" /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'projects' && (
                <motion.div key="projects" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  {portfolioData.projects.map((p, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-3 relative group transition-all hover:border-primary/30">
                      <button onClick={() => removeItem('projects', i)} className="absolute top-2 right-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                      <input type="text" value={p.name} placeholder="Project Name" onChange={e => {
                        const updated = [...portfolioData.projects];
                        updated[i].name = e.target.value;
                        setPortfolioData({ ...portfolioData, projects: updated });
                      }} className="bg-transparent font-black text-foreground outline-none text-sm w-full" />
                      <textarea value={p.desc} placeholder="Short description..." rows={2} onChange={e => {
                        const updated = [...portfolioData.projects];
                        updated[i].desc = e.target.value;
                        setPortfolioData({ ...portfolioData, projects: updated });
                      }} className="bg-transparent font-medium text-muted-foreground outline-none text-[11px] w-full resize-none" />
                      <div className="grid grid-cols-1 gap-2">
                        <input type="text" value={p.tech} placeholder="React, Node, etc." onChange={e => {
                          const updated = [...portfolioData.projects];
                          updated[i].tech = e.target.value;
                          setPortfolioData({ ...portfolioData, projects: updated });
                        }} className="bg-muted/50 border border-border rounded px-2 py-1 text-[9px] font-bold w-full" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 bg-muted/30 border border-border rounded px-2 py-1.5">
                          <LinkIcon size={12} className="text-muted-foreground" />
                          <input type="text" value={p.link} placeholder="Demo URL" onChange={e => {
                            const updated = [...portfolioData.projects];
                            updated[i].link = e.target.value;
                            setPortfolioData({ ...portfolioData, projects: updated });
                          }} className="bg-transparent text-[9px] font-bold outline-none w-full" />
                        </div>
                        <div className="flex items-center gap-2 bg-muted/30 border border-border rounded px-2 py-1.5">
                          <Github size={12} className="text-muted-foreground" />
                          <input type="text" value={p.github} placeholder="Repo URL" onChange={e => {
                            const updated = [...portfolioData.projects];
                            updated[i].github = e.target.value;
                            setPortfolioData({ ...portfolioData, projects: updated });
                          }} className="bg-transparent text-[9px] font-bold outline-none w-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addItem('projects', { name: 'New Project', desc: 'Brief overview...', tech: 'Tech Stack', link: '#', github: '#' })}
                    className="w-full py-3 border-2 border-dashed border-border rounded-2xl text-xs font-black text-muted-foreground uppercase hover:border-primary hover:text-primary transition-all">
                    <Plus size={14} className="inline mr-2" /> Add Project
                  </button>
                </motion.div>
              )}

              {activeTab === 'experience' && (
                <motion.div key="experience" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  {portfolioData.experience.map((exp, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-3 relative group">
                      <button onClick={() => removeItem('experience', i)} className="absolute top-2 right-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                      <input type="text" value={exp.company} placeholder="Company" onChange={e => {
                        const updated = [...portfolioData.experience];
                        updated[i].company = e.target.value;
                        setPortfolioData({ ...portfolioData, experience: updated });
                      }} className="bg-transparent font-black text-foreground outline-none text-sm w-full" />
                      <div className="flex gap-2">
                        <input type="text" value={exp.role} placeholder="Role" onChange={e => {
                          const updated = [...portfolioData.experience];
                          updated[i].role = e.target.value;
                          setPortfolioData({ ...portfolioData, experience: updated });
                        }} className="bg-muted/50 border border-border rounded px-2 py-1 text-[9px] font-bold w-full" />
                        <input type="text" value={exp.duration} placeholder="2023 - Present" onChange={e => {
                          const updated = [...portfolioData.experience];
                          updated[i].duration = e.target.value;
                          setPortfolioData({ ...portfolioData, experience: updated });
                        }} className="bg-muted/50 border border-border rounded px-2 py-1 text-[9px] font-bold w-full" />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addItem('experience', { company: 'New Company', role: 'Dev Role', duration: 'Date Range', desc: 'Summary...' })}
                    className="w-full py-3 border-2 border-dashed border-border rounded-2xl text-xs font-black text-muted-foreground uppercase hover:border-primary hover:text-primary transition-all">
                    <Plus size={14} className="inline mr-2" /> Add Experience
                  </button>
                </motion.div>
              )}

              {activeTab === 'contact' && (
                <motion.div key="contact" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="space-y-1.5 flex items-center gap-4">
                    <Mail size={18} className="text-muted-foreground" />
                    <input type="text" value={portfolioData.contact.email} onChange={e => setPortfolioData({ ...portfolioData, contact: { ...portfolioData.contact, email: e.target.value } })} className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-1.5 flex items-center gap-4">
                    <Linkedin size={18} className="text-muted-foreground" />
                    <input type="text" value={portfolioData.contact.linkedin} onChange={e => setPortfolioData({ ...portfolioData, contact: { ...portfolioData.contact, linkedin: e.target.value } })} className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-1.5 flex items-center gap-4">
                    <Github size={18} className="text-muted-foreground" />
                    <input type="text" value={portfolioData.contact.github} onChange={e => setPortfolioData({ ...portfolioData, contact: { ...portfolioData.contact, github: e.target.value } })} className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Live Preview Display */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-card/60 backdrop-blur-md border border-border/60 p-3 rounded-2xl shadow-inner sticky top-0 z-[100]">
            <div className="flex items-center gap-4 px-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Neural Stream</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPreviewMode('desktop')} className={`p-2.5 rounded-xl transition-all ${previewMode === 'desktop' ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}>
                <Monitor size={18} />
              </button>
              <button onClick={() => setPreviewMode('mobile')} className={`p-2.5 rounded-xl transition-all ${previewMode === 'mobile' ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}>
                <Smartphone size={18} />
              </button>
            </div>
          </div>

          <div className="glass-panel relative min-h-[850px] overflow-hidden flex items-start justify-center bg-[#050510] p-6 transition-all duration-500 overflow-y-auto no-scrollbar">
            <motion.div
              key={template}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1, width: previewMode === 'desktop' ? '100%' : '380px' }}
              className={`bg-background rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 relative min-h-[750px] flex flex-col no-scrollbar transition-all duration-500`}
              style={{
                fontFamily: template === 'cyber' ? '"JetBrains Mono", monospace' : template === 'minimal' ? '"Inter", sans-serif' : '"Space Grotesk", sans-serif',
                borderColor: template === 'cyber' ? `${accent.hex}40` : 'rgba(255,255,255,0.1)'
              }}
            >
              {/* --- HERO SECTION --- */}
              <div className={`p-10 relative overflow-hidden ${template === 'cyber' ? 'bg-black/40 border-b border-white/5' : 'bg-white'}`}>
                {template === 'cyber' && <div className="absolute top-4 right-4 text-[8px] font-mono text-primary animate-pulse opacity-40">VECTOR_INITIALIZED</div>}
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black mb-6 overflow-hidden ${template === 'minimal' ? 'bg-slate-100 text-slate-900 rounded-full' : 'text-white'}`} style={template !== 'minimal' ? { backgroundColor: accent.hex, boxShadow: `0 10px 30px ${accent.glow}` } : {}}>
                    {portfolioData.hero.profileImage ? (
                      <img src={portfolioData.hero.profileImage} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      portfolioData.hero.name[0]
                    )}
                  </div>
                  <h2 className={`text-4xl font-black tracking-tighter uppercase mb-2 ${template === 'minimal' ? 'text-black' : 'text-white'}`}>{portfolioData.hero.name}</h2>
                  <div className={`text-xs font-black uppercase tracking-[0.4em] mb-6 ${template === 'minimal' ? 'text-slate-400' : ''}`} style={template !== 'minimal' ? { color: accent.hex } : {}}>{portfolioData.hero.role}</div>
                  <p className={`text-sm font-medium leading-relaxed max-w-sm mb-8 ${template === 'minimal' ? 'text-slate-600' : 'text-white/70'}`}>"{portfolioData.hero.tagline}"</p>
                  <div className="flex gap-4">
                    <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl" style={{ backgroundColor: accent.hex }}>{portfolioData.hero.ctaPrimary}</button>
                    <button className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${template === 'minimal' ? 'border-slate-200 text-slate-900 hover:bg-slate-50' : 'border-white/10 text-white hover:bg-white/5'}`}>{portfolioData.hero.ctaSecondary}</button>
                  </div>
                </div>
              </div>

              {/* --- ABOUT SECTION --- */}
              <div className={`p-10 ${template === 'minimal' ? 'bg-white text-slate-900' : 'text-white/80'}`}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Neural Overview</h4>
                <p className="text-sm leading-loose font-medium opacity-90">{portfolioData.about.bio}</p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className={`p-4 rounded-2xl border ${template === 'minimal' ? 'border-slate-100' : 'bg-muted/20 border-white/5'}`}>
                    <div className="text-[9px] font-black uppercase text-muted-foreground mb-1">Experience</div>
                    <div className="text-sm font-black">{portfolioData.about.experience}</div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${template === 'minimal' ? 'border-slate-100' : 'bg-muted/20 border-white/5'}`}>
                    <div className="text-[9px] font-black uppercase text-muted-foreground mb-1">Niche Vector</div>
                    <div className="text-sm font-black">{portfolioData.about.niche}</div>
                  </div>
                </div>
              </div>

              {/* --- SKILLS SECTION --- */}
              <div className={`p-10 border-t border-white/5 ${template === 'minimal' ? 'bg-white' : ''}`}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Technical DNA</h4>
                <div className="space-y-4">
                  {portfolioData.skills.frontend.concat(portfolioData.skills.backend).slice(0, 5).map((s, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black uppercase">
                        <span>{s}</span>
                        <span style={{ color: accent.hex }}>{95 - (i * 5)}%</span>
                      </div>
                      <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${95 - (i * 5)}%` }} className="h-full rounded-full" style={{ backgroundColor: accent.hex }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- PROJECTS SECTION --- */}
              <div className={`p-10 border-t border-white/5 ${template === 'minimal' ? 'bg-white' : ''}`}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Verified Exploits</h4>
                <div className="space-y-4">
                  {portfolioData.projects.map((p, i) => (
                    <div key={i} className={`p-6 rounded-[2rem] border transition-all ${template === 'minimal' ? 'border-slate-100 hover:shadow-xl' : 'bg-muted/10 border-white/5 hover:bg-muted/20'}`}>
                      <h5 className="font-black text-sm uppercase tracking-tight text-white mb-2" style={template === 'minimal' ? { color: '#000' } : {}}>{p.name}</h5>
                      <p className="text-[11px] font-medium opacity-70 mb-4 line-clamp-2">{p.desc}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-[8px] font-black text-primary uppercase" style={{ color: accent.hex }}>{p.tech}</div>
                        <div className="flex gap-3">
                          <Github size={14} className="opacity-40" />
                          <ExternalLink size={14} className="opacity-40" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared Footer Simulation */}
              <div className={`mt-auto pt-8 pb-10 border-t border-white/5 text-center px-10 ${template === 'minimal' ? 'bg-white' : ''}`}>
                <div className="inline-flex items-center gap-2 text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] bg-muted/20 px-4 py-2 rounded-full border border-white/5">
                  <Globe size={10} /> brain.ai/p/{portfolioData.contact.github.split('/').pop()}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Deploying Overlay */}
      <AnimatePresence>
        {publishing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-background/80 backdrop-blur-2xl flex flex-col items-center justify-center p-10">
            <div className="relative w-32 h-32 mb-8">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary shadow-[0_0_40px_rgba(99,102,241,0.5)]" />
              <div className="absolute inset-0 flex items-center justify-center text-primary"><Rocket size={48} className="animate-bounce" /></div>
            </div>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-widest mb-2">Architecting Cloud Node</h2>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] animate-pulse">Syncing Neural Identity... 87%</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
