const sharp = require('sharp');
const path = require('path');

const files = [
  'Logo_bg.png',
  'adaptive_icon.png',
  'splash_icon.png'
];

async function checkDimensions() {
  console.log('\n📱 Icon Dimension Check:\n');
  
  for (const file of files) {
    const filePath = path.join(__dirname, '../assets/images', file);
    try {
      const metadata = await sharp(filePath).metadata();
      const hasAlpha = metadata.channels === 4;
      console.log(`${file}:`);
      console.log(`  Size: ${metadata.width}x${metadata.height}`);
      console.log(`  Transparency: ${hasAlpha ? 'Yes' : 'No'}`);
      console.log(`  Format: ${metadata.format}`);
      console.log('');
    } catch (err) {
      console.log(`${file}: ❌ Error - ${err.message}\n`);
    }
  }
  
  console.log('✅ Recommendations:');
  console.log('  - iOS icon (Logo_bg.png): Should be 1024x1024');
  console.log('  - Android adaptive (adaptive_icon.png): Should be 1024x1024 with padding');
  console.log('  - Splash (splash_icon.png): Flexible, but 1284x2778 recommended for best quality\n');
}

checkDimensions();
