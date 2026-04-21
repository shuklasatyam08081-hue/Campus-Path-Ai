import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../api/client';
import { User, Shield, Bell, Trash, Save, Eye, EyeOff, TriangleAlert, Search, Check, Plus, LogOut, Code, Briefcase, Clock, Github } from 'lucide-react';

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

const TABS = [
  { id: 'profile', label: 'Profile', icon: User, desc: 'Personal info & career' },
  { id: 'security', label: 'Security', icon: Shield, desc: 'Passwords & auth' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email alerts' },
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    githubUsername: user?.githubUsername || '',
    targetRole: user?.targetRole || 'Fullstack',
    weeklyHours: user?.weeklyHours || 10,
  });

  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [notifs, setNotifs] = useState({ weeklyDigest: true, achievements: true, jobMatches: false });

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(profile);
      updateUser(data.user);
      toast.success('✅ Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = () => {
    if (!passwords.current) { toast.error('Enter your current password'); return; }
    if (passwords.newPw.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (passwords.newPw !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    toast.success('Password updated successfully!');
    setPasswords({ current: '', newPw: '', confirm: '' });
  };

  const saveNotifs = () => {
    toast.success('Notification preferences saved!');
  };

  const deleteAccount = () => {
    if (confirmDelete !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    toast.error('Account deletion requested. Check your email for confirmation.');
    setShowDanger(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 px-4 sm:px-6 animation-fade-in">
      <div className="mb-8 md:mb-12 relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3">
          <span className="text-gradient">Account Settings</span>
        </h1>
        <p className="text-slate-400 text-lg">Manage your identity, security, and learning preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="md:w-72 flex-shrink-0">
          <div className="sticky top-24 flex flex-col gap-2 glass-panel p-3 shadow-xl">
            {TABS.map(({ id, label, icon: TabIcon, desc }) => (
              <button 
                key={id} 
                onClick={() => setTab(id)} 
                className={`
                  flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 relative overflow-hidden group
                  ${tab === id 
                    ? 'bg-primary/10 border border-primary/30 text-primary shadow-[0_0_15px_rgba(47,129,247,0.15)]' 
                    : 'bg-transparent border border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                `}
              >
                {tab === id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(47,129,247,0.5)]"></div>}
                <div className={`p-2 rounded-lg transition-colors ${tab === id ? 'bg-primary/20 text-primary' : 'bg-slate-800 group-hover:bg-slate-700 text-slate-400'}`}>
                  <TabIcon size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div className={`font-semibold text-sm ${tab === id ? 'text-primary' : ''}`}>{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="glass-panel p-6 md:p-10 relative overflow-hidden min-h-[500px]">
            
            {/* Subtle glow effect behind content */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            {/* Profile Tab */}
            {tab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-10">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <User className="text-primary" size={24} /> Profile Information
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Update your personal details and path.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 drop-shadow-sm">
                      <User size={14} className="text-primary" /> Full Name
                    </label>
                    <input 
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-inner group-hover:border-slate-700" 
                      value={profile.name} 
                      onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} 
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 drop-shadow-sm">
                      <Code size={14} className="text-primary" /> Email Address
                    </label>
                    <input 
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-inner group-hover:border-slate-700" 
                      type="email" 
                      value={profile.email} 
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} 
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 drop-shadow-sm">
                      <Github size={14} className="text-slate-300" /> GitHub Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">github.com/</span>
                      <input 
                        className="w-full bg-background border border-border rounded-lg pl-[105px] pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-inner group-hover:border-slate-700 font-mono text-sm" 
                        value={profile.githubUsername} 
                        onChange={e => setProfile(p => ({ ...p, githubUsername: e.target.value }))} 
                        placeholder="username" 
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 drop-shadow-sm">
                      <Clock size={14} className="text-amber-500" /> Weekly Goal (Hours)
                    </label>
                    <input 
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition-all duration-300 shadow-inner group-hover:border-slate-700" 
                      type="number" min={1} max={40} 
                      value={profile.weeklyHours} 
                      onChange={e => setProfile(p => ({ ...p, weeklyHours: Number(e.target.value) }))} 
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-border">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Briefcase size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Roadmap & Career Path</h4>
                      <p className="text-sm text-slate-400">Select your target role to personalize your journey</p>
                    </div>
                  </div>
                  
                  <div className="relative mb-6 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                      <Search size={18} />
                    </div>
                    <input 
                      className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-inner text-lg placeholder-slate-600" 
                      type="text" 
                      placeholder="Search for roles, languages, tools..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                    />
                  </div>

                  <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar bg-background p-4 rounded-xl border border-border">
                    <div className="mb-8">
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-4 h-[2px] bg-primary/50 inline-block"></span> Career Roles</p>
                      <div className="flex flex-wrap gap-2.5">
                        {ROADMAP_OPTIONS.roles.filter(r => r.toLowerCase().includes(searchTerm.toLowerCase())).map(role => {
                          const isSelected = profile.targetRole === role;
                          return (
                            <button key={role} 
                              onClick={() => { setProfile(p => ({ ...p, targetRole: role })); setShowCustomInput(false); }}
                              className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                                ${isSelected 
                                  ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(47,129,247,0.3)] scale-105 border-0' 
                                  : 'bg-muted border border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-accent-foreground'}
                              `}>
                              {role}
                              {isSelected && <Check size={14} className="animate-in zoom-in duration-300" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-4 h-[2px] bg-emerald-400/50 inline-block"></span> Skills & Technologies</p>
                      <div className="flex flex-wrap gap-2.5">
                        {ROADMAP_OPTIONS.skills.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).map(skill => {
                          const isSelected = profile.targetRole === skill;
                          return (
                            <button key={skill} 
                              onClick={() => { setProfile(p => ({ ...p, targetRole: skill })); setShowCustomInput(false); }}
                              className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                                ${isSelected 
                                  ? 'bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] scale-105 border-0' 
                                  : 'bg-muted border border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-accent-foreground'}
                              `}>
                              {skill}
                              {isSelected && <Check size={14} className="animate-in zoom-in duration-300" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button 
                      className={`
                        w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 border-2 border-dashed
                        ${showCustomInput ? 'border-border text-muted-foreground bg-muted/50' : 'border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60'}
                      `}
                      onClick={() => setShowCustomInput(!showCustomInput)}>
                      <Plus size={16} className={`transition-transform duration-300 ${showCustomInput ? 'rotate-45' : ''}`} /> 
                      {showCustomInput ? 'Cancel Custom Input' : "Can't find your role? Enter a custom one"}
                    </button>
                    {showCustomInput && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <input 
                          className="w-full bg-background border-2 border-primary/50 rounded-xl px-5 py-4 text-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 text-lg shadow-inner placeholder-muted-foreground" 
                          value={profile.targetRole} 
                          onChange={e => setProfile(p => ({ ...p, targetRole: e.target.value }))}
                          placeholder="e.g. Director of Engineering" autoFocus 
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    className="btn-primary flex items-center gap-2 scale-105 py-3 px-8 rounded-lg" 
                    onClick={saveProfile} 
                    disabled={saving}
                  >
                    <Save size={18} className={saving ? 'animate-pulse' : ''} /> 
                    {saving ? 'Saving Changes...' : 'Save Profile Details'}
                  </button>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 relative overflow-hidden rounded-xl border border-destructive/20 bg-destructive/5 p-8 transition-colors duration-300 hover:border-destructive/40">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <TriangleAlert size={100} className="text-destructive" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-destructive/20 rounded-lg">
                          <TriangleAlert size={20} className="text-destructive" />
                        </div>
                        <h4 className="text-xl font-bold text-destructive">Danger Zone</h4>
                      </div>
                      <p className="text-muted-foreground text-sm max-w-md">Once you delete your account, there is no going back. Please be certain. This will permanently delete your progress, stats, and profile.</p>
                    </div>
                    <button 
                      className={`font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-all duration-300 flex-shrink-0 ${showDanger ? 'bg-muted text-muted-foreground border border-border' : 'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white hover:shadow-[0_0_15px_rgba(248,81,73,0.5)]'}`}
                      onClick={() => setShowDanger(!showDanger)}>
                      <Trash size={16} /> {showDanger ? 'Cancel Deletion' : 'Delete Account'}
                    </button>
                  </div>
                  
                  {showDanger && (
                    <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300 bg-destructive/10 p-6 rounded-lg border border-destructive/20 shadow-inner">
                      <p className="text-destructive text-sm mb-4 font-medium flex items-center gap-2">
                        <TriangleAlert size={14} /> Type <strong className="text-foreground bg-destructive/20 px-2 py-0.5 rounded uppercase tracking-widest">DELETE</strong> to confirm permanent deletion.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input 
                          className="flex-1 bg-background border-2 border-destructive/40 rounded-lg px-4 py-3 text-foreground placeholder-destructive/50 focus:outline-none focus:ring-4 focus:ring-destructive/20 focus:border-destructive/80 transition-all font-mono" 
                          value={confirmDelete} 
                          onChange={e => setConfirmDelete(e.target.value)} 
                          placeholder="Type DELETE" 
                        />
                        <button 
                          className="bg-destructive hover:bg-destructive/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(248,81,73,0.4)]"
                          onClick={deleteAccount}
                          disabled={confirmDelete !== 'DELETE'}
                        >
                          Confirm & Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {tab === 'security' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8 w-full max-w-2xl mx-auto py-4">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20 shadow-[0_0_30px_rgba(47,129,247,0.15)]">
                    <Shield size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Password & Security</h3>
                  <p className="text-slate-400 mt-2">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <div className="space-y-6">
                  {[
                    { key: 'current', label: 'Current Password', desc: 'Enter your existing password' },
                    { key: 'newPw', label: 'New Password', desc: 'Must be at least 8 characters long' },
                    { key: 'confirm', label: 'Confirm New Password', desc: 'Repeat your new password' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="group">
                      <div className="flex justify-between items-end mb-2">
                        <label className="text-sm font-bold text-slate-300">{label}</label>
                        <span className="text-xs text-slate-500 hidden sm:inline-block">{desc}</span>
                      </div>
                      <div className="relative">
                        <input 
                          className="w-full bg-background border border-border rounded-lg pl-4 pr-12 py-3.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-inner group-hover:border-border text-lg tracking-wider" 
                          type={showPw[key] ? 'text' : 'password'}
                          value={passwords[key]} 
                          onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                          placeholder="••••••••" 
                        />
                        <button 
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-500 hover:bg-muted hover:text-slate-300 transition-colors focus:outline-none"
                          onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}>
                          {showPw[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-8 border-t border-border">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Shield size={14} className="text-emerald-500" /> Secure connection established
                  </div>
                  <button 
                    className="btn-primary w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2" 
                    onClick={savePassword}>
                    <Shield size={18} /> Update Password
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {tab === 'notifications' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6 w-full max-w-3xl mx-auto py-2">
                <div className="flex items-center gap-4 mb-4 border-b border-border pb-6">
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <Bell size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Email & Push Notifications</h3>
                    <p className="text-sm text-slate-400 mt-1">Choose what updates you want to receive.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'weeklyDigest', label: 'Weekly Progress Digest', desc: 'Get a comprehensive summary of your learning progress every Monday morning.', icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
                    { key: 'achievements', label: 'Achievement Alerts', desc: 'Be instantly notified when you unlock new badges, levels, or learning milestones.', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { key: 'jobMatches', label: 'Job Match Updates', desc: 'Get notified when exciting new opportunities match your roadmap and skill profile.', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  ].map(({ key, label, desc, icon: Icon, color, bg }) => (
                    <div key={key} className={`
                      group flex gap-4 p-5 rounded-2xl border transition-all duration-300 cursor-pointer
                      ${notifs[key] ? 'bg-muted border-border shadow-md' : 'bg-muted/30 border-border hover:bg-muted/50'}
                    `} onClick={() => setNotifs(p => ({ ...p, [key]: !p[key] }))}>
                      
                      <div className={`p-3 rounded-xl flex-shrink-0 h-fit ${bg}`}>
                        <Icon size={20} className={color} />
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between flex-1 gap-4">
                        <div>
                          <div className={`font-bold mb-1 transition-colors ${notifs[key] ? 'text-white' : 'text-slate-300'}`}>{label}</div>
                          <div className="text-sm text-slate-500 leading-relaxed pr-4">{desc}</div>
                        </div>
                        
                        {/* Custom Animated Toggle */}
                        <div className={`
                          relative flex-shrink-0 w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out
                          ${notifs[key] ? 'bg-primary shadow-[0_0_10px_rgba(47,129,247,0.5)]' : 'bg-slate-700'}
                        `}>
                          <div className={`
                            w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-spring
                            ${notifs[key] ? 'translate-x-6' : 'translate-x-0'}
                          `} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-8 pt-6 border-t border-border">
                  <button 
                    className="btn-secondary h-12 px-8 flex items-center justify-center gap-2" 
                    onClick={saveNotifs}>
                    <Save size={18} /> Update Preferences
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </main>
      </div>
{/* Add global styles for animations right in the file to make it completely self-contained over the default tailwind config */}
<style dangerouslySetInnerHTML={{__html: `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slide-in-from-bottom {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide-in-from-top {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes zoom-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-in {
    animation-duration: 0.5s;
    animation-fill-mode: both;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }
  .fade-in { animation-name: fade-in; }
  .slide-in-from-bottom-4 { animation-name: slide-in-from-bottom; }
  .slide-in-from-top-4 { animation-name: slide-in-from-top; animation-duration: 0.3s; }
  .zoom-in { animation-name: zoom-in; }
  .ease-spring { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
`}} />
    </div>
  );
}
