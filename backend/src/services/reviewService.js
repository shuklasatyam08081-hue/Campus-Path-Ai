const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const GITHUB_API_URL = 'https://api.github.com';

const reviewRepository = async (username, repoName) => {
  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  };

  try {
    // 1. Get repository contents
    const { data: contents } = await axios.get(`${GITHUB_API_URL}/repos/${username}/${repoName}/contents`, { headers });
    
    // 2. Find "interesting" files (JS, TS, Python, etc.)
    const interestingFiles = contents.filter(file => 
      file.type === 'file' && 
      /\.(js|jsx|ts|tsx|py|go|java|cpp|c|php)$/i.test(file.name) &&
      !file.name.includes('config') &&
      !file.name.includes('test') &&
      !file.name.includes('lock')
    ).slice(0, 3); // Review top 3 files for speed and token limits

    if (interestingFiles.length === 0) {
      throw new Error('No supported source files found for review.');
    }

    // 3. Fetch content of these files
    const fileContents = await Promise.all(interestingFiles.map(async file => {
      const { data } = await axios.get(file.download_url);
      return `FILE: ${file.name}\n\n${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`;
    }));

    const combinedCode = fileContents.join('\n\n---\n\n');

    // 4. Use Gemini to review
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are a Senior Security Architect and World-Class Software Engineer.
      Analyze the following code from a GitHub repository: ${repoName} (User: ${username}).
      
      CODE CONTENT:
      ${combinedCode}
      
      Perform a deep-dive analysis and return a JSON object with the following structure:
      {
        "scorecard": {
          "security": (0-100),
          "performance": (0-100),
          "cleanliness": (0-100),
          "architecture": (0-100)
        },
        "overallGrade": "A-F",
        "keyFindings": ["finding 1", "finding 2"],
        "securityAlerts": ["alert 1", "alert 2"],
        "refactoringSuggestions": ["suggestion 1", "suggestion 2"],
        "verdict": "A brief overall summary of the repository quality."
      }
      Only return the JSON object, nothing else.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace(/```json|```/g, ''));

  } catch (error) {
    console.error('GitHub Review Service Error:', error.response?.data || error.message);
    throw new Error('Failed to review repository: ' + (error.response?.data?.message || error.message));
  }
};

module.exports = { reviewRepository };
module.exports = { reviewRepository };
