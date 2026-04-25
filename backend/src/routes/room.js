const express = require('express');
const router = express.Router();
const { getRooms, createRoom, updateRoom, deleteRoom, verifyRoomPassword } = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

router.get('/', getRooms);
router.post('/', protect, createRoom);
router.put('/:id', protect, updateRoom);
router.delete('/:id', protect, deleteRoom);
router.post('/:id/verify', protect, verifyRoomPassword);

module.exports = router;
