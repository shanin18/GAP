import assert from 'node:assert/strict';
import { verifyTurnstile } from '../lib/turnstile.ts';

const originalFetch = globalThis.fetch;
const names = ['NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY', 'TURNSTILE_ALLOWED_HOSTNAMES', 'NEXT_PUBLIC_SITE_URL'];
const originalEnv = Object.fromEntries(names.map(name => [name, process.env[name]]));
try {
  delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  delete process.env.TURNSTILE_SECRET_KEY;
  assert.equal(await verifyTurnstile(undefined, 'login'), true);
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key';
  assert.equal(await verifyTurnstile('token', 'login'), false);
  process.env.TURNSTILE_SECRET_KEY = 'test-secret';
  process.env.TURNSTILE_ALLOWED_HOSTNAMES = 'localhost,example.com';
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls++;
    assert.equal(options.cache, 'no-store');
    assert.equal(new URLSearchParams(options.body).get('response'), 'token');
    return Response.json({ success: true, action: 'login', hostname: 'example.com' });
  };
  assert.equal(await verifyTurnstile(undefined, 'login'), false);
  assert.equal(await verifyTurnstile('x'.repeat(2049), 'login'), false);
  assert.equal(calls, 0);
  assert.equal(await verifyTurnstile('token', 'login'), true);
  assert.equal(await verifyTurnstile('token', 'lead'), false);
  process.env.TURNSTILE_ALLOWED_HOSTNAMES = '';
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  assert.equal(await verifyTurnstile('token', 'login'), true);
  process.env.TURNSTILE_ALLOWED_HOSTNAMES = 'localhost';
  assert.equal(await verifyTurnstile('token', 'login'), false);
  process.env.TURNSTILE_ALLOWED_HOSTNAMES = 'localhost,example.com';
  globalThis.fetch = async () => Response.json({ success: true, action: 'login', hostname: 'attacker.example' });
  assert.equal(await verifyTurnstile('token', 'login'), false);
  globalThis.fetch = async () => Response.json({ success: false, 'error-codes': ['timeout-or-duplicate'] });
  assert.equal(await verifyTurnstile('token', 'login'), false);
  globalThis.fetch = async () => { throw new Error('Network unavailable'); };
  assert.equal(await verifyTurnstile('token', 'login'), false);
  globalThis.fetch = async () => new Response('Unavailable', { status: 503 });
  assert.equal(await verifyTurnstile('token', 'login'), false);
  console.log('Turnstile verification checks passed: valid, missing, oversized, misconfigured, wrong action/hostname, rejected/replayed token, outage and HTTP error.');
} finally {
  globalThis.fetch = originalFetch;
  for (const name of names) { if (originalEnv[name] === undefined) delete process.env[name]; else process.env[name] = originalEnv[name]; }
}
