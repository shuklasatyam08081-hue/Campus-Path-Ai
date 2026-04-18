import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authAPI, roadmapAPI } from '../api/client';
import { RefreshCw, Zap, ChevronRight, ChevronLeft, Check, User, Clock, Code, Globe, Flame, Search, Plus } from 'lucide-react';

const HOURS = [5, 10, 15, 20, 30];
const TECHS = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Ruby', 'PHP', 'Kotlin', 'Swift', 'Dart'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const URGENCY = [
  { value: 'Exploring', label: 'Exploring', desc: 'Just browsing, no rush', icon: '🌱' },
  { value: 'Active', label: 'Actively Looking', desc: 'Job hunting in 3-6 months', icon: '🚀' },
  { value: 'Urgent', label: 'Urgent', desc: 'Need a job ASAP', icon: '🔥' },
];

const ROADMAP_OPTIONS = {
  roles: [
    'Frontend', 'Backend', 'Full Stack', 'DevOps', 'DevSecOps', 'Data Analyst',
    'AI Engineer', 'AI and Data Scientist', 'Data Engineer', 'Android',
    'Machine Learning', 'PostgreSQL', 'iOS', 'Blockchain', 'QA',
    'Software Architect', 'Cyber Security', 'UX Design', 'Technical Writer',
    'Game Developer', 'Server Side Game Developer', 'MLOps', 'Product Manager',
    'Engineering Manager', 'Developer Relations', 'BI Analyst'
  ],
  skills: [
    'SQL', 'Computer Science', 'React', 'Vue', 'Angular', 'JavaScript',
    'TypeScript', 'Node.js', 'Python', 'System Design', 'Java', 'ASP.NET Core',
    'API Design', 'Spring Boot', 'Flutter', 'C++', 'Rust', 'Go Roadmap',
    'Design and Architecture', 'GraphQL', 'React Native', 'Design System',
    'Prompt Engineering', 'MongoDB', 'Linux', 'Kubernetes', 'Docker',
    'AWS', 'Terraform', 'Data Structures & Algorithms', 'Redis',
    'Git and GitHub', 'PHP', 'Cloudflare', 'AI Red Teaming', 'AI Agents',
    'Next.js', 'Code Review', 'Kotlin', 'HTML', 'CSS', 'Swift & Swift UI',
    'Shell / Bash', 'Laravel', 'Elasticsearch', 'WordPress', 'Django',
    'Ruby', 'Ruby on Rails', 'Claude Code', 'Vibe Coding', 'Scala'
  ]
};

