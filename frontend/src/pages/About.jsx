import Navbar from '../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';
import { Target, Zap, ArrowRight } from 'lucide-react';
import GradientText from '../components/GradientText';

const TECH = [
  { name: 'React 18', color: '#a259de', category: 'Frontend' },
  { name: 'Vite', color: '#a259de', category: 'Frontend' },
  { name: 'Tailwind CSS', color: '#a259de', category: 'Frontend' },
  { name: 'Framer Motion', color: '#a259de', category: 'Frontend' },
  { name: 'React Flow', color: '#a259de', category: 'Frontend' },
  { name: 'Recharts', color: '#a259de', category: 'Frontend' },
  { name: 'Node.js', color: '#a259de', category: 'Backend' },
  { name: 'Express.js', color: '#a259de', category: 'Backend' },
  { name: 'MongoDB', color: '#a259de', category: 'Backend' },
  { name: 'Gemini AI', color: '#a259de', category: 'AI' },
  { name: 'GitHub API', color: '#a259de', category: 'AI' },
  { name: 'JWT Auth', color: '#a259de', category: 'Backend' },
];

const TEAM = [
  { name: 'Shubham Kumar Yadav', role: 'Founder & CEO', bio: 'Former FAANG engineer who spent 2 years advising junior developers. Built CampusPath to solve the #1 problem: developers don\'t know what they don\'t know.', avatar: 'A', color: '#7c3aed' },
  { name: 'Jordan Kim', role: 'Head of AI', bio: 'ML researcher specializing in personalization systems. Designed the Gemini integration that makes each roadmap truly unique.', avatar: 'J', color: '#06b6d4' },
  { name: 'Maya Patel', role: 'Head of Product', bio: 'Shipped 4 developer tools used by 100K+ engineers. Obsessed with reducing friction between "learning" and "doing".', avatar: 'M', color: '#10b981' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflowX: 'hidden' }}>
      <Navbar />
      
      {/* Dynamic Background Wrapper (Matches Landing) */}
      <div style={{ position: 'relative' }}>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, height: '30rem', 
          background: '#A259DE',
          backgroundImage: 'linear-gradient(0deg, rgba(162, 89, 222, 1) 0%, rgba(0, 0, 0, 1) 60%)',
          zIndex: 0 
        }} />
        
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          maxWidth: '1100px', 
          margin: '0 auto', 
          padding: 'clamp(120px, 20vh, 180px) 1.5rem 80px' 
        }}>
          
          <div className="hero-bloom"></div>

          {/* Hero Section */}
          <section style={{ textAlign: 'center', marginBottom: 'clamp(4rem, 10vh, 8rem)' }}>
            <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
              Built by Engineers,<br />
              <GradientText
                colors={["#eabbf7","#a259de","#6f37c7","#eabbf7"]}
                animationSpeed={3}
                showBorder={false}
              >
                For Engineers
              </GradientText>
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.8, opacity: 0.9 }}>
              CampusPath AI was born from a simple frustration: the gap between knowing how to code
              and knowing which skills actually get you hired is enormous — and nobody was solving it intelligently.
            </p>
          </section>

          {/* Mission Card */}
          <div style={{ 
            background: 'var(--bg-glass)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-subtle)', 
            borderRadius: '32px', 
            padding: 'clamp(1.5rem, 5vw, 4rem)', 
            marginBottom: '6rem',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '2rem', 
              alignItems: 'center', 
              flexDirection: 'row',
              flexWrap: 'wrap', 
              justifyContent: 'center' 
            }}>
              <div style={{ 
                width: 72, height: 72, 
                background: 'var(--gradient-vibrant)', 
                borderRadius: '20px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                flexShrink: 0, 
                boxShadow: 'var(--shadow-glow)' 
              }}>
                <Target size={32} color="white" />
              </div>
              <div style={{ flex: '1 1 300px', textAlign: 'left', minWidth: 'min(100%, 300px)' }}>
                <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Our Mission</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7 }}>
                  To eliminate skill gap ambiguity for every developer on earth. We treat career development
                  as an engineering problem — with measurable inputs, adaptive algorithms, and verifiable outputs.
                  No more generic playlists. Just precision-targeted growth, guided by AI.
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div style={{ marginBottom: '6rem' }}>
            <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '1rem' }}>Open Tech Stack</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem', fontSize: '1.05rem' }}>Built with best-in-class open source technologies</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
              {TECH.map(({ name, color, category }) => (
                <div key={name} style={{
                  padding: '0.6rem 1.25rem', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 600,
                  background: `${color}10`, border: `1px solid ${color}25`, color,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  backdropFilter: 'blur(4px)'
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  {name}
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>· {category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div style={{ marginBottom: '6rem' }}>
            <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '3.5rem' }}>The Team</h2>
            <div className="responsive-grid-3">
              {TEAM.map(({ name, role, bio, avatar, color }) => (
                <div key={name} className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ 
                    width: 80, height: 80, borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${color}, ${color}40)`, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    marginBottom: '1.5rem', fontWeight: 900, fontSize: '1.75rem', color: 'white', 
                    boxShadow: `0 8px 24px ${color}30` 
                  }}>
                    {avatar}
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{name}</h3>
                  <div style={{ color, fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem' }}>{role}</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.75, opacity: 0.8 }}>{bio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section (Refined) */}
          <div style={{ textAlign: 'center' }}>
            <div className="glass-card" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', borderRadius: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Want to join the mission?</h2>
              <button 
                className="btn-primary" 
                onClick={() => navigate('/register')}
                style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}
              >
                <Zap size={18} /> Start Your Journey <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
