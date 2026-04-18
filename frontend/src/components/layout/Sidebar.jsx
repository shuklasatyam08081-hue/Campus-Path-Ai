import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Map, TrendingUp, FolderGit2, GitBranch, Briefcase,
  Globe, Wrench, Trophy, Users, Settings, LogOut, Zap
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/projects', icon: FolderGit2, label: 'Projects' },
  { to: '/github', icon: GitBranch, label: 'GitHub DNA' },
  { to: '/jobs', icon: Briefcase, label: 'Job Match' },
  { to: '/portfolio', icon: Globe, label: 'Portfolio' },
  { to: '/portfolio-builder', icon: Wrench, label: 'Builder' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '64px',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(24px)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 100,
      padding: '0 1.5rem',
      gap: '2rem'
    }}>
      {/* Background orb mapping */}
      <div style={{
        position: 'absolute', top: -50, left: '20%',
        width: 300, height: 100,
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <NavLink to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <div style={{
          width: 34, height: 34, flexShrink: 0,
          background: 'var(--gradient-vibrant)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={16} color="white" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
            CampusPath
          </div>
        </div>
      </NavLink>

      {/* Horizontal Scrollable Nav */}
      <nav style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none', /* IE/Edge */
      }} className="hide-scroll">
        <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              background: isActive ? 'var(--bg-card)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.85rem',
              whiteSpace: 'nowrap'
            })}
          >
            <Icon size={14} style={{ color: "inherit" }} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <div className="hide-mobile">
          <ThemeToggle />
        </div>
        
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hide-mobile">
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--gradient-vibrant)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: 'white',
            }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            background: 'var(--bg-card)',
            width: 32, height: 32, borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease',
            border: 'none'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

