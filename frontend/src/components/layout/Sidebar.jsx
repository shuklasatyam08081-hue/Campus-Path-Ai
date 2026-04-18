import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Map, TrendingUp, FolderGit2, GitBranch, Briefcase,
  Globe, Wrench, Trophy, Users, Settings, LogOut, Zap
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  { to: '/focus', icon: Zap, label: 'Focus Rooms' },
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
    <motion.header 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-50 flex items-center px-4 gap-6"
    >
      {/* Logo */}
      <NavLink to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
        <div className="w-8 h-8 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
          <Zap size={16} className="text-primary" fill="currentColor" />
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-sm font-bold text-foreground font-sans tracking-tight">
            CampusPath
          </div>
        </div>
      </NavLink>

      {/* Horizontal Nav Bar - GitHub Style */}
      <nav className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar relative">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => twMerge(
              clsx(
                "flex items-center gap-2 px-3 py-4 text-[13px] transition-all whitespace-nowrap relative font-medium group h-full",
                isActive 
                  ? "text-foreground font-semibold" 
                  : "text-muted-foreground hover:text-foreground"
              )
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={clsx("transition-transform", isActive ? "text-foreground" : "text-muted-foreground")} />
                <span>{label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fd8c73] rounded-full z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-foreground overflow-hidden">
               {user.githubUsername ? (
                 <img src={`https://github.com/${user.githubUsername}.png`} alt={user.name} className="w-full h-full" />
               ) : (
                 user.name?.[0]?.toUpperCase() || 'U'
               )}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </motion.header>
  );
}
