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
      /\.(js|jsx|ts|tsx|py|go|java|cpp|c|php)$/i.test(file.name) &&
      !file.name.includes('config') &&
      !file.name.includes('test') &&
      !file.name.includes('lock');

    let interestingFiles = contents.filter(isInteresting);

    // Deep Search Logic: If root is empty, check subdirectories
    if (interestingFiles.length === 0) {
      console.log('📂 Root empty of source files, checking subdirectories...');
      const subDirs = contents.filter(f => f.type === 'dir' && ['src', 'backend', 'frontend', 'app', 'lib', 'server'].includes(f.name.toLowerCase()));
      
      for (const dir of subDirs.slice(0, 3)) { // Check top 3 subdirs
         try {
           const { data: subContents } = await axios.get(`${GITHUB_API_URL}/repos/${username}/${repoName}/contents/${dir.name}`, { headers });
           let found = subContents.filter(isInteresting);
           
           // If still no files, but there is a 'src' inside this subdir, check it too!
           if (found.length === 0) {
             const nestedSrc = subContents.find(f => f.type === 'dir' && f.name.toLowerCase() === 'src');
             if (nestedSrc) {
               const { data: nestedContents } = await axios.get(`${GITHUB_API_URL}/repos/${username}/${repoName}/contents/${dir.name}/${nestedSrc.name}`, { headers });
               found = nestedContents.filter(isInteresting);
             }
           }

           interestingFiles = [...interestingFiles, ...found];
           if (interestingFiles.length >= 3) break;
         } catch (e) { /* skip failed dir fetch */ }
      }
    }

    interestingFiles = interestingFiles.slice(0, 3); // Review top 3 files for speed

    if (interestingFiles.length === 0) {
      throw new Error('No supported source files found for review in root or major subdirectories.');
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
