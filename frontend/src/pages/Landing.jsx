import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import Navbar from '../components/layout/Navbar';
import GradientText from '../components/GradientText';
import { ChevronRight, Zap, GitBranch, Brain, Map, Trophy, Users, BarChart, ArrowRight, Star, Check, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: Brain, title: 'AI Roadmap Generator', desc: 'Gemini AI analyzes your GitHub and builds a hyper-personalized week-by-week roadmap for your target role.', color: 'var(--c1)' },
  { icon: GitBranch, title: 'GitHub DNA Analysis', desc: 'We scan your repositories, commit history, and tech stack to understand exactly what you already know.', color: 'var(--c3)' },
  { icon: Map, title: 'Interactive Roadmap', desc: 'Navigate your career path with a visual node-graph. Check off tasks, unlock resources, and track progress.', color: 'var(--c6)' },
  { icon: BarChart, title: 'Command Center Dashboard', desc: 'Career readiness gauges, radar charts, heatmaps, and daily AI missions keep you laser-focused.', color: 'var(--c7)' },
  { icon: Trophy, title: 'Achievement Vault', desc: 'Earn badges, claim XP rewards, and auto-generate LinkedIn posts to showcase your milestones.', color: 'var(--c2)' },
  { icon: Users, title: 'Job Match Engine', desc: 'AI-matched job listings based on your roadmap progress — see your % match score for every role.', color: 'var(--c1)' },
];

const STATS = [
  { value: '50K+', label: 'Developers Onboarded' },
  { value: '94%', label: 'Job Placement Rate' },
  { value: '12 Wks', label: 'Average to Hire-Ready' },
  { value: '4.9★', label: 'User Rating' },
];

const ROLES = ['Backend Engineer', 'Frontend Developer', 'Full Stack Dev', 'DevOps Engineer', 'Cloud Architect', 'AI/ML Engineer'];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Backend Engineer @ Stripe', avatar: 'P', text: 'CampusPath AI identified exactly the 3 skills I was missing for backend roles. Within 10 weeks I had my offer from Stripe.', rating: 5 },
  { name: 'Marcus Chen', role: 'Frontend Dev @ Vercel', avatar: 'M', text: 'The GitHub DNA analysis blew my mind. It skipped React basics (I already knew it) and jumped straight to Next.js optimization. Saved me weeks.', rating: 5 },
  { name: 'Aisha Patel', role: 'DevOps @ AWS', avatar: 'A', text: 'The roadmap was so precise it felt like it was written for me personally. It actually WAS — because it read my entire GitHub history first.', rating: 5 },
];



export default function Landing() {
  const navigate = useNavigate();
  const [roleIdx, setRoleIdx] = useState(0);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      <Navbar />
      <div style={{ position: 'relative' }}>


        {/* HERO SECTION WITH BLOOM & DASHBOARD MOCK */}
        <section style={{ 
          position: 'relative', 
          zIndex: 2, 
          paddingTop: 'max(12vh, 100px)', 
          paddingBottom: '8rem', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          background: '#A259DE',
          backgroundImage: 'linear-gradient(0deg, rgba(162, 89, 222, 1) 0%, rgba(0, 0, 0, 1) 60%)',
          filter: 'progid:DXImageTransform.Microsoft.gradient(startColorstr="#A259DE", endColorstr="#000000", GradientType=0)'
        }}>
          <div className="hero-bloom"></div>
          
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 3 }}>
            
            {/* Badge */}
            <div className="badge-glow">
              <Sparkles size={14} /> Latest integration just arrived
            </div>

            {/* H1 Title */}
            <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(2.25rem, 8vw, 5rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.5rem', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
              Architect Your Future<br />
              <GradientText
                colors={["#eabbf7","#a259de","#6f37c7","#eabbf7"]}
                animationSpeed={4}
                showBorder={false}
              >
                Decoded From Your Code
              </GradientText>
            </h1>

            {/* Subtext */}
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto 2.5rem' }}>
              Stop wasting months on tutorials you've already mastered. Synchronize with GitHub to build a surgical, week-by-week roadmap.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', padding: '0 1rem' }}>
              <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '14px 32px', fontSize: '1.05rem', fontWeight: 600 }}>
                 Start for free
              </button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section style={{ padding: '3rem 1.5rem' }}>
          <div className="responsive-grid-4" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {STATS.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.5rem', fontWeight: 800 }} className="gradient-text">{value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES BENTO GRID */}
        <section style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Every Tool You Need to{' '}
              <span className="gradient-text">Land the Role</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
              A complete career engineering platform — not just another tutorial site.
            </p>
          </div>
          <div className="responsive-grid-3">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ width: 48, height: 48, background: `${color}20`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ padding: '6rem 2rem', background: 'var(--bg-glass)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              From GitHub to <GradientText colors={["#eabbf7","#a259de","#6f37c7","#eabbf7"]} animationSpeed={4} showBorder={false}>Hire-Ready</GradientText> in 3 Steps
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3.5rem', fontSize: '1.05rem' }}>No generic courses. No wasted time. Just precision learning.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              {[
              { step: '01', title: 'Connect Your GitHub', desc: 'Connect your repositories. Our AI scans your history and technical contributions to map your current baseline.', color: 'var(--c3)' },
              { step: '02', title: 'AI Generates Your Roadmap', desc: 'Gemini AI identifies your exact skill gaps for your target role and builds a personalized curriculum — skipping what you already show mastery in.', color: 'var(--c6)' },
              { step: '03', title: 'Execute & Track Progress', desc: 'Follow your roadmap, complete technical milestones, and track your journey on the Command Center with precision-matched roles.', color: 'var(--c7)' },
            ].map(({ step, title, desc, color }) => (
                <div key={step} className="glass-card" style={{ padding: '1.75rem 2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, color, minWidth: 52 }}>{step}</div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding: '6rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, textAlign: 'center', marginBottom: '3rem', color: 'var(--text-primary)' }}>
            Developers Who <span className="gradient-text">Made It</span>
          </h2>
          <div className="responsive-grid-3">
            {TESTIMONIALS.map(({ name, role, avatar, text, rating }) => (
              <div key={name} className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {Array.from({ length: rating }).map((__, i) => (
                    <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>"{text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-vibrant)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', color: 'white' }}>
                    {avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto', borderRadius: '32px', padding: '4rem 3rem' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Ready to Engineering Your Career?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.7 }}>
              Join 50,000+ developers who stopped guessing and started growing with AI-powered precision.
            </p>
            <button className="btn-primary" onClick={() => navigate('/register')}>
              <Zap size={18} /> Get Your Free Roadmap <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: '2rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>© 2024 CampusPath AI. Built to bridge the gap between code and careers.</p>
        </footer>
      </div>{/* end content wrapper above Spline */}
    </div>
  );
}
