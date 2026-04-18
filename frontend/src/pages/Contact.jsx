import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { Mail, MessageSquare, GitBranch, Send, MapPin, Clock, Twitter, ArrowRight } from 'lucide-react';
import GradientText from '../components/GradientText';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflowX: 'hidden' }}>
      <Navbar />
      
      {/* Premium Hero Background Removed */}
      <div style={{ position: 'relative' }}>
        
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          maxWidth: '1100px', 
          margin: '0 auto', 
          padding: 'clamp(120px, 20vh, 180px) 1.5rem 80px' 
        }}>
          
          <div className="hero-bloom"></div>

          <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 8vh, 5rem)' }}>
            <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
              Get in <GradientText
                colors={["#eabbf7","#a259de","#6f37c7","#eabbf7"]}
                animationSpeed={3}
                showBorder={false}
              >Touch</GradientText>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8, opacity: 0.9 }}>
              Have questions or feedback? We read every message and usually respond within 24 hours.
            </p>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '3rem', 
            flexWrap: 'wrap', 
            justifyContent: 'center' 
          }}>
            {/* Contact Form Card */}
            <div className="glass-card" style={{ 
              flex: '1 1 500px', 
              padding: 'clamp(1.5rem, 4vw, 3rem)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '32px'
            }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <div style={{ 
                    width: 80, height: 80, background: 'var(--gradient-vibrant)', 
                    borderRadius: '50%', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', margin: '0 auto 1.5rem',
                    boxShadow: 'var(--shadow-glow)'
                  }}>
                    <Send size={32} color="white" />
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Message Sent!</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.6rem', marginLeft: '0.5rem' }}>Your Name</label>
                      <input 
                        className="input-field" 
                        value={form.name} 
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                        placeholder="Alex Johnson" 
                        required 
                        style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.6rem', marginLeft: '0.5rem' }}>Email Address</label>
                      <input 
                        className="input-field" 
                        type="email" 
                        value={form.email} 
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                        placeholder="you@example.com" 
                        required 
                        style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.6rem', marginLeft: '0.5rem' }}>Subject</label>
                    <input 
                      className="input-field" 
                      value={form.subject} 
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} 
                      placeholder="How can we help?" 
                      required 
                      style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.6rem', marginLeft: '0.5rem' }}>Message</label>
                    <textarea 
                      className="input-field" 
                      rows={5} 
                      value={form.message} 
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))} 
                      placeholder="Tell us what's on your mind..." 
                      style={{ resize: 'none', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem' }} 
                      required 
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', fontSize: '1rem', borderRadius: '16px' }}>
                    Send Message <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                  </button>
                </form>
              )}
            </div>

            {/* Info Column */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { icon: Mail, label: 'Email', value: 'hello@campuspath.ai', color: '#a259de' },
                { icon: MessageSquare, label: 'Discord', value: 'discord.gg/campuspath', color: '#a259de' },
                { icon: GitBranch, label: 'GitHub', value: 'github.com/campuspath-ai', color: '#a259de' },
                { icon: Twitter, label: 'Twitter / X', value: '@CampusPathAI', color: '#a259de' },
                { icon: MapPin, label: 'Location', value: 'San Francisco & Remote', color: '#a259de' },
                { icon: Clock, label: 'Response Time', value: 'Within 24 hours', color: '#a259de' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="glass-card" style={{ 
                  padding: '1.25rem', 
                  display: 'flex', 
                  gap: '1.25rem', 
                  alignItems: 'center',
                  borderRadius: '20px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ 
                    width: 48, height: 48, 
                    background: `${color}15`, 
                    borderRadius: 14, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    flexShrink: 0,
                    border: `1px solid ${color}30`
                  }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600, wordBreak: 'break-all' }}>{value}</div>
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
