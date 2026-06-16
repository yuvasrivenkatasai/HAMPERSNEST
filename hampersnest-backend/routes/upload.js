import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { protect } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize S3/R2 client if config is available
const isR2Configured = () => {
  return (
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_ENDPOINT &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL
  );
};

let r2Client = null;
if (isR2Configured()) {
  let endpoint = process.env.R2_ENDPOINT;
  const bucketName = process.env.R2_BUCKET_NAME;
  if (bucketName && endpoint.endsWith(`/${bucketName}`)) {
    endpoint = endpoint.slice(0, -(bucketName.length + 1));
  }

  r2Client = new S3Client({
    endpoint: endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    region: 'auto',
  });
}

// @desc    Upload image, convert to webp and save to R2/Local
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }

  try {
    // Parse target directory from query param (allow products, gallery, general, hero)
    const allowedFolders = ['products', 'gallery', 'general', 'hero'];
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

    // Generate a unique filename with .webp extension
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;

    // Process image buffer and convert to WebP using sharp
    const webpBuffer = await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .toBuffer();

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
      const key = `${uploadSubfolder}/${filename}`;
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: webpBuffer,
        ContentType: 'image/webp',
      });

      await r2Client.send(command);

      // Clean public URL trailing slash
      const publicUrlBase = process.env.R2_PUBLIC_URL.endsWith('/') 
        ? process.env.R2_PUBLIC_URL.slice(0, -1) 
        : process.env.R2_PUBLIC_URL;
        
      imageUrl = `${publicUrlBase}/${key}`;
      console.log(`Successfully uploaded to R2: ${imageUrl}`);
    } else {
      console.log(`No R2 Credentials config. Falling back to local storage uploads folder: ${uploadSubfolder}...`);
      
      // Ensure target directory exists
      const uploadDir = path.join(__dirname, `../public/uploads/${uploadSubfolder}`);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, webpBuffer);
      
      // Return relative/absolute URL
      const host = req.get('host');
      const protocol = req.protocol;
      imageUrl = `${protocol}://${host}/uploads/${uploadSubfolder}/${filename}`;
      console.log(`Successfully saved locally: ${imageUrl}`);
    }

    res.status(200).json({ url: imageUrl, filename, size: sizeStr, dimensions });
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
    const allowedFolders = ['products', 'gallery', 'general', 'hero'];
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
