import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Generate an SVG buffer for the text watermark
 */
function createTextWatermarkSVG(text, width, height, opacity = 0.18, size = 'Medium') {
  // Rough scaling based on size
  let fontSize = Math.max(24, Math.floor(width / 15)); // Default Medium
  if (size === 'Small') fontSize = Math.floor(fontSize * 0.5); // Visibly smaller
  if (size === 'Large') fontSize = Math.floor(fontSize * 2.0); // Visibly larger

  // Increase bounding box width multiplier to prevent text from being cut off with wide fonts
  const textWidth = Math.floor(text.length * fontSize * 0.85);
  const textHeight = Math.floor(fontSize * 1.8);

  return Buffer.from(`
    <svg width="${textWidth}" height="${textHeight}">
      <text 
        x="50%" y="50%" 
        text-anchor="middle" 
        alignment-baseline="middle" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}px" 
        font-weight="bold" 
        fill="rgba(255, 255, 255, ${opacity})"
        stroke="rgba(0, 0, 0, ${opacity * 0.5})"
        stroke-width="1"
      >
        ${text}
      </text>
    </svg>
  `);
}

/**
 * Process a single image buffer, applying a watermark if requested
 * Returns a buffer.
 */
export async function generateWatermarkedImage(buffer, options = {}) {
  const {
    enableWatermark = true,
    watermarkText = 'Hampers Nest',
    position = 'Center',
    opacity = 0.18,
    size = 'Medium'
  } = options;

  if (!enableWatermark) {
    // Just return webp buffer
    return await sharp(buffer).webp({ quality: 80 }).toBuffer();
  }

  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const watermarkSvg = createTextWatermarkSVG(
      watermarkText, 
      metadata.width, 
      metadata.height, 
      opacity, 
      size
    );

    let gravity = 'center';
    switch (position) {
      case 'Top Left': gravity = 'northwest'; break;
      case 'Top Right': gravity = 'northeast'; break;
      case 'Bottom Left': gravity = 'southwest'; break;
      case 'Bottom Right': gravity = 'southeast'; break;
      case 'Center':
      default:
        gravity = 'center';
        break;
    }

    return await image
      .composite([
        {
          input: watermarkSvg,
          gravity: gravity
        }
      ])
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('Watermark generation failed:', error);
    // fallback to normal webp
    return await sharp(buffer).webp({ quality: 80 }).toBuffer();
  }
}