const STEPS = [
  { id: 1, title: 'Target Role', subtitle: 'What kind of developer do you want to be?', icon: User },
  { id: 2, title: 'Weekly Time', subtitle: 'How many hours can you commit per week?', icon: Clock },
  { id: 3, title: 'Tech Stack', subtitle: 'Which technologies are you already comfortable with?', icon: Code },
  { id: 4, title: 'Skill Level', subtitle: 'How would you rate your current overall proficiency?', icon: Globe },
  { id: 5, title: 'Career Urgency', subtitle: 'How soon are you looking to land a role?', icon: Flame },
];

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [data, setData] = useState({
    targetRole: '',
    weeklyHours: 10,
    techStack: [],
    proficiency: 'Intermediate',
    careerUrgency: 'Active',
    githubUsername: user?.githubUsername || '',
  });

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const toggleTech = (tech) => {
    setData(p => ({
      ...p,
      techStack: p.techStack.includes(tech) ? p.techStack.filter(t => t !== tech) : [...p.techStack, tech],
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // 1. Update Profile
      const { data: res } = await authAPI.updateProfile({ ...data, onboardingComplete: true });
      updateUser(res.user);

      // 2. Trigger AI Roadmap Generation Immediately
      toast.info('🤖 Analyzing your GitHub & generating AI roadmap...');
      try {
        await roadmapAPI.generate({ 
          githubUsername: data.githubUsername, 
          targetRole: data.targetRole,
          manualSkills: data.techStack 
        });
        toast.success('🎯 Roadmap generated successfully!');
      } catch (rmErr) {
        console.warn('Initial roadmap generation failed:', rmErr.message);
        toast.info('You can generate your roadmap manually from the dashboard.');
      }

      toast.success('🎉 Profile setup complete!');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 1) return data.targetRole !== '';
    if (step === 2) return data.weeklyHours > 0;
    return true;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', background: '#050505' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, rgba(168,85,247,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div className="onboarding-step-container" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '100px', padding: '0.3rem 1rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#D8B4FE' }}>
            <Zap size={12} /> Step {step} of {STEPS.length}
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#F9FAFB', marginBottom: '0.5rem' }}>
            {STEPS[step - 1].title}
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>{STEPS[step - 1].subtitle}</p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            {STEPS.map(s => (
              <div key={s.id} style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700,
                background: s.id < step ? 'linear-gradient(135deg, #A855F7, #D8B4FE)' : s.id === step ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
                border: s.id === step ? '2px solid #A855F7' : '2px solid transparent',
                color: s.id <= step ? '#F9FAFB' : '#475569',
                transition: 'all 0.3s',
              }}>
                {s.id < step ? <Check size={12} /> : s.id}
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>

          {/* Step 1: Roadmap Selection Grid (Side-by-Side Layout) */}
          {step === 1 && (
            <div className="onboarding-flex-layout">
              {/* Left Column: Grid Selection */}
              <div className="onboarding-main-panel no-scrollbar" style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '1rem' }}>
                {/* Search Bar */}
                <div style={{ top: 0, zIndex: 10, padding: '0.5rem 0 1.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <input 
                      className="input-field" 
                      type="text" 
                      placeholder="Search roles or skills..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '2.5rem', background: 'rgba(15, 17, 23, 0.6)' }}
                    />
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                      <Search size={18} />
                    </div>
                  </div>
                </div>

                {/* Roles Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '20px', height: '1px', background: 'rgba(124,58,237,0.3)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Roles</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(124,58,237,0.1)' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                    {ROADMAP_OPTIONS.roles.filter(r => r.toLowerCase().includes(searchTerm.toLowerCase())).map(role => (
                      <button key={role} onClick={() => { setData(p => ({ ...p, targetRole: role })); setShowCustomInput(false); }}
                        style={{
                          padding: '0.8rem 1rem', borderRadius: '8px', border: data.targetRole === role ? '1px solid #A855F7' : '1px solid #1e293b',
                          background: data.targetRole === role ? 'rgba(168,85,247,0.1)' : '#0F1117',
                          color: data.targetRole === role ? '#F9FAFB' : '#9CA3AF',
                          cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', transition: 'all 0.2s', position: 'relative'
                        }}>
                        {role}
                        {data.targetRole === role && <Check size={12} style={{ position: 'absolute', right: 8, top: 8, color: '#A855F7' }} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Section */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '20px', height: '1px', background: 'rgba(6,182,212,0.3)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Skills</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(6,182,212,0.1)' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                    {ROADMAP_OPTIONS.skills.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).map(skill => (
                      <button key={skill} onClick={() => { setData(p => ({ ...p, targetRole: skill })); setShowCustomInput(false); }}
                        style={{
                          padding: '0.8rem 1rem', borderRadius: '8px', border: data.targetRole === skill ? '1px solid #D8B4FE' : '1px solid #1e293b',
                          background: data.targetRole === skill ? 'rgba(216,180,254,0.1)' : '#0F1117',
                          color: data.targetRole === skill ? '#F9FAFB' : '#9CA3AF',
                          cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', transition: 'all 0.2s', position: 'relative'
                        }}>
                        {skill}
                        {data.targetRole === skill && <Check size={12} style={{ position: 'absolute', right: 8, top: 8, color: '#D8B4FE' }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Actions & Integration */}
              <div className="onboarding-side-panel">
                {/* Custom Role Selector */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Can't find your role?</div>
                  <button onClick={() => setShowCustomInput(!showCustomInput)}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px dashed #334155',
                      background: 'rgba(15, 23, 42, 0.4)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      transition: 'all 0.2s', marginBottom: showCustomInput ? '1rem' : 0
                    }}>
                    <Plus size={16} /> {showCustomInput ? 'Close Custom Entry' : 'Enter Custom Role'}
                  </button>

                  {showCustomInput && (
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                      <input className="input-field" type="text" placeholder="e.g. Blockchain Dev..." 
                        value={data.targetRole} onChange={e => setData(p => ({ ...p, targetRole: e.target.value }))}
                        autoFocus style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', fontSize: '0.9rem' }} />
                    </div>
                  )}
                </div>

                {/* GitHub Integration */}
                <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(6,182,212,0.05) 100%)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Globe size={18} style={{ color: '#a855f7' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GitHub Sync</span>
                  </div>
                  <input className="input-field" type="text" placeholder="your-github-username" value={data.githubUsername}
                    onChange={e => setData(p => ({ ...p, githubUsername: e.target.value }))} 
                    style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.75rem' }} />
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.4', fontStyle: 'italic' }}>
                    Recommended to skip skills you've already mastered in your repositories.
                  </p>
                </div>

                {/* Selected Summary */}
                {data.targetRole && (
                  <div style={{ marginTop: 'auto', background: 'rgba(124,58,237,0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(124,58,237,0.2)', animation: 'slideUp 0.3s' }}>
                    <div style={{ fontSize: '0.65rem', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Current Choice</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{data.targetRole}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Weekly Hours */}
          {step === 2 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1rem' }}>HOURS PER WEEK</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {HOURS.map(h => (
                  <button key={h} onClick={() => setData(p => ({ ...p, weeklyHours: h }))}
                    style={{
                      padding: '1rem 1.25rem', borderRadius: '10px',
                      border: data.weeklyHours === h ? '2px solid #A855F7' : '1px solid rgba(255,255,255,0.08)',
                      background: data.weeklyHours === h ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                      color: data.weeklyHours === h ? '#D8B4FE' : '#9CA3AF',
                      fontWeight: data.weeklyHours === h ? 700 : 500, cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.2s',
                    }}>
                    <span>{h} hours/week</span>
                    <span style={{ fontSize: '0.8rem', color: data.weeklyHours === h ? '#D8B4FE' : '#475569' }}>
                      {h <= 5 ? 'Light' : h <= 10 ? 'Moderate' : h <= 20 ? 'Dedicated' : 'Intensive'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Tech Stack */}
          {step === 3 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1rem' }}>SELECT LANGUAGES YOU KNOW (select all that apply)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {TECHS.map(tech => (
                  <button key={tech} onClick={() => toggleTech(tech)}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: '100px',
                      border: data.techStack.includes(tech) ? '2px solid #A855F7' : '1px solid rgba(255,255,255,0.1)',
                      background: data.techStack.includes(tech) ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
                      color: data.techStack.includes(tech) ? '#D8B4FE' : '#9CA3AF',
                      cursor: 'pointer', fontSize: '0.875rem', fontWeight: data.techStack.includes(tech) ? 600 : 400,
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem',
                    }}>
                    {data.techStack.includes(tech) && <Check size={12} />}
                    {tech}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '1rem' }}>
                Selected: {data.techStack.length} language{data.techStack.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Step 4: Skill Level */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {LEVELS.map((level, i) => (
                <button key={level} onClick={() => setData(p => ({ ...p, proficiency: level }))}
                  style={{
                    padding: '1.25rem 1.5rem', borderRadius: '12px',
                    border: data.proficiency === level ? '2px solid #A855F7' : '1px solid rgba(255,255,255,0.08)',
                    background: data.proficiency === level ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                    color: data.proficiency === level ? '#F9FAFB' : '#9CA3AF',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{level}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    {i === 0 ? 'Learning fundamentals, less than 1 year experience' :
                     i === 1 ? '1-3 years, comfortable with core concepts and building projects' :
                     '3+ years, deep expertise and ability to architect solutions'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 5: Urgency */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {URGENCY.map(({ value, label, desc, icon }) => (
                <button key={value} onClick={() => setData(p => ({ ...p, careerUrgency: value }))}
                  style={{
                    padding: '1.25rem 1.5rem', borderRadius: '12px',
                    border: data.careerUrgency === value ? '2px solid #A855F7' : '1px solid rgba(255,255,255,0.08)',
                    background: data.careerUrgency === value ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                    color: data.careerUrgency === value ? '#F9FAFB' : '#9CA3AF',
                    cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s',
                  }}>
                  <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{label}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          {step > 1 && (
            <button className="btn-secondary" onClick={() => setStep(s => s - 1)} style={{ flex: 1, justifyContent: 'center' }}>
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {step < STEPS.length ? (
            <button className="btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{ flex: 1, justifyContent: 'center', opacity: canNext() ? 1 : 0.5 }}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn-primary" onClick={handleComplete} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Saving...' : <><Zap size={16} /> Complete Setup</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
