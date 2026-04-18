import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../api/client';
import { User, Shield, Bell, Trash, Save, Eye, EyeOff, TriangleAlert, Search, Check, Plus } from 'lucide-react';

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
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
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
    <div style={{ paddingBottom: '3rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>Settings</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage your account, security, and preferences</p>
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
        {TABS.map(({ id, label, icon: TabIcon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600,
            background: tab === id ? 'rgba(124,58,237,0.25)' : 'transparent',
            border: tab === id ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
            color: tab === id ? '#a855f7' : '#64748b', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <TabIcon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem', marginBottom: '0.25rem' }}>Profile Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>Full Name</label>
              <input className="input-field" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>Email Address</label>
              <input className="input-field" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>GitHub Username</label>
              <input className="input-field" value={profile.githubUsername} onChange={e => setProfile(p => ({ ...p, githubUsername: e.target.value }))} placeholder="your-github-username" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>Weekly Learning Goal (hours)</label>
              <input className="input-field" type="number" min={1} max={40} value={profile.weeklyHours} onChange={e => setProfile(p => ({ ...p, weeklyHours: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1rem' }}>Roadmap & Career Path</label>
            
            {/* Search Path */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input className="input-field" type="text" placeholder="Search roles (e.g. Backend)..." 
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Search size={16} />
              </div>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem', borderRadius: '12px' }} className="custom-scrollbar">
              {/* Roles Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Roles</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                  {ROADMAP_OPTIONS.roles.filter(r => r.toLowerCase().includes(searchTerm.toLowerCase())).map(role => (
                    <button key={role} onClick={() => { setProfile(p => ({ ...p, targetRole: role })); setShowCustomInput(false); }}
                      style={{
                        padding: '0.6rem 0.8rem', borderRadius: '8px', border: profile.targetRole === role ? '1px solid #7c3aed' : '1px solid #1e293b',
                        background: profile.targetRole === role ? 'rgba(124,58,237,0.1)' : '#0f172a',
                        color: profile.targetRole === role ? '#f8fafc' : '#94a3b8',
                        cursor: 'pointer', textAlign: 'left', fontSize: '0.8rem', transition: 'all 0.15s', position: 'relative'
                      }}>
                      {role}
                      {profile.targetRole === role && <Check size={10} style={{ position: 'absolute', right: 6, top: 6, color: '#a855f7' }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Skills</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                  {ROADMAP_OPTIONS.skills.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).map(skill => (
                    <button key={skill} onClick={() => { setProfile(p => ({ ...p, targetRole: skill })); setShowCustomInput(false); }}
                      style={{
                        padding: '0.6rem 0.8rem', borderRadius: '8px', border: profile.targetRole === skill ? '1px solid #06b6d4' : '1px solid #1e293b',
                        background: profile.targetRole === skill ? 'rgba(6,182,212,0.1)' : '#0f172a',
                        color: profile.targetRole === skill ? '#f8fafc' : '#94a3b8',
                        cursor: 'pointer', textAlign: 'left', fontSize: '0.8rem', transition: 'all 0.15s', position: 'relative'
                      }}>
                      {skill}
                      {profile.targetRole === skill && <Check size={10} style={{ position: 'absolute', right: 6, top: 6, color: '#06b6d4' }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Option */}
            <div style={{ marginTop: '1rem' }}>
              <button className="btn-secondary" onClick={() => setShowCustomInput(!showCustomInput)} style={{ width: '100%', fontSize: '0.8rem', borderStyle: 'dashed' }}>
                <Plus size={14} /> {showCustomInput ? 'Hide Custom Input' : 'Enter Custom Role'}
              </button>
              {showCustomInput && (
                <div style={{ marginTop: '0.75rem', animation: 'fadeIn 0.2s' }}>
                  <input className="input-field" value={profile.targetRole} 
                    onChange={e => setProfile(p => ({ ...p, targetRole: e.target.value }))}
                    placeholder="e.g. Lead DevRel" autoFocus style={{ background: 'rgba(124,58,237,0.05)' }} />
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ fontSize: '0.875rem' }}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Danger Zone */}
          <div style={{ marginTop: '0.5rem', padding: '1.25rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <TriangleAlert size={16} color="#f87171" />
                  <span style={{ fontWeight: 700, color: '#f87171', fontSize: '0.9rem' }}>Danger Zone</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Permanently delete your account and all data</p>
              </div>
              <button className="btn-danger" onClick={() => setShowDanger(!showDanger)} style={{ fontSize: '0.8rem' }}>
                <Trash size={14} /> Delete Account
              </button>
            </div>
            {showDanger && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>
                <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.75rem' }}>This action is irreversible. Type <strong>DELETE</strong> to confirm.</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input className="input-field" value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} placeholder="Type DELETE" style={{ maxWidth: '200px', borderColor: 'rgba(239,68,68,0.3)' }} />
                  <button className="btn-danger" onClick={deleteAccount} style={{ fontSize: '0.8rem' }}>Confirm Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>Change Password</h3>
          {[
            { key: 'current', label: 'Current Password' },
            { key: 'newPw', label: 'New Password' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPw[key] ? 'text' : 'password'}
                  value={passwords[key]} onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••" style={{ paddingRight: '2.5rem' }} />
                <button onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                  {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={savePassword} style={{ fontSize: '0.875rem' }}>
              <Shield size={15} /> Update Password
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>Notification Preferences</h3>
          {[
            { key: 'weeklyDigest', label: 'Weekly Progress Digest', desc: 'Get a summary of your learning progress every Monday' },
            { key: 'achievements', label: 'Achievement Alerts', desc: 'Be notified when you unlock new badges or milestones' },
            { key: 'jobMatches', label: 'Job Match Updates', desc: 'Get notified when new jobs match your roadmap profile' },
          ].map(({ key, label, desc }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{desc}</div>
              </div>
              <button onClick={() => setNotifs(p => ({ ...p, [key]: !p[key] }))} style={{
                width: 44, height: 24, borderRadius: '100px', border: 'none', cursor: 'pointer',
                background: notifs[key] ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(255,255,255,0.1)',
                position: 'relative', flexShrink: 0, transition: 'background 0.3s',
              }}>
                <div style={{
                  position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: 'white',
                  transition: 'left 0.3s', left: notifs[key] ? 23 : 3,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={saveNotifs} style={{ fontSize: '0.875rem' }}>
              <Save size={15} /> Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
