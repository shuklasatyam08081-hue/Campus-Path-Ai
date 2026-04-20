const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeResume = async (buffer, jobDescription) => {
  try {
    const data = await pdf(buffer);
    const resumeText = data.text;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace(/```json|```/g, ''));
  } catch (error) {
    console.error('Resume analysis service error:', error);
    throw new Error('Failed to analyze resume. Please ensure it is a valid PDF and try again.');
  }
};

const conductMockInterview = async ({ roadmapContext, messages, targetRole }) => {
  try {
    console.log('🤖 Starting interview simulation for:', targetRole);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
      5. If the user answers correctly, dive deeper. If they struggle, provide a hint or a learning resource and pivot to a related concept.
      
      CONVERSATION HISTORY:
      ${JSON.stringify(messages || [])}
      
      Respond in a supportive but rigorous manner.
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    console.log('✅ AI Response generated successfully');
    return text;
  } catch (error) {
    console.error('❌ Interview service error details:', error);
    throw new Error('Interview simulation interrupted: ' + error.message);
  }
};

module.exports = { analyzeResume, conductMockInterview };
