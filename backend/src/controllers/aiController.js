const { analyzeResume, conductMockInterview } = require('../services/aiService');
const User = require('../models/User');

const scoreResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume.' });
    }
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ success: false, message: 'Job description is required for analysis.' });
    }

    const analysis = await analyzeResume(req.file.buffer, jobDescription);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleInterviewChat = async (req, res) => {
  try {
    const { messages, targetRole, roadmapContext } = req.body;
    const aiResponse = await conductMockInterview({ messages, targetRole, roadmapContext });
    res.json({ success: true, message: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { scoreResume, handleInterviewChat };
module.exports = { scoreResume, handleInterviewChat };
