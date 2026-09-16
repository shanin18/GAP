import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { getPayload, type CollectionSlug } from 'payload';
import config from '../payload/payload.config';

// Creates synthetic records and removes only those records in finally.
assert.ok(process.argv.includes('write-fixtures'), 'Pass write-fixtures for database-backed QA.');
const base = process.env.QA_BASE_URL || 'http://localhost:3000';
assert.equal(new URL(base).hostname, 'localhost', 'This QA runner targets localhost only.');
const payload = await getPayload({ config });
const created: { collection: CollectionSlug; id: number }[] = [];
const run = `qa-${randomUUID().slice(0, 8)}`;
const password = randomUUID() + randomUUID();
let token = '';
async function request(path: string, method = 'GET', data?: unknown, auth = '') {
  const res = await fetch(base + path, {
    method, headers: { ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(auth ? { Authorization: `JWT ${auth}` } : {}) },
    body: data === undefined ? undefined : JSON.stringify(data), signal: AbortSignal.timeout(60000), redirect: 'manual',
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { html: text }; }
  return { status: res.status, body, headers: res.headers };
}
function track(collection: CollectionSlug, id: number) { created.push({ collection, id }); return id; }
try {
  const first = (await payload.count({ collection: 'users' })).totalDocs === 0;
  const adminEmail = `${run}-admin@example.invalid`;
  if (first) {
    const result = await request('/api/users/first-register', 'POST', { email: adminEmail, password });
    assert.equal(result.status, 200, 'First-user registration');
    track('users', result.body.user.id);
    assert.equal(result.body.user.role, 'admin', 'First user must be admin');
    token = result.body.token;
    console.log('PASS first-user bootstrap creates admin');
  } else {
    const user = await payload.create({ collection: 'users', data: { email: adminEmail, password, role: 'admin' } });
    track('users', user.id);
  }
  const login = await request('/api/users/login', 'POST', { email: adminEmail, password });
  assert.equal(login.status, 200); token = login.body.token;
  const duplicateBootstrap = await request('/api/users/first-register', 'POST', { email: `${run}-forbidden@example.invalid`, password });
  assert.equal(duplicateBootstrap.status, 403);
  const editor = await request('/api/users', 'POST', { email: `${run}-editor@example.invalid`, password, role: 'editor' }, token);
  assert.equal(editor.status, 201); track('users', editor.body.doc.id);
  const editorLogin = await request('/api/users/login', 'POST', { email: `${run}-editor@example.invalid`, password });
  assert.equal(editorLogin.status, 200);
  const editorToken = editorLogin.body.token;
  const elevated = await request(`/api/users/${editor.body.doc.id}`, 'PATCH', { role: 'admin' }, editorToken);
  assert.ok([200, 403].includes(elevated.status));
  assert.equal((await payload.findByID({ collection: 'users', id: editor.body.doc.id })).role, 'editor');
  assert.equal((await request('/api/users', 'POST', { email: `${run}-other@example.invalid`, password }, editorToken)).status, 403);
  for (const auth of [token, editorToken]) {
    const staff = await request('/staff', 'GET', undefined, auth);
    assert.equal(staff.status, 200); assert.ok(staff.body.html.includes('Student pipeline'));
  }
  console.log('PASS admin/editor login, staff dashboard, bootstrap closed and role escalation denied');

  async function create(collection: CollectionSlug, data: object) {
    const result = await request(`/api/${collection}`, 'POST', data, token);
    assert.equal(result.status, 201, `Create ${collection}`);
    return track(collection, result.body.doc.id);
  }
  const country = await create('countries', { name: run, slug: run });
  const otherCountry = await create('countries', { name: `${run}-other`, slug: `${run}-other` });
  const university = await create('universities', { name: run, slug: run, country, description: 'Synthetic QA university', status: 'draft' });
  const news = await create('news', { title: run, slug: run, shortBlurb: 'Synthetic QA article', publishedDate: new Date().toISOString(), status: 'draft' });
  const service = await create('services', { title: run, shortDescription: 'Synthetic QA service' });
  const testimonial = await create('testimonials', { studentName: run, quote: 'Synthetic QA testimonial', university });
  for (const [collection, id] of [['countries', country], ['services', service], ['testimonials', testimonial]] as const) {
    assert.equal((await request(`/api/${collection}/${id}`, 'GET', undefined, editorToken)).status, 200);
    const field = collection === 'countries' ? 'name' : collection === 'services' ? 'title' : 'studentName';
    assert.equal((await request(`/api/${collection}/${id}`, 'PATCH', { [field]: `${run} updated` }, editorToken)).status, 200);
    assert.equal((await request(`/api/${collection}/${id}`, 'DELETE', undefined, editorToken)).status, 403);
  }
  for (const [collection, id] of [['news', news], ['universities', university]] as const) {
    assert.equal((await request(`/api/${collection}/${id}`)).status, 404, 'Draft must not be public');
    assert.equal((await request(`/api/${collection}/${id}`, 'PATCH', { status: 'published' }, editorToken)).status, 200);
    assert.equal((await request(`/api/${collection}/${id}`)).status, 200);
    const page = await request(`/${collection}/${run}`);
    assert.equal(page.status, 200); assert.ok(page.body.html.includes(run));
    assert.equal((await request(`/api/${collection}/${id}`, 'PATCH', { status: 'draft' }, editorToken)).status, 200);
    const hidden = await request(`/${collection}/${run}`);
    assert.ok(hidden.status === 404 || hidden.body.html.includes('NEXT_HTTP_ERROR_FALLBACK;404'));
  }
  console.log('PASS content CRUD permissions, draft privacy, publish/unpublish reflected on pages');
  await request(`/api/universities/${university}`, 'PATCH', { status: 'published' }, token);

  for (const path of ['/api/leads', '/api/applications']) {
    const invalid = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{', signal: AbortSignal.timeout(30000) });
    assert.equal(invalid.status, 400, 'Malformed JSON should be a client error');
    assert.equal((await request(path, 'POST', {})).status, 400);
  }
  const lead = await request('/api/leads', 'POST', { name: run, email: `${run}@example.invalid`, status: 'qualified', staffNotes: 'injected', emailVerified: true });
  assert.equal(lead.status, 201); track('leads', lead.body.id);
  const savedLead = await payload.findByID({ collection: 'leads', id: lead.body.id });
  assert.equal(savedLead.status, 'new'); assert.ok(!savedLead.staffNotes); assert.equal(savedLead.emailVerified, false);
  const applicationInput = { studentName: run, email: `${run}@example.invalid`, countryId: String(country), universityId: String(university), studyLevel: 'Undergraduate', status: 'enrolled', internalNotes: 'injected' };
  assert.equal((await request('/api/applications', 'POST', { ...applicationInput, countryId: '' })).status, 400);
  assert.equal((await request('/api/applications', 'POST', { ...applicationInput, countryId: otherCountry })).status, 400);
  await request(`/api/universities/${university}`, 'PATCH', { status: 'draft' }, token);
  assert.equal((await request('/api/applications', 'POST', applicationInput)).status, 400);
  await request(`/api/universities/${university}`, 'PATCH', { status: 'published' }, token);
  const application = await request('/api/applications', 'POST', applicationInput);
  assert.equal(application.status, 201); assert.match(application.body.reference, /^GAP-\d{8}-/);
  const saved = (await payload.find({ collection: 'applications', where: { reference: { equals: application.body.reference } } })).docs[0];
  assert.ok(saved); track('applications', saved.id);
  assert.equal(saved.status, 'submitted'); assert.ok(!saved.internalNotes); assert.equal(saved.documents?.length, 3);
  for (const collection of ['users', 'leads', 'applications', 'documents']) {
    assert.equal((await request(`/api/${collection}`)).status, 403);
  }
  for (const collection of ['leads', 'applications']) {
    const id = collection === 'leads' ? savedLead.id : saved.id;
    assert.equal((await request(`/api/${collection}/${id}`, 'GET', undefined, editorToken)).status, 200);
    assert.equal((await request(`/api/${collection}/${id}`, 'PATCH', { status: collection === 'leads' ? 'contacted' : 'profile-review' }, editorToken)).status, 200);
    assert.equal((await request(`/api/${collection}/${id}`, 'DELETE', undefined, editorToken)).status, 403);
  }
  console.log('PASS lead/application persistence, validation, workflow injection protection and staff access');

  const form = new FormData();
  form.set('_payload', JSON.stringify({ application: saved.id, documentType: 'other', uploadedBy: editor.body.doc.id }));
  form.set('file', new Blob(['%PDF-1.4\n% Synthetic QA document, no student information\n%%EOF'], { type: 'application/pdf' }), `${run}.pdf`);
  const deniedUpload = await fetch(base + '/api/documents', { method: 'POST', body: form, signal: AbortSignal.timeout(30000) });
  assert.equal(deniedUpload.status, 403);
  const upload = await fetch(base + '/api/documents', { method: 'POST', body: form, headers: { Authorization: `JWT ${editorToken}` }, signal: AbortSignal.timeout(30000) });
  assert.equal(upload.status, 201);
  const document = (await upload.json()).doc; track('documents', document.id);
  const filePath = `/api/documents/file/${document.filename}`;
  assert.equal((await request(filePath)).status, 403);
  const file = await fetch(base + filePath, { headers: { Authorization: `JWT ${editorToken}` }, signal: AbortSignal.timeout(30000) });
  assert.equal(file.status, 200); assert.match(file.headers.get('cache-control') || '', /private.*no-store/);
  assert.match(file.headers.get('content-security-policy') || '', /sandbox/);
  assert.equal((await request(`/api/documents/${document.id}`, 'DELETE', undefined, editorToken)).status, 403);
  console.log('PASS private document upload/download authorization and response headers');
} finally {
  for (const record of created.reverse()) {
    await payload.delete({ collection: record.collection, id: record.id, overrideAccess: true });
  }
  await payload.destroy();
  console.log(`Removed ${created.length} synthetic QA records.`);
}
