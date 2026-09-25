// Read-only data-loading benchmark. Does not create sessions or modify CMS data.
import { createLocalReq, getPayload } from "payload";
import config from "../payload/payload.config";
import { loadDashboardData } from "../lib/admin-dashboard-data";

const started = performance.now();
const payload = await getPayload({ config });
try {
  const users = await payload.find({ collection: "users", limit: 1, depth: 0 });
  if (!users.docs[0]) throw new Error("A staff user is required for permission-aware dashboard reads.");
  const req = await createLocalReq({ user: { ...users.docs[0], collection: "users" } }, payload);
  console.log(`Payload initialization: ${Math.round(performance.now() - started)} ms`);
  for (let run = 1; run <= 3; run++) {
    const before = performance.now();
    await loadDashboardData(req);
    console.log(`Dashboard data load ${run}: ${Math.round(performance.now() - before)} ms`);
  }
} finally {
  await payload.destroy();
}
