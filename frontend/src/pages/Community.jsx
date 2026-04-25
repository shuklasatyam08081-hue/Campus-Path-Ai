import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { ThumbsUp, MessageSquare, Share2, Send, TrendingUp, Flame, User, Sparkles, Zap, Trophy, ShieldCheck, MoreHorizontal, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LEADERBOARD = [
  { rank: 1, name: 'Priya Sharma', role: 'Backend', readiness: 94, streak: 42, avatar: 'P', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  { rank: 2, name: 'Marcus Chen', role: 'Frontend', readiness: 91, streak: 37, avatar: 'M', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { rank: 3, name: 'Aisha Patel', role: 'DevOps', readiness: 88, streak: 28, avatar: 'A', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { rank: 4, name: 'Ryan Park', role: 'Fullstack', readiness: 82, streak: 21, avatar: 'R', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { rank: 5, name: 'Sofia Martins', role: 'AI/ML', readiness: 78, streak: 19, avatar: 'S', color: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-blue-600/20' },
  { rank: 6, name: 'You', role: 'Fullstack', readiness: 42, streak: 7, avatar: 'Y', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', isYou: true },
];

const POSTS = [
  { id: 1, author: 'Priya Sharma', avatar: 'P', time: '2h ago', tag: 'Tip', content: 'Just finished the Docker module and WOW. The CampusPath roadmap skipped Docker basics I already knew and jumped straight to multi-stage builds 🐳 Saved me 3+ days of review.', upvotes: 47, comments: 12, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  { id: 2, author: 'Marcus Chen', avatar: 'M', time: '4h ago', tag: 'Resource', content: 'For anyone on the TypeScript week — this free book is 🔥: basarat.gitbook.io/typescript. Goes deep on generics and declaration merging.', upvotes: 31, comments: 8, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 3, author: 'Ryan Park', avatar: 'R', time: '1d ago', tag: 'Win', content: '🎉 Just got my offer from Stripe after 8 weeks on CampusPath! The skill gap analysis was SPOT ON — I was missing system design and PostgreSQL.', upvotes: 128, comments: 34, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
];

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
    const fresh = { id: Date.now(), author: 'You', avatar: 'Y', time: 'just now', tag: 'Tip', content: newPost, upvotes: 0, comments: 0, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
    setPosts(p => [fresh, ...p]);
    setNewPost('');
    toast.success('Post published successfully!');
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-5 pb-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            Community Collective <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">LIVE</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Connect with elite developers and share technical intelligence.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-card border border-border px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <Zap size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground">52.4K Members</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-4">
          {/* Post Composer Dashboard Style */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <User size={20} className="text-muted-foreground opacity-50" />
              </div>
              <textarea
                className="flex-1 bg-transparent border-0 text-foreground placeholder-muted-foreground focus:outline-none text-sm resize-none min-h-[80px] font-medium pt-2"
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Share technical insights or resources..."
              />
            </div>
            <div className="px-4 py-3 border-t border-border bg-muted/20 flex justify-between items-center">
              <div className="flex gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">#Insight</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">#Code</span>
              </div>
              <button onClick={submitPost} className="btn-primary py-1.5 px-6 text-xs flex items-center gap-2">
                <Send size={14} /> Broadcast
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-card border border-border rounded-xl shadow-sm p-4 hover:border-primary/40 transition-all group">
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0 shadow-sm`}
                    style={{ background: `var(--color-primary)` }}>
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="font-bold text-sm text-foreground truncate">{post.author}</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border uppercase tracking-widest">
                          {post.tag}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{post.time}</span>
                    </div>
                    <p className="text-[13px] text-foreground/90 font-medium leading-relaxed mb-4">{post.content}</p>
                    <div className="flex items-center gap-6 pt-3 border-t border-border">
                      <button
                        onClick={() => toggleUpvote(post.id)}
                        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${upvoted[post.id] ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                      >
                        <ThumbsUp size={14} fill={upvoted[post.id] ? 'currentColor' : 'none'} />
                        {post.upvotes}
                      </button>
                      <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all">
                        <MessageSquare size={14} />
                        {post.comments}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('Broadcast link secured.');
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-emerald-500 transition-all ml-auto opacity-0 group-hover:opacity-100"
                      >
                        <Share2 size={14} />
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Leaders Dashboard Style */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="font-bold text-xs uppercase tracking-widest text-foreground">Top Velocity</h3>
              </div>
              <button className="text-[10px] font-bold text-primary hover:underline">Full Leaderboard</button>
            </div>
            <div className="p-2 space-y-1">
              {LEADERBOARD.map(({ rank, name, role, readiness, streak, avatar, color, bg, border, isYou }) => (
                <div key={rank} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isYou ? 'bg-primary/5 border border-primary/20 shadow-sm' : 'hover:bg-muted/50'}`}>
                  <div className="w-5 text-center shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground">#{rank}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${bg} ${border} ${color}`}>
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isYou ? 'text-primary' : 'text-foreground'}`}>{name}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{role}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-emerald-500">{readiness}%</p>
                    <div className="text-[9px] text-amber-500 flex items-center gap-1 justify-end font-bold">
                      <Flame size={10} fill="currentColor" /> {streak}d
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4 group hover:border-primary/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                <Trophy size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-foreground">Collective Goal</h4>
                <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Neural Sync</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Engage with peer roadmaps to increase your market value score by up to 22% this week.
            </p>
            <button className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-2">
              Synchronize Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
