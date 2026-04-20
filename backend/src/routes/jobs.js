const express = require('express');
const router = express.Router();
const { getJobs, claimMilestone } = require('../controllers/jobsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getJobs);
router.post('/milestone/claim', protect, claimMilestone);

module.exports = router;
