import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Zap, Mail, Lock, Eye, EyeOff, GitBranch, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 outline-none group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Zap size={24} className="text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-sans font-bold text-2xl text-foreground tracking-tight">
              CampusPath <span className="text-primary">AI</span>
            </span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold font-sans mt-8 text-foreground tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Continue your journey to engineering excellence
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel p-5 md:p-10 relative overflow-hidden">
          {/* Subtle glow border */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />

          <div className="relative z-10">
            {/* Social Auth */}
            <div className="flex gap-4 mb-8">
              <button onClick={demoLogin} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-background/50 border border-border hover:bg-muted text-sm font-bold transition-colors">
                <GitBranch size={18} /> GitHub
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-background/50 border border-border hover:bg-muted text-sm font-bold transition-colors">
                <Globe size={18} /> Google
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-border" />
              <span className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">or email</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 mb-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive" /> {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground ml-1">Email address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-background/50 border border-border rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground ml-1">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full bg-background/50 border border-border rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/20 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-muted-foreground font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4">Create one free</Link>
        </p>
      </motion.div>
    </div>
  );
}
