import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { ThumbsUp, MessageSquare, Share2, Send, Search, TrendingUp, Flame } from 'lucide-react';

const LEADERBOARD = [
  { rank: 1, name: 'Priya Sharma', role: 'Backend', readiness: 94, streak: 42, avatar: 'P', color: '#f59e0b' },
  { rank: 2, name: 'Marcus Chen', role: 'Frontend', readiness: 91, streak: 37, avatar: 'M', color: '#7c3aed' },
  { rank: 3, name: 'Aisha Patel', role: 'DevOps', readiness: 88, streak: 28, avatar: 'A', color: '#06b6d4' },
  { rank: 4, name: 'Ryan Park', role: 'Fullstack', readiness: 82, streak: 21, avatar: 'R', color: '#10b981' },
  { rank: 5, name: 'Sofia Martins', role: 'AI/ML', readiness: 78, streak: 19, avatar: 'S', color: '#ec4899' },
  { rank: 6, name: 'You', role: 'Fullstack', readiness: 42, streak: 7, avatar: 'Y', color: 'var(--primary)', isYou: true },
];

const POSTS = [
  { id: 1, author: 'Priya Sharma', avatar: 'P', time: '2h ago', tag: 'Tip', content: 'Just finished the Docker module and WOW. The CampusPath roadmap skipped Docker basics I already knew from my previous job and jumped straight to multi-stage builds 🐳 Saved me 3+ days of review.', upvotes: 47, comments: 12, color: '#f59e0b' },
  { id: 2, author: 'Marcus Chen', avatar: 'M', time: '4h ago', tag: 'Resource', content: 'For anyone on the TypeScript week — this free book is 🔥: basarat.gitbook.io/typescript. Goes deep on generics and declaration merging. The AI roadmap linked to it and it is genuinely the best resource.', upvotes: 31, comments: 8, color: '#7c3aed' },
  { id: 3, author: 'Ryan Park', avatar: 'R', time: '1d ago', tag: 'Win', content: '🎉 Just got my offer from Stripe after 8 weeks on CampusPath! The skill gap analysis was SPOT ON — I was missing system design and PostgreSQL. Both are now deeply ingrained. THANK YOU COMMUNITY!', upvotes: 128, comments: 34, color: '#10b981' },
];

const TAG_COLORS = { Tip: 'badge-cyan', Resource: 'badge-purple', Win: 'badge-green', Question: 'badge-orange' };

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
    const fresh = { id: Date.now(), author: 'You', avatar: 'Y', time: 'just now', tag: 'Tip', content: newPost, upvotes: 0, comments: 0, color: 'var(--primary)' };
    setPosts(p => [fresh, ...p]);
    setNewPost('');
    toast.success('Post published to the community!');
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>Community Hub</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Learn together, grow faster. 50K+ developers on the journey.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Feed */}
        <div>
          {/* Post Composer */}
          <div className="stat-card" style={{ marginBottom: '1.25rem' }}>
            <textarea className="input-field" rows={3} value={newPost} onChange={e => setNewPost(e.target.value)}
              placeholder="Share a tip, resource, or win with the community..."
              style={{ resize: 'none', marginBottom: '0.75rem' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={submitPost} style={{ fontSize: '0.85rem' }}>
                <Send size={14} /> Post
              </button>
            </div>
          </div>

          {/* Posts */}
          {posts.map(post => (
            <div key={post.id} className="stat-card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.875rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${post.color}, ${post.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', color: 'white', flexShrink: 0 }}>
                  {post.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f8fafc' }}>{post.author}</span>
                      <span className={`badge ${TAG_COLORS[post.tag] || 'badge-purple'}`} style={{ fontSize: '0.65rem' }}>{post.tag}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#475569' }}>{post.time}</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1rem' }}>{post.content}</p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => toggleUpvote(post.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none',
                      color: upvoted[post.id] ? 'var(--primary)' : '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                      transition: 'color 0.2s',
                    }}>
                      <ThumbsUp size={14} fill={upvoted[post.id] ? 'var(--primary)' : 'none'} /> {post.upvotes}
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <MessageSquare size={14} /> {post.comments}
                    </button>
                    <button onClick={() => toast.success('Link copied!')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <Share2 size={14} /> Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar: Leaderboard */}
        <div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <TrendingUp size={18} color="#f59e0b" />
              <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>Weekly Leaderboard</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {LEADERBOARD.map(({ rank, name, role, readiness, streak, avatar, color, isYou }) => (
                <div key={rank} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.75rem', borderRadius: '10px',
                  background: isYou ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.02)',
                  border: isYou ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{
                    width: 24, fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 800, fontSize: '0.875rem',
                    color: rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#f97316' : '#475569',
                    textAlign: 'center',
                  }}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                  </span>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {avatar}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.825rem', color: isYou ? 'var(--primary)' : '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{role}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#10b981' }}>{readiness}%</div>
                    <div style={{ fontSize: '0.65rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'flex-end' }}>
                      <Flame size={9} /> {streak}d
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
