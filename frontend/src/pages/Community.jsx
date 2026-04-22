import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { ThumbsUp, MessageSquare, Share2, Send, Search, TrendingUp, Flame, User } from 'lucide-react';

const LEADERBOARD = [
  { rank: 1, name: 'Priya Sharma', role: 'Backend', readiness: 94, streak: 42, avatar: 'P', color: 'var(--color-chart-2)' }, // Green
  { rank: 2, name: 'Marcus Chen', role: 'Frontend', readiness: 91, streak: 37, avatar: 'M', color: 'var(--color-primary)' }, // Blue
  { rank: 3, name: 'Aisha Patel', role: 'DevOps', readiness: 88, streak: 28, avatar: 'A', color: 'var(--color-chart-1)' }, // Light Blue
  { rank: 4, name: 'Ryan Park', role: 'Fullstack', readiness: 82, streak: 21, avatar: 'R', color: 'var(--color-chart-5)' }, // Emerald
  { rank: 5, name: 'Sofia Martins', role: 'AI/ML', readiness: 78, streak: 19, avatar: 'S', color: 'var(--color-chart-3)' }, // Purple/Indigo
  { rank: 6, name: 'You', role: 'Fullstack', readiness: 42, streak: 7, avatar: 'Y', color: 'var(--color-primary)', isYou: true },
];

const POSTS = [
  { id: 1, author: 'Priya Sharma', avatar: 'P', time: '2h ago', tag: 'Tip', content: 'Just finished the Docker module and WOW. The CampusPath roadmap skipped Docker basics I already knew from my previous job and jumped straight to multi-stage builds 🐳 Saved me 3+ days of review.', upvotes: 47, comments: 12, color: 'var(--color-chart-2)' },
  { id: 2, author: 'Marcus Chen', avatar: 'M', time: '4h ago', tag: 'Resource', content: 'For anyone on the TypeScript week — this free book is 🔥: basarat.gitbook.io/typescript. Goes deep on generics and declaration merging. The AI roadmap linked to it and it is genuinely the best resource.', upvotes: 31, comments: 8, color: 'var(--color-primary)' },
  { id: 3, author: 'Ryan Park', avatar: 'R', time: '1d ago', tag: 'Win', content: '🎉 Just got my offer from Stripe after 8 weeks on CampusPath! The skill gap analysis was SPOT ON — I was missing system design and PostgreSQL. Both are now deeply ingrained. THANK YOU COMMUNITY!', upvotes: 128, comments: 34, color: 'var(--color-chart-5)' },
];

const TAG_COLORS = { Tip: 'badge-blue', Resource: 'badge-purple', Win: 'badge-green', Question: 'badge-cyan' };

