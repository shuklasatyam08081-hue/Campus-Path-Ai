const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Roadmap = require('../src/models/Roadmap');

async function fixLinks() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    // Find the most recent roadmap
    const roadmap = await Roadmap.findOne().sort({ createdAt: -1 });

    if (!roadmap) {
      console.log('❌ No roadmap found in database.');
      return;
    }

    console.log(`🎯 Found roadmap for ${roadmap.targetRole} (${roadmap._id})`);
    let updateCount = 0;

    roadmap.weeks.forEach(week => {
      week.days.forEach(day => {
        const oldLink = day.videoLink;
        
        // If it's a direct YouTube link, we'll convert it to a search fallback 
        // to ensure the user gets a working video through our new failsafe UI,
        // since we don't know for sure if the direct link allows embedding.
        if (oldLink && !oldLink.includes('/results')) {
          const searchQuery = encodeURIComponent(`${day.topic} ${day.subtopic} tutorial`);
          day.videoLink = `https://www.youtube.com/results?search_query=${searchQuery}`;
          updateCount++;
          console.log(`  - Updated Day ${day.dayNumber}: ${day.topic}`);
        }
      });
    });

    if (updateCount > 0) {
      await roadmap.save();
      console.log(`\n✨ Successfully updated ${updateCount} video links!`);
      console.log('✅ Changes applied to the latest roadmap.');
    } else {
      console.log('ℹ️ No links needed updating.');
    }

  } catch (error) {
    console.error('❌ Error fixing links:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected.');
  }
}

fixLinks();
