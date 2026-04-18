import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Monitor, Smartphone, FileText, Palette, Download, Eye, RefreshCw } from 'lucide-react';

const TEMPLATES = [
  { id: 'desktop', icon: Monitor, label: 'Desktop', desc: 'Full-width professional layout' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile', desc: 'Mobile-first responsive design' },
  { id: 'document', icon: FileText, label: 'Document', desc: 'ATS-friendly resume style' },
];

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export default function PortfolioBuilder() {
  const { user } = useAuth();
  const toast = useToast();
  const [template, setTemplate] = useState('desktop');
  const [color, setColor] = useState('#7c3aed');
  
  // Bind to real user data
  const [seoTitle, setSeoTitle] = useState(`${user?.name || 'Developer'} — ${user?.targetRole || 'Fullstack'} Engineer`);
  const [bio, setBio] = useState(`Passionate about building scalable applications with ${user?.githubData?.languages?.[0]?.language || 'modern technologies'}.`);

  // Auto-update if user changes
  useEffect(() => {
    if (user) {
      setSeoTitle(`${user.name} — ${user.targetRole} Engineer`);
    }
  }, [user]);

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>Portfolio Builder</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Customize your public portfolio with live preview</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>
        {/* Controls Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Templates */}
          <div className="stat-card">
            <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem', marginBottom: '1rem' }}>Layout Template</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {TEMPLATES.map(({ id, icon: Icon, label, desc }) => (
                <button key={id} onClick={() => setTemplate(id)}
                  style={{
                    padding: '0.875rem', borderRadius: '10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    background: template === id ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                    border: template === id ? '2px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.2s', textAlign: 'left',
                  }}>
                  <div style={{ width: 36, height: 36, background: template === id ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={template === id ? 'var(--primary)' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: template === id ? 'var(--primary)' : '#f8fafc' }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Scheme */}
          <div className="stat-card">
            <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem', marginBottom: '1rem' }}>Accent Color</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{
                  width: 36, height: 36, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                  boxShadow: color === c ? `0 0 0 3px rgba(255,255,255,0.3), 0 0 12px ${c}` : 'none',
                  transition: 'all 0.2s', transform: color === c ? 'scale(1.2)' : 'scale(1)',
                }} />
              ))}
            </div>
          </div>

          {/* SEO Settings */}
          <div className="stat-card">
            <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem', marginBottom: '1rem' }}>SEO & Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>Page Title</label>
                <input className="input-field" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>Bio / Tagline</label>
                <textarea className="input-field" value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', resize: 'none' }} />
              </div>
            </div>
          </div>

          {/* Export */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-primary" onClick={() => toast.success('Portfolio published! 🎉')} style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}>
              <Eye size={15} /> Publish
            </button>
            <button className="btn-secondary" onClick={() => toast.info('Export coming soon!')} style={{ fontSize: '0.85rem', padding: '0.625rem 1rem' }}>
              <Download size={15} />
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="stat-card" style={{ position: 'relative', overflow: 'hidden', minHeight: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>Live Preview</h3>
            <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>● Live</span>
          </div>

          {/* Preview mini-portfolio */}
          <div style={{
            borderRadius: '12px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            background: '#050512',
          }}>
            {/* Preview Hero */}
            <div style={{ padding: '2rem', background: `linear-gradient(135deg, ${color}20, rgba(6,182,212,0.08))`, borderBottom: `1px solid ${color}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '1.25rem', boxShadow: `0 0 20px ${color}60` }}>
                  {user?.name?.[0] || 'D'}
                </div>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#f8fafc' }}>{user?.name || 'Developer'}</div>
                  <div style={{ color, fontWeight: 600, fontSize: '0.85rem' }}>{seoTitle.split('—')[1]?.trim() || 'Software Engineer'}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>{bio.substring(0, 60)}...</div>
                </div>
              </div>
            </div>

            {/* Preview Skills (Real Languages) */}
            <div style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>TECHNICAL DNA</div>
              {(user?.githubData?.languages?.slice(0, 3) || [{language: 'JavaScript', score: 85}, {language: 'React', score: 70}]).map((l, i) => {
                const name = typeof l === 'string' ? l : l.language;
                const pct = 90 - (i * 10);
                return (
                  <div key={name} style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{name}</span>
                      <span style={{ fontSize: '0.7rem', color, fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 5 }}>
                      <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}66` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
