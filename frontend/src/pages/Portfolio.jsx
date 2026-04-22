import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Github, ExternalLink, Globe, Mail, Linkedin, 
  MapPin, Award, Rocket, Code, Share2, Copy, User, ArrowLeft 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Portfolio() {
  const { user } = useAuth();
  const toast = useToast();

  const portfolio = user?.portfolioData;
  const content = portfolio?.content;
  const template = portfolio?.template || 'cyber';
  const accentHex = portfolio?.accentHex || '#6366f1'; // Default Indigo

  const sharePortfolio = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('🔗 Portfolio URL copied to clipboard!');
  };

  // If no portfolio built yet, show a beautiful "Build it" state
  if (!portfolio) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Rocket size={48} className="text-primary animate-bounce" />
        </div>
        <h2 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4">No Portfolio Detected</h2>
        <p className="text-muted-foreground max-w-md mb-8 font-medium">Your professional identity is waiting to be architected. Build your elite portfolio in seconds.</p>
        <Link to="/portfolio-builder" className="btn-primary px-10 py-4 text-xs font-black uppercase tracking-[0.2em]">Build My Legacy</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 no-scrollbar">
      {/* Actions / Floating Nav */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl">
         <Link to="/portfolio-builder" className="p-3 rounded-xl bg-muted/50 text-white hover:bg-primary transition-all">
           <ArrowLeft size={18} />
         </Link>
         <button onClick={sharePortfolio} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
           <Share2 size={16} /> Share Portfolio
         </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-card rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 relative min-h-[800px] flex flex-col`}
          style={{ 
            fontFamily: template === 'cyber' ? '"JetBrains Mono", monospace' : template === 'minimal' ? '"Inter", sans-serif' : '"Space Grotesk", sans-serif',
            borderColor: template === 'cyber' ? `${accentHex}40` : 'rgba(255,255,255,0.1)'
          }}
        >
          {/* --- HERO SECTION --- */}
          <div className={`p-12 relative overflow-hidden ${template === 'cyber' ? 'bg-black/40 border-b border-white/5' : 'bg-white'}`}>
             {template === 'cyber' && <div className="absolute top-6 right-6 text-[10px] font-mono text-primary animate-pulse">IDENTITY_VERIFIED</div>}
             <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
               <div className={`w-40 h-40 rounded-[2.5rem] flex items-center justify-center text-5xl font-black shrink-0 overflow-hidden ${template === 'minimal' ? 'bg-slate-100 text-slate-900 rounded-full' : 'text-white'}`} style={template !== 'minimal' ? { backgroundColor: accentHex, boxShadow: `0 20px 50px ${accentHex}60` } : {}}>
                 {content.hero.profileImage ? (
                   <img src={content.hero.profileImage} className="w-full h-full object-cover" alt="Profile" />
                 ) : (
                   content.hero.name[0]
                 )}
               </div>
               <div className="text-center md:text-left">
                 <h1 className={`text-6xl font-black tracking-tighter uppercase mb-2 ${template === 'minimal' ? 'text-black' : 'text-white'}`}>{content.hero.name}</h1>
                 <div className={`text-sm font-black uppercase tracking-[0.5em] mb-6 ${template === 'minimal' ? 'text-slate-400' : ''}`} style={template !== 'minimal' ? { color: accentHex } : {}}>{content.hero.role}</div>
                 <p className={`text-lg font-medium leading-relaxed max-w-xl ${template === 'minimal' ? 'text-slate-600' : 'text-white/70'}`}>"{content.hero.tagline}"</p>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] flex-1">
             <div className={`p-12 space-y-16 ${template === 'minimal' ? 'bg-white' : ''}`}>
                
                {/* About Section */}
                <section>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-6">Neural Overview</h4>
                   <p className={`text-lg leading-loose font-medium ${template === 'minimal' ? 'text-slate-700' : 'text-white/90'}`}>{content.about.bio}</p>
                   <div className="grid grid-cols-3 gap-6 mt-10">
                      <div className={`p-6 rounded-3xl border ${template === 'minimal' ? 'border-slate-100' : 'bg-muted/10 border-white/5'}`}>
                         <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Experience</div>
                         <div className={`text-sm font-black ${template === 'minimal' ? 'text-black' : 'text-white'}`}>{content.about.experience}</div>
                      </div>
                      <div className={`p-6 rounded-3xl border ${template === 'minimal' ? 'border-slate-100' : 'bg-muted/10 border-white/5'}`}>
                         <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Niche Vector</div>
                         <div className={`text-sm font-black ${template === 'minimal' ? 'text-black' : 'text-white'}`}>{content.about.niche}</div>
                      </div>
                      <div className={`p-6 rounded-3xl border ${template === 'minimal' ? 'border-slate-100' : 'bg-muted/10 border-white/5'}`}>
                         <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Location</div>
                         <div className={`text-sm font-black ${template === 'minimal' ? 'text-black' : 'text-white'}`}>Remote</div>
                      </div>
                   </div>
                </section>

                {/* Projects Section */}
                <section>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-8">Verified Exploits</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {content.projects.map((p, i) => (
                        <motion.div whileHover={{ y: -5 }} key={i} className={`p-8 rounded-[2.5rem] border transition-all ${template === 'minimal' ? 'border-slate-100 bg-slate-50/50 hover:shadow-2xl' : 'bg-muted/10 border-white/5 hover:bg-muted/20'}`}>
                           <h5 className="font-black text-lg uppercase tracking-tight mb-3" style={template === 'minimal' ? { color: '#000' } : { color: '#fff' }}>{p.name}</h5>
                           <p className="text-sm font-medium opacity-70 mb-6 line-clamp-3">{p.desc}</p>
                           <div className="flex justify-between items-center mt-auto pt-6 border-t border-white/5">
                              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: accentHex }}>{p.tech}</div>
                              <div className="flex gap-4">
                                 {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white transition-colors"><Github size={18} /></a>}
                                 {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white transition-colors"><ExternalLink size={18} /></a>}
                              </div>
                           </div>
                        </motion.div>
                      ))}
                   </div>
                </section>
             </div>

             {/* Sidebar Info */}
             <div className={`p-12 border-l border-white/5 space-y-12 ${template === 'minimal' ? 'bg-slate-50' : 'bg-black/20'}`}>
                
                {/* Skills Sidebar */}
                <section>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-8">Technical DNA</h4>
                   <div className="space-y-6">
                      {Object.entries(content.skills).map(([cat, skills]) => (
                        <div key={cat} className="space-y-3">
                           <div className="text-[9px] font-black text-primary uppercase tracking-widest" style={{ color: accentHex }}>{cat}</div>
                           <div className="flex flex-wrap gap-2">
                              {skills.map((s, si) => (
                                <span key={si} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border ${template === 'minimal' ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-white'}`}>{s}</span>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </section>

                {/* Experience Sidebar */}
                <section>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-8">Service Log</h4>
                   <div className="space-y-6">
                      {content.experience?.map((exp, i) => (
                        <div key={i} className="relative pl-6 border-l-2 border-white/5">
                           <div className="absolute top-0 left-[-6px] w-[10px] h-[10px] rounded-full" style={{ backgroundColor: accentHex }} />
                           <div className={`text-xs font-black uppercase ${template === 'minimal' ? 'text-black' : 'text-white'}`}>{exp.company}</div>
                           <div className="text-[10px] font-bold text-muted-foreground mt-1">{exp.role}</div>
                           <div className="text-[9px] font-black text-primary uppercase mt-1 opacity-60">{exp.duration}</div>
                        </div>
                      ))}
                   </div>
                </section>

                {/* Contact Sidebar */}
                <section className="pt-10 border-t border-white/5">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-6">Connect</h4>
                   <div className="space-y-4">
                      <a href={`mailto:${content.contact.email}`} className="flex items-center gap-3 text-sm font-bold text-muted-foreground hover:text-white transition-colors">
                        <Mail size={16} style={{ color: accentHex }} /> {content.contact.email}
                      </a>
                      <a href={`https://${content.contact.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-bold text-muted-foreground hover:text-white transition-colors">
                        <Linkedin size={16} style={{ color: accentHex }} /> LinkedIn
                      </a>
                      <a href={`https://${content.contact.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-bold text-muted-foreground hover:text-white transition-colors">
                        <Github size={16} style={{ color: accentHex }} /> GitHub
                      </a>
                   </div>
                </section>

             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
