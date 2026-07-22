import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateWatermarkedImage } from './utils/imageProcessor.js';
import { Product } from './database/models.js';

// Setup env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const LOGO_PATH = path.join(__dirname, 'assets', 'official-watermark.png');

async function verifyLogo() {
  if (!fs.existsSync(LOGO_PATH)) {
    throw new Error(`[ABORT] Official watermark asset not found at: ${LOGO_PATH}`);
  }
  try {
    const metadata = await sharp(LOGO_PATH).metadata();
    if (!metadata.hasAlpha) {
      throw new Error(`[ABORT] Official watermark exists but does NOT have a transparent alpha channel.`);
    }
  } catch (err) {
    throw new Error(`[ABORT] Failed to load official watermark asset: ${err.message}`);
  }
}

async function runMigration() {
  try {
    console.log('====================================================');
    console.log('WATERMARK V2 MIGRATION (FULL PURGE)');
    console.log('====================================================');
    
    console.log('[1/4] Verifying new asset...');
    await verifyLogo();
    console.log('  -> official-watermark.png is valid and transparent.\\n');

    console.log('[2/4] Connecting to database...');
    
    const products = await Product.findAll();
    console.log(`  -> Found ${products.length} products to process.\\n`);
    
    let stats = {
      processed: 0,
      imagesRegenerated: 0,
      thumbRegenerated: 0,
      mediumRegenerated: 0,
      largeRegenerated: 0,
      failed: 0,
      skipped: 0,
      startTime: Date.now()
    };

    console.log('[3/4] Starting migration...\\n');

    for (const product of products) {
      let imagePaths = [];
      if (product.image) imagePaths.push(product.image);
      
      let galleryImages = [];
      try {
        galleryImages = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
      } catch (e) {
        galleryImages = [];
      }
      
      if (Array.isArray(galleryImages)) {
        imagePaths.push(...galleryImages);
      }

      if (imagePaths.length === 0) {
        stats.skipped++;
        continue;
      }
      
      let productSuccessCount = 0;
      let productFailed = false;
      let updatedGallery = [];

      for (let imgStr of imagePaths) {
          try {
            const urlObj = new URL(imgStr, 'http://localhost'); // add base in case relative
            let baseRelativePath = urlObj.pathname.replace('_watermarked', '').replace('_original', '');
            
            // Remove leading /uploads if present and join
            if (baseRelativePath.startsWith('/uploads')) {
              baseRelativePath = baseRelativePath.substring(1);
            }
            
            const absoluteBasePath = path.join(__dirname, 'public', baseRelativePath);
            const absoluteOriginalPath = absoluteBasePath.replace('.webp', '_original.webp');

            // 1. Identify the pristine original
            let pristineSource = '';
            if (fs.existsSync(absoluteOriginalPath)) {
                pristineSource = absoluteOriginalPath;
            } else if (fs.existsSync(absoluteBasePath)) {
                await fs.promises.copyFile(absoluteBasePath, absoluteOriginalPath);
                pristineSource = absoluteOriginalPath;
            } else {
                console.warn(`[WARN] Original image missing for Product ${product.id}: ${baseRelativePath}`);
                updatedGallery.push(imgStr.replace('_watermarked', '')); // keep track of best guess
                continue;
            }

            // 2. Read pristine buffer
            const originalBuffer = await fs.promises.readFile(pristineSource);

            // 3. Generate new clean variants + watermarks
            const dir = path.dirname(absoluteBasePath);
            const ext = path.extname(absoluteBasePath);
            const baseName = path.basename(absoluteBasePath, ext);
            
            const variants = [
                { suffix: '', width: null, height: null, fit: null, target: absoluteBasePath },
                { suffix: '_large', width: 1200, height: 1200, fit: 'inside', target: path.join(dir, `${baseName}_large.webp`) },
                { suffix: '_medium', width: 800, height: 800, fit: 'inside', target: path.join(dir, `${baseName}_medium.webp`) },
                { suffix: '_thumbnail', width: 400, height: 400, fit: 'cover', target: path.join(dir, `${baseName}_thumbnail.webp`) }
            ];

            for (const v of variants) {
                const tmpTarget = `${v.target}.tmp`;
                try {
                    let resizedBuffer = originalBuffer;
                    if (v.width && v.height) {
                        resizedBuffer = await sharp(originalBuffer)
                            .resize(v.width, v.height, { fit: v.fit, withoutEnlargement: true })
                            .webp({ quality: 80 })
                            .toBuffer();
                    }

                    const watermarkedBuffer = await generateWatermarkedImage(resizedBuffer, { enableWatermark: true });
                    
                    await fs.promises.writeFile(tmpTarget, watermarkedBuffer);
                    await fs.promises.rename(tmpTarget, v.target);
                    
                    productSuccessCount++;
                    if (v.suffix === '') stats.imagesRegenerated++;
                    if (v.suffix === '_large') stats.largeRegenerated++;
                    if (v.suffix === '_medium') stats.mediumRegenerated++;
                    if (v.suffix === '_thumbnail') stats.thumbRegenerated++;
                    
                    const legacyPath = path.join(dir, `${baseName}${v.suffix}_watermarked.webp`);
                    if (fs.existsSync(legacyPath)) {
                        await fs.promises.unlink(legacyPath).catch(() => {});
                    }
                } catch (err) {
                    console.error(`[ERROR] Failed to generate variant ${v.suffix} for product ${product.id}: ${err.message}`);
                    if (fs.existsSync(tmpTarget)) {
                        await fs.promises.unlink(tmpTarget).catch(() => {});
                    }
                    throw err;
                }
            }
            
            // Clean up DB URL
            updatedGallery.push(imgStr.replace('_watermarked', ''));
          } catch (err) {
            console.error(`[FAILED] processing image ${imgStr} for Product ID ${product.id}: ${err.message}`);
            productFailed = true;
          }
      }

      if (!productFailed) {
         if (product.image) product.image = updatedGallery[0];
         if (galleryImages.length > 0) {
            product.images = JSON.stringify(updatedGallery.slice(product.image ? 1 : 0));
         }
         await product.save();
         console.log(`[SUCCESS] Product ID ${product.id} processed (${productSuccessCount} variants)`);
         stats.processed++;
      } else {
         stats.failed++;
      }
    }

    console.log('\\n====================================================');
    console.log('MIGRATION COMPLETED');
    console.log('====================================================');
    console.log(`Products Processed      : ${stats.processed}`);
    console.log(`Images Regenerated      : ${stats.imagesRegenerated}`);
    console.log(`Thumbnails Regenerated  : ${stats.thumbRegenerated}`);
    console.log(`Medium Images Regenerated: ${stats.mediumRegenerated}`);
    console.log(`Large Images Regenerated : ${stats.largeRegenerated}`);
    console.log(`Failed                  : ${stats.failed}`);
    console.log(`Skipped                 : ${stats.skipped}`);
    const timeTaken = Math.round((Date.now() - stats.startTime) / 1000);
    const min = Math.floor(timeTaken / 60);
    const sec = timeTaken % 60;
    console.log(`Time Taken              : ${min} min ${sec} sec`);
    console.log('====================================================\\n');
    console.log('NOTE: Please clear your browser cache or CDN cache to see the new watermarks immediately.');

  } catch (err) {
    console.error(`\\n[FATAL ERROR] Migration aborted: ${err.message}`);
  } finally {
    process.exit(0);
  }
}

runMigration();
