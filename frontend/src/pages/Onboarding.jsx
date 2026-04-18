import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authAPI, roadmapAPI } from '../api/client';
import { Zap, ChevronRight, ChevronLeft, Check, User, Clock, Code, Globe, Flame, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
      const { data: res } = await authAPI.updateProfile({ ...data, onboardingComplete: true });
      updateUser(res.user);

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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative bg-background overflow-hidden">
      {/* GitHub Themed Background Detail */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        {/* Header Content */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Zap size={14} /> Step {step} of {STEPS.length}
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {STEPS[step - 1].title}
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            {STEPS[step - 1].subtitle}
          </p>
        </div>

        {/* GitHub Themed Progress Bar */}
        <div className="mb-10 mx-auto max-w-2xl px-4">
          <div className="flex justify-between mb-4 relative z-10">
            {STEPS.map(s => (
              <div 
                key={s.id} 
                className={twMerge(
                  clsx(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 z-10",
                    s.id < step ? "bg-primary text-primary-foreground border-transparent shadow-sm" : 
                    s.id === step ? "bg-background border-2 border-primary text-primary shadow-sm" : 
                    "bg-muted border border-border text-muted-foreground"
                  )
                )}
              >
                {s.id < step ? <Check size={12} strokeWidth={3} /> : s.id}
              </div>
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden relative w-full z-0">
             <motion.div 
               className="h-full bg-primary" 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 0.4, ease: "easeOut" }}
             />
          </div>
        </div>

        {/* Main Content Container */}
        <div className="bg-card border border-border p-6 sm:p-10 rounded-xl shadow-sm relative overflow-hidden backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Target Role */}
              {step === 1 && (
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Column (Options Grid) */}
                  <div className="flex-1 lg:max-h-[45vh] overflow-y-auto no-scrollbar pr-0 lg:pr-4">
                    <div className="sticky top-0 z-10 pb-4 bg-card">
                      <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                          type="text" 
                          placeholder="Search roles or technical skills..." 
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full bg-muted border border-border text-foreground text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                       <div className="w-full flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Common Roles</span>
                          <div className="h-px flex-1 bg-border" />
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                         {ROADMAP_OPTIONS.roles.filter(r => r.toLowerCase().includes(searchTerm.toLowerCase())).map(role => (
                           <button 
                             key={role} 
                             onClick={() => { setData(p => ({ ...p, targetRole: role })); setShowCustomInput(false); }}
                             className={twMerge(
                               clsx(
                                 "text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between group",
                                 data.targetRole === role 
                                    ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary" 
                                    : "border-border bg-background hover:bg-muted text-foreground"
                               )
                             )}
                           >
                             <span className="truncate mr-2">{role}</span>
                             {data.targetRole === role && <Check size={12} strokeWidth={3} className="shrink-0" />}
                           </button>
                         ))}
                       </div>
                    </div>

                    <div>
                       <div className="w-full flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Technologies</span>
                          <div className="h-px flex-1 bg-border" />
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                         {ROADMAP_OPTIONS.skills.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).map(skill => (
                           <button 
                             key={skill} 
                             onClick={() => { setData(p => ({ ...p, targetRole: skill })); setShowCustomInput(false); }}
                             className={twMerge(
                               clsx(
                                 "text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between shadow-sm",
                                 data.targetRole === skill 
                                    ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary" 
                                    : "border-border bg-background hover:bg-muted text-foreground"
                               )
                             )}
                           >
                             <span className="truncate mr-2">{skill}</span>
                             {data.targetRole === skill && <Check size={12} strokeWidth={3} className="shrink-0" />}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>

                  {/* Right Column (Custom & Github) */}
                  <div className="lg:w-1/4 flex flex-col gap-5">
                     <div className="bg-muted border border-border p-4 rounded-lg">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Custom entry</div>
                        <button 
                          onClick={() => setShowCustomInput(!showCustomInput)}
                          className="w-full p-2.5 rounded-lg border border-dashed border-border text-muted-foreground hover:bg-background transition-colors flex items-center justify-center gap-2 text-[11px] font-semibold"
                        >
                          <Plus size={14} /> {showCustomInput ? 'Cancel' : 'Enter Custom'}
                        </button>
                        <AnimatePresence>
                          {showCustomInput && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden mt-3"
                            >
                               <input 
                                 type="text" 
                                 placeholder="e.g. AI Researcher" 
                                 value={data.targetRole} 
                                 onChange={e => setData(p => ({ ...p, targetRole: e.target.value }))}
                                 className="w-full bg-background border border-border text-foreground text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                                 autoFocus 
                               />
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>

                     <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Globe size={14} className="text-primary" />
                          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">GitHub Handle</span>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Your GitHub username" 
                          value={data.githubUsername}
                          onChange={e => setData(p => ({ ...p, githubUsername: e.target.value }))} 
                          className="w-full bg-background border border-border text-foreground text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" 
                        />
                        <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
                          We will scan your repos and tech stack to customize your carrier path.
                        </p>
                     </div>

                     {data.targetRole && (
                       <motion.div 
                         initial={{ scale: 0.98, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         className="mt-auto bg-primary border-transparent p-4 rounded-lg shadow-sm text-primary-foreground"
                       >
                         <div className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1">Current Goal</div>
                         <div className="text-sm font-bold truncate">{data.targetRole}</div>
                       </motion.div>
                     )}
                  </div>
                </div>
              )}

              {/* Step 2: Weekly Hours */}
              {step === 2 && (
                <div className="max-w-md mx-auto py-4">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6 text-center">Available Time</div>
                  <div className="grid gap-3">
                    {HOURS.map(h => (
                      <button 
                        key={h} 
                        onClick={() => setData(p => ({ ...p, weeklyHours: h }))}
                        className={twMerge(
                          clsx(
                             "w-full flex items-center justify-between p-4 rounded-xl border transition-all group shadow-sm",
                             data.weeklyHours === h 
                                ? "border-primary bg-primary/5 text-primary shadow-md"
                                : "border-border bg-background hover:bg-muted text-foreground"
                          )
                        )}
                      >
                        <span className="font-bold">{h} hours per week</span>
                        <span className={clsx(
                          "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md",
                          data.weeklyHours === h ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {h <= 5 ? 'Light' : h <= 10 ? 'Medium' : h <= 20 ? 'Professional' : 'Full-time'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Tech Stack */}
              {step === 3 && (
                <div className="max-w-2xl mx-auto py-4">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6 text-center">Knowledge Base</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {TECHS.map(tech => (
                      <button 
                         key={tech} 
                         onClick={() => toggleTech(tech)}
                         className={twMerge(
                           clsx(
                             "px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm",
                             data.techStack.includes(tech) 
                                ? "border-primary bg-primary text-primary-foreground shadow-md scale-105" 
                                : "border-border bg-background hover:bg-muted text-muted-foreground"
                           )
                         )}
                      >
                        {data.techStack.includes(tech) && <Check size={12} strokeWidth={3} />}
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Skill Level */}
              {step === 4 && (
                <div className="max-w-md mx-auto grid gap-3 py-4">
                  {LEVELS.map((level, i) => (
                    <button 
                       key={level} 
                       onClick={() => setData(p => ({ ...p, proficiency: level }))}
                       className={twMerge(
                         clsx(
                            "w-full text-left p-5 rounded-xl border transition-all shadow-sm",
                            data.proficiency === level 
                               ? "border-primary bg-primary/5 shadow-md" 
                               : "border-border bg-background hover:bg-muted"
                         )
                       )}
                    >
                      <div className={clsx("font-bold text-base mb-1", data.proficiency === level ? "text-primary" : "text-foreground")}>{level}</div>
                      <div className="text-xs text-muted-foreground">
                        {i === 0 ? 'Learning basics. Looking for foundational guidance.' :
                         i === 1 ? 'Practical experience. Ready to build production apps.' :
                         'Experienced. Seeking architectural and high-level mastery.'}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 5: Urgency */}
              {step === 5 && (
                <div className="max-w-md mx-auto grid gap-3 py-4">
                  {URGENCY.map(({ value, label, desc, icon }) => (
                    <button 
                       key={value} 
                       onClick={() => setData(p => ({ ...p, careerUrgency: value }))}
                       className={twMerge(
                         clsx(
                            "w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 shadow-sm",
                            data.careerUrgency === value 
                               ? "border-primary bg-primary/5 shadow-md" 
                               : "border-border bg-background hover:bg-muted"
                         )
                       )}
                    >
                      <div className={clsx(
                        "w-12 h-12 shrink-0 flex items-center justify-center text-xl rounded-lg bg-muted",
                        data.careerUrgency === value && "bg-primary/20"
                      )}>
                        {icon}
                      </div>
                      <div>
                        <div className={clsx("font-bold text-sm", data.careerUrgency === value ? "text-primary" : "text-foreground")}>{label}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Action Footer */}
          <div className="flex gap-3 mt-10 border-t border-border pt-6">
            {step > 1 && (
              <button 
                onClick={() => setStep(s => s - 1)} 
                className="flex-1 py-2.5 bg-background hover:bg-muted text-foreground font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-border shadow-sm text-sm"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            
            {step < STEPS.length ? (
              <button 
                onClick={() => setStep(s => s + 1)} 
                disabled={!canNext()} 
                className={clsx(
                  "flex-1 py-2.5 font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm",
                  canNext() 
                    ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90" 
                    : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                )}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                 onClick={handleComplete} 
                 disabled={loading} 
                 className={clsx(
                   "flex-1 py-2.5 font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-md",
                   loading 
                     ? "bg-muted text-muted-foreground cursor-wait border border-border" 
                     : "bg-primary text-primary-foreground hover:opacity-90"
                 )}
              >
                {loading ? 'Initializing...' : <><Zap size={16} /> Complete Setup</>}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
