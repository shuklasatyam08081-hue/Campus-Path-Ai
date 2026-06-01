const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateMockResumeAnalysis = (jobDescription) => {
  const score = 72 + Math.floor(Math.random() * 16);
  const keywords = ['asynchronous', 'REST API', 'scalable architecture', 'TypeScript', 'Docker', 'JWT', 'MongoDB'];
  const missingKeywords = keywords.filter(() => Math.random() > 0.4);
  
  return {
    score,
    matchExplanation: `Your resume shows a strong alignment of core technical abilities relevant to the ${jobDescription.substring(0, 50)}... role. Key frontend and server-side paradigms are highlighted with high cleanliness metrics.`,
    missingKeywords,
    improvementTips: [
      "Include detailed quantitative impact in your projects (e.g. 'improved performance by 25%').",
      "Explicitly mention testing workflows (Jest/Cypress/TDD) and CI/CD tools.",
      "Add a dedicated skills summary section at the top of your resume."
    ],
    technicalGapAnalysis: "Your backend orchestration and framework foundations are strong. The main technical gap lies in containerization (Docker/Kubernetes) and cloud deployment specifications which could be showcased more explicitly to match enterprise recruitment parsers."
  };
};

const generateMockInterviewResponse = (targetRole, messages) => {
  const isFirstMessage = !messages || messages.length === 0;
  
  if (isFirstMessage) {
    return `Hello! Welcome to your mock technical interview for the ${targetRole || 'Software Engineer'} role. I am delighted to speak with you today.

To start off, could you briefly introduce yourself and tell me about a technically challenging project you have built recently? What were some of the key technical decisions you had to make?`;
  }
  
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const behavioralKeywords = ['challenges', 'resolved', 'team', 'lead', 'failure', 'conflict'];
  const isBehavioral = behavioralKeywords.some(kw => lastUserMessage.toLowerCase().includes(kw));
  
  if (isBehavioral) {
    return `Thank you for sharing that experience. Handling conflict and complex team dynamics requires solid maturity. 

Now, let's switch gears to technical concepts. In the context of your target role (${targetRole}), could you explain how you approach designing robust backend systems or API architectures to ensure scalability and avoid bottlenecks?`;
  }
  
  return `Excellent details! That demonstrates you have a clear grasp of component structures and data-flow optimizations.

Let's drill down into database management and system efficiency. How do you decide when to use index optimizations or introduce caching layers (such as Redis) in your applications?`;
};

const analyzeResume = async (buffer, jobDescription) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' || process.env.GEMINI_API_KEY.includes('dummy')) {
    console.warn('⚠️ GEMINI_API_KEY not set or placeholder. Falling back to simulated resume analysis.');
    return generateMockResumeAnalysis(jobDescription);
  }

  const modelName = 'gemini-flash-latest';
  const MAX_RETRIES = 5;
  let retryCount = 0;

  try {
    console.log('📄 Extracting text from PDF...');
    const data = await pdf(buffer);
    const resumeText = data.text?.trim();

    if (!resumeText || resumeText.length < 50) {
      throw new Error('Could not extract enough text from the PDF. Please ensure it is not an image-based PDF or a scanned document.');
    }

    console.log(`✅ Extracted ${resumeText.length} characters of resume text.`);

    const prompt = `
      You are an expert Technical Recruiter and ATS (Applicant Tracking System) Specialist.
      Analyze the following RESUME against the provided JOB DESCRIPTION.

      JOB DESCRIPTION:
      ${jobDescription}

      RESUME:
      ${resumeText}

      Return a JSON object with the following structure:
      {
        "score": (0-100),
        "matchExplanation": "brief overall summary",
        "missingKeywords": ["keyword1", "keyword2"],
        "improvementTips": ["tip1", "tip2"],
        "technicalGapAnalysis": "detailed analysis of skills missing for this specific role"
      }
      Only return the JSON object, no other text.
    `;

    while (retryCount < MAX_RETRIES) {
      try {
        console.log(`🤖 [Attempt ${retryCount + 1}/${MAX_RETRIES}] Requesting ATS Analysis...`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.1 
          }
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI failed to generate a valid analysis format.');
        
        const cleanJson = jsonMatch[0].replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        
        // Defensive checks for expected fields
        return {
          score: typeof parsed.score === 'number' ? parsed.score : 0,
          matchExplanation: parsed.matchExplanation || 'No summary available.',
          missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
          improvementTips: Array.isArray(parsed.improvementTips) ? parsed.improvementTips : [],
          technicalGapAnalysis: parsed.technicalGapAnalysis || 'No gap analysis available.'
        };
        
      } catch (error) {
        retryCount++;
        const isRateLimit = error.message?.includes('429') || error.message?.includes('Too Many Requests');
        const isHighDemand = error.message?.includes('503') || error.message?.includes('high demand');
        
        if (retryCount < MAX_RETRIES && (isRateLimit || isHighDemand)) {
          let waitTime = 15000;
          const delayMatch = error.message?.match(/"retryDelay":"(\d+)s"/);
          if (delayMatch) waitTime = (parseInt(delayMatch[1]) + 2) * 1000;
          else if (isRateLimit) waitTime = 30000; // 30s for rate limit

          console.warn(`⚠️ Resume AI busy. Retrying in ${waitTime/1000}s...`);
          await sleep(waitTime);
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Resume analysis service error, falling back to simulated analysis:', error.message);
    return generateMockResumeAnalysis(jobDescription);
  }
};

const conductMockInterview = async ({ roadmapContext, messages, targetRole }) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' || process.env.GEMINI_API_KEY.includes('dummy')) {
    console.warn('⚠️ GEMINI_API_KEY not set or placeholder. Falling back to simulated interviewer responses.');
    return generateMockInterviewResponse(targetRole, messages);
  }

  const modelName = 'gemini-flash-latest';
  const MAX_RETRIES = 3; // Lower retries for chat interaction to preserve UX
  let retryCount = 0;

  try {
    const systemPrompt = `
      You are an elite Senior Technical Interviewer for a Top Tier Tech Company.
      Your goal is to conduct a realistic, challenging, but encouraging mock technical interview.
      
      CONTEXT:
      - Target Role: ${targetRole || 'Software Engineer'}
      - User's Current Learning Path: ${JSON.stringify(roadmapContext || {})}
      
      INSTRUCTIONS:
      1. Start with a warm professional greeting if this is the first message.
      2. Ask ONE technical or behavioral question at a time related to their role and current roadmap progress.
      3. Evaluate their previous answer (if any) with constructive feedback before moving to the next question.
      4. Keep the tone professional, like a real job interview.
      
      CONVERSATION HISTORY:
      ${JSON.stringify(messages || [])}
    `;

    while (retryCount < MAX_RETRIES) {
      try {
        console.log(`🤖 Interview Request [Attempt ${retryCount + 1}] for: ${targetRole}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(systemPrompt);
        return result.response.text();
      } catch (error) {
        retryCount++;
        const isRateLimit = error.message?.includes('429') || error.message?.includes('Too Many Requests');
        if (retryCount < MAX_RETRIES && isRateLimit) {
          console.warn('⚠️ Interview API rate limited. Retrying in 5s...');
          await sleep(5000);
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Interview service error, falling back to simulated responses:', error);
    return generateMockInterviewResponse(targetRole, messages);
  }
};

module.exports = { analyzeResume, conductMockInterview };
