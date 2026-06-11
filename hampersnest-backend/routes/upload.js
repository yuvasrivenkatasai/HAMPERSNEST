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
    // Parse target directory from query param (allow products, gallery, general)
    const allowedFolders = ['products', 'gallery', 'general'];
    const folder = allowedFolders.includes(req.query.folder) ? req.query.folder : 'general';

    // Generate a unique filename with .webp extension
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;

    // Process image buffer and convert to WebP using sharp
    const webpBuffer = await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .toBuffer();

    let imageUrl = '';

    if (isR2Configured()) {
      console.log(`R2 Credentials detected. Uploading to Cloudflare R2 folder: ${folder}...`);
      
      const bucketName = process.env.R2_BUCKET_NAME;
      const key = `${folder}/${filename}`;
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
      console.log(`No R2 Credentials config. Falling back to local storage uploads folder: ${folder}...`);
      
      // Ensure target directory exists
      const uploadDir = path.join(__dirname, `../public/uploads/${folder}`);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, webpBuffer);
      
      // Return relative/absolute URL
      const host = req.get('host');
      const protocol = req.protocol;
      imageUrl = `${protocol}://${host}/uploads/${folder}/${filename}`;
      console.log(`Successfully saved locally: ${imageUrl}`);
    }

    res.status(200).json({ url: imageUrl, filename });
  } catch (error) {
    console.error('Image processing/upload failed:', error);
    res.status(500).json({ message: `Image upload failed: ${error.message}` });
  }
});

export default router;
