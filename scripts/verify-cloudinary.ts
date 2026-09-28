import assert from 'node:assert/strict';
import { getPayload, createLocalReq } from 'payload';
import { v2 as cloudinary } from 'cloudinary';
import { getFileHandler } from '../node_modules/payload/dist/uploads/endpoints/getFile.js';
import { cloudinaryAsset, publicMediaURL } from '../lib/cloudinary-storage';

process.env.PAYLOAD_PUSH_SCHEMA = 'false';
process.env.SMTP_HOST = '';
const { default: config } = await import('../payload/payload.config');
const payload = await getPayload({ config });
try {
  assert.equal(process.env.UPLOAD_STORAGE, 'cloudinary');
  const publicFile = await fetch(publicMediaURL('demo-qa-image.png'));
  assert.equal(publicFile.status, 200, 'Public demo image should load');
  await publicFile.body?.cancel();
  const asset = cloudinaryAsset('documents', 'demo-qa-document-1.png');
  const unsigned = cloudinary.url(asset.public_id, {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, secure: true,
    resource_type: 'raw', type: 'authenticated',
  });
  const denied = await fetch(unsigned);
  assert.ok([401, 403, 404].includes(denied.status), 'Unsigned private document must not be publicly accessible');
  await denied.body?.cancel();
  const { docs } = await payload.find({ collection: 'documents', where: { filename: { equals: 'demo-qa-document-1.png' } }, depth: 0 });
  assert.equal(docs.length, 1);
  const application = await payload.findByID({ collection: 'applications', id: docs[0].application as number, depth: 0 });
  const staff = await payload.findByID({ collection: 'users', id: application.assignedTo as number, depth: 0 });
  const admins = await payload.find({ collection: 'users', where: { role: { equals: 'admin' } }, limit: 1 });
  const routeParams = { collection: 'documents', filename: 'demo-qa-document-1.png' };
  for (const account of [admins.docs[0], staff]) {
    const req = await createLocalReq({ user: { ...account, collection: 'users' }, req: { routeParams } }, payload);
    const response = await getFileHandler(req);
    assert.equal(response.status, 200, 'Admin and assignee must be able to download');
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
    assert.equal(response.headers.get('Location'), null);
    assert.ok((await response.arrayBuffer()).byteLength > 0);
  }
  const anonymous = await createLocalReq({ req: { routeParams, user: null } }, payload);
  await assert.rejects(async () => getFileHandler(anonymous));
  // Exercise the actual assignment query with an unrelated staff principal, without creating an account.
  const unrelated = await createLocalReq({ user: { ...staff, collection: 'users', id: -1, role: 'editor' }, req: { routeParams } }, payload);
  await assert.rejects(async () => getFileHandler(unrelated));
  console.log('PASS: public image, unsigned-document denial, admin/assignee downloads, anonymous and unrelated-staff denial. No records changed.');
} finally { await payload.destroy(); }
