import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { io } from 'socket.io-client';
import { 
  Users, MessageSquare, ShieldCheck, Timer, Zap, 
  Send, X, Brain, User, MoreVertical, Coffee, Focus,
  Volume2, Music, Play, Pause, RotateCcw, Target, Sparkles,
  Terminal, Globe, Activity, Plus, Cloud, Settings, Trash2,
  ChevronRight, ArrowLeft, Lock, Unlock, Shield, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { roomAPI } from '../api/client';

const socket = io('http://localhost:5000', { autoConnect: true });

const AMBIENCE_SOUNDS = [
  { id: 'lofi', name: 'Lofi Beats', icon: Music, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'space', name: 'Deep Space', icon: Globe, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'rain', name: 'Neon Rain', icon: Cloud, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function FocusRooms() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [activeRoom, setActiveRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [roomData, setRoomData] = useState({ name: '', description: '', category: 'Fullstack', color: '#2f81f7', isPrivate: false, password: '' });
  
  const [showPassPrompt, setShowPassPrompt] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [targetRoom, setTargetRoom] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [roomCounts, setRoomCounts] = useState({});
  
  const [timer, setTimer] = useState(25 * 60); 
  const [initialTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeAmbience, setActiveAmbience] = useState(null);

  const audioRef = useRef(null);
  const scrollRef = useRef();

  useEffect(() => {
    fetchRooms();
    socket.on('room-counts', (counts) => setRoomCounts(counts));
    socket.emit('get-room-counts');
    return () => {
      socket.off('room-counts');
    };
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await roomAPI.getAll();
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      toast.error('Sync failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!roomData.name || !roomData.description) return toast.error('Fill identity parameters.');
    if (roomData.isPrivate && !roomData.password) return toast.error('Access key required.');
    
    try {
      if (isEditing) {
        const res = await roomAPI.update(editingId, roomData);
        if (res.data.success) {
          setRooms(rooms.map(r => r._id === editingId ? res.data.room : r));
          toast.success('DNA updated.');
        }
      } else {
        const res = await roomAPI.create(roomData);
        if (res.data.success) {
          setRooms([res.data.room, ...rooms]);
          toast.success('Chamber initialized.');
        }
      }
      closeModal();
    } catch (err) {
      toast.error('Sync error.');
    }
  };

  const handleJoinAttempt = (room) => {
    if (room.isPrivate && room.createdBy !== user?._id) {
      setTargetRoom(room);
      setShowPassPrompt(true);
    } else {
      setActiveRoom(room);
    }
  };

  const verifyAndJoin = async () => {
    try {
      const res = await roomAPI.verifyPassword(targetRoom._id, passInput);
      if (res.data.success) {
        setActiveRoom(targetRoom);
        setShowPassPrompt(false);
        setPassInput('');
        toast.success('Access granted.');
      }
    } catch (err) {
      toast.error('Invalid key.');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chamber?')) return;
    try {
      const res = await roomAPI.delete(id);
      if (res.data.success) {
        setRooms(rooms.filter(r => r._id !== id));
        toast.success('Deleted.');
      }
    } catch (err) {
      toast.error('Delete error.');
    }
  };

  const openEdit = (room, e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingId(room._id);
    setRoomData({ 
      name: room.name, 
      description: room.description, 
      category: room.category, 
      color: room.color, 
      isPrivate: room.isPrivate, 
      password: room.password || '' 
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setRoomData({ name: '', description: '', category: 'Fullstack', color: '#2f81f7', isPrivate: false, password: '' });
  };

  useEffect(() => {
    if (!activeRoom || !user) return;
    const roomId = activeRoom._id || activeRoom.id;
    socket.emit('join-room', { roomId, user: { name: user.name, role: user.targetRole } });
    
    socket.on('user-joined', (data) => {
      setMessages(prev => [...prev, { system: true, content: `${data.name} online.` }]);
      setAttendees(data.roomUsers || []);
    });
    socket.on('new-message', (data) => setMessages(prev => [...prev, data]));
    socket.on('user-left', (data) => {
      setMessages(prev => [...prev, { system: true, content: `${data.name} offline.` }]);
      setAttendees(data.roomUsers || []);
    });
    socket.on('room-users', (users) => setAttendees(users));
    
    return () => {
      socket.emit('leave-room', { roomId, user: { name: user.name } });
      socket.off('user-joined');
      socket.off('new-message');
      socket.off('user-left');
      socket.off('room-users');
    };
  }, [activeRoom, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      toast.success('Focus session complete!');
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, toast]);

  const handleSendMessage = () => {
    if (!input.trim() || !activeRoom) return;
    socket.emit('send-message', { roomId: activeRoom._id || activeRoom.id, message: input, user: { name: user.name } });
    setInput('');
  };

  const toggleAmbience = (sound) => {
    if (activeAmbience?.id === sound.id) {
      audioRef.current.pause();
      setActiveAmbience(null);
    } else {
      setActiveAmbience(sound);
      if (audioRef.current) {
        audioRef.current.src = sound.url;
        audioRef.current.play();
      }
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const progress = ((initialTime - timer) / initialTime) * 100;

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full animate-in fade-in duration-500 overflow-hidden">
      <audio ref={audioRef} loop />

      {/* SELECTION VIEW */}
      {!activeRoom ? (
        <div className="flex-1 flex flex-col min-h-0 space-y-5 p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Focus Chambers</h1>
              <p className="text-sm text-muted-foreground font-medium">Synchronized deep-work zones for technical excellence.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> New Chamber
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <RefreshCw size={24} className="animate-spin mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Scanning collective...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                {rooms.map(room => (
                  <div 
                    key={room._id}
                    onClick={() => handleJoinAttempt(room)}
                    className="group bg-card border border-border p-4 rounded-xl shadow-sm hover:border-primary/50 transition-all cursor-pointer relative flex flex-col h-[180px]"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-xl opacity-80" style={{ backgroundColor: room.color }} />
                    <div className="flex-1 ml-2">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-sm text-foreground truncate">{room.name}</h3>
                        {room.isPrivate && <Lock size={12} className="text-muted-foreground/50" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed font-medium">{room.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border mt-3 ml-2">
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{roomCounts[room._id] || 0} online</span>
                      </div>
                      {room.createdBy === user._id && (
                        <div className="flex gap-1">
                          <button onClick={(e) => openEdit(room, e)} className="p-1 hover:text-primary transition-colors"><Settings size={14} /></button>
                          <button onClick={(e) => handleDelete(room._id, e)} className="p-1 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CHAMBER VIEW Dashboard Style */
        <div className="flex-1 flex flex-col min-h-0 space-y-4 p-4 animate-in zoom-in duration-300">
          <div className="flex justify-between items-center shrink-0 px-1">
            <button onClick={() => setActiveRoom(null)} className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors">
              <ArrowLeft size={14} /> Back to Lobby
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Sync Established</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-0">
              <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: activeRoom.color }}>
                    {activeRoom.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{activeRoom.name}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Deep Work Protocol</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   {AMBIENCE_SOUNDS.map(sound => (
                     <button key={sound.id} onClick={() => toggleAmbience(sound)} className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${activeAmbience?.id === sound.id ? 'bg-primary/10 border-primary/40 text-primary shadow-sm' : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'}`}>
                        <sound.icon size={14} />
                     </button>
                   ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar min-h-0 bg-muted/5">
                {messages.map((m, i) => (
                  m.system ? (
                    <div key={i} className="flex justify-center"><span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">[{m.content}]</span></div>
                  ) : (
                    <div key={i} className={`flex flex-col ${m.user.name === user.name ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3 rounded-xl text-[13px] font-medium max-w-[80%] shadow-sm ${m.user.name === user.name ? 'bg-primary text-primary-foreground border border-primary' : 'bg-card border border-border text-foreground'}`}>
                        <span className="block text-[9px] font-bold mb-1 opacity-70 uppercase tracking-widest">{m.user.name}</span>
                        {m.message}
                      </div>
                    </div>
                  )
                ))}
                <div ref={scrollRef} />
              </div>
              <div className="p-4 bg-muted/20 border-t border-border shrink-0">
                <div className="flex gap-2">
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message to collective..." className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-primary shadow-sm"/>
                  <button onClick={handleSendMessage} className="btn-primary py-2 px-5"><Send size={16} /></button>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-72 flex flex-col gap-4 overflow-hidden shrink-0">
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm text-center shrink-0">
                <div className="relative w-32 h-32 mx-auto mb-6">
                   <svg className="w-full h-full -rotate-90">
                     <circle cx="64" cy="64" r="58" className="stroke-muted fill-none" strokeWidth="6" />
                     <motion.circle cx="64" cy="64" r="58" className="stroke-primary fill-none" strokeWidth="6" strokeDasharray="364" initial={{ strokeDashoffset: 364 }} animate={{ strokeDashoffset: 364 - (364 * (progress / 100)) }} strokeLinecap="round" style={{ stroke: activeRoom.color }} />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Focus</span>
                      <span className="text-2xl font-bold text-foreground tabular-nums tracking-tight">{formatTime(timer)}</span>
                   </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`flex-1 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${isTimerRunning ? 'bg-muted text-foreground' : 'btn-primary shadow-md shadow-primary/10'}`} style={!isTimerRunning ? { backgroundColor: activeRoom.color } : {}}>
                    {isTimerRunning ? 'Pause' : 'Start Focus'}
                  </button>
                  <button onClick={() => { setTimer(25 * 60); setIsTimerRunning(false); }} className="p-2 bg-muted border border-border rounded-lg hover:bg-border transition-colors"><RotateCcw size={16} /></button>
                </div>
              </div>

              <div className="flex-1 bg-card border border-border p-4 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={12} className="text-primary" /> Active Syncs ({attendees.length})</h4>
                <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-1">
                   {attendees.map((a, i) => (
                     <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border transition-all hover:bg-muted/50">
                        <div className="flex items-center gap-2 overflow-hidden">
                           <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[10px] shadow-sm" style={{ backgroundColor: activeRoom.color }}>{a.name[0]}</div>
                           <p className="text-xs font-bold text-foreground truncate">{a.name}</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS Dashboard Style */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-xl z-10 mx-auto my-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-foreground">{isEditing ? 'Update' : 'New'} Chamber</h2>
                  <button onClick={closeModal} className="text-muted-foreground hover:text-foreground p-1 transition-colors"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Identity</label>
                      <input type="text" value={roomData.name} onChange={e => setRoomData({...roomData, name: e.target.value})} placeholder="e.g. MERN Collective" className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary shadow-sm"/>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Mission</label>
                      <textarea rows={2} value={roomData.description} onChange={e => setRoomData({...roomData, description: e.target.value})} placeholder="Focus goals for this session..." className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary resize-none shadow-sm"/>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Sector</label>
                         <select value={roomData.category} onChange={e => setRoomData({...roomData, category: e.target.value})} className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm font-bold">
                            {['Fullstack', 'Frontend', 'Backend', 'DSA', 'DevOps', 'AI', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Color DNA</label>
                         <div className="flex gap-2 p-2 bg-muted/50 rounded-lg border border-border justify-around items-center h-[46px] shadow-sm">
                            {['#2f81f7', '#238636', '#f59e0b', '#f85149', '#8b5cf6'].map(c => (
                              <button key={c} onClick={() => setRoomData({...roomData, color: c})} className={`w-5 h-5 rounded-full transition-all ${roomData.color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-card scale-110' : 'opacity-40 hover:opacity-100'}`} style={{ backgroundColor: c }} />
                            ))}
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border mt-2">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-md border ${roomData.isPrivate ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/50 border-border text-muted-foreground'}`}>
                            {roomData.isPrivate ? <Lock size={16} /> : <Unlock size={16} />}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground leading-none mb-1">Private Room</span>
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Secure Sync</span>
                         </div>
                      </div>
                      <input type="checkbox" checked={roomData.isPrivate} onChange={e => setRoomData({...roomData, isPrivate: e.target.checked})} className="w-5 h-5 accent-primary cursor-pointer"/>
                   </div>
                   {roomData.isPrivate && (
                     <div className="space-y-1.5 animate-in slide-in-from-top fade-in">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Access Key</label>
                        <input type="password" value={roomData.password} onChange={e => setRoomData({...roomData, password: e.target.value})} placeholder="••••••••" className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm font-bold tracking-widest shadow-sm"/>
                     </div>
                   )}
                </div>
                <div className="flex gap-3 mt-8">
                   <button onClick={closeModal} className="flex-1 btn-secondary py-2.5 font-bold">Discard</button>
                   <button onClick={handleSubmit} className="flex-1 btn-primary py-2.5 font-bold" style={{ backgroundColor: roomData.color }}>{isEditing ? 'Update DNA' : 'Initialize Chamber'}</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPassPrompt && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPassPrompt(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-xl z-10 text-center mx-auto my-auto">
                <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-primary shadow-sm">
                   <Shield size={32} />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Restricted Access</h2>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-8">Verification Required</p>
                <input 
                  type="password" value={passInput} 
                  onChange={e => setPassInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && verifyAndJoin()}
                  placeholder="Enter access key" 
                  autoFocus
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-center text-sm font-bold tracking-widest focus:outline-none focus:border-primary shadow-sm mb-6"
                />
                <div className="flex gap-3">
                   <button onClick={() => setShowPassPrompt(false)} className="flex-1 btn-secondary py-2.5 font-bold">Abort</button>
                   <button onClick={verifyAndJoin} className="flex-1 btn-primary py-2.5 font-bold">Authorize</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
