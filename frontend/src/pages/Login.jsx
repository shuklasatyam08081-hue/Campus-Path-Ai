import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Zap, Mail, Lock, Eye, EyeOff, GitBranch, Globe, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.onboardingComplete ? '/dashboard' : '/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      await login('demo@campuspath.ai', 'demo1234');
      navigate('/dashboard');
    } catch {
      setError('Demo account unavailable. Please register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 'clamp(1rem, 5vw, 2.5rem)', 
      position: 'relative',
      overflow: 'hidden' 
    }}>
      {/* Background blocks removed */}

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>
        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vh, 3rem)' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ 
              width: 48, height: 48, 
              background: 'var(--gradient-vibrant)', 
              borderRadius: 14, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Zap size={24} color="white" fill="white" />
            </div>
            <span style={{ 
              fontFamily: 'Inter, system-ui, sans-serif', 
              fontWeight: 800, 
              fontSize: '1.4rem', 
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em'
            }}>
              CampusPath <span style={{ color: 'var(--accent-purple)' }}>AI</span>
            </span>
          </Link>
          <h1 style={{ 
            fontFamily: 'Inter, system-ui, sans-serif', 
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', 
            fontWeight: 900, 
            marginTop: '1.5rem', 
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em'
          }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem', opacity: 0.8 }}>
            Continue your journey to engineering excellence
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card" style={{ 
          padding: 'clamp(1.5rem, 5vw, 2.5rem)',
          borderRadius: '32px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Social Auth */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button className="glass-card" onClick={demoLogin} style={{ 
              flex: 1, justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600, 
              padding: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
              cursor: 'pointer', border: '1px solid var(--border-subtle)'
            }}>
              <GitBranch size={18} /> GitHub
            </button>
            <button className="glass-card" style={{ 
              flex: 1, justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600, 
              padding: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
              cursor: 'pointer', border: '1px solid var(--border-subtle)'
            }}>
              <Globe size={18} /> Google
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)', opacity: 0.5 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>or email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)', opacity: 0.5 }} />
          </div>

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '12px', 
              padding: '0.85rem 1rem', 
              marginBottom: '1.5rem', 
              color: '#f87171', 
              fontSize: '0.9rem',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input-field"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  style={{ 
                    paddingLeft: '3rem', 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '14px', 
                    border: '1px solid var(--border-subtle)',
                    padding: '1rem 1rem 1rem 3rem'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input-field"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ 
                    paddingLeft: '3rem', 
                    paddingRight: '3rem',
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '14px', 
                    border: '1px solid var(--border-subtle)',
                    padding: '1rem 3rem'
                  }}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)} 
                  style={{ 
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', 
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading} 
              style={{ 
                width: '100%', justifyContent: 'center', padding: '1.1rem', marginTop: '1rem', 
                opacity: loading ? 0.7 : 1, fontSize: '1rem', fontWeight: 700,
                borderRadius: '16px'
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-purple)', fontWeight: 700, textDecoration: 'none' }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
