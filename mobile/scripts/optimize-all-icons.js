const sharp = require('sharp');
const path = require('path');

async function optimizeIcons() {
  const assetsDir = path.join(__dirname, '../assets/images');
  
  console.log('🎨 Optimizing icons for production...\n');
  
  // 1. iOS icon - 1024x1024, no transparency
  console.log('📱 Creating iOS icon (Logo_bg.png)...');
  await sharp(path.join(assetsDir, 'Logo.png'))
    .resize(1024, 1024, { fit: 'contain', background: { r: 143, g: 35, b: 29, alpha: 1 } })
    .flatten({ background: { r: 143, g: 35, b: 29 } })
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, 'Logo_bg_optimized.png'));
  console.log('  ✅ 1024x1024, no transparency\n');
  
  // 2. Android adaptive icon - 1024x1024 with padding, transparent
  console.log('🤖 Creating Android adaptive icon (adaptive_icon.png)...');
  const logoBuffer = await sharp(path.join(assetsDir, 'Logo.png'))
    .resize(660, 660, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: logoBuffer, top: 182, left: 182 }])
  .png({ quality: 100 })
  .toFile(path.join(assetsDir, 'adaptive_icon_optimized.png'));
  console.log('  ✅ 1024x1024 with 660px logo centered, transparent padding\n');
  
  // 3. Splash screen - keep high res but optimize
  console.log('💦 Creating splash screen (splash_icon.png)...');
  await sharp(path.join(assetsDir, 'Logo.png'))
    .resize(1200, 1200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, 'splash_icon_optimized.png'));
  console.log('  ✅ 1200x1200 for splash screen\n');
  
  console.log('✨ Done! Review the *_optimized.png files and rename them to replace originals if they look good.');
}

optimizeIcons().catch(console.error);
