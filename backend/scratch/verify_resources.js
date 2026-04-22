require('dotenv').config();
const { generateRoadmap } = require('../src/services/geminiService');

async function test() {
  console.log('Testing Roadmap Generation with new resource rules...');
  try {
    const roadmap = await generateRoadmap({
      targetRole: 'Frontend Developer',
      weeklyHours: 15,
      proficiency: 'Beginner'
    });

    console.log('\n--- VERIFICATION RESULTS ---');
    console.log(`Total Weeks: ${roadmap.totalWeeks}`);
    
    // Check Day 1 of Week 1
    const day1 = roadmap.weeks[0].days[0];
    console.log(`\nWeek 1, Day 1: ${day1.topic}`);
    console.log(`Doc Link: ${day1.docLink}`);
    console.log(`Video Link: ${day1.videoLink}`);

    if (day1.docLink.includes('w3schools.com')) {
      console.log('✅ Success: W3Schools prioritized for basics.');
    } else {
      console.log('⚠️ Warning: W3Schools not used for basics.');
    }

    if (day1.videoLink.includes('youtube.com/watch?v=')) {
      console.log('✅ Success: Direct YouTube video provided.');
    } else {
      console.log('⚠️ Warning: Direct YouTube link missing.');
    }

    // Check a middle week for official docs
    const midWeek = roadmap.weeks[Math.floor(roadmap.weeks.length / 2)];
    const midDay = midWeek.days[0];
    console.log(`\nWeek ${midWeek.weekNumber}, Day 1: ${midDay.topic}`);
    console.log(`Doc Link: ${midDay.docLink}`);
    console.log(`Video Link: ${midDay.videoLink}`);

  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

test();
