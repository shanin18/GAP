// Read-only browser checks. Requires a production build and local Chrome.
// Starts isolated server/browser processes; never submits forms or changes CMS data.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3112';
const output = await mkdtemp(path.join(tmpdir(), 'gap-ui-qa-'));
const browserPath = process.env.QA_BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const server = process.env.QA_BASE_URL ? null : spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3112'], { windowsHide: true, stdio: 'ignore' });
const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9227', `--user-data-dir=${path.join(output, 'profile')}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
let sequence = 0;
const pending = new Map();
const errors = [];
async function until(fn, label, timeout = 45000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { try { const result = await fn(); if (result) return result; } catch {} await pause(100); }
  throw new Error(`Timed out: ${label}`);
}
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result?.value;
}
async function click(expression) {
  await evaluate(`(${expression})?.scrollIntoView({block:'center',behavior:'instant'})`);
  const rect = await evaluate(`(()=>{const e=(${expression});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  assert.ok(rect, `Missing click target: ${expression}`);
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', ...rect, button: 'left', clickCount: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', ...rect, button: 'left', clickCount: 1 });
}
async function escape() {
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
}
async function navigate(route, ready) {
  await command('Page.navigate', { url: base + route });
  await until(() => evaluate(ready), route);
  await pause(450);
}
async function screenshot(name) {
  const shot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(path.join(output, name + '.png'), Buffer.from(shot.data, 'base64'));
}

try {
  await until(async () => (await fetch(base, { signal: AbortSignal.timeout(1000) })).ok, 'production server');
  const tabs = await until(async () => { const result = await fetch('http://127.0.0.1:9227/json'); return result.ok && await result.json(); }, 'Chrome');
  socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) { const promise = pending.get(message.id); pending.delete(message.id); message.error ? promise.reject(new Error(message.error.message)) : promise.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(arg => arg.value || arg.description || '').join(' '));
  });
  await command('Page.enable'); await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate('/', "document.querySelector('header button[aria-haspopup=menu]') && document.querySelector('h1')?.textContent.includes('Your next chapter')");
  if (process.argv.includes('--hydration')) {
    await pause(4000);
    console.log('Hydration console:', JSON.stringify(errors));
    assert.deepEqual(errors, []);
    process.exitCode = 0;
  } else {
  await until(() => evaluate("[...document.images].find(i=>i.alt.includes('Illustration'))?.naturalWidth > 0"), 'hero image');
  await screenshot('home-desktop');
  await click("document.querySelector('header button[aria-haspopup=menu]')");
  await until(() => evaluate("document.querySelector('[role=menu]')?.textContent.includes('New Zealand')"), 'country dropdown');
  await escape();
  await until(() => evaluate("!document.querySelector('[role=menu]')"), 'menu closes');
  assert.equal(await evaluate("document.activeElement?.getAttribute('aria-haspopup')"), 'menu');
  await click("[...document.querySelectorAll('header button')].find(b=>b.textContent.includes('Apply Now'))");
  await until(() => evaluate("!!document.querySelector('[role=dialog]')"), 'apply dialog');
  assert.notEqual(await evaluate("getComputedStyle(document.querySelector('[role=dialog]')).animationName"), 'none');
  await click("document.querySelector('[role=dialog] [role=combobox]')");
  await until(() => evaluate("!!document.querySelector('[role=option]')"), 'country select');
  await click("[...document.querySelectorAll('[role=option]')].find(e=>e.textContent==='Canada')");
  await until(() => evaluate("document.querySelector('[role=dialog] [role=combobox]')?.textContent.includes('Canada')"), 'selected country');
  await until(() => evaluate("!document.querySelector('[role=listbox]')"), 'select exit transition');
  await screenshot('apply-dialog');
  await escape();
  await until(() => evaluate("!document.querySelector('[role=dialog]')"), 'dialog closes');
  await click("[...document.querySelectorAll('#process button')].find(b=>b.textContent.includes('Fly'))");
  assert.ok(await evaluate("document.querySelector('#process [aria-live]')?.textContent.includes('Prepare for departure')"));
  console.log('PASS desktop dropdown, Escape/focus return, dialog animation, nested select, interactive journey');

  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await navigate('/', "!!document.querySelector('nav[aria-label=\"Mobile navigation\"]')");
  assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Mobile horizontal overflow');
  await screenshot('home-mobile');
  await click("document.querySelector('nav[aria-label=\"Mobile navigation\"] button[aria-haspopup=menu]')");
  await until(() => evaluate("!!document.querySelector('[role=menu]')"), 'mobile destinations');
  await escape();
  await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await click("[...document.querySelectorAll('header button')].find(b=>b.textContent.includes('Apply Now'))");
  await until(() => evaluate("!!document.querySelector('[role=dialog]')"), 'reduced-motion dialog');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('[role=dialog]')).animationName"), 'none');
  await escape();
  console.log('PASS mobile width, mobile destinations, and reduced-motion overlay');

  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }, { name: 'prefers-color-scheme', value: 'light' }] });
  await navigate('/admin/login', "!!document.querySelector('.gap-admin-brand')");
  assert.ok(await evaluate("document.documentElement.classList.contains('gap-admin')"));
  assert.ok(await evaluate("getComputedStyle(document.body).fontFamily.includes('Manrope')"), 'Admin Manrope font');
  assert.equal(await evaluate("getComputedStyle(document.documentElement).backgroundColor"), 'rgb(251, 251, 248)');
  await screenshot('admin-login');
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Admin mobile overflow');
  await screenshot('admin-login-mobile');
  console.log('PASS GAP Admin login branding, typography, palette and mobile width');
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log(`Screenshots: ${output}`);
  }
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await command('Browser.close'); } catch {} socket.close(); }
  if (browser.exitCode === null) browser.kill();
  if (server?.exitCode === null) server.kill();
}
