import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import {
  ChevronRight, Zap, GitBranch, Brain, Map, Trophy, Users,
  BarChart, ArrowRight, Star, Check, Sparkles, Code, Terminal,
  Rocket, ShieldCheck, Cpu
} from 'lucide-react';

const FEATURES = [
  { icon: Brain, title: 'AI Roadmap Generator', desc: 'Gemini AI analyzes your GitHub and builds a hyper-personalized week-by-week roadmap for your target role.', size: 'col-span-2' },
  { icon: GitBranch, title: 'GitHub DNA Analysis', desc: 'We scan your repositories and tech stack to understand exactly what you already know.', size: 'col-span-1' },
  { icon: Map, title: 'Interactive Roadmap', desc: 'Navigate your career path with a visual node-graph. Check off tasks, and track progress.', size: 'col-span-1' },
  { icon: Cpu, title: 'Job Match Engine', desc: 'AI-matched job listings based on your roadmap progress — see your % match score.', size: 'col-span-2' },
];

const STATS = [
  { value: '50K+', label: 'Developers' },
  { value: '94%', label: 'Placement Rate' },
  { value: '12 Wks', label: 'Hire-Ready' },
  { value: '4.9★', label: 'User Rating' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Backend @ Stripe', text: 'CampusPath AI identified exactly the 3 skills I was missing. Within 10 weeks I had my offer.', rating: 5 },
  { name: 'Marcus Chen', role: 'Frontend @ Vercel', text: 'The GitHub DNA analysis blew my mind. It skipped basics and jumped to optimization.', rating: 5 },
  { name: 'Aisha Patel', role: 'DevOps @ AWS', text: 'The roadmap was so precise it felt like it was written for me personally.', rating: 5 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar />

      {/* Background Decorative Elements - GitHub Themed */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] bg-blue-400/5 rounded-full blur-[80px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden md:pt-48 md:pb-32">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>Powering 50,000+ Career Paths</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold font-sans tracking-tight leading-[1.1] mb-6"
          >
            Architect Your Future <br />
            <span className="text-gradient">From Your Code</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
          >
            Stop wasting months on tutorials you've already mastered. Link your GitHub and let AI build a surgical, week-by-week roadmap to your target role.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group shadow-sm"
            >
              Start Your Journey <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/about')}
              className="px-8 py-4 bg-card border border-border text-lg font-bold rounded-lg hover:bg-muted transition-all"
            >
              How it works
            </button>
          </motion.div>

          {/* Hero Visual - GitHub Syntax Themed */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: [-5, 5, -5] }}
            transition={{
              opacity: { delay: 0.5, duration: 0.8 },
              y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1.3 }
            }}
            className="mt-20 w-full max-w-5xl glass-panel p-2 shadow-xl relative"
          >
            <div className="rounded-lg overflow-hidden bg-background border border-border">
              <div className="flex items-center gap-2 p-4 border-b border-border bg-muted">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                </div>
                <div className="flex-1 text-xs text-muted-foreground font-mono flex justify-center">github_analysis.js</div>
              </div>
              <div className="p-4 md:p-10 text-left font-mono text-sm overflow-hidden">
                <pre className="text-muted-foreground italic opacity-70">{"// AI-Powered Roadmap Initialization..."}</pre>
                <div className="flex gap-4 mt-4">
                  <div className="space-y-2 opacity-30">
                    <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
                  </div>
                  <code className="space-y-2 block">
                    <div className="flex gap-2">
                      <span className="text-blue-500">const</span> <span className="text-foreground">profile</span> = <span className="text-blue-500">await</span> <span className="text-blue-600">AnalyzeGitHub</span>(<span className="text-orange-600">"username"</span>);
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-500">const</span> <span className="text-foreground">roadmap</span> = <span className="text-blue-500">new</span> <span className="text-blue-600">CareerPath</span>(profile);
                    </div>
                    <div className="flex gap-2 text-muted-foreground italic">
                      {"// Skipping React basics (Mastery detected)..."}
                    </div>
                    <div className="flex gap-2">
                      roadmap.<span className="text-blue-600">setTarget</span>(<span className="text-orange-600">"Senior_Backend_Engineer"</span>);
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-500">return</span> roadmap.<span className="text-blue-600">generate</span>();
                    </div>
                  </code>
                </div>
              </div>
            </div>
            {/* Floating decoration */}
            <div className="absolute -top-4 -right-6 w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 rotate-12">
              <Zap size={24} className="text-primary-foreground" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {STATS.map(({ value, label }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-black font-sans text-primary mb-2 tracking-tighter">{value}</div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight mb-4 text-foreground">
              Smarter Career <span className="text-gradient">Engineering</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Skip generic courses. Our platform adapts to your existing codebase history and future goals.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                className={feature.size + " glass-panel p-5 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-300 group"}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Steps CTA */}
      <section className="py-24 bg-card relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-sans mb-12">How to get started?</h2>
          <div className="space-y-6 text-left">
            {[
              { s: "01", t: "Connect GitHub", d: "One-click connection to analyze all your code contributions and repos." },
              { s: "02", t: "Pick Your Goal", d: "Choose from 20+ specialized career paths or build a custom one." },
              { s: "03", t: "Master the Gaps", d: "Follow your AI curriculum and automatically match with open roles." }
            ].map((step, i) => (
              <motion.div
                key={step.s}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-4 p-4 md:p-5 rounded-lg bg-background border border-border hover:border-primary/30 transition-all"
              >
                <span className="text-4xl md:text-5xl font-black font-sans text-primary/10 leading-none">{step.s}</span>
                <div>
                  <h4 className="text-xl font-bold mb-1">{step.t}</h4>
                  <p className="text-muted-foreground">{step.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.15 }}
                className="p-5 rounded-lg bg-card border border-border shadow-sm relative flex flex-col justify-between"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} className="fill-primary text-primary" />)}
                </div>
                <p className="text-lg italic text-foreground/90 mb-6 font-medium">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-tight">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto glass-panel p-12 md:p-20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <h2 className="text-4xl md:text-6xl font-black font-sans mb-6 leading-tight">Ready to stop guessing?</h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of developers leveling up with AI-powered career paths.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-5 bg-primary text-primary-foreground text-xl font-bold rounded-lg shadow-sm hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center gap-3"
          >
            Create Your Account <ChevronRight size={24} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border mt-12 bg-muted px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-lg font-sans tracking-tighter">CampusPath AI</span>
          </div>
          <div className="flex gap-5 text-sm text-muted-foreground font-medium">
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 CampusPath AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
