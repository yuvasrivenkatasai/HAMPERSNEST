import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { ExportJob } from '../database/models.js';

const EXPORTS_DIR = path.join(process.cwd(), 'tmp', 'exports');
const JOB_TTL_MS = 24 * 60 * 60 * 1000;

export const ensureExportsDir = () => {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  }
  return EXPORTS_DIR;
};

export const getExportsDir = () => EXPORTS_DIR;

// Mark any "running" or "pending" jobs as failed on boot (process died mid-job).
export const resetOrphanedJobs = async () => {
  try {
    const orphans = await ExportJob.findAll({
      where: { status: { [Op.in]: ['pending', 'running'] } }
    });
    for (const job of orphans) {
      job.status = 'failed';
      job.error = 'Server restarted while job was running.';
      await job.save();
    }
    if (orphans.length) {
      console.log(`[jobRunner] Marked ${orphans.length} orphaned export job(s) as failed.`);
    }
  } catch (err) {
    console.error('[jobRunner] Failed to reset orphaned jobs:', err.message);
  }
};

// Delete expired job files + rows.
export const sweepExpiredJobs = async () => {
  try {
    const expired = await ExportJob.findAll({
      where: { expiresAt: { [Op.lt]: new Date() } }
    });
    for (const job of expired) {
      if (job.filePath && fs.existsSync(job.filePath)) {
        try { fs.unlinkSync(job.filePath); } catch (e) { /* noop */ }
      }
      await job.destroy();
    }
  } catch (err) {
    console.error('[jobRunner] sweep error:', err.message);
  }
};

/**
 * Enqueue a background job. The handler runs asynchronously; this function
 * returns the created job row immediately. Handler receives (job, report).
 *   report(progress:int 0-100, message:string) persists progress to DB.
 */
export const enqueue = async (type, handler, { createdBy } = {}) => {
  ensureExportsDir();
  // Opportunistic sweep (cheap: a few rows at most).
  sweepExpiredJobs().catch(() => {});

  const job = await ExportJob.create({
    id: crypto.randomUUID(),
    type,
    status: 'pending',
    progress: 0,
    message: 'Queued',
    expiresAt: new Date(Date.now() + JOB_TTL_MS),
    createdBy: createdBy || null
  });

  const report = async (progress, message) => {
    try {
      job.progress = Math.max(0, Math.min(100, Math.round(progress)));
      if (message !== undefined) job.message = String(message).slice(0, 255);
      await job.save();
    } catch (e) { /* noop */ }
  };

  setImmediate(async () => {
    try {
      job.status = 'running';
      job.message = 'Starting';
      await job.save();
      await handler(job, report);
      // Handler is expected to set filePath, fileName, fileSize and progress=100.
      if (job.status === 'running') {
        job.status = 'done';
        job.progress = 100;
        if (!job.message) job.message = 'Completed';
        await job.save();
      }
    } catch (err) {
      console.error(`[jobRunner] Job ${job.id} (${type}) failed:`, err);
      try {
        job.status = 'failed';
        job.error = err?.message || String(err);
        job.message = 'Failed';
        await job.save();
      } catch (e) { /* noop */ }
    }
  });

  return job;
};
