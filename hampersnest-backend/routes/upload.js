import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { protect } from '../middleware/auth.js';
import { generateWatermarkedImage } from '../utils/imageProcessor.js';
import { isR2Configured, getR2Client } from '../utils/r2Client.js';

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const r2Client = getR2Client();

// @desc    Upload image, convert to webp and save to R2/Local
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }

  try {
    // Parse target directory from query param (allow products, gallery, general, hero, showcase)
    const allowedFolders = ['products', 'gallery', 'general', 'hero', 'showcase'];
    const folder = allowedFolders.includes(req.query.folder) ? req.query.folder : 'general';

    console.log('[DEBUG UPLOAD] Image Upload Endpoint Called:');
    console.log('  - req.query:', req.query);
    console.log('  - folder:', folder);

    let uploadSubfolder = folder;
    if (folder === 'products' && req.query.productId) {
      const sanitizedProductId = req.query.productId.replace(/[^a-zA-Z0-9-_]/g, '');
      console.log('  - sanitizedProductId:', sanitizedProductId);
      if (sanitizedProductId) {
        uploadSubfolder = `products/${sanitizedProductId}`;
      }
    }
    console.log('  - final uploadSubfolder:', uploadSubfolder);

    // Generate a unique filename prefix
    const filenamePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${filenamePrefix}.webp`;

    // Process image buffer and convert to WebP using sharp
    const webpBuffer = await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .toBuffer();
      
    // Generate different sizes
    const largeBuffer = await sharp(req.file.buffer).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    const mediumBuffer = await sharp(req.file.buffer).resize(800, 800, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    const thumbnailBuffer = await sharp(req.file.buffer).resize(400, 400, { fit: 'cover' }).webp({ quality: 80 }).toBuffer();

    const variants = [
      { suffix: '', buffer: webpBuffer },
      { suffix: '_large', buffer: largeBuffer },
      { suffix: '_medium', buffer: mediumBuffer },
      { suffix: '_thumbnail', buffer: thumbnailBuffer },
    ];

    // Generate watermarked version if options are provided
    let watermarkedFilename = null;
    let watermarkedImageUrl = null;
    
    // Parse watermark options from body or query
    const applyWatermark = req.body.watermarkEnabled === 'true' || req.query.watermarkEnabled === 'true';
    if (applyWatermark) {
      watermarkedFilename = filename.replace('.webp', '_watermarked.webp');
      
      for (const variant of variants) {
         // V2 logic uses official-watermark.png exclusively and ignores text/opacity overrides.
         variant.watermarkedBuffer = await generateWatermarkedImage(variant.buffer, { enableWatermark: true });
      }
    }

    const metadata = await sharp(webpBuffer).metadata();
    const dimensions = `${metadata.width}x${metadata.height}`;
    const sizeBytes = webpBuffer.length;
    let sizeStr = '';
    if (sizeBytes < 1024) sizeStr = `${sizeBytes} B`;
    else if (sizeBytes < 1024 * 1024) sizeStr = `${(sizeBytes / 1024).toFixed(1)} KB`;
    else sizeStr = `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;

    let imageUrl = '';

    if (isR2Configured()) {
      console.log(`R2 Credentials detected. Uploading to Cloudflare R2 folder: ${uploadSubfolder}...`);
      
      const bucketName = process.env.R2_BUCKET_NAME;
      const publicUrlBase = process.env.R2_PUBLIC_URL.endsWith('/') 
        ? process.env.R2_PUBLIC_URL.slice(0, -1) 
        : process.env.R2_PUBLIC_URL;
      
      for (const variant of variants) {
        const vFilename = `${filenamePrefix}${variant.suffix}.webp`;
        const key = `${uploadSubfolder}/${vFilename}`;
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: variant.buffer,
          ContentType: 'image/webp',
        });
        await r2Client.send(command);
        
        if (variant.suffix === '') {
          imageUrl = `${publicUrlBase}/${key}`;
        }
        
        if (applyWatermark && variant.watermarkedBuffer) {
          const wFilename = `${filenamePrefix}${variant.suffix}_watermarked.webp`;
          const wmKey = `${uploadSubfolder}/${wFilename}`;
          const wmCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: wmKey,
            Body: variant.watermarkedBuffer,
            ContentType: 'image/webp',
          });
          await r2Client.send(wmCommand);
          if (variant.suffix === '') {
            watermarkedImageUrl = `${publicUrlBase}/${wmKey}`;
          }
        }
      }
      
      console.log(`Successfully uploaded to R2: ${imageUrl}`);
    } else {
      console.log(`No R2 Credentials config. Falling back to local storage uploads folder: ${uploadSubfolder}...`);
      
      // Ensure target directory exists
      const uploadDir = path.join(__dirname, `../public/uploads/${uploadSubfolder}`);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (const variant of variants) {
        const vFilename = `${filenamePrefix}${variant.suffix}.webp`;
        const filePath = path.join(uploadDir, vFilename);
        await fs.promises.writeFile(filePath, variant.buffer);
        
        if (applyWatermark && variant.watermarkedBuffer) {
          const wFilename = `${filenamePrefix}${variant.suffix}_watermarked.webp`;
          const wmFilePath = path.join(uploadDir, wFilename);
          await fs.promises.writeFile(wmFilePath, variant.watermarkedBuffer);
        }
      }
      
      // Return relative/absolute URL
      const host = req.get('host');
      const protocol = req.protocol;
      imageUrl = `${protocol}://${host}/uploads/${uploadSubfolder}/${filename}`;
      if (applyWatermark) {
        watermarkedImageUrl = `${protocol}://${host}/uploads/${uploadSubfolder}/${watermarkedFilename}`;
      }
      console.log(`Successfully saved locally: ${imageUrl}`);
    }

    res.status(200).json({ 
      url: imageUrl, 
      watermarkedUrl: watermarkedImageUrl,
      filename, 
      watermarkedFilename,
      size: sizeStr, 
      dimensions 
    });
  } catch (error) {
    console.error('Image processing/upload failed:', error);
    res.status(500).json({ message: `Image upload failed: ${error.message}` });
  }
});

