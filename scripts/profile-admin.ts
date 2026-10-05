import { createLocalReq, getPayload } from 'payload';
import config from '../payload/payload.config';
import { loadDashboardData } from '../lib/admin-dashboard-data';

// Read-only local diagnostic. Prints timings/counts, never user or record data.
const start = performance.now();
const payload = await getPayload({ config });
console.log(`Payload initialization: ${Math.round(performance.now() - start)} ms`);
try {
  const { docs } = await payload.find({ collection: 'users', overrideAccess: true,
    limit: 10, depth: 0, select: { role: true, updatedAt: true, createdAt: true, email: true } });
  for (const role of ['admin', 'editor']) {
    const account = docs.find(doc => doc.role === role);
    if (!account) continue;
    const req = await createLocalReq({ user: { ...account, collection: 'users' } }, payload);
    for (const label of ['cold', 'warm']) {
      const began = performance.now();
      await loadDashboardData(req);
      console.log(`${role} dashboard ${label}: ${Math.round(performance.now() - began)} ms`);
    }
    for (const collection of ['leads', 'applications', 'documents'] as const) {
      const began = performance.now();
      await payload.find({ collection, req, user: req.user!, overrideAccess: false,
        limit: 10, depth: 0, select: { createdAt: true, updatedAt: true } });
      console.log(`${role} ${collection} list query: ${Math.round(performance.now() - began)} ms`);
    }
  }
} finally { await payload.destroy(); }
