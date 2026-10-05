import assert from 'node:assert/strict';
import { adminRead, invalidateAdminReads } from '../lib/admin-read-cache.ts';
import { rateLimit } from '../lib/rate-limit.ts';

const payload = {};
const user = { collection: 'users', id: 1, role: 'editor', updatedAt: 'first' };
let calls = 0;
const read = async () => ++calls;
const originalNow = Date.now;
let now = originalNow();
Date.now = () => now;
try {
  await Promise.all([adminRead(payload, user, 'reminders', read, 15_000), adminRead(payload, user, 'reminders', read, 15_000)]);
  assert.equal(calls, 1);
  now += 14_999;
  await adminRead(payload, user, 'reminders', read, 15_000);
  assert.equal(calls, 1);
  now++;
  await adminRead(payload, user, 'reminders', read, 15_000);
  assert.equal(calls, 2);
  await adminRead(payload, { ...user, id: 2 }, 'reminders', read, 15_000);
  await adminRead(payload, { ...user, role: 'admin' }, 'reminders', read, 15_000);
  assert.equal(calls, 4);
  invalidateAdminReads(payload);
  await adminRead(payload, user, 'reminders', read, 15_000);
  assert.equal(calls, 5);
  await assert.rejects(adminRead(payload, user, 'failure', async () => { throw Error('test'); }));
  assert.equal(await adminRead(payload, user, 'failure', async () => 'recovered'), 'recovered');
  for (let i = 0; i < 60; i++) assert.equal(rateLimit('reminder-test', 60, 60_000).ok, true);
  assert.equal(rateLimit('reminder-test', 60, 60_000).ok, false);
  now += 60_000;
  assert.equal(rateLimit('reminder-test', 60, 60_000).ok, true);
  console.log('Admin cache TTL, deduplication, role/user isolation, invalidation, failure recovery and rate limit passed.');
} finally { Date.now = originalNow; }
