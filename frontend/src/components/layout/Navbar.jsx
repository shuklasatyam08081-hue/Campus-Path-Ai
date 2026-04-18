import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, Menu, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '../ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header style={{
      position: 'fixed', top: '1.25rem', left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 2.5rem)', maxWidth: '1200px', zIndex: 200,
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      borderRadius: '20px',
      height: '68px',
      boxShadow: 'var(--shadow-card)',
      border: '1px solid var(--border-subtle)'
    }}>

      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 1.5rem',
        height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--gradient-vibrant)',
            borderRadius: 8,

            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            CampusPath <span style={{ color: 'var(--accent-highlight)' }}>AI</span>
          </span>

        </Link>

        {/* Desktop Nav */}
        <nav className="hide-mobile" style={{ alignItems: 'center', gap: '2rem' }}>
          {[['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
            <Link key={to} to={to} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >{label}</Link>
          ))}
        </nav>

        {/* Action Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="hide-mobile">
            <ThemeToggle />
          </div>

          {/* Mobile Toggle */}
          <button 
            className="show-mobile" 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid var(--border-subtle)', 
              color: 'var(--text-primary)', 
              cursor: 'pointer',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              marginRight: '-0.5rem' // Balanced with logo padding
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            {mobileOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
          </button>

          {/* CTA */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>
                Dashboard <ChevronRight size={14} />
              </Link>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Sign In</Link>
                <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>
                  Join <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div style={{
            position: 'absolute', 
            top: 'calc(100% + 0.75rem)', 
            left: 0, 
            right: 0,
            width: '100%',
            background: 'var(--bg-primary)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '20px',
            zIndex: 190, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
            animation: 'fadeIn 0.3s ease',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-subtle)'
          }}>


            {[['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1.15rem', fontWeight: 600 }}>
                {label}
              </Link>
            ))}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1rem 0' }} />
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                Dashboard <ChevronRight size={18} />
              </Link>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'center' }}>Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                  Get Started <ChevronRight size={18} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
