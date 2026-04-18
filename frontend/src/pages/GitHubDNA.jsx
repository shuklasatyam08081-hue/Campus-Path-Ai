import { useState } from 'react';
import ContributionHeatmap from '../components/GitHub/ContributionHeatmap';
import { 
  Github, Globe, Terminal, Info, AlertTriangle, Zap, Search, 
  RefreshCw, Shield, Zap as Fast, Layout, Activity, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export default function GitHubDNA() {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.githubUsername || 'Shubham-k-yadav');
  const [repoSearch, setRepoSearch] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [scorecard, setScorecard] = useState(null);
  const toast = useToast();

  const handleReview = async () => {
    if (!repoSearch.trim()) { toast.error('Please enter a repository name'); return; }
    setReviewLoading(true);
    setScorecard(null);
    try {
      const { data } = await githubAPI.reviewRepo(username, repoSearch);
      setScorecard(data.data);
      toast.success('Code Review Complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed. Is the repo public?');
    } finally {
      setReviewLoading(false);
    }
  };

  const Metric = ({ label, value, icon: Icon, color }) => (
    <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <Icon size={14} className={color} />
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-black text-foreground">{value}</p>
        <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden mb-2">
           <div className={`h-full ${color.replace('text-', 'bg-')}`} style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-12 animate-in fade-in duration-300 selection:bg-primary/20">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-muted rounded-lg border border-border">
                <Github size={24} className="text-foreground" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">GitHub DNA Analyzer</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              A high-fidelity contribution visualizer and <span className="text-emerald-500">AI-powered</span> code auditing engine.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border shadow-sm">
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub Username" 
              className="bg-transparent border-none outline-none text-sm px-4 py-2 w-48 font-mono placeholder:text-muted-foreground/70 text-foreground"
            />
            <button className="btn-green">
              Sync DNA
            </button>
          </div>
        </div>

        {/* Contribution Grid */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <Globe size={16} />
            <span className="text-xs font-semibold tracking-widest uppercase opacity-80">Real-Time Contribution Grid</span>
          </div>
          <ContributionHeatmap username={username} />
        </div>

        {/* AI Repo Reviewer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 mb-16">
          <div className="space-y-6">
            <div className="p-6 bg-card border border-border rounded-2xl relative overflow-hidden group shadow-sm">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-foreground">
                  <Terminal size={80} />
               </div>
               <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-foreground">
                 <Fast size={18} className="text-emerald-500" /> 
                 Repo Auto-Reviewer
               </h3>
               <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                 Enter a repository name to perform a deep-dive AI audit on security, cleanliness, and architecture.
               </p>
               
               <div className="space-y-3">
                 <div className="relative">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                   <input 
                     value={repoSearch}
                     onChange={(e) => setRepoSearch(e.target.value)}
                     className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 ring-primary outline-none text-foreground placeholder:text-muted-foreground/70" 
                     placeholder="Repository name..." 
                   />
                 </div>
                 <button 
                   onClick={handleReview}
                   disabled={reviewLoading}
                   className="w-full py-2 bg-muted border border-border hover:border-emerald-500 hover:text-emerald-500 text-foreground transition-all rounded-lg text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   {reviewLoading ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
                   {reviewLoading ? 'Auditing Code...' : 'Start AI Audit'}
                 </button>
               </div>
            </div>

            <div className="p-6 bg-card border border-border sm:rounded-2xl shadow-sm">
               <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">DNA Core Metrics</h4>
               <div className="space-y-4">
                  {[
                    { label: 'Consistency', value: 'High', icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: 'Language Diversity', value: 'Polyglot', icon: Activity, color: 'text-sky-500' },
                    { label: 'Review Latency', value: 'Sub-second', icon: Fast, color: 'text-orange-500' }
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between text-xs">
                       <span className="text-muted-foreground">{m.label}</span>
                       <span className={`font-bold flex items-center gap-1.5 ${m.color}`}><m.icon size={12} /> {m.value}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {scorecard ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Metric label="Security" value={scorecard.scorecard.security} icon={Shield} color="text-red-500" />
                    <Metric label="Cleanliness" value={scorecard.scorecard.cleanliness} icon={Layout} color="text-emerald-500" />
                    <Metric label="Performance" value={scorecard.scorecard.performance} icon={Fast} color="text-orange-500" />
                    <Metric label="Architecture" value={scorecard.scorecard.architecture} icon={Terminal} color="text-sky-500" />
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-6">
                       <div className="text-6xl font-black text-muted opacity-50">{scorecard.overallGrade}</div>
                    </div>
                    <h4 className="text-xs font-bold text-foreground mb-4 uppercase tracking-widest">AI Audit Verdict</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                      {scorecard.verdict}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Key Findings</h4>
                      <ul className="space-y-3">
                        {scorecard.keyFindings.map((f, i) => (
                          <li key={i} className="text-xs text-foreground flex gap-3">
                            <span className="text-emerald-500">•</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Security Alerts</h4>
                      <ul className="space-y-3">
                        {scorecard.securityAlerts.map((s, i) => (
                          <li key={i} className="text-xs text-foreground flex gap-3">
                            <AlertTriangle size={14} className="text-red-500 shrink-0" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground p-12 text-center bg-card/50 shadow-sm">
                   <Terminal size={48} className="mb-4 opacity-20 text-foreground" />
                   <h4 className="text-sm font-bold text-muted-foreground mb-1">Awaiting Repository Input</h4>
                   <p className="text-xs max-w-xs">Audit any public repository to see the DNA-level technical scorecard.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card border border-border rounded-xl hover:border-muted-foreground/40 transition-colors group shadow-sm">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/10 transition-colors">
              <Terminal size={20} className="text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </div>
            <h4 className="font-bold text-foreground mb-2 uppercase text-xs tracking-wider">Architecture</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Uses a high-performance CSS Grid engine to calculate 53 columns across 7 rows starting on Sundays for 100% GitHub fidelity.
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl hover:border-muted-foreground/40 transition-colors group shadow-sm">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-4 group-hover:bg-sky-500/10 transition-colors">
              <Info size={20} className="text-muted-foreground group-hover:text-sky-500 transition-colors" />
            </div>
            <h4 className="font-bold text-foreground mb-2 uppercase text-xs tracking-wider">State Handling</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Implements native <code>fetch</code> with GraphQL, managing multi-state logic (Loading, Shimmer-Skeleton, Error, Data).
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl hover:border-muted-foreground/40 transition-colors group shadow-sm">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <Fast size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h4 className="font-bold text-foreground mb-2 uppercase text-xs tracking-wider">Luxury UX</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Powered by Framer Motion for smooth tooltips, scale-on-hover effects, and entry animations. 1:1 color mapping.
            </p>
          </div>
        </div>

        {/* Footer/Instructions */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-xs font-medium">
            &copy; 2026 CampusPath AI · Senior Engineering Showcase · Built with ❤️ for GitHub
          </p>
        </div>

      </div>
    </div>
  );
}
