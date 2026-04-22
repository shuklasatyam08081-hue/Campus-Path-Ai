import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import AppLayout from './components/layout/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Public pages
import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';

// App pages
import Dashboard from './pages/Dashboard';
import RoadmapViewer from './pages/RoadmapViewer';
import Progress from './pages/Progress';
import Projects from './pages/Projects';
import GitHubDNA from './pages/GitHubDNA';
import Jobs from './pages/Jobs';
import Portfolio from './pages/Portfolio';
import PortfolioBuilder from './pages/PortfolioBuilder';
import Achievements from './pages/Achievements';
import Community from './pages/Community';
import FocusRooms from './pages/FocusRooms';
import SettingsPage from './pages/Settings';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 blur-[100px] animate-pulse" />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center relative z-10 shadow-2xl shadow-primary/20"
      >
        <div className="w-8 h-8 rounded-full bg-primary shadow-lg" />
      </motion.div>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse relative z-10">Initializing Neural Link</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
};

function AppContent() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><PageTransition><RoadmapViewer /></PageTransition></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><PageTransition><Progress /></PageTransition></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><PageTransition><Projects /></PageTransition></ProtectedRoute>} />
        <Route path="/github" element={<ProtectedRoute><PageTransition><GitHubDNA /></PageTransition></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><PageTransition><Jobs /></PageTransition></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute><PageTransition><Portfolio /></PageTransition></ProtectedRoute>} />
        <Route path="/portfolio-builder" element={<ProtectedRoute><PageTransition><PortfolioBuilder /></PageTransition></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><PageTransition><Achievements /></PageTransition></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><PageTransition><Community /></PageTransition></ProtectedRoute>} />
        <Route path="/focus" element={<ProtectedRoute><PageTransition><FocusRooms /></PageTransition></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PageTransition><SettingsPage /></PageTransition></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <div className="fixed inset-0 pointer-events-none z-[-1]">
              <div className="absolute inset-0 bg-background" />
            </div>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
