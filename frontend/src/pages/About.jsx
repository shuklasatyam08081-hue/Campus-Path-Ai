import Navbar from '../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';
import { Target, Zap, ArrowRight, Code2, Users, Rocket } from 'lucide-react';
import GradientText from '../components/GradientText';
import { motion } from 'framer-motion';

const TECH = [
  { name: 'React 18', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', category: 'Frontend' },
  { name: 'Vite', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', category: 'Frontend' },
  { name: 'Tailwind CSS v4', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20', category: 'Frontend' },
  { name: 'Framer Motion', color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20', category: 'Frontend' },
  { name: 'Recharts', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', category: 'Frontend' },
  { name: 'Node.js', color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', category: 'Backend' },
  { name: 'Express.js', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', category: 'Backend' },
  { name: 'MongoDB', color: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-blue-600/20', category: 'Backend' },
  { name: 'Gemini AI', color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20', category: 'AI' },
  { name: 'GitHub API', color: 'text-indigo-600', bg: 'bg-indigo-600/10', border: 'border-indigo-600/20', category: 'Integration' },
  { name: 'JWT Auth', color: 'text-blue-700', bg: 'bg-blue-700/10', border: 'border-blue-700/20', category: 'Security' },
];

const TEAM = [
  { name: 'Shubham Kumar Yadav', role: 'Full Stack & Ideation', bio: 'BTech Student. Designed the conceptual framework and served as the primary Full Stack engineer bringing CampusPath to life.', avatar: 'SK', gradient: 'from-primary to-blue-600', shadow: 'shadow-primary/20' },
  { name: 'Satyam Shukla', role: 'Frontend & Research', bio: 'BTech Student. Spearheaded the frontend architecture and conducted core research to refine the platform user experience.', avatar: 'SS', gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
  { name: 'Saijal Chauhan', role: 'Designing / UI & UX', bio: 'BTech Student. Masterminded the visual identity, creating the beautiful glassmorphic designs and seamless user workflows.', avatar: 'SC', gradient: 'from-primary/80 to-blue-500', shadow: 'shadow-primary/20' },
  { name: 'Madhur Sharma', role: 'Backend Engineering', bio: 'BTech Student. Engineered the robust server architecture, database schemas, and API integrations that power the platform.', avatar: 'MS', gradient: 'from-indigo-400 to-primary', shadow: 'shadow-indigo-500/20' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex flex-col">
      <Navbar />
      
      {/* Dynamic Background Setup */}
      <div className="absolute top-0 left-0 right-0 h-[500px] w-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] max-w-4xl h-[400px] bg-primary/20 rounded-full blur-[120px] opacity-70" />
      </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-32 pb-24 md:pt-40">
        
        {/* Hero Section */}
        <section className="text-center mb-20 md:mb-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-sans text-5xl md:text-7xl font-black text-foreground mb-6 leading-[1.1] tracking-tight"
          >
            Built by Engineers,<br />
              For Engineers
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium"
          >
            CampusPath AI was born from a simple frustration: the gap between knowing how to code
            and knowing which skills actually get you hired is enormous — and nobody was solving it intelligently.
          </motion.p>
        </section>

        {/* Mission Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="glass-panel p-5 md:p-16 mb-24 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-5 md:gap-12 items-center md:items-start text-center md:text-left">
            <div className="w-20 h-20 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <Target size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-black font-sans text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                To eliminate skill gap ambiguity for every developer on earth. We treat career development
                as an engineering problem — with measurable inputs, adaptive algorithms, and verifiable outputs.
                No more generic playlists. Just precision-targeted growth, guided by AI.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <div className="mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black font-sans text-foreground mb-2 flex items-center justify-center gap-3">
              <Code2 className="text-primary" size={32} /> Open Tech Stack
            </h2>
            <p className="text-muted-foreground text-lg font-medium mb-12">Built with best-in-class open source technologies</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.05 }}
            className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
          >
            {TECH.map(({ name, color, bg, border, category }, idx) => (
              <motion.div 
                whileHover={{ y: -4, scale: 1.05 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                key={name} 
                className={`px-4 py-2 rounded-full border ${bg} ${border} ${color} flex items-center gap-2 backdrop-blur-sm shadow-sm cursor-default hover:shadow-lg transition-all duration-300`}
              >
                <div className={`w-2 h-2 rounded-full ${color.replace('text', 'bg')}`} />
                <span className="font-bold text-sm">{name}</span>
                <span className="text-[10px] uppercase font-black tracking-widest opacity-60 ml-2">· {category}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Team Section */}
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-black font-sans text-foreground flex items-center justify-center gap-3">
              <Users className="text-primary" size={32} /> The Team
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM.map(({ name, role, bio, avatar, gradient, shadow }, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -12, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
                key={name} 
                className="glass-panel p-5 flex flex-col items-center text-center group cursor-pointer hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(9,105,218,0.2)] hover:bg-primary/5 transition-all duration-300"
              >
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradient} shadow-xl ${shadow} flex items-center justify-center text-white font-black text-3xl mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  {avatar}
                </div>
                <h3 className="font-bold text-xl text-foreground mb-1">{name}</h3>
                <div className={`text-sm font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r ${gradient} mb-4`}>
                  {role}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  {bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Refined CTA Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="glass-panel p-12 md:p-16 inline-flex flex-col items-center relative overflow-hidden group border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none group-hover:from-primary/20 transition-colors" />
            
            <div className="w-16 h-16 bg-background border border-border rounded-2xl flex items-center justify-center mb-6 shadow-md relative z-10 text-primary">
              <Rocket size={32} />
            </div>

            <h2 className="text-3xl font-black text-foreground mb-8 relative z-10">Want to join the mission?</h2>
            
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-foreground text-background font-black rounded-xl pulse-glow flex items-center justify-center gap-3 hover:bg-primary transition-all hover:scale-[1.02] active:scale-[0.98] group relative z-10"
            >
              <Zap size={20} className="text-background" /> 
              Start Your Journey 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
