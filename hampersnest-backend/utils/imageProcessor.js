import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Define the path to the official logo
// We assume this file exists at `hampersnest-backend/assets/official-watermark.png`
const LOGO_PATH = path.join(process.cwd(), 'assets', 'official-watermark.png');

const DEFAULT_WATERMARK_POSITION = 'center';
const DEFAULT_WATERMARK_OPACITY = 0.60;
/**
 * Process a single image buffer, applying a premium logo watermark if requested
 * Returns a high-quality processed buffer.
 */
export async function generateWatermarkedImage(buffer, options = {}) {
  const {
    enableWatermark = true,
    position = 'center', // Configurable position, defaults to center
    scalePercent = 0.35    // 35% of image width
  } = options;

  if (!enableWatermark) {
    // Just return optimized webp buffer, keeping metadata
    return await sharp(buffer).withMetadata().webp({ quality: 90, effort: 4 }).toBuffer();
  }

  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // 1. Automatic padding based on image size (2-3% of width)
    let padding = Math.floor(metadata.width * 0.025);
    padding = Math.max(20, Math.min(padding, 40)); // Clamp between 20px and 40px

    let watermarkWidth = Math.floor(metadata.width * scalePercent);
    // Ensure watermark doesn't get too small, but also doesn't exceed image width when padded
    watermarkWidth = Math.max(80, Math.min(watermarkWidth, metadata.width - (padding * 2)));

    // Calculate positions
    let left = padding;
    let top = padding;

    // Support configurable positioning (Top Left, Top Right, Bottom Left, Bottom Right)
    if (position.includes('Right')) {
        left = metadata.width - watermarkWidth - padding;
    }
    if (position.includes('Bottom')) {
        // We need the watermark height to precisely position it on the bottom
        // But since we preserve aspect ratio, we'll let sharp's gravity handle corner positioning 
        // if we didn't want to calculate height. For precise padding, we'll calculate it.
    }

    // 2. Determine gravity position
    // As per global update requirements, watermark is placed at center
    const gravity = DEFAULT_WATERMARK_POSITION;

    // 3. Process the logo watermark (Resize)
    const logoBuffer = await fs.promises.readFile(LOGO_PATH);
    
    const resizedLogo = await sharp(logoBuffer)
      .resize({ width: watermarkWidth })
      .png()
      .toBuffer();

    const logoMeta = await sharp(resizedLogo).metadata();
    const logoB64 = resizedLogo.toString('base64');
    
    // Wrap in SVG for extreme transparency (using DEFAULT_WATERMARK_OPACITY)
    const svgOpacityWrapper = Buffer.from(`
      <svg width="${logoMeta.width}" height="${logoMeta.height}">
        <image href="data:image/png;base64,${logoB64}" width="100%" height="100%" opacity="${DEFAULT_WATERMARK_OPACITY}"/>
      </svg>
    `);

    const processedLogo = await sharp(svgOpacityWrapper).png().toBuffer();

    // 4. Apply watermark to image
    // If it's a corner gravity, we can just pad the logo itself to push it away from the edges
    // This perfectly respects Sharp's gravity positioning while providing exact padding
    const paddedLogo = await sharp(processedLogo)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    // 5. Generate final high quality image
    return await image
      .withMetadata() // Preserve orientation and useful metadata
      .composite([
        {
          input: paddedLogo,
          gravity: gravity
        }
      ])
      .webp({ 
        quality: 90, 
        effort: 4, 
        smartSubsample: true 
      })
      .toBuffer();
  } catch (error) {
    console.error('Watermark generation failed:', error);
    // fallback to high quality optimized webp
    return await sharp(buffer).withMetadata().webp({ quality: 90, effort: 4 }).toBuffer();
  }
}
