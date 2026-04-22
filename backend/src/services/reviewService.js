const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const GITHUB_API_URL = 'https://api.github.com';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const reviewRepository = async (username, repoName) => {
  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  };

  const modelName = 'gemini-flash-latest';
  const MAX_RETRIES = 5;
  let retryCount = 0;

  try {
    // 1. Get repository contents
    let { data: contents } = await axios.get(`${GITHUB_API_URL}/repos/${username}/${repoName}/contents`, { headers });
    
    // 2. Find "interesting" files (JS, TS, Python, etc.)
    const isInteresting = file => 
      file.type === 'file' && 
      /\.(js|jsx|ts|tsx|py|go|java|cpp|c|php|html|css|rs|rb|cs|swift|kt)$/i.test(file.name) &&
      !file.name.toLowerCase().includes('config') &&
      !file.name.toLowerCase().includes('test') &&
      !file.name.toLowerCase().includes('lock') &&
      !file.name.toLowerCase().includes('min.js');

    let interestingFiles = contents.filter(isInteresting);

    // Deep Search Logic: If root doesn't have enough files, check ALL subdirectories
    if (interestingFiles.length < 3) {
      console.log('📂 Root lacks source files, scanning subdirectories...');
      const allDirs = contents.filter(f => f.type === 'dir' && !f.name.startsWith('.'));
      
      for (const dir of allDirs.slice(0, 8)) { // Scan up to 8 subdirectories
         try {
           const { data: subContents } = await axios.get(`${GITHUB_API_URL}/repos/${username}/${repoName}/contents/${dir.path}`, { headers });
           let found = subContents.filter(isInteresting);
           
           // If still no files, check one level deeper
           if (found.length === 0) {
             const nestedDirs = subContents.filter(f => f.type === 'dir' && !f.name.startsWith('.'));
             for (const nDir of nestedDirs.slice(0, 3)) {
               const { data: nestedContents } = await axios.get(`${GITHUB_API_URL}/repos/${username}/${repoName}/contents/${nDir.path}`, { headers });
               found = [...found, ...nestedContents.filter(isInteresting)];
               if (found.length >= 3) break;
             }
           }

           interestingFiles = [...interestingFiles, ...found];
           if (interestingFiles.length >= 5) break;
         } catch (e) { /* skip failed dir fetch */ }
      }
    }

    // Keep unique files by path
    interestingFiles = Array.from(new Map(interestingFiles.map(item => [item.path, item])).values());
    interestingFiles = interestingFiles.slice(0, 5); // Review up to 5 files for a better deep-dive

    if (interestingFiles.length === 0) {
      throw new Error('No supported source files found for review. Make sure your repo has code files (js, py, etc.) and is not just a README.');
    }

    // 3. Fetch content of these files
    const fileContents = await Promise.all(interestingFiles.map(async file => {
      const { data } = await axios.get(file.download_url);
      return `FILE: ${file.name}\n\n${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`;
    }));

    const combinedCode = fileContents.join('\n\n---\n\n');

    // 4. Use Gemini to review
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

    while (retryCount < MAX_RETRIES) {
      try {
        console.log(`🤖 [Attempt ${retryCount + 1}/${MAX_RETRIES}] Reviewing Repo "${repoName}"...`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI failed to generate a valid review format.');

        return JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());

      } catch (error) {
        retryCount++;
        const isRateLimit = error.message?.includes('429') || error.message?.includes('Too Many Requests');
        const isHighDemand = error.message?.includes('503') || error.message?.includes('high demand');
        
        if (retryCount < MAX_RETRIES && (isRateLimit || isHighDemand)) {
          let waitTime = 10000;
          const delayMatch = error.message?.match(/"retryDelay":"(\d+)s"/);
          if (delayMatch) waitTime = (parseInt(delayMatch[1]) + 2) * 1000;
          else if (isRateLimit) waitTime = 60000;

          console.warn(`⚠️ Review API busy. Retrying in ${waitTime/1000}s...`);
          await sleep(waitTime);
          continue;
        }
        throw error;
      }
    }

  } catch (error) {
    console.error('GitHub Review Service Error:', error.response?.data || error.message);
    throw new Error('Failed to review repository: ' + (error.response?.data?.message || error.message));
  }
};

module.exports = { reviewRepository };
