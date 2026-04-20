import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Map, TrendingUp, FolderGit2, GitBranch, Briefcase,
  Globe, Wrench, Trophy, Users, Settings, LogOut, Zap, Menu, X
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.header 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-50 flex items-center justify-between px-4"
    >
      <div className="flex items-center gap-6">
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

        {/* Desktop Nav Bar - GitHub Style */}
        <nav className="hidden md:flex flex-1 items-center gap-1">
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
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />
        
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

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          title="Menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors hidden sm:flex"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-0 right-0 max-h-[85vh] overflow-y-auto bg-card border-b border-border shadow-2xl p-4 flex flex-col gap-2 md:hidden z-40"
          >
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => twMerge(
                  clsx(
                    "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all font-medium",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={clsx("transition-transform", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
            
            <hr className="border-border my-2" />
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg text-destructive hover:bg-destructive/10 transition-colors w-full text-left font-medium"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}