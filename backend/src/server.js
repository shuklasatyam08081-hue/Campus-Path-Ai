require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('./config/passport');

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/github', require('./routes/github'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/jobs', require('./routes/jobs'));

// Basic Socket.io connection logic for study rooms
const rooms = new Map(); // Store active room users

io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);
  
  // Send current room counts when client requests
  socket.on('get-room-counts', () => {
    const counts = {};
    rooms.forEach((users, roomId) => { counts[roomId] = users.size; });
    socket.emit('room-counts', counts);
  });

  socket.on('join-room', ({ roomId, user }) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    rooms.get(roomId).add({ socketId: socket.id, ...user });
    
    // Notify all clients with updated counts
    const counts = {};
    rooms.forEach((users, id) => { counts[id] = users.size; });
    io.emit('room-counts', counts);
    io.to(roomId).emit('user-joined', { socketId: socket.id, ...user, count: rooms.get(roomId).size });
    console.log(`👤 ${user.name} joined room: ${roomId}`);
  });

  socket.on('send-message', ({ roomId, message, user }) => {
    io.to(roomId).emit('new-message', { user, message, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    rooms.forEach((users, roomId) => {
      const user = Array.from(users).find(u => u.socketId === socket.id);
      if (user) {
        users.delete(user);
        // Broadcast updated counts
        const counts = {};
        rooms.forEach((u, id) => { counts[id] = u.size; });
        io.emit('room-counts', counts);
        io.to(roomId).emit('user-left', { name: user.name, count: users.size });
      }
    });
    console.log('🔌 User disconnected');
  });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 CampusPath API (Socket.io enabled) running on http://localhost:${PORT}`));
