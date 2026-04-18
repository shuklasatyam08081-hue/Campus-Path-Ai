import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { Mail, MessageSquare, GitBranch, Send, MapPin, Clock, Twitter, ArrowRight } from 'lucide-react';
import GradientText from '../components/GradientText';
import { motion } from 'framer-motion';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const infoBlocks = [
    { icon: Mail, label: 'Email', value: 'hello@campuspath.ai', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { icon: MessageSquare, label: 'Discord', value: 'discord.gg/campuspath', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { icon: GitBranch, label: 'GitHub', value: 'github.com/campuspath-ai', color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' },
    { icon: Twitter, label: 'Twitter / X', value: '@CampusPathAI', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    { icon: MapPin, label: 'Location', value: 'San Francisco & Remote', color: 'text-emerald-600', bg: 'bg-emerald-600/10', border: 'border-emerald-600/20' },
    { icon: Clock, label: 'Response Time', value: 'Within 24 hours', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex flex-col">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-32 pb-24 md:pt-40 flex-1 flex flex-col justify-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-black font-sans text-foreground mb-4 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Have questions or feedback? We read every message and usually respond within 24 hours.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">
          
          {/* Contact Form Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 w-full max-w-2xl mx-auto glass-panel p-8 md:p-12 relative overflow-hidden"
          >
            {/* Subtle glow inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {sent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-primary/20 text-primary border border-primary/30 rounded-full flex flex-col items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                  <Send size={40} className="ml-2 mt-1" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">Message Sent!</h3>
                <p className="text-primary font-medium text-lg">We'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground tracking-widest uppercase ml-1 block">Your Name</label>
                    <input 
                      value={form.name} 
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                      placeholder="Alex Johnson" 
                      required 
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm text-foreground placeholder:text-muted-foreground/50 hover:bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground tracking-widest uppercase ml-1 block">Email Address</label>
                    <input 
                      type="email" 
                      value={form.email} 
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                      placeholder="you@example.com" 
                      required 
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm text-foreground placeholder:text-muted-foreground/50 hover:bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground tracking-widest uppercase ml-1 block">Subject</label>
                  <input 
                    value={form.subject} 
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} 
                    placeholder="How can we help?" 
                    required 
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm text-foreground placeholder:text-muted-foreground/50 hover:bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground tracking-widest uppercase ml-1 block">Message</label>
                  <textarea 
                    rows={5} 
                    value={form.message} 
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))} 
                    placeholder="Tell us what's on your mind..." 
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm text-foreground placeholder:text-muted-foreground/50 resize-none hover:bg-background" 
                    required 
                  />
                </div>
                <button type="submit" className="mt-2 w-full py-4 bg-foreground text-background font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-lg hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] group">
                  Send Message <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </motion.div>

          {/* Info Column */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[350px] flex flex-col gap-4"
          >
            {infoBlocks.map(({ icon: Icon, label, value, color, bg, border }, idx) => (
              <motion.div 
                whileHover={{ scale: 1.05, y: -4 }}
                key={label} 
                className={`glass-panel p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 hover:shadow-[0_15px_30px_rgba(16,185,129,0.15)] hover:bg-primary/5 transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${bg} ${border} ${color}`}>
                  <Icon size={20} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">{label}</div>
                  <div className="text-sm font-bold text-foreground truncate">{value}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
