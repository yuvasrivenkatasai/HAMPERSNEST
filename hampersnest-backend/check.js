import { Setting } from './database/models.js';

async function check() {
  try {
    const res = await Setting.upsert({ key: 'facebookUrl', value: null });
    console.log('Success upserting NULL:', res);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit();
  }
}
check();
