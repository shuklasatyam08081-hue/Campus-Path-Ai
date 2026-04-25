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
app.use('/api/rooms', require('./routes/room'));

// Basic Socket.io connection logic for study rooms
const rooms = {}; // { roomId: { socketId: userData } }

io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  socket.on('get-room-counts', () => {
    const counts = {};
    Object.keys(rooms).forEach(id => { counts[id] = Object.keys(rooms[id]).length; });
    socket.emit('room-counts', counts);
  });

  socket.on('join-room', ({ roomId, user }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = { socketId: socket.id, ...user };

    // Broadcast updated counts & user list
    const counts = {};
    Object.keys(rooms).forEach(id => { counts[id] = Object.keys(rooms[id]).length; });
    io.emit('room-counts', counts);

    const roomUsers = Object.values(rooms[roomId]);
    io.to(roomId).emit('user-joined', { socketId: socket.id, ...user, roomUsers });
    console.log(`👤 ${user.name} joined room: ${roomId}`);
  });

  socket.on('leave-room', ({ roomId, user }) => {
    socket.leave(roomId);
    if (rooms[roomId] && rooms[roomId][socket.id]) {
      const userData = rooms[roomId][socket.id];
      delete rooms[roomId][socket.id];

      const counts = {};
      Object.keys(rooms).forEach(id => { counts[id] = Object.keys(rooms[id]).length; });
      io.emit('room-counts', counts);

      const roomUsers = Object.values(rooms[roomId] || {});
      io.to(roomId).emit('user-left', { name: userData.name, roomUsers });
    }
  });

  socket.on('send-message', ({ roomId, message, user }) => {
    io.to(roomId).emit('new-message', { user, message, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    Object.keys(rooms).forEach(roomId => {
      if (rooms[roomId][socket.id]) {
        const userData = rooms[roomId][socket.id];
        delete rooms[roomId][socket.id];

        const counts = {};
        Object.keys(rooms).forEach(id => { counts[id] = Object.keys(rooms[id]).length; });
        io.emit('room-counts', counts);

        const roomUsers = Object.values(rooms[roomId]);
        io.to(roomId).emit('user-left', { name: userData.name, roomUsers });
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
