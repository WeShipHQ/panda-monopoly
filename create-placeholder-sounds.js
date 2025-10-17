/**
 * Script để tạo các file âm thanh placeholder (silent) cho game
 * 
 * Cách chạy:
 * 1. Cài ffmpeg: https://ffmpeg.org/download.html
 * 2. Chạy: node create-placeholder-sounds.js
 * 
 * Hoặc tìm và download các file âm thanh miễn phí từ:
 * - https://freesound.org/
 * - https://mixkit.co/free-sound-effects/
 * - https://www.zapsplat.com/
 * - https://soundbible.com/
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Danh sách các file âm thanh cần tạo
const missingFiles = [
  {
    name: 'button-hover.mp3',
    description: 'Tiếng hover button (rất nhẹ, subtle)',
    duration: 0.1,
    frequency: 800
  },
  {
    name: 'button-click2.mp3',
    description: 'Tiếng click button phụ',
    duration: 0.15,
    frequency: 1000
  },
  {
    name: 'dice-land.mp3',
    description: 'Tiếng xúc xắc rơi xuống',
    duration: 0.3,
    frequency: 500
  },
  {
    name: 'money-pay.mp3',
    description: 'Tiếng trả tiền (hơi buồn hơn receive)',
    duration: 0.5,
    frequency: 600
  },
  {
    name: 'jail.mp3',
    description: 'Tiếng vào tù (dramatic)',
    duration: 1.5,
    frequency: 300
  },
  {
    name: 'win.mp3',
    description: 'Tiếng thắng game (vui vẻ)',
    duration: 3.0,
    frequency: 1200
  },
  {
    name: 'lose.mp3',
    description: 'Tiếng thua game (buồn)',
    duration: 2.0,
    frequency: 400
  },
  {
    name: 'anime-wow.mp3',
    description: 'Tiếng wow anime',
    duration: 1.0,
    frequency: 900
  },
  {
    name: 'bruh.mp3',
    description: 'Tiếng bruh',
    duration: 0.8,
    frequency: 700
  },
  {
    name: 'vine-boom.mp3',
    description: 'Tiếng vine boom',
    duration: 0.5,
    frequency: 200
  },
  {
    name: 'background-music.mp3',
    description: 'Nhạc nền game (looping, upbeat)',
    duration: 60.0,
    frequency: 440
  }
];

const soundsDir = path.join(__dirname, 'web', 'public', 'sounds');

console.log('🎵 Panda Monopoly - Sound File Generator');
console.log('=======================================\n');

// Check if ffmpeg is available
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
  console.log('✅ ffmpeg detected\n');
} catch (error) {
  console.log('❌ ffmpeg not found. Please install ffmpeg first:');
  console.log('   Windows: https://ffmpeg.org/download.html');
  console.log('   Mac: brew install ffmpeg');
  console.log('   Linux: sudo apt-get install ffmpeg\n');
  console.log('📝 Or manually download sound files from:');
  console.log('   - https://freesound.org/');
  console.log('   - https://mixkit.co/free-sound-effects/');
  console.log('   - https://www.zapsplat.com/\n');
  process.exit(1);
}

console.log('📋 Files needed:\n');
missingFiles.forEach((file, index) => {
  console.log(`${index + 1}. ${file.name}`);
  console.log(`   ${file.description}`);
  console.log(`   Duration: ${file.duration}s, Frequency: ${file.frequency}Hz\n`);
});

console.log('\n💡 Recommendations:');
console.log('   1. Download professional sound effects from free libraries');
console.log('   2. Use this script to generate silent placeholders for testing');
console.log('   3. Replace placeholders with real sounds later\n');

// Function to create silent audio file
function createSilentAudio(filename, duration) {
  const outputPath = path.join(soundsDir, filename);
  
  // Create silent audio with ffmpeg
  const command = `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${duration} -q:a 9 -acodec libmp3lame "${outputPath}" -y`;
  
  try {
    execSync(command, { stdio: 'ignore' });
    console.log(`✅ Created: ${filename}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to create: ${filename}`);
    return false;
  }
}

// Ask user if they want to create silent placeholders
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('\n🔧 Create silent placeholder files for testing? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n📦 Creating placeholder files...\n');
    
    let successCount = 0;
    missingFiles.forEach(file => {
      if (createSilentAudio(file.name, file.duration)) {
        successCount++;
      }
    });
    
    console.log(`\n✅ Created ${successCount}/${missingFiles.length} placeholder files`);
    console.log('⚠️  Remember to replace these with real sound effects!\n');
  } else {
    console.log('\n📝 Please download sound files manually and place them in:');
    console.log(`   ${soundsDir}\n`);
  }
  
  readline.close();
});
