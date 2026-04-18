import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { roadmapAPI, jobsAPI } from '../api/client';
import axios from 'axios';
import { 
  Briefcase, Search, MapPin, Zap, ArrowUp, Tag, TrendingUp, RefreshCw, 
  Brain, Mic, MicOff, Send, X, FileText, Upload, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const matchColor = (pct) => pct >= 90 ? '#10b981' : pct >= 75 ? 'var(--primary)' : '#f59e0b';

// --- AI Interview Modal Component ---
function InterviewSimulator({ job, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Initial greeting
    setLoading(true);
    axios.post('http://localhost:5000/api/ai/interview', {
      targetRole: job.role,
      messages: [],
      roadmapContext: user?.roadmapData || {}
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('campuspath_token')}` }
    }).then(res => {
      setMessages([{ role: 'assistant', content: res.data.message }]);
    }).finally(() => setLoading(false));
  }, [job.role, user?.roadmapData]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/interview', {
        targetRole: job.role,
        messages: newMessages,
        roadmapContext: user?.roadmapData || {}
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('campuspath_token')}` }
      });
      setMessages([...newMessages, { role: 'assistant', content: data.message }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setInput(speechToText);
      sendMessage(speechToText);
    };
    if (isListening) recognition.stop();
    else recognition.start();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-card border border-border w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold">AI Interview Simulator</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Role: {job.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                ? 'bg-primary text-primary-foreground font-medium rounded-tr-none' 
                : 'bg-muted border border-border text-foreground rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted border border-border p-4 rounded-2xl rounded-tl-none animate-pulse">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 border-t border-border bg-muted/10">
          <div className="flex gap-3">
            <button 
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all ${isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-card border border-border text-muted-foreground hover:text-primary'}`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input 
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer or use voice..." 
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 ring-primary/20"
            />
            <button onClick={() => sendMessage()} className="p-3 bg-primary text-primary-foreground rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all">
              <Send size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- ATS Grader Component ---
function ATSGrader({ job, onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload a resume first'); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', `${job.role} at ${job.company}. Requirements: ${job.tags.join(', ')}`);

    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/score-resume', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('campuspath_token')}` 
        }
      });
      setResult(data.data);
    } catch (err) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <FileText className="text-orange-500" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold">AI Resume ATS Grader</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Analyze for: {job.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-8">
          {!result ? (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer relative group">
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" />
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-primary" size={24} />
                </div>
                <h4 className="text-sm font-bold mb-1">{file ? file.name : 'Upload Resume (PDF)'}</h4>
                <p className="text-xs text-muted-foreground">Max size 2MB · Only PDF supported</p>
              </div>

              <button 
                onClick={handleAnalyze} disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />} 
                {loading ? 'Analyzing...' : 'Get ATS Score'}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">Match Percentage</p>
                  <p className="text-4xl font-black text-foreground">{result.score}%</p>
                </div>
                <div className={`w-16 h-16 rounded-full border-[6px] border-${result.score > 70 ? 'primary' : 'orange-500'}/20 flex items-center justify-center relative`}>
                   <div className={`absolute inset-0 rounded-full border-[6px] border-${result.score > 70 ? 'primary' : 'orange-500'}`} style={{ clipPath: `inset(0 ${100 - result.score}% 0 0)` }} />
                   <ChevronRight className="text-muted-foreground" size={20} />
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black tracking-widest text-primary uppercase mb-3 flex items-center gap-2"><CheckCircle2 size={14} /> Critical Suggestions</h4>
                <div className="space-y-2">
                  {result.improvementTips.map((tip, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-card border border-border rounded-lg text-xs font-medium leading-relaxed">
                       <span className="text-primary">•</span> {tip}
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setResult(null)} className="w-full py-3 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                Analyze another resume
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Main Jobs Component ---
export default function Jobs() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [jobPool, setJobPool] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  
  // Feature states
  const [interviewJob, setInterviewJob] = useState(null);
  const [atsJob, setAtsJob] = useState(null);

  // Extract baseline user skills
  const github = user?.githubData || {};
  const [userSkillsSet, setUserSkillsSet] = useState(new Set([
    ...(github.languages?.map(l => l.language.toLowerCase()) || []),
    ...(github.frameworks?.map(f => f.toLowerCase()) || []),
    ...(user?.techStack?.map(s => s.toLowerCase()) || [])
  ]));

  useEffect(() => {
    const fetchRealData = async () => {
      const currentUserSkills = new Set([
        ...(github.languages?.map(l => l.language.toLowerCase()) || []),
        ...(github.frameworks?.map(f => f.toLowerCase()) || []),
        ...(user?.techStack?.map(s => s.toLowerCase()) || [])
      ]);

      try {
        let searchKeyword = user?.targetRole || 'developer';
        
        const { data: roadmapData } = await roadmapAPI.getAll();
        if (roadmapData.roadmaps && roadmapData.roadmaps.length > 0) {
          const roadmap = roadmapData.roadmaps[0];
          setActiveRoadmap(roadmap);
          searchKeyword = roadmap.targetRole || searchKeyword;
          roadmap.weeks.forEach(w => { if (w.skills) w.skills.forEach(s => currentUserSkills.add(s.toLowerCase())); });
        }
        
        setLoading(true);
        // Use backend proxy to avoid CORS issues with Remotive API
        const { data: jobsData } = await jobsAPI.getJobs(searchKeyword, 80);

        if (jobsData.jobs) {
          const formattedJobs = jobsData.jobs.map(job => ({
            id: job.id,
            url: job.url,
            company: job.company_name,
            role: job.title,
            location: job.candidate_required_location || 'Remote',
            tags: job.tags || [],
            salary: job.salary ? job.salary.replace(/USD|EUR|GBP/gi, '').trim() : 'Competitive',
            posted: new Date(job.publication_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            hot: (Date.now() - new Date(job.publication_date).getTime() < 86400000 * 3)
          }));
          // Store skills so calculateMatch can use them
          setUserSkillsSet(currentUserSkills);
          setJobPool(formattedJobs);
        }
      } catch (err) {
        console.error("Failed to fetch Job Board:", err);
        toast.error('Could not load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateMatch = (tags) => {
    if (!userSkillsSet.size) return 45; // Default 45% if no skills data yet
    let matches = 0;
    tags.forEach(t => {
      const lowerT = t.toLowerCase();
      for (const skill of userSkillsSet) {
        if (lowerT.includes(skill) || skill.includes(lowerT)) {
          matches++;
          break;
        }
      }
    });
    const percentage = Math.round((matches / (tags.length || 1)) * 100);
    return Math.min(percentage + 30, 100); 
  };

  const REAL_JOBS = jobPool
    .map(j => ({ ...j, match: calculateMatch(j.tags) }))
    .sort((a, b) => b.match - a.match);

  const filtered = REAL_JOBS.filter(j =>
    j.role.toLowerCase().includes(query.toLowerCase()) ||
    j.company.toLowerCase().includes(query.toLowerCase()) ||
    j.location.toLowerCase().includes(query.toLowerCase()) ||
    j.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  const handleApply = (job) => {
    toast.info(`Redirecting safely to ${job.company} portal...`);
    window.open(job.url, '_blank');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <RefreshCw size={40} className="animate-spin text-primary" />
      <p className="text-primary text-sm font-bold tracking-widest uppercase">Polling live global remote board...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-12">
      {/* Modals */}
      <AnimatePresence>
        {interviewJob && <InterviewSimulator job={interviewJob} onClose={() => setInterviewJob(null)} />}
        {atsJob && <ATSGrader job={atsJob} onClose={() => setAtsJob(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Live Job Match Engine</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          Aggregating active remote tech opportunities mapped to your developer DNA
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </p>
      </div>

      {/* Search & AI Tools Promo */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            className="w-full bg-card border border-border pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 ring-primary/20 transition-all" 
            placeholder="Search roles, verified companies, or tech tags..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl text-xs font-bold text-primary">
            <Brain size={16} /> AI Simulator Ready
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-500/5 border border-orange-500/20 rounded-xl text-xs font-bold text-orange-500">
            <FileText size={16} /> ATS Scanner v2.0
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Live Openings', value: filtered.length, color: 'var(--color-primary)', icon: Briefcase },
          { label: 'Avg Match', value: `${Math.round(filtered.reduce((s, j) => s + j.match, 0) / (filtered.length || 1))}%`, color: '#10b981', icon: TrendingUp },
          { label: 'Recently Active', value: filtered.filter(j => j.hot).length, color: '#f59e0b', icon: Zap },
          { label: 'Match Verified', value: '100%', color: '#6366f1', icon: CheckCircle2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground leading-none mb-1">{value}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map(job => {
          const color = matchColor(job.match);
          return (
            <motion.div 
              layout key={job.id} 
              className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-primary/50 transition-all flex flex-col md:flex-row gap-6 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Tag className="text-muted-foreground/30" size={120} style={{ transform: 'rotate(-20deg) translate(40px, -20px)' }} />
              </div>

              {/* Company Logo Replacement */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center text-xl font-black shrink-0 border border-primary/10">
                {job.company[0]}
              </div>

              {/* Main Info */}
              <div className="flex-1 space-y-4 relative z-10">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground leading-tight">{job.role}</h3>
                      {job.hot && <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">🔥 NEW</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <span className="font-bold text-primary">{job.company}</span>
                      <span className="flex items-center gap-1.5 text-muted-foreground"><MapPin size={14} /> {job.location}</span>
                      <span className="text-emerald-500 font-bold tracking-tight">{job.salary}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:self-start lg:self-center">
                    <div className="text-right">
                      <div className="text-2xl font-black text-foreground">{job.match}%</div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">DNA Match</div>
                    </div>
                    <div className="w-12 h-12 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
                        <circle cx="24" cy="24" r="20" fill="transparent" stroke={color} strokeWidth="4" strokeDasharray={126} strokeDashoffset={126 - (job.match / 100) * 126} strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.tags.slice(0, 6).map(tag => (
                    <span key={tag} className="text-[10px] font-bold px-2 py-1 bg-muted border border-border rounded-lg text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button onClick={() => handleApply(job)} className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <Zap size={14} /> Apply Now
                  </button>
                  <button onClick={() => setInterviewJob(job)} className="flex-1 md:flex-none px-6 py-2.5 bg-muted border border-border text-foreground text-xs font-bold rounded-xl hover:bg-card transition-all flex items-center justify-center gap-2">
                    <Brain size={14} className="text-primary" /> AI Simulator
                  </button>
                  <button onClick={() => setAtsJob(job)} className="flex-1 md:flex-none px-6 py-2.5 bg-muted border border-border text-foreground text-xs font-bold rounded-xl hover:bg-card transition-all flex items-center justify-center gap-2">
                    <FileText size={14} className="text-orange-500" /> ATS Grader
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
