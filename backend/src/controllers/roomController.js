const Room = require('../models/Room');

// Get all rooms (Public + Private indicators)
const getRooms = async (req, res) => {
  try {
    // We fetch all rooms but we will handle privacy on frontend
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    console.error('GetRooms Error:', error);
    res.status(500).json({ success: false, message: 'Neural link data corrupted.' });
  }
};

// Create a new focus chamber
const createRoom = async (req, res) => {
  try {
    const { name, description, category, color, isPrivate, password } = req.body;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Identity not verified.' });
    }

    const room = await Room.create({
      name,
      description,
      category,
      color,
      isPrivate,
      password: isPrivate ? password : null,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, room });
  } catch (error) {
    console.error('CreateRoom Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an existing chamber
const updateRoom = async (req, res) => {
  try {
    const { name, description, category, color, isPrivate, password } = req.body;
    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { name, description, category, color, isPrivate, password: isPrivate ? password : null },
      { new: true }
    );

    if (!room) return res.status(404).json({ success: false, message: 'Room not found or unauthorized' });
    res.json({ success: true, room });
  } catch (error) {
    console.error('UpdateRoom Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Decommission a chamber
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found or unauthorized' });
    res.json({ success: true, message: 'Chamber decommissioned.' });
  } catch (error) {
    console.error('DeleteRoom Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify access key for private rooms
const verifyRoomPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const room = await Room.findById(req.params.id);
    
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (!room.isPrivate) return res.json({ success: true, message: 'Public access' });
    
    if (room.password === password) {
      res.json({ success: true, message: 'Access granted' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid access key' });
    }
  } catch (error) {
    console.error('VerifyPassword Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRooms, createRoom, updateRoom, deleteRoom, verifyRoomPassword };
