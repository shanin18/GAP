import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { getPayload } from "payload";
import config from "../payload/payload.config";

// Uses only disposable QA records; never edits existing site content or sends email.
const payload = await getPayload({ config });
const run = `cache-qa-${randomUUID()}`;
const password = randomUUID() + randomUUID();
const base = "http://127.0.0.1:3128";
let userId: number | undefined;
let serviceId: number | undefined;
let token = "";
let output = "";
let server: ReturnType<typeof spawn> | undefined;
async function request(path: string, method = "GET", body?: object) {
  return fetch(base + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(method !== "GET" ? { Authorization: `JWT ${token}` } : {}),
      ...(path.startsWith("/services") ? { RSC: "1" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(120000),
  });
}
const misses = () =>
  (output.match(/\[cms-cache\] MISS getServices /g) ?? []).length;
try {
  const user = await payload.create({
    collection: "users",
    data: { email: `${run}@example.invalid`, password, role: "admin" },
  });
  userId = user.id;
  token = (
    await payload.login({
      collection: "users",
      data: { email: user.email, password },
    })
  ).token!;
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3128",
    ],
    {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        NEXT_DIST_DIR: ".next/cache-check",
        CMS_CACHE_DEBUG: "true",
        PAYLOAD_PUSH_SCHEMA: "false",
        SMTP_HOST: "",
      },
    },
  );
  server.stdout?.on("data", (chunk) => {
    output += chunk;
  });
  server.stderr?.on("data", (chunk) => {
    output += chunk;
  });
  const deadline = Date.now() + 120000;
  while (!output.includes("Ready in")) {
    if (server.exitCode !== null || Date.now() > deadline)
      throw new Error("Cache test server did not start");
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  await (await request("/services?_rsc=cache-qa")).text();
  const baseline = misses();
  await (await request("/services?_rsc=cache-qa")).text();
  assert.equal(misses(), baseline, "Second render reuses cached service data");
  const create = await request("/api/services", "POST", {
    title: run,
    shortDescription: "Temporary cache verification record.",
  });
  assert.equal(create.status, 201);
  serviceId = (await create.json()).doc.id;
  const createdPage = await (await request("/services?_rsc=cache-qa")).text();
  assert.ok(misses() > baseline, "Creating content invalidates its data cache");
  assert.ok(
    createdPage.includes(run),
    "Created service reaches the public page",
  );
  const revised = `${run} updated`;
  assert.equal(
    (await request(`/api/services/${serviceId}`, "PATCH", { title: revised }))
      .status,
    200,
  );
  assert.ok(
    (await (await request("/services?_rsc=cache-qa")).text()).includes(revised),
    "Saved edits appear immediately",
  );
  assert.equal(
    (await request(`/api/services/${serviceId}`, "DELETE")).status,
    200,
  );
  serviceId = undefined;
  assert.ok(
    !(await (await request("/services?_rsc=cache-qa")).text()).includes(run),
    "Deleted service is removed from the cache",
  );
  assert.ok(
    !output.includes("Pulling schema"),
    "No automatic schema synchronization",
  );
  console.log(
    "PASS cache hit, create/update/delete invalidation, immediate public rendering and no schema pulls",
  );
} finally {
  if (serviceId !== undefined) {
    try {
      await request(`/api/services/${serviceId}`, "DELETE");
    } catch {
      /* local cleanup below */
    }
    const remaining = await payload.find({
      collection: "services",
      where: { id: { equals: serviceId } },
      depth: 0,
    });
    if (remaining.docs.length)
      await payload.delete({ collection: "services", id: serviceId });
  }
  server?.kill();
  if (userId !== undefined)
    await payload.delete({ collection: "users", id: userId });
  await payload.destroy();
  console.log(
    "Removed cache-verification records and stopped the isolated server.",
  );
}
