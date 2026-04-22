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

  // 2. Build the dynamic AI prompt
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

6. **Documentation Links**: Provide a direct 'docLink' for every day. 
   - **PRIORITIZE W3Schools** for web fundamentals (HTML, CSS, JavaScript basics, SQL).
   - For all other topics, provide the **OFFICIAL documentation** link (e.g., nodejs.org, mdn.io). 
   - **STRICT**: NEVER use search engine links (Google/Bing). Only direct educational links.

RETURN ONLY JSON:

STRICT VIDEO RULES (MANDATORY):
- **STRICT VIDEO FORMAT**: Only provide direct watch links: \`https://www.youtube.com/watch?v=VIDEO_ID\`. 
- **NO HALLUCINATIONS**: If you do not have a 100% VERIFIED, working Video ID for this EXACT topic from a major channel (FreeCodeCamp, NetNinja, Traversy Media, Programming with Mosh, Fireship, Academind), you MUST return a search URL: \`https://www.youtube.com/results?search_query=${targetRole}+[Topic]+tutorial\`. 
- **NEVER** guess a Video ID. A search link is 100% better than a "Video Unavailable" error.
- **STRICT**: Do not use playlist links, shorts, or private videos.


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
          "docLink": "https://www.w3schools.com/...",
          "videoLink": "https://www.youtube.com/watch?v=..."
        }
      ],
      "tasks": [
        { "text": "Task description", "completed": false }
      ],
      "projectBrief": "Weekend project details."
    }
  ]
}

STRICT: Return ONLY JSON.No markdown.No filler.`;

  const modelsToTry = [
    'gemini-3.1-flash-lite', 
    'gemini-3.1-flash', 
    'gemini-2.5-flash-lite', 
    'gemini-2.5-flash', 
    'gemini-2.0-flash-lite', 
    'gemini-1.5-flash'
  ];
  let lastError = null;

  for (const modelName of modelsToTry) {
    let retryCount = 0;
    while (retryCount < 2) { // 2 retries per model for faster rotation
      try {
        console.log(`🤖[Model: ${ modelName }][Attempt ${ retryCount + 1 }/2] Requesting Roadmap for "${targetRole}"...`);
        const model = getGenAI().getGenerativeModel({
          model: modelName,
          generationConfig: {
            // Note: v1.0 doesn't support responseMimeType: "application/json"
            ...(modelName.includes('1.5') ? { responseMimeType: "application/json" } : {}),
            temperature: 0.1
          }
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        console.log(`🤖 ${ modelName } responded.Parsing...`);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI failed to generate a valid roadmap format.');

        const cleanJson = jsonMatch[0].replace(/```json | ```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        if (!parsed.weeks || !Array.isArray(parsed.weeks) || parsed.weeks.length < 4) {
          throw new Error('Roadmap too short or invalid structure');
        }

        return parsed;

      } catch (error) {
        lastError = error;
        retryCount++;
        const isRateLimit = error.message?.includes('429') || error.message?.includes('Too Many Requests');
        
        if (retryCount < 2 && isRateLimit) {
          console.warn(`⚠️ ${ modelName } rate limited.Waiting 3s...`);
          await sleep(3000);
          continue;
        }
        break; 
      }
    }
    console.warn(`❌ ${ modelName } failed, trying next option...`);
  }

  // Final fallback to mock if all models fail
  console.warn('⚠️ All AI models failed, falling back to Mock Roadmap.');
  const mockTopics = {
        'Frontend': ['HTML & CSS', 'JavaScript Basics', 'React.js', 'State Management', 'API Integration', 'Testing', 'Deployment'],
        'Backend': ['Node.js Basics', 'Express.js', 'MongoDB/SQL', 'Authentication', 'API Design', 'System Architecture', 'Cloud/DevOps'],
        'Fullstack': ['Frontend Foundations', 'React Essentials', 'Node & Express', 'Databases', 'Fullstack Integration', 'Security', 'Deployment']
      };

      const topics = mockTopics[targetRole] || mockTopics['Fullstack'];
      return generateMockRoadmap(targetRole, topics, 8, weeklyHours);
};

const generateMockRoadmap = (targetRole, topics, totalWeeks, weeklyHours) => {
  const weeks = topics.map((topic, i) => {
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      weekNumber: i + 1,
      topic: topic,
      description: `Professional curriculum for ${ topic } within the ${ targetRole } path.`,
      skills: [targetRole, topic.split(' ')[0]],
      expectedRepoName: `cp - week${ i + 1 } -${ slug } `,
      estimatedHours: weeklyHours || 10,
      days: Array.from({ length: 7 }, (_, d) => ({
        dayNumber: d + 1,
        topic: `${ topic } - Focus Area ${ d + 1 } `,
        subtopic: `Deep dive into concept ${ d + 1 } of ${ topic } `,
        description: `This is a comprehensive study of focus area ${ d + 1 }. You will master the fundamental theories and practical applications today.`,
        docLink: `https://www.w3schools.com/tags/default.asp`,
videoLink: `https://www.youtube.com/watch?v=qz0aGYMCzl0`,
  completed: false
      })),
tasks: [
  { text: `Research industry best practices for ${topic}`, completed: false },
  { text: `Complete a hands-on lab exercise related to ${topic}`, completed: false },
  { text: `Integrate ${topic} into your master project`, completed: false },
  { text: `Review and optimize implementation`, completed: false },
],
  resources: [
    { title: `${topic} Official Guide`, url: 'https://developer.mozilla.org', type: 'docs' },
  ],
    projectBrief: `Develop a ${topic} focused module for your ${targetRole} portfolio.`,
    };
  });
return { totalWeeks, targetRole, weeks };
};

module.exports = { generateRoadmap };
