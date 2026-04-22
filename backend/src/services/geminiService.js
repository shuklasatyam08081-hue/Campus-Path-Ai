const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Generates a high-fidelity, personalized roadmap using the Gemini-2.0-Flash model.
 * The AI identifies required skills for the given role and bridges the gap from current skills.
 */
const generateRoadmap = async ({ targetRole, githubAnalysis, manualSkills, weeklyHours, proficiency }) => {
  const modelName = 'gemini-2.5-flash';

  // 1. Gather all existing knowledge
  const githubSkills = githubAnalysis
    ? [...githubAnalysis.frameworks, ...githubAnalysis.languages.map(l => l.language)]
    : [];
  const knownSkills = Array.from(new Set([...githubSkills, ...(manualSkills || [])]));

  // 2. Build the dynamic AI prompt
  const prompt = `You are an elite Technical Career Architect. Your mission is to generate a COMPREHENSIVE day-by-day learning roadmap as valid JSON.

USER PROFILE & TARGET:
- The user has selected this specific Skill/Role to master: **${targetRole}**. The entire roadmap MUST strongly focus on mastering "${targetRole}" from the ground up to an advanced level.
- Mastered Tech (EXCLUDE): [${knownSkills.join(', ') || 'None'}]
- Current Proficiency: ${proficiency || 'Intermediate'}
- Time Commitment: ${weeklyHours || 10} hours/week

<<<<<<< Updated upstream
STRICT GENERATION RULES:
1. **DAY-WISE FIRST**: Think day-by-day. Detail exactly what the user should learn each day to master the selected skill (${targetRole}).
2. **GROUP INTO WEEKS**: Group every 7 days into exactly 1 Week. Generate a total of 4 to 8 weeks (depending on the depth of the skill).
3. **HIGH-QUALITY RESOURCES**: For EVERY SINGLE DAY, you must provide functional search links. Do NOT use placeholders or fake IDs.
    - "videoLink": You MUST generate a working YouTube Search link formatted EXACTLY like this: "https://www.youtube.com/results?search_query=[Insert+Specific+Subtopic+Here]"
    - "docLink": You MUST generate a working Google Search link formatted EXACTLY like this: "https://www.google.com/search?q=[Insert+Specific+Subtopic+Here]+tutorial+docs"
4. **GITHUB PROJECT**: Every week must culminate in a practical project. Assign an "expectedRepoName" (e.g., "cp-week1-${targetRole.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}") that the user will build to pass the week.
=======
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
7. **Direct Video Lessons**: Provide a direct 'videoLink' for every day.
   - You MUST identify the single best, most specific and clear YouTube tutorial for that specific day's topic.
   - **STRICT CONTEXTUAL CONGRUENCE**: Every video MUST be 100% relevant to the **${targetRole}** path. If the topic is "The Box Model" and the role is "Frontend", give a web-based CSS video, NOT a generic or unrelated one.
   - **Direct Video Only**: Prioritize direct watch links (e.g., https://www.youtube.com/watch?v=...). DO NOT give playlist links or channel homepages.
   - **PRIORITIZE Embeddable Channels**: FreeCodeCamp, Traversy Media, Programming with Mosh, Net Ninja, Computerphile, Fireship. These channels allow embedding.
   - **HALLUCINATION FALLBACK**: If you are NOT 100% certain of a working direct Video ID for this EXACT topic, you MUST provide a search URL: https://www.youtube.com/results?search_query=${targetRole}+[DayTopic]+tutorial
   - **STRICT**: Only use direct video links or specific search results. NEVER use links that require login, are age-restricted, or are from unrelated tech stacks.
>>>>>>> Stashed changes

RETURN ONLY JSON:
{
  "totalWeeks": [Number of weeks],
  "targetRole": "${targetRole}",
  "weeks": [
    {
      "weekNumber": 1,
<<<<<<< Updated upstream
      "topic": "Main Weekly Theme (e.g., Core Fundamentals)",
      "description": "Short description of the week's goal.",
      "skills": ["${targetRole}", "Related Skill"],
      "expectedRepoName": "cp-[skill]-week1",
      "days": [
        {
          "dayNumber": 1,
          "topic": "Specific Daily Concept (e.g., Component State)",
          "subtopic": "Deep dive subtopic details",
          "description": "What exactly to build or learn.",
          "docLink": "https://www.google.com/search?q=Component+State+React+tutorial+docs",
          "videoLink": "https://www.youtube.com/results?search_query=Component+State+React+tutorial"
=======
      "topic": "Simple Weekly Theme",
      "description": "What we will master this week in simple words.",
      "estimatedHours": ${weeklyHours || 10},
      "skills": ["Skill 1", "Skill 2"],
      "expectedRepoName": "cp-project-name",
      "days": [
        {
          "dayNumber": 1,
          "topic": "Simple Topic",
          "subtopic": "Easy Concept",
          "description": "Goal in simple sentences.",
          "docLink": "https://www.w3schools.com/html/default.asp",
          "videoLink": "https://www.youtube.com/watch?v=qz0aGYMCzl0"
>>>>>>> Stashed changes
        }
      ],
      "tasks": [{ "text": "Finish the GitHub Repo", "completed": false }],
      "projectBrief": "Build a specific project summarizing the week's 7 days."
    }
  ]
}

Ensure the output is 100% valid JSON and no markdown formatting outside of the braces.`;

  try {
    console.log(`🤖 Requesting 8-14 Week Granular Roadmap for "${targetRole}"...`);
    const model = getGenAI().getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1 // Even lower for maximum consistency
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
      console.warn('⚠️ AI generated too short a roadmap or invalid structure. Re-triggering logic check.');
      // If AI still gives < 4 weeks, we force fallback
      if (parsed.weeks.length < 4) throw new Error('Roadmap too short');
    }

    return parsed;
  } catch (error) {
    require('fs').writeFileSync('gemini_error.txt', error.stack || error.message);
    console.error('❌ Gemini Error:', error.message);
    console.log('⚠️ Activating High-Quality Role-Based Fallback...');

    // Fallback: Generate a logical multi-week structure based on the role itself
    const fallbackTopics = [
      `Foundations of ${targetRole}`,
      `Core ${targetRole} Frameworks`,
      `Advanced Pattern Implementation`,
      `State Management & Performance`,
      `Testing & Production Readiness`,
      `Deployment & CI/CD Pipelines`,
      `Scalability & System Design`,
      `Industry Projects & Portfolio`
    ];

    return generateMockRoadmap(targetRole, fallbackTopics, 8, weeklyHours);
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
