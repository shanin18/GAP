import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";

const dev = process.argv.includes("--dev");
const port = dev ? 3126 : 3127;
const base = `http://127.0.0.1:${port}`;
const mode = dev ? "development" : "production";
const routes = [
  "/",
  "/about",
  "/services",
  "/country/australia",
  "/universities",
  "/news",
  "/apply",
];
let output = "";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    dev ? "dev" : "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      CMS_CACHE_DEBUG: "true",
      PAYLOAD_PUSH_SCHEMA: "false",
      ...(dev ? { NEXT_DIST_DIR: ".next/performance" } : {}),
    },
  },
);
server.stdout.on("data", (chunk) => {
  output += chunk;
});
server.stderr.on("data", (chunk) => {
  output += chunk;
});
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const misses = () => (output.match(/\[cms-cache\] MISS/g) ?? []).length;
async function request(route, rsc = false) {
  const start = performance.now();
  const response = await fetch(
    base + route + (rsc ? "?_rsc=performance-check" : ""),
    {
      headers: rsc ? { RSC: "1" } : {},
      signal: AbortSignal.timeout(120000),
    },
  );
  const text = await response.text();
  assert.equal(response.status, 200, `${route}: HTTP ${response.status}`);
  if (rsc)
    assert.match(
      response.headers.get("content-type") ?? "",
      /text\/x-component/,
    );
  return {
    ms: Math.round(performance.now() - start),
    text,
    cache: response.headers.get("x-nextjs-cache"),
  };
}
try {
  const deadline = Date.now() + 120000;
  while (!output.includes("Ready in")) {
    if (server.exitCode !== null)
      throw new Error(`Server exited: ${server.exitCode}`);
    if (Date.now() > deadline) throw new Error("Server startup timed out");
    await pause(100);
  }
  const rows = [];
  for (const route of routes) {
    const first = await request(route);
    rows.push({ route, firstRequestMs: first.ms, htmlCache: first.cache });
    console.log(`${mode}: ${route} first ${first.ms}ms`);
  }
  // Separate initial RSC response generation from repeat navigation timing.
  for (const route of routes) await request(route, true);
  await pause(500);
  const before = misses();
  for (const row of rows) {
    const times = [];
    for (let i = 0; i < 5; i++) times.push((await request(row.route, true)).ms);
    times.sort((a, b) => a - b);
    row.warmRscMedianMs = times[2];
    row.warmRscRangeMs = [times[0], times[4]];
  }
  await pause(200);
  const warmMisses = misses() - before;
  assert.equal(
    warmMisses,
    0,
    "Warm navigations should not execute public CMS queries",
  );
  assert.ok(
    !output.includes("Pulling schema"),
    "Navigation must not run schema synchronization",
  );
  const result = {
    mode,
    metric:
      "Loopback RSC response including body; not browser paint or internet latency",
    warmCmsCacheMisses: warmMisses,
    routes: rows,
  };
  console.log(JSON.stringify(result, null, 2));
  await mkdir(".next/performance-results", { recursive: true });
  await writeFile(
    `.next/performance-results/${mode}.json`,
    JSON.stringify(result, null, 2),
  );
} finally {
  server.kill();
  await mkdir(".next/performance-results", { recursive: true });
  await writeFile(`.next/performance-results/${mode}.log`, output);
}
