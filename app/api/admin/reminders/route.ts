import { getCms } from '@/lib/payload';
import { adminRead } from '@/lib/admin-read-cache';
import type { Where } from 'payload';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const payload = await getCms();
  const { user } = await payload.auth({ headers: request.headers });
  const headers = { 'Cache-Control': 'private, no-store' };
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  const limited = rateLimit(`admin-reminders:${user.id}`, 60, 60_000);
  if (!limited.ok) return Response.json({ error: 'Too many reminder requests' }, {
    status: 429, headers: { ...headers, 'Retry-After': String(limited.retryAfter) },
  });
  try {
    const result = await adminRead(payload, user, 'due-reminders', async () => {
      const now = new Date().toISOString();
      const ownership: Where[] = user.role === 'admin' ? [] : [{ assignedTo: { equals: user.id } }];
      const [leads, applications] = await Promise.all([
        payload.find({ collection: 'leads', user, overrideAccess: false, depth: 0, limit: 20, sort: 'followUpAt',
          select: { name: true, followUpAt: true },
          where: { and: [...ownership, { followUpAt: { less_than_equal: now } }, { status: { not_in: ['not-proceeding', 'application-started'] } }] } }),
        payload.find({ collection: 'applications', user, overrideAccess: false, depth: 0, limit: 20, sort: 'nextActionAt',
          select: { studentName: true, nextActionAt: true },
          where: { and: [...ownership, { nextActionAt: { less_than_equal: now } }, { status: { not_in: ['enrolled', 'closed'] } }] } }),
      ]);
      return { total: leads.totalDocs + applications.totalDocs, items: [
        ...leads.docs.map(d => ({ id: `lead-${d.id}`, label: d.name, date: d.followUpAt, href: `/admin/collections/leads/${d.id}` })),
        ...applications.docs.map(d => ({ id: `application-${d.id}`, label: d.studentName, date: d.nextActionAt, href: `/admin/collections/applications/${d.id}` })),
      ].sort((a, b) => String(a.date).localeCompare(String(b.date))) };
    }, 15_000);
    return Response.json(result, { headers });
  } catch {
    return Response.json({ error: 'Unable to load reminders' }, { status: 503, headers });
  }
}
