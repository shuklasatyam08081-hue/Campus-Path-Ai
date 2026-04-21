const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateRoadmap = async ({ targetRole, githubAnalysis, manualSkills, weeklyHours, proficiency }) => {
  const modelName = 'gemini-flash-latest';
  const MAX_RETRIES = 5;
  let retryCount = 0;

  // 1. Gather all existing knowledge
  const githubSkills = githubAnalysis
    ? [...githubAnalysis.frameworks, ...githubAnalysis.languages.map(l => l.language)]
    : [];
  const knownSkills = Array.from(new Set([...githubSkills, ...(manualSkills || [])]));

  // 2. Build the dynamic AI prompt (moved into the loop if needed, but static here is fine)
  const prompt = `You are a Friendly and Expert Technical Mentor. Your mission is to generate a COMPREHENSIVE, day-by-day learning roadmap from ABSOLUTE BASIC to ADVANCED level as valid JSON.

USER CONTEXT:
- Target Role: **${targetRole}**.
- User already has some experience in: [${knownSkills.join(', ') || 'None'}]. 
- Proficiency: ${proficiency || 'Beginner'}.

STRICT CONTENT RULES:
1. **Full Journey Mandatory**: Even if the user knows some skills, DO NOT skip the foundations. Instead, include them as "Week 1-2: Foundations & Review" so the user has a complete reference. The roadmap MUST be a "Zero to Hero" path.
2. **Dynamic but Long Duration**: Generate exactly **8 to 12 weeks** of content to ensure it is truly "Basic to Advance". Do not make it shorter than 8 weeks.
3. **Simple Language**: Avoid corporate/complex jargon. 
   - Use "Making it Responsive/Mobile-friendly" instead of "Media Queries/Atomic Design".
   - Use "Building Reusable Parts" instead of "Component Architecture".
   - Use "Saving and Managing Data" instead of "State Management/Redux".
4. **Daily Routine**: 7 days per week. Every day has a clear, simple topic and a learning goal.
5. **Weekly Milestone**: Ends with a project. Give each project a unique, simple name.

JSON STRUCTURE:
{
  "totalWeeks": [Number between 8-12],
  "targetRole": "${targetRole}",
  "weeks": [
    {
      "weekNumber": 1,
      "topic": "Simple Weekly Theme (e.g., Foundations & Quick Review)",
      "description": "What we will master this week in simple words.",
      "estimatedHours": ${weeklyHours || 10},
      "skills": ["Skill 1", "Skill 2"],
      "expectedRepoName": "cp-project-name",
      "days": [
        {
          "dayNumber": 1,
          "topic": "Simple Topic",
          "subtopic": "Easy Concept",
          "description": "Today's goal in simple sentences.",
          "docLink": "https://www.google.com/search?q=[Topic]+beginner+tutorial",
          "videoLink": "https://www.youtube.com/results?search_query=[Topic]+tutorial"
        }
      ],
      "tasks": [
        { "text": "Task description", "completed": false }
      ],
      "projectBrief": "Weekend project details."
    }
  ]
}

STRICT: Return ONLY JSON. No markdown. No filler.`;

  while (retryCount < MAX_RETRIES) {
    try {
      console.log(`🤖 [Attempt ${retryCount + 1}/${MAX_RETRIES}] Requesting Roadmap for "${targetRole}"...`);
      const model = getGenAI().getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      console.log('🤖 Parsing Gemini response...');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI failed to generate a valid roadmap format.');

      const cleanJson = jsonMatch[0].replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (!parsed.weeks || !Array.isArray(parsed.weeks) || parsed.weeks.length < 4) {
        throw new Error('Roadmap too short or invalid structure');
      }

      return parsed;

    } catch (error) {
      retryCount++;
      const isRateLimit = error.message?.includes('429') || error.message?.includes('Too Many Requests');
      const isHighDemand = error.message?.includes('503') || error.message?.includes('high demand');
      
      if (retryCount < MAX_RETRIES && (isRateLimit || isHighDemand)) {
        let waitTime = 10000; // Default 10s
        
        // Try to extract suggested retry delay if present in error message (e.g. "retryDelay":"43s")
        const delayMatch = error.message?.match(/"retryDelay":"(\d+)s"/);
        if (delayMatch) {
          waitTime = (parseInt(delayMatch[1]) + 2) * 1000; // Add 2s buffer
        } else if (isRateLimit) {
          waitTime = 60000; // If rate-limited and no delay given, wait 60s (quota reset?)
        }

        console.warn(`⚠️ Gemini API busy (${error.message}). Retrying in ${waitTime/1000}s...`);
        await sleep(waitTime);
        continue;
      }

      require('fs').writeFileSync('gemini_error.txt', error.stack || error.message);
      console.error('❌ Gemini Error after retries:', error.message);
      
      const userMessage = isRateLimit 
        ? 'The AI model is temporarily rate-limited. Please wait a moment and try again.' 
        : isHighDemand 
          ? 'The AI model is currently experiencing high demand. Please try again in a minute.' 
          : `AI generation failed: ${error.message}`;
      
      throw new Error(userMessage);
    }
  }
};

const generateMockRoadmap = (targetRole, topics, totalWeeks, weeklyHours) => {
  const weeks = topics.map((topic, i) => {
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      weekNumber: i + 1,
      topic: topic,
      description: `Professional curriculum for ${topic} within the ${targetRole} path.`,
      skills: [targetRole, topic.split(' ')[0]],
      expectedRepoName: `cp-week${i + 1}-${slug}`,
      estimatedHours: weeklyHours || 10,
      days: Array.from({ length: 7 }, (_, d) => ({
        dayNumber: d + 1,
        topic: `${topic} - Focus Area ${d + 1}`,
        subtopic: `Deep dive into concept ${d + 1} of ${topic}`,
        description: `This is a comprehensive study of focus area ${d + 1}. You will master the fundamental theories and practical applications today.`,
        docLink: `https://www.google.com/search?q=${encodeURIComponent(topic + ' tutorial docs')}`,
        videoLink: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`,
        completed: false
      })),
      tasks: [
        { text: `Research industry best practices for ${topic}`, completed: false },
        { text: `Complete a hands-on lab exercise related to ${topic}`, completed: false },
        { text: `Integrate ${topic} into your master project`, completed: false },
        { text: `Review and optimize implementation`, completed: false },
      ],
      resources: [
        { title: `${topic} Guide`, url: 'https://developer.mozilla.org', type: 'docs' },
      ],
      projectBrief: `Develop a ${topic} focused module for your ${targetRole} portfolio.`,
    };
  });
  return { totalWeeks, targetRole, weeks };
};

module.exports = { generateRoadmap };
