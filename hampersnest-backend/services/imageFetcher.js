import fs from 'fs';
import path from 'path';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { isR2Configured, getR2Client } from '../utils/r2Client.js';

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (c) => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });

const extFromContentType = (ct) => {
  if (!ct) return '';
  const map = {
    'image/webp': '.webp',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/webm': '.webm'
  };
  return map[ct.split(';')[0].trim().toLowerCase()] || '';
};

const basenameFromUrl = (url) => {
  try {
    const clean = url.split('?')[0].split('#')[0];
    return path.basename(clean) || 'file';
  } catch (e) {
    return 'file';
  }
};

const resolveR2Key = (url) => {
  const publicBase = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');
  if (publicBase && url.startsWith(publicBase + '/')) {
    return url.slice(publicBase.length + 1);
  }
  return null;
};

const resolveLocalPath = (url) => {
  // Site-relative uploads (e.g. "/uploads/products/<id>/file.webp")
  // or absolute URLs that happen to contain "/uploads/..." from the dev server.
  const uploadsIdx = url.indexOf('/uploads/');
  if (uploadsIdx !== -1) {
    const rel = url.substring(uploadsIdx).split('?')[0]; // "/uploads/..."
    return path.join(process.cwd(), 'public', rel);
  }
  const assetsIdx = url.indexOf('/assets/');
  if (assetsIdx !== -1) {
    const rel = url.substring(assetsIdx).split('?')[0];
    return path.join(process.cwd(), 'public', rel);
  }
  return null;
};

/**
 * Fetch an image or video binary by stored URL.
 * Returns { buffer, contentType, basename } or throws.
 */
export const fetchImageBuffer = async (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL');
  }

  const basename = basenameFromUrl(url);

  // 1. R2 object (when public base matches)
  if (isR2Configured()) {
    const key = resolveR2Key(url);
    if (key) {
      const r2 = getR2Client();
      const out = await r2.send(new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key
      }));
      const buffer = await streamToBuffer(out.Body);
      return {
        buffer,
        contentType: out.ContentType || '',
        basename: basename || `object${extFromContentType(out.ContentType)}`
      };
    }
  }

  // 2. Local disk under public/
  const localPath = resolveLocalPath(url);
  if (localPath && fs.existsSync(localPath)) {
    const buffer = fs.readFileSync(localPath);
    return { buffer, contentType: '', basename };
  }

  // 3. Fallback: HTTP fetch for any other absolute URL.
  if (/^https?:\/\//i.test(url)) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${url}`);
    }
    const ab = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || '';
    return {
      buffer: Buffer.from(ab),
      contentType,
      basename: basename || `file${extFromContentType(contentType)}`
    };
  }

  throw new Error(`Could not resolve URL to any source: ${url}`);
};