// @desc    Upload video, bypass sharp, save to R2/Local
// @route   POST /api/upload/video
// @access  Private/Admin
router.post('/video', protect, upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No video file uploaded' });
  }

  try {
    const allowedFolders = ['products', 'gallery', 'general', 'hero', 'showcase'];
    const folder = allowedFolders.includes(req.query.folder) ? req.query.folder : 'general';

    console.log('[DEBUG VIDEO UPLOAD] Video Upload Endpoint Called:');
    console.log('  - req.query:', req.query);
    console.log('  - folder:', folder);

    let uploadSubfolder = folder;
    if (folder === 'products' && req.query.productId) {
      const sanitizedProductId = req.query.productId.replace(/[^a-zA-Z0-9-_]/g, '');
      console.log('  - sanitizedProductId:', sanitizedProductId);
      if (sanitizedProductId) {
        uploadSubfolder = `products/${sanitizedProductId}`;
      }
    }
    console.log('  - final uploadSubfolder:', uploadSubfolder);

    // Get original extension
    const ext = path.extname(req.file.originalname) || '.mp4';
    const filename = `vid-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    const videoBuffer = req.file.buffer;
    const sizeBytes = videoBuffer.length;
    let sizeStr = '';
    if (sizeBytes < 1024) sizeStr = `${sizeBytes} B`;
    else if (sizeBytes < 1024 * 1024) sizeStr = `${(sizeBytes / 1024).toFixed(1)} KB`;
    else sizeStr = `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;

    let videoUrl = '';

    if (isR2Configured()) {
      console.log(`R2 Credentials detected. Uploading video to Cloudflare R2 folder: ${uploadSubfolder}...`);
      
      const bucketName = process.env.R2_BUCKET_NAME;
      const key = `${uploadSubfolder}/${filename}`;
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: videoBuffer,
        ContentType: req.file.mimetype || 'video/mp4',
      });

      await r2Client.send(command);

      const publicUrlBase = process.env.R2_PUBLIC_URL.endsWith('/') 
        ? process.env.R2_PUBLIC_URL.slice(0, -1) 
        : process.env.R2_PUBLIC_URL;
        
      videoUrl = `${publicUrlBase}/${key}`;
      console.log(`Successfully uploaded video to R2: ${videoUrl}`);
    } else {
      console.log(`No R2 Credentials config. Falling back to local storage video uploads folder: ${uploadSubfolder}...`);
      
      const uploadDir = path.join(__dirname, `../public/uploads/${uploadSubfolder}`);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, videoBuffer);
      
      const host = req.get('host');
      const protocol = req.protocol;
      videoUrl = `${protocol}://${host}/uploads/${uploadSubfolder}/${filename}`;
      console.log(`Successfully saved video locally: ${videoUrl}`);
    }

    res.status(200).json({ url: videoUrl, filename, size: sizeStr });
  } catch (error) {
    console.error('Video upload failed:', error);
    res.status(500).json({ message: `Video upload failed: ${error.message}` });
  }
});

export default router;
