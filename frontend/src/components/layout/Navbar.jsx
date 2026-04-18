import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, Menu, X, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import ThemeToggle from '../ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-[200] flex justify-center transition-all duration-500 ${
        scrolled ? 'pt-0 px-0' : 'pt-5 px-5 md:px-10'
      }`}
    >
      <div 
        className={`bg-card/90 backdrop-blur-md border border-border shadow-sm flex items-center justify-between transition-all duration-500 ${
          scrolled 
            ? 'w-full max-w-none !rounded-none border-x-0 border-t-0 px-6 md:px-12 h-14' 
            : 'w-full max-w-6xl px-6 rounded-xl h-16'
        }`}
      >
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group outline-none">
          <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Zap size={16} className="text-primary-foreground" fill="currentColor" />
          </div>
          <span className="font-sans font-bold text-base text-foreground tracking-tight">
            CampusPath <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
            <Link 
              key={to} 
              to={to} 
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Action Group */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="px-4 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-all shadow-sm">
                Dashboard <ChevronRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs font-bold text-foreground hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-all shadow-sm">
                  Join <ChevronRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center bg-muted border border-border text-foreground transition-colors outline-none hover:bg-muted/80"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[calc(100%+0.5rem)] left-4 right-4 bg-card border border-border p-5 rounded-xl shadow-lg md:hidden flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                {[['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
                  <Link 
                    key={to} 
                    to={to} 
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
              
              <div className="h-px w-full bg-border" />
              
              <div className="flex flex-col gap-3">
                {user ? (
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 text-sm">
                    Dashboard <ChevronRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full py-2.5 bg-muted border border-border text-foreground font-bold rounded-lg flex items-center justify-center text-sm">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 text-sm">
                      Get Started <ChevronRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
