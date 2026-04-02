const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, '../assets/images/Logo_bg.png');
const output = path.join(__dirname, '../assets/images/adaptive_icon.png');

// Canvas is 1024x1024, logo scaled to 660px (64% of canvas) centered
// This ensures the full logo is visible within Android's safe zone
const canvasSize = 1024;
const logoSize = 660;
const offset = Math.floor((canvasSize - logoSize) / 2); // 182px padding on each side

sharp(input)
  .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer()
  .then(resizedLogo => {
    return sharp({
      create: {
        width: canvasSize,
        height: canvasSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: resizedLogo, top: offset, left: offset }])
    .png()
    .toFile(output);
  })
  .then(() => console.log(`Done! Saved to ${output}`))
  .catch(err => console.error('Error:', err));
