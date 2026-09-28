import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { getPayload } from 'payload';
import { uploadCloudinaryFile } from '../lib/cloudinary-storage';

process.env.PAYLOAD_PUSH_SCHEMA = 'false';
process.env.SMTP_HOST = '';
const { default: config } = await import('../payload/payload.config');
const payload = await getPayload({ config });
try {
  const files: { collection: 'media' | 'documents'; filename: string; buffer: Buffer }[] = [];
  // Preflight every local file before uploading anything. Preserve DB IDs and local backups.
  for (const collection of ['media', 'documents'] as const) {
    const { docs } = await payload.find({ collection, pagination: false, depth: 0 });
    const root = path.resolve(collection === 'media' ? 'public/uploads' : 'private-uploads');
    for (const doc of docs) {
      if (!doc.filename) continue;
      const resolved = path.resolve(root, doc.filename);
      if (path.dirname(resolved) !== root) throw new Error('Unsafe upload filename in database.');
      files.push({ collection, filename: doc.filename, buffer: await readFile(resolved) });
    }
  }
  for (const file of files) {
    if (process.argv.includes('--demo-only')) {
      const allowed = /^(demo-qa-image|demo-qa-document-[1-3])\.png$/.test(file.filename);
      const hash = createHash('sha256').update(file.buffer).digest('hex');
      if (!allowed || hash !== '92ec86dbaa8f8a9dc4369f2c92eb09dc250a7a615d71779fc0c51bb3d45dc774') {
        throw new Error('Demo-only migration refuses files other than the verified generated placeholder.');
      }
    }
  }
  for (const file of files) {
    await uploadCloudinaryFile(file.collection, file.filename, file.buffer);
    console.log(`Migrated ${file.collection}/${file.filename}`);
  }
  console.log(`Uploaded ${files.length} existing files. Database records and local originals were preserved.`);
} finally { await payload.destroy(); }