export default function Community() {
  const toast = useToast();
  const [upvoted, setUpvoted] = useState({});
  const [posts, setPosts] = useState(POSTS);
  const [newPost, setNewPost] = useState('');

  const toggleUpvote = (id) => {
    setUpvoted(p => {
      const was = p[id];
      setPosts(prev => prev.map(post => post.id === id ? { ...post, upvotes: post.upvotes + (was ? -1 : 1) } : post));
      return { ...p, [id]: !was };
    });
  };

  const submitPost = () => {
    if (!newPost.trim()) return;
    const fresh = { id: Date.now(), author: 'You', avatar: 'Y', time: 'just now', tag: 'Tip', content: newPost, upvotes: 0, comments: 0, color: 'var(--color-primary)' };
    setPosts(p => [fresh, ...p]);
    setNewPost('');
    toast.success('Post published to the community!');
  };

  return (
    <div className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 animation-fade-in relative">
      {/* Background Decorative Element */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="mb-12 relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
          <span className="text-gradient">Community Hub</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">Learn together, grow faster. Join 50K+ developers engineering their future.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Feed Section */}
        <div className="space-y-6">
          {/* Post Composer */}
          <div className="glass-panel p-6 shadow-2xl relative group border-primary/20 hover:border-primary/40 transition-all duration-500">
            <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 shadow-inner overflow-hidden">
                  <User size={24} />
                </div>
                <textarea 
                  className="flex-1 bg-background/50 border border-border rounded-xl p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-base resize-none min-h-[120px] custom-scrollbar shadow-inner"
                  value={newPost} 
                  onChange={e => setNewPost(e.target.value)}
                  placeholder="Share a tip, resource, or win with the community..."
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex gap-3">
                  <span className="badge badge-purple px-4 py-1.5 cursor-pointer hover:opacity-80 transition-all active:scale-95">#Resource</span>
                  <span className="badge badge-blue px-4 py-1.5 cursor-pointer hover:opacity-80 transition-all active:scale-95">#Tip</span>
                </div>
                <button 
                  className="btn-primary py-2.5 px-8 flex items-center gap-2 text-sm font-bold shadow-[0_4px_20px_rgba(47,129,247,0.3)] hover:scale-105 active:scale-95 transition-all" 
                  onClick={submitPost}
                >
                  <Send size={18} strokeWidth={2.5} /> Post to Feed
                </button>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className="glass-panel p-6 hover:border-primary/40 transition-all duration-300 group shadow-lg hover:shadow-primary/5 active:scale-[0.99] cursor-pointer animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl relative overflow-hidden group-hover:scale-110 transition-transform duration-500"
                         style={{ background: `linear-gradient(135deg, ${post.color}, ${post.color})` }}>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative z-10 text-xl drop-shadow-md">{post.avatar}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground text-xl tracking-tight leading-none">{post.author}</span>
                        <span className={`badge ${TAG_COLORS[post.tag] || 'badge-blue'} text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border-opacity-50`}>
                          {post.tag}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"></span>
                        {post.time}
                      </span>
                    </div>
                    
                    <p className="text-foreground/80 leading-relaxed mb-6 text-base font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-8 pt-5 border-t border-border/20">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleUpvote(post.id); }} 
                        className={`group/btn flex items-center gap-2.5 text-sm font-bold transition-all
                                   ${upvoted[post.id] ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                      >
                        <div className={`p-2 rounded-xl transition-all ${upvoted[post.id] ? 'bg-primary/20 scale-110 shadow-lg' : 'bg-muted hover:bg-primary/10'}`}>
                          <ThumbsUp size={18} fill={upvoted[post.id] ? 'currentColor' : 'none'} strokeWidth={2.5} />
                        </div>
                        <span className="tabular-nums">{post.upvotes}</span>
                      </button>
                      
                      <button className="group/btn flex items-center gap-2.5 text-sm font-bold text-muted-foreground hover:text-primary transition-all">
                        <div className="p-2 rounded-xl bg-muted group-hover/btn:bg-primary/10 transition-all">
                          <MessageSquare size={18} strokeWidth={2.5} />
                        </div>
                        <span className="tabular-nums">{post.comments}</span>
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('Link copied to clipboard!');
                        }}
                        className="group/btn flex items-center gap-2.5 text-sm font-bold text-muted-foreground hover:text-emerald-500 transition-all ml-auto"
                      >
                        <div className="p-2 rounded-xl bg-muted group-hover/btn:bg-emerald-500/10 transition-all">
                          <Share2 size={18} strokeWidth={2.5} />
                        </div>
                        <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Section */}
        <aside className="space-y-6 sticky top-24">
          <div className="glass-panel p-6 shadow-2xl border-primary/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner">
                <TrendingUp size={24} className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-xl tracking-tight">Weekly Leaders</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">Global Rankings</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {LEADERBOARD.map(({ rank, name, role, readiness, streak, avatar, color, isYou }) => (
                <div 
                  key={rank} 
                  className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all duration-300 group/item cursor-pointer
                             ${isYou 
                               ? 'bg-primary/10 border-primary/40 shadow-[0_0_25px_rgba(47,129,247,0.15)] scale-[1.02]' 
                               : 'bg-muted/40 border-border/10 hover:bg-muted/80 hover:border-border/30 hover:scale-[1.01]'}`}
                >
                  <div className="w-8 text-center flex-shrink-0">
                    <span className="text-xl font-black italic">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : <span className="text-muted-foreground text-sm font-bold">#{rank}</span>}
                    </span>
                  </div>
                  
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-xl flex-shrink-0 relative overflow-hidden"
                       style={{ background: `linear-gradient(135deg, ${color}, ${color})` }}>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                    <span className="relative z-10 drop-shadow-md">{avatar}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm truncate flex items-center gap-1.5 ${isYou ? 'text-primary' : 'text-foreground/90'}`}>
                      {name} 
                      {isYou && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-black tracking-tighter shadow-sm border border-primary/20">YOU</span>}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate font-semibold">{role}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-black text-sm text-emerald-500 tabular-nums">{readiness}%</div>
                    <div className="text-[10px] text-amber-500 flex items-center gap-1 justify-end font-black italic">
                      <Flame size={12} strokeWidth={3} /> {streak}d
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-8 py-3.5 rounded-2xl bg-background border border-border/20 text-slate-400 text-sm font-bold hover:text-white hover:bg-slate-900 hover:border-primary/30 hover:shadow-lg transition-all active:scale-[0.98]">
              View Full Leaderboard
            </button>
          </div>
          
          {/* Community Stats/Ad card */}
          <div className="glass-panel p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 hover:border-primary/40 transition-all group">
            <h4 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">Build Together 🚀</h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed font-medium">
              CampusPath communities are where real growth happens. Join a study room or start a project.
            </p>
            <button className="w-full btn-primary text-xs py-2.5 rounded-lg shadow-md hover:shadow-primary/20 active:scale-95 transition-all">
              Browse Study Rooms
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

