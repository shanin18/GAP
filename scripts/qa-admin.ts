import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { getPayload } from 'payload';
import config from '../payload/payload.config';

// Creates only a disposable QA user, then removes that exact user in finally.
// The browser navigates and inspects layouts without saving collection documents.
assert.ok(process.argv.includes('write-fixture'), 'Pass write-fixture to create the temporary QA user.');
const payload = await getPayload({ config });
const email = `ui-qa-${randomUUID()}@example.invalid`;
const password = randomUUID() + randomUUID();
let id: number | undefined;
try {
  const user = await payload.create({ collection: 'users', data: { email, password, role: 'admin' } });
  id = user.id;
  const { token } = await payload.login({ collection: 'users', data: { email, password } });
  assert.ok(token);
  const exitCode = await new Promise<number | null>((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/qa-ui.mjs', '--admin'], {
      windowsHide: true, stdio: 'inherit', env: { ...process.env, QA_AUTH_TOKEN: token },
    });
    child.once('error', reject);
    child.once('exit', resolve);
  });
  assert.equal(exitCode, 0, 'Admin browser QA');
} finally {
  if (id !== undefined) await payload.delete({ collection: 'users', id, overrideAccess: true });
  await payload.destroy();
  console.log('Removed temporary Admin QA user.');
}
