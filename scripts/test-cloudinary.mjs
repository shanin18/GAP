import assert from 'node:assert/strict';
import { v2 as sdk } from 'cloudinary';
import { cloudinaryAdapter, cloudinaryAsset, publicMediaURL, uploadCloudinaryFile } from '../lib/cloudinary-storage.ts';
import { validateEnvironment } from '../lib/validate-environment.mjs';

Object.assign(process.env, { CLOUDINARY_CLOUD_NAME: 'qa-cloud', CLOUDINARY_API_KEY: 'test-key', CLOUDINARY_API_SECRET: 'test-secret' });
assert.throws(() => cloudinaryAsset('documents', '../passport.pdf'), /filename/);
assert.throws(() => cloudinaryAsset('media', 'file.html'), /filename/);
assert.equal(cloudinaryAsset('documents', 'passport.pdf').type, 'authenticated');
assert.equal(cloudinaryAsset('documents', 'passport.pdf').resource_type, 'raw');
assert.equal(cloudinaryAsset('media', 'photo.png').type, 'upload');
assert.notEqual(cloudinaryAsset('media', 'photo.png').public_id, cloudinaryAsset('documents', 'photo.png').public_id);
assert.match(publicMediaURL('photo.png'), /^https:\/\/res\.cloudinary\.com\/qa-cloud\/image\/upload\//);
assert.throws(() => validateEnvironment({ UPLOAD_STORAGE: 'cloudinary' }, false), /CLOUDINARY_API_SECRET is required/);
assert.throws(() => validateEnvironment({ VERCEL: '1', UPLOAD_STORAGE: 'local' }, false), /not persistent/);
assert.doesNotThrow(() => validateEnvironment({ UPLOAD_STORAGE: 'cloudinary', ...process.env }, false));

const originalDelete = sdk.uploader.destroy;
const originalFetch = globalThis.fetch;
try {
  let options;
  globalThis.fetch = async (url, opts) => {
    options = { type: opts.body.get('type'), resource_type: url.includes('/raw/') ? 'raw' : 'image' };
    assert.equal(opts.method, 'POST');
    assert.ok(opts.body.get('signature'));
    assert.ok(opts.body.get('file') instanceof Blob);
    return Response.json({ public_id: opts.body.get('public_id') });
  };
  await uploadCloudinaryFile('documents', 'passport.pdf', Buffer.from('test'));
  assert.equal(options.type, 'authenticated');
  assert.equal(options.resource_type, 'raw');
  await uploadCloudinaryFile('media', 'photo.png', Buffer.from('test'));
  assert.equal(options.type, 'upload');
  const adapter = cloudinaryAdapter({ collection: { slug: 'documents' } });
  sdk.uploader.destroy = async (id, opts) => { options = { id, ...opts }; return { result: 'ok' }; };
  await adapter.handleDelete({ filename: 'passport.pdf' });
  assert.equal(options.type, 'authenticated');
  let fetches = 0;
  globalThis.fetch = async url => {
    fetches++;
    assert.match(url, /\/raw\/authenticated\/s--/);
    return new Response('protected test file');
  };
  const args = { doc: { id: 1, filename: 'passport.pdf', mimeType: 'application/pdf' }, params: { filename: 'passport.pdf' } };
  assert.equal((await adapter.staticHandler({ user: null }, args)).status, 404);
  assert.equal(fetches, 0);
  const response = await adapter.staticHandler({ user: { id: 8 } }, args);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(response.headers.get('Location'), null);
  assert.equal(response.headers.get('Content-Type'), 'application/pdf');
  assert.equal(await response.text(), 'protected test file');
  let checkedAccess = false;
  const adminReq = { user: { id: 1 }, payload: { find: async opts => {
    checkedAccess = opts.overrideAccess === false;
    return { docs: [args.doc] };
  } } };
  assert.equal((await adapter.staticHandler(adminReq, { params: args.params })).status, 200);
  assert.equal(checkedAccess, true);
  globalThis.fetch = async () => new Response(null, { status: 404 });
  assert.equal((await adapter.staticHandler({ user: { id: 8 } }, args)).status, 404);
  console.log('Cloudinary tests passed: upload types, deletion, URL isolation, guarded downloads, errors and environment validation.');
} finally {
  sdk.uploader.destroy = originalDelete;
  globalThis.fetch = originalFetch;
}
