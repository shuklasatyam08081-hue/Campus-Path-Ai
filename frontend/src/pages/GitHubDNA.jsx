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
    <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">{label}</p>
        <Icon size={14} className={color} />
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-black text-[#f0f6fc]">{value}</p>
        <div className="h-1 flex-1 bg-[#30363d] rounded-full overflow-hidden mb-2">
           <div className={`h-full ${color.replace('text-', 'bg-')}`} style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] p-5 font-sans selection:bg-[#39d35340]">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363d] pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#21262d] rounded-lg border border-[#30363d]">
                <Github size={24} className="text-[#f0f6fc]" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">GitHub DNA Analyzer</h1>
            </div>
            <p className="text-[#8b949e] text-lg max-w-2xl">
              A high-fidelity contribution visualizer and <span className="text-[#39d353]">AI-powered</span> code auditing engine.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-[#161b22] p-2 rounded-xl border border-[#30363d]">
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub Username" 
              className="bg-transparent border-none outline-none text-sm px-4 py-2 w-48 font-mono placeholder:text-[#484f58]"
            />
            <button className="bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">
              Sync DNA
            </button>
          </div>
        </div>

        {/* Contribution Grid */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4 text-[#8b949e]">
            <Globe size={16} />
            <span className="text-xs font-semibold tracking-widest uppercase opacity-80">Real-Time Contribution Grid</span>
          </div>
          <ContributionHeatmap username={username} />
        </div>

        {/* AI Repo Reviewer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5 mb-16">
          <div className="space-y-6">
            <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Terminal size={80} />
               </div>
               <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                 <Fast size={18} className="text-[#39d353]" /> 
                 Repo Auto-Reviewer
               </h3>
               <p className="text-xs text-[#8b949e] mb-6 leading-relaxed">
                 Enter a repository name to perform a deep-dive AI audit on security, cleanliness, and architecture.
               </p>
               
               <div className="space-y-3">
                 <div className="relative">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
                   <input 
                     value={repoSearch}
                     onChange={(e) => setRepoSearch(e.target.value)}
                     className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 ring-[#39d353] outline-none" 
                     placeholder="Repository name..." 
                   />
                 </div>
                 <button 
                   onClick={handleReview}
                   disabled={reviewLoading}
                   className="w-full py-2 bg-[#21262d] border border-[#30363d] hover:border-[#39d353] hover:text-[#39d353] transition-all rounded-lg text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   {reviewLoading ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
                   {reviewLoading ? 'Auditing Code...' : 'Start AI Audit'}
                 </button>
               </div>
            </div>

            <div className="p-4 bg-[#161b22]/50 border border-[#30363d] rounded-2xl">
               <h4 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-4">DNA Core Metrics</h4>
               <div className="space-y-4">
                  {[
                    { label: 'Consistency', value: 'High', icon: CheckCircle2, color: 'text-[#39d353]' },
                    { label: 'Language Diversity', value: 'Polyglot', icon: Activity, color: 'text-[#58a6ff]' },
                    { label: 'Review Latency', value: 'Sub-second', icon: Fast, color: 'text-orange-500' }
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between text-xs">
                       <span className="text-[#8b949e]">{m.label}</span>
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
                    <Metric label="Cleanliness" value={scorecard.scorecard.cleanliness} icon={Layout} color="text-[#39d353]" />
                    <Metric label="Performance" value={scorecard.scorecard.performance} icon={Fast} color="text-orange-500" />
                    <Metric label="Architecture" value={scorecard.scorecard.architecture} icon={Terminal} color="text-[#58a6ff]" />
                  </div>

                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                       <div className="text-6xl font-black text-[#30363d] opacity-50">{scorecard.overallGrade}</div>
                    </div>
                    <h4 className="text-xs font-bold text-[#f0f6fc] mb-4 uppercase tracking-widest">AI Audit Verdict</h4>
                    <p className="text-sm text-[#8b949e] leading-relaxed max-w-xl">
                      {scorecard.verdict}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                      <h4 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-4">Key Findings</h4>
                      <ul className="space-y-3">
                        {scorecard.keyFindings.map((f, i) => (
                          <li key={i} className="text-xs text-[#f0f6fc] flex gap-3">
                            <span className="text-[#39d353]">•</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                      <h4 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-4">Security Alerts</h4>
                      <ul className="space-y-3">
                        {scorecard.securityAlerts.map((s, i) => (
                          <li key={i} className="text-xs text-[#f0f6fc] flex gap-3">
                            <AlertTriangle size={14} className="text-red-500 shrink-0" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full border border-dashed border-[#30363d] rounded-2xl flex flex-col items-center justify-center text-[#484f58] p-12 text-center bg-[#161b22]/20">
                   <Terminal size={48} className="mb-4 opacity-20" />
                   <h4 className="text-sm font-bold text-[#8b949e] mb-1">Awaiting Repository Input</h4>
                   <p className="text-xs max-w-xs">Audit any public repository to see the DNA-level technical scorecard.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#8b949e40] transition-colors group">
            <div className="w-10 h-10 bg-[#30363d] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#39d35330] transition-colors">
              <Terminal size={20} className="text-[#8b949e] group-hover:text-[#39d353] transition-colors" />
            </div>
            <h4 className="font-bold text-[#f0f6fc] mb-2 uppercase text-xs tracking-wider">Architecture</h4>
            <p className="text-[#8b949e] text-sm leading-relaxed">
              Uses a high-performance CSS Grid engine to calculate 53 columns across 7 rows starting on Sundays for 100% GitHub fidelity.
            </p>
          </div>

          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#8b949e40] transition-colors group">
            <div className="w-10 h-10 bg-[#30363d] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#58a6ff30] transition-colors">
              <Info size={20} className="text-[#8b949e] group-hover:text-[#58a6ff] transition-colors" />
            </div>
            <h4 className="font-bold text-[#f0f6fc] mb-2 uppercase text-xs tracking-wider">State Handling</h4>
            <p className="text-[#8b949e] text-sm leading-relaxed">
              Implements native <code>fetch</code> with GraphQL, managing multi-state logic (Loading, Shimmer-Skeleton, Error, Data).
            </p>
          </div>

          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#8b949e40] transition-colors group">
            <div className="w-10 h-10 bg-[#30363d] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[var(--primary)30] transition-colors">
              <Fast size={20} className="text-[#8b949e] group-hover:text-[var(--primary)] transition-colors" />
            </div>
            <h4 className="font-bold text-[#f0f6fc] mb-2 uppercase text-xs tracking-wider">Luxury UX</h4>
            <p className="text-[#8b949e] text-sm leading-relaxed">
              Powered by Framer Motion for smooth tooltips, scale-on-hover effects, and entry animations. 1:1 color mapping.
            </p>
          </div>
        </div>

        {/* Footer/Instructions */}
        <div className="mt-16 pt-8 border-t border-[#30363d] text-center">
          <p className="text-[#484f58] text-xs font-medium">
            &copy; 2026 CampusPath AI · Senior Engineering Showcase · Built with ❤️ for shubham-0
          </p>
        </div>

      </div>
    </div>
  );
}
