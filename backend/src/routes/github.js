const express = require('express');
const router = express.Router();
const { analyzeUser, getHeatmap } = require('../controllers/githubController');
const { protect } = require('../middleware/auth');

router.get('/analyze/:username', protect, analyzeUser);
router.get('/heatmap/:username', getHeatmap);

module.exports = router;
