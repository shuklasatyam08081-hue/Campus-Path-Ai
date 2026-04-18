import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { GitBranch, Mail, MapPin, ExternalLink, Share2, Copy } from 'lucide-react';

export default function Portfolio() {
  const { user } = useAuth();
  const toast = useToast();

  const github = user?.githubData || {};
  
  // Map real skills from GitHub analysis
  const REAL_SKILLS = [
    ...(github.languages?.slice(0, 3).map((l, i) => ({ 
      name: l.language, 
      level: 90 - (i * 10), 
      color: ['#06b6d4', '#f59e0b', '#7c3aed'][i] 
    })) || []),
    ...(github.frameworks?.slice(0, 3).map((f, i) => ({ 
      name: f, 
      level: 85 - (i * 10), 
      color: ['#10b981', '#ec4899', '#f97316'][i] 
    })) || [])
  ];

  // Map real projects from GitHub repositories
  const REAL_PROJECTS = (github.repos || []).slice(0, 6).map(r => ({
    title: r.name,
    desc: r.description || `A technical project built with ${r.language || 'modern technologies'}.`,
    tech: r.language ? [r.language] : [],
    stars: r.stars || 0,
    live: r.url
  }));

  const hireReady = Math.min(100, 30 + (user?.xp ? Math.floor(user.xp / 100) : 0) + (github.totalStars || 0));

  const sharePortfolio = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('🔗 Portfolio URL copied to clipboard!');
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button className="btn-secondary" onClick={sharePortfolio} style={{ fontSize: '0.85rem' }}>
          <Copy size={14} /> Copy Link
        </button>
        <button className="btn-primary" style={{ fontSize: '0.85rem' }}>
          <ExternalLink size={14} /> View Public URL
        </button>
      </div>

      {/* Hero Banner */}
      <div style={{
        borderRadius: '20px', padding: '3rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.1) 50%, rgba(16,185,129,0.08) 100%)',
        border: '1px solid rgba(124,58,237,0.2)',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 800, color: 'white', flexShrink: 0,
            boxShadow: '0 0 30px rgba(124,58,237,0.4)',
          }}>
            {user?.name?.[0] || 'D'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
              {user?.name || 'Alex Developer'}
            </h1>
            <p style={{ color: '#a855f7', fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' }}>
              {user?.targetRole || 'Fullstack'} Engineer · CampusPath AI Graduate
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem' }}>
                <GitBranch size={14} /> {user?.githubUsername || 'github-user'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem' }}>
                <Mail size={14} /> {user?.email || 'dev@example.com'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem' }}>
                <MapPin size={14} /> Available Worldwide
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center', flexShrink: 0 }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{hireReady}%</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Hire Ready</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed' }}>{user?.xp || 0}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>XP Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: '#f8fafc', marginBottom: '1.5rem' }}>Technical Skills</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {REAL_SKILLS.map(({ name, level, color }) => (
            <div key={name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>{name}</span>
                <span style={{ fontSize: '0.8rem', color, fontWeight: 700 }}>{level}%</span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div style={{ height: '100%', borderRadius: 4, width: `${level}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)`, boxShadow: `0 0 8px ${color}66`, transition: 'width 1.5s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="stat-card">
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: '#f8fafc', marginBottom: '1.5rem' }}>Featured Projects</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {REAL_PROJECTS.map(project => (
            <div key={project.title} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>{project.title}</h3>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#f59e0b' }}>⭐ {project.stars}</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1rem', minHeight: '3.2rem' }}>{project.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                {project.tech.map(t => (
                  <span key={t} className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{t}</span>
                ))}
              </div>
              <a href={project.live} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.4rem 0.875rem', display: 'inline-flex' }}>
                <ExternalLink size={12} /> View Project
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
