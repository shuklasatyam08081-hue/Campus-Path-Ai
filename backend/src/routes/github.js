const express = require('express');
const router = express.Router();
const { analyzeUser, getHeatmap, handleReview } = require('../controllers/githubController');
const { protect } = require('../middleware/auth');

router.get('/analyze/:username', protect, analyzeUser);
router.get('/heatmap/:username', getHeatmap);
router.post('/review', protect, handleReview);

module.exports = router;
