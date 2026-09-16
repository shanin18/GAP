import assert from 'node:assert/strict';

const base = process.env.QA_BASE_URL || 'http://localhost:3000';
const routes = [
  ['/', 'Your next chapter'], ['/services', 'Guidance that turns'],
  ['/country/australia', 'Australia'], ['/country/canada', 'Canada'],
  ['/country/new-zealand', 'New Zealand'], ['/universities', 'University discovery'],
  ['/news', 'GAP Journal'], ['/apply', 'application'], ['/admin', 'Payload'],
];
for (const [path, expected] of routes) {
  const res = await fetch(base + path, { signal: AbortSignal.timeout(45000) });
  const html = await res.text();
  assert.equal(res.status, 200, path);
  assert.ok(html.toLowerCase().includes(expected.toLowerCase()), `${path}: missing content`);
  assert.ok(!html.includes('data-dgst="') && !html.includes('$RX('), `${path}: server-rendered error boundary`);
  console.log(`PASS ${path}: complete response, expected content, no SSR error boundary`);
}
for (const path of ['/country/qa-invalid-slug', '/news/qa-invalid-slug', '/universities/qa-invalid-slug', '/qa-invalid-route']) {
  // HTML-only clients should receive an actual 404, not a streamed 200 shell.
  const res = await fetch(base + path, { headers: { 'User-Agent': 'Googlebot' }, signal: AbortSignal.timeout(45000) });
  const html = await res.text();
  assert.ok(res.status === 404 || html.includes('NEXT_HTTP_ERROR_FALLBACK;404'), `${path}: missing 404`);
  console.log(`PASS ${path}: 404`);
}
const staff = await fetch(base + '/staff', { redirect: 'manual', signal: AbortSignal.timeout(45000) });
const staffHtml = await staff.text();
assert.ok(staff.headers.get('location')?.includes('/admin/login') || staffHtml.includes('NEXT_REDIRECT;replace;/admin/login'), 'Anonymous staff access');
console.log('PASS anonymous staff redirect');
for (const collection of ['users', 'leads', 'applications', 'documents']) {
  const res = await fetch(`${base}/api/${collection}`, { signal: AbortSignal.timeout(45000) });
  assert.ok([401, 403].includes(res.status), `${collection}: anonymous read returned ${res.status}`);
  console.log(`PASS anonymous ${collection} read denied`);
}
