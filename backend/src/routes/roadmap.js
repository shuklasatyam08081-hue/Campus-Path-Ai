const express = require('express');
const router = express.Router();
const { generateRoadmapController, getRoadmaps, getRoadmap, updateTask, verifyMilestone } = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/generate', generateRoadmapController);
router.get('/', getRoadmaps);
router.get('/:id', getRoadmap);
router.put('/:id/task', updateTask);
router.put('/:id/verify', verifyMilestone); // NEW

module.exports = router;
