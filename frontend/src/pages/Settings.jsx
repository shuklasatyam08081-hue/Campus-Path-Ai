import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../api/client';
import { 
  User, Shield, Bell, Trash, Save, Eye, EyeOff, 
  AlertTriangle, Search, Check, Plus, LogOut, 
  Code, Briefcase, Clock, Github, ChevronRight,
  Target, Mail, Key, Zap, Activity, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    githubUsername: '',
    targetRole: 'Fullstack',
    weeklyHours: 10,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        githubUsername: user.githubUsername || '',
        targetRole: user.targetRole || 'Fullstack',
        weeklyHours: user.weeklyHours || 10,
      });
    }
  }, [user]);

  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [notifs, setNotifs] = useState({ weeklyDigest: true, achievements: true, jobMatches: false });

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(profile);
      updateUser(data.user);
      toast.success('System parameters synchronized.');
    } catch {
      toast.error('Failed to sync profile.');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = () => {
    if (!passwords.current) return toast.error('Access key required.');
    toast.success('Security layers updated.');
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Activity size={24} className="animate-spin text-primary opacity-50" />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-10">
      {/* Header Dashboard Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Account & Preferences</h1>
          <p className="text-sm text-muted-foreground font-medium">Configure your technical identity and system environment.</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-card border border-border px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <Shield size={14} className="text-primary" />
              <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Secure Sync</span>
           </div>
        </div>
      </div>

      {/* Stats Summary Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Identity Status</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-foreground">Active</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Check size={16} />
              </div>
            </div>
         </div>
         <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Current Path</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-foreground truncate max-w-[100px]">{profile.targetRole.split(' ')[0]}</p>
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Target size={16} />
              </div>
            </div>
         </div>
         <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Weekly Commitment</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-foreground">{profile.weeklyHours}h/w</p>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Clock size={16} />
              </div>
            </div>
         </div>
         <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Technical XP</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-foreground">{user?.xp || 0}</p>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Award size={16} />
              </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Configuration Grid Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
               <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                 <User size={16} className="text-primary" /> Profile Parameters
               </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Legal Name</label>
                  <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-all"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Connection</label>
                  <input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-all"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">GitHub Sync Handle</label>
                  <div className="relative">
                    <Github size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={profile.githubUsername} onChange={e => setProfile({...profile, githubUsername: e.target.value})} className="w-full bg-muted/30 border border-border rounded-lg pl-11 pr-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-all"/>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Weekly Commitment (Hours)</label>
                  <div className="relative">
                    <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="number" value={profile.weeklyHours} onChange={e => setProfile({...profile, weeklyHours: Number(e.target.value)})} className="w-full bg-muted/30 border border-border rounded-lg pl-11 pr-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-all"/>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                 <div className="flex items-center gap-2 mb-4">
                    <Target size={16} className="text-primary" />
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Specialization Catalog</label>
                 </div>
                 
                 <div className="max-h-[350px] overflow-y-auto pr-2 no-scrollbar space-y-6">
                    <div>
                       <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                         <span className="w-3 h-[1px] bg-primary/30"></span> Career Roles
                       </p>
                       <div className="flex flex-wrap gap-2">
                          {ROADMAP_OPTIONS.roles.map(role => (
                            <button key={role} onClick={() => setProfile({...profile, targetRole: role})} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${profile.targetRole === role ? 'bg-primary border-primary text-white shadow-md' : 'bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground'}`}>
                               {role}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <span className="w-3 h-[1px] bg-emerald-500/30"></span> Skills & Technologies
                       </p>
                       <div className="flex flex-wrap gap-2">
                          {ROADMAP_OPTIONS.skills.map(skill => (
                            <button key={skill} onClick={() => setProfile({...profile, targetRole: skill})} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${profile.targetRole === skill ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground'}`}>
                               {skill}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border mt-6">
                <button onClick={saveProfile} disabled={saving} className="btn-primary py-2 px-8 flex items-center gap-2">
                  <Save size={16} /> {saving ? 'Syncing...' : 'Update Profile'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden border-rose-500/20">
             <div className="p-4 border-b border-border bg-rose-500/5">
                <h3 className="text-sm font-bold text-rose-500 flex items-center gap-2">
                  <AlertTriangle size={16} /> Critical Zone
                </h3>
             </div>
             <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="max-w-md">
                   <p className="text-sm font-semibold text-foreground mb-1">Permanent Deletion</p>
                   <p className="text-xs text-muted-foreground leading-relaxed">Once you delete your account, all your technical progress and roadmaps will be purged.</p>
                </div>
                <button onClick={() => setShowDanger(!showDanger)} className="btn-secondary border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white px-8 py-2">
                   Purge Identity
                </button>
             </div>
          </div>
        </div>

        {/* Security & Alerts Sidebar Area */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
               <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                 <Shield size={16} className="text-primary" /> Security Keys
               </h3>
            </div>
            <div className="p-5 space-y-5">
               {['current', 'newPw', 'confirm'].map((key) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">{key.replace('Pw', '')} Key</label>
                    <div className="relative">
                      <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showPw[key] ? 'text' : 'password'} value={passwords[key]} onChange={e => setPasswords({...passwords, [key]: e.target.value})} placeholder="••••••••" className="w-full bg-muted/30 border border-border rounded-lg pl-11 pr-12 py-2.5 text-sm font-bold tracking-widest focus:outline-none focus:border-primary"/>
                      <button onClick={() => setShowPw({...showPw, [key]: !showPw[key]})} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground">
                        {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={savePassword} className="w-full btn-primary py-2.5 font-bold mt-2">
                   Update Access
                </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
               <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                 <Bell size={16} className="text-amber-500" /> Notifications
               </h3>
            </div>
            <div className="p-2 space-y-1">
              {[
                { key: 'weeklyDigest', label: 'Velocity Summary', icon: Zap },
                { key: 'achievements', label: 'Milestone Alerts', icon: Award },
                { key: 'jobMatches', label: 'Carrier Matches', icon: Target }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} onClick={() => setNotifs({...notifs, [key]: !notifs[key]})} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${notifs[key] ? 'bg-primary/5 border border-primary/20 shadow-sm' : 'hover:bg-muted/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${notifs[key] ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-xs font-bold text-foreground">{label}</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${notifs[key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                     <div className={`w-3 h-3 bg-white rounded-full transition-transform ${notifs[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Confirmation Modal */}
      <AnimatePresence>
        {showDanger && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDanger(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-2xl z-10 mx-auto my-auto text-center">
                <div className="w-16 h-16 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-sm">
                   <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Final Confirmation</h2>
                <p className="text-xs text-muted-foreground mb-8">This action is irreversible. Type <span className="font-black text-rose-500">DELETE</span> to confirm purge.</p>
                <input 
                  value={confirmDelete} 
                  onChange={e => setConfirmDelete(e.target.value)} 
                  placeholder="Type DELETE" 
                  className="w-full bg-muted/30 border border-border rounded-lg px-4 py-3 text-center text-sm font-black tracking-widest focus:outline-none focus:border-rose-500 transition-all mb-6"
                />
                <div className="flex gap-3">
                   <button onClick={() => setShowDanger(false)} className="flex-1 btn-secondary py-2.5 font-bold">Cancel</button>
                   <button disabled={confirmDelete !== 'DELETE'} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-lg font-bold disabled:opacity-30 shadow-lg shadow-rose-500/20">Purge Data</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
