import { useState } from 'react';
import ContributionHeatmap from '../components/GitHub/ContributionHeatmap';
import { Github, Globe, Terminal, Info, AlertTriangle, Zap } from 'lucide-react';

export default function GitHubDNA() {
  const [username, setUsername] = useState('Shubham-k-yadav');

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] p-8 font-sans selection:bg-[#39d35340]">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#30363d] pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#21262d] rounded-lg border border-[#30363d]">
                <Github size={24} className="text-[#f0f6fc]" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">GitHub DNA Analyzer</h1>
            </div>
            <p className="text-[#8b949e] text-lg max-w-2xl">
              A high-fidelity contribution visualizer built with <span className="text-[#58a6ff]">React 19</span>, 
              <span className="text-[#58a6ff]"> Tailwind v4</span>, and the <span className="text-[#58a6ff]">GitHub GraphQL API</span>.
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
              Analyze
            </button>
          </div>
        </div>


        {/* Main Component Render */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4 text-[#8b949e]">
            <Globe size={16} />
            <span className="text-xs font-semibold tracking-widest uppercase opacity-80">Real-Time Contribution Grid</span>
          </div>
          <ContributionHeatmap username={username} />
        </div>

        {/* Grid Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#8b949e40] transition-colors group">
            <div className="w-10 h-10 bg-[#30363d] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#39d35330] transition-colors">
              <Terminal size={20} className="text-[#8b949e] group-hover:text-[#39d353] transition-colors" />
            </div>
            <h4 className="font-bold text-[#f0f6fc] mb-2 uppercase text-xs tracking-wider">Architecture</h4>
            <p className="text-[#8b949e] text-sm leading-relaxed">
              Uses a high-performance CSS Grid engine to calculate 53 columns across 7 rows starting on Sundays for 100% GitHub fidelity.
            </p>
          </div>

          <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#8b949e40] transition-colors group">
            <div className="w-10 h-10 bg-[#30363d] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#58a6ff30] transition-colors">
              <Info size={20} className="text-[#8b949e] group-hover:text-[#58a6ff] transition-colors" />
            </div>
            <h4 className="font-bold text-[#f0f6fc] mb-2 uppercase text-xs tracking-wider">State Handling</h4>
            <p className="text-[#8b949e] text-sm leading-relaxed">
              Implements native <code>fetch</code> with GraphQL, managing multi-state logic (Loading, Shimmer-Skeleton, Error, Data).
            </p>
          </div>

          <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#8b949e40] transition-colors group">
            <div className="w-10 h-10 bg-[#30363d] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#a855f730] transition-colors">
              <Zap size={20} className="text-[#8b949e] group-hover:text-[#a855f7] transition-colors" />
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
