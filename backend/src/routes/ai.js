const express = require('express');
const router = express.Router();
const multer = require('multer');
const { scoreResume, handleInterviewChat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/score-resume', protect, upload.single('resume'), scoreResume);
router.post('/interview', protect, handleInterviewChat);

module.exports = router;