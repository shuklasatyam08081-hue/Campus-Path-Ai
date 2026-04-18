import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { io } from 'socket.io-client';
import { 
  Users, MessageSquare, ShieldCheck, Timer, Zap, 
  Send, X, Brain, User, MoreVertical, Coffee, Focus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:5000');

const ROOM_META = [
  { id: 'fullstack-elite', name: 'Fullstack Elite', description: 'Deep focus on MERN & System Design' },
  { id: 'frontend-dna', name: 'Frontend DNA', description: 'Vite, React 19, and Framer Motion experts' },
  { id: 'backend-architects', name: 'Backend Architects', description: 'Microservices and Distributed Systems' },
  { id: 'leetcode-grind', name: 'LeetCode Grind', description: 'Daily DSA challenges and optimizations' },
];

export default function FocusRooms() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [timer, setTimer] = useState(25 * 60); // 25 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [roomCounts, setRoomCounts] = useState({});
  const scrollRef = useRef();

  // Fetch live room counts on load
  useEffect(() => {
    socket.emit('get-room-counts');
    socket.on('room-counts', (counts) => setRoomCounts(counts));
    return () => socket.off('room-counts');
  }, []);

  const mockRooms = ROOM_META.map(r => ({ ...r, members: roomCounts[r.id] || 0 }));

  useEffect(() => {
    if (!activeRoom) return;

    socket.emit('join-room', { roomId: activeRoom.id, user: { name: user.name, role: user.targetRole } });

    socket.on('user-joined', (data) => {
      setMessages(prev => [...prev, { system: true, content: `${data.name} joined the focus session.` }]);
      setAttendees(prev => {
        const exists = prev.find(p => p.socketId === data.socketId);
        if (exists) return prev;
        return [...prev, data];
      });
    });

    socket.on('new-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('user-left', (data) => {
      setMessages(prev => [...prev, { system: true, content: `${data.name} left the room.` }]);
    });

    return () => {
      socket.off('user-joined');
      socket.off('new-message');
      socket.off('user-left');
    };
  }, [activeRoom, user.name, user.targetRole]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      toast.success('Focus session complete! Take a break.');
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, toast]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    socket.emit('send-message', { roomId: activeRoom.id, message: input, user: { name: user.name } });
    setInput('');
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!activeRoom) {
    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Collaborative Focus Rooms</h1>
          <p className="text-sm text-muted-foreground">Virtual environments for real-time peer learning and parallel focus sessions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockRooms.map(room => (
            <motion.div 
              key={room.id}
              whileHover={{ y: -5 }}
              className="bg-card border border-border p-4 rounded-2xl shadow-sm hover:border-primary transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                   <Users className="text-primary" size={20} />
                </div>
                <h3 className="font-bold text-foreground mb-1">{room.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">{room.description}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Zap size={10} className="text-primary"/> {room.members} Active</span>
                <button 
                  onClick={() => setActiveRoom(room)}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all"
                >
                  Join Room
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
           <Coffee size={32} className="text-muted-foreground/30 mb-4" />
           <h4 className="font-bold text-foreground mb-1">Create Private Room</h4>
           <p className="text-xs text-muted-foreground mb-6 max-w-xs">Host a password-protected environment for your immediate team or study group.</p>
           <button className="px-6 py-2 bg-muted border border-border text-foreground text-xs font-bold rounded-xl hover:bg-card transition-all">Enable Custom Instance</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 animate-in zoom-in-95 duration-500">
      {/* Left: Chat & Attendees */}
      <div className="flex-1 bg-card border border-border rounded-3xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-black">CP</div>
             <div>
               <h3 className="text-sm font-bold text-foreground">{activeRoom.name}</h3>
               <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5 animation-pulse">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Sync Active
               </p>
             </div>
          </div>
          <button onClick={() => setActiveRoom(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.map((m, i) => (
            m.system ? (
              <div key={i} className="flex justify-center">
                 <span className="text-[10px] bg-muted px-3 py-1 rounded-full font-bold text-muted-foreground uppercase tracking-wider">{m.content}</span>
              </div>
            ) : (
              <div key={i} className={`flex ${m.user.name === user.name ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] space-y-1`}>
                   <p className="text-[10px] font-black text-muted-foreground px-1">{m.user.name}</p>
                   <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                     m.user.name === user.name 
                     ? 'bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10' 
                     : 'bg-muted border border-border text-foreground rounded-tl-none'
                   }`}>
                     {m.message}
                   </div>
                </div>
              </div>
            )
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 border-t border-border bg-muted/10">
          <div className="flex gap-3">
            <input 
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Communicate with other focusers..." 
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 ring-primary/30"
            />
            <button onClick={handleSendMessage} className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 active:scale-95 transition-all">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Timer & Status */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-card border border-border p-5 rounded-3xl shadow-sm text-center">
           <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Timer className="text-orange-500" size={24} />
           </div>
           <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Focus Session</h3>
           <div className="text-5xl font-black text-foreground tabular-nums mb-6">{formatTime(timer)}</div>
           
           <button 
             onClick={() => setIsTimerRunning(!isTimerRunning)}
             className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
               isTimerRunning 
               ? 'bg-muted border border-border text-foreground' 
               : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
             }`}
           >
             {isTimerRunning ? 'Pause Session' : 'Start Focus'}
           </button>
           <button 
             onClick={() => { setTimer(25 * 60); setIsTimerRunning(false); }}
             className="w-full py-2 mt-2 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all"
           >
             Reset Timer
           </button>
        </div>

        <div className="bg-card border border-border p-4 rounded-3xl shadow-sm">
           <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
             <Users size={14} /> Room DNA ({attendees.length})
           </h4>
           <div className="space-y-4">
              {attendees.map((a, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border border-border">
                        <User size={14} className="text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-foreground">{a.name}</p>
                        <p className="text-[9px] text-muted-foreground font-medium">{a.role || 'Contributor'}</p>
                      </div>
                   </div>
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                </div>
              ))}
              {attendees.length === 0 && (
                <p className="text-[10px] text-muted-foreground italic text-center py-4">You are currently focusing solo.</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
