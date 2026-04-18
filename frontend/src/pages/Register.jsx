import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Mail, Lock, User, Eye, EyeOff, GitBranch, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden py-12">
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 outline-none group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Zap size={24} className="text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-sans font-bold text-2xl text-foreground tracking-tight">
              CampusPath <span className="text-primary">AI</span>
            </span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold font-sans mt-8 text-foreground tracking-tight">
            Create your account
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Start engineering your career today — free forever
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-panel p-8 md:p-10 relative overflow-hidden">
          {/* Subtle glow border */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50 pointer-events-none" />

          <div className="relative z-10">
            {/* Social Auth */}
            <div className="flex gap-4 mb-8">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-background/50 border border-border hover:bg-muted text-sm font-bold transition-colors">
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
                <label className="text-sm font-bold text-foreground ml-1">Full name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Alex Johnson"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-background/50 border border-border rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Min 6 characters"
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

              <p className="text-xs text-muted-foreground font-medium px-1 leading-relaxed mt-4">
                By creating an account, you agree to our <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/20 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-muted-foreground font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
