import type { CollectionSlug, PayloadRequest, Where } from "payload";

export const APPLICATION_STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "profile-review", label: "Profile review" },
  { value: "documents-required", label: "Documents required" },
  { value: "ready-to-apply", label: "Ready to apply" },
  { value: "university-submitted", label: "Submitted to university" },
  { value: "offer-received", label: "Offer received" },
  { value: "enrolled", label: "Enrolled" },
  { value: "closed", label: "Closed" },
];

async function count(req: PayloadRequest, collection: CollectionSlug, where?: Where) {
  try {
    const { totalDocs } = await req.payload.count({ collection, where, user: req.user ?? undefined, overrideAccess: false });
    return totalDocs;
  } catch {
    return 0;
  }
}

async function recentLeads(req: PayloadRequest) {
  try {
    const { docs } = await req.payload.find({
      collection: "leads", limit: 5, sort: "-createdAt", depth: 0,
      pagination: false,
      select: { name: true, email: true, interestedCountry: true, status: true, createdAt: true },
      user: req.user ?? undefined, overrideAccess: false,
    });
    return docs;
  } catch {
    return [];
  }
}

async function recentApplications(req: PayloadRequest) {
  try {
    const { docs } = await req.payload.find({
      collection: "applications", limit: 5, sort: "-createdAt", depth: 1,
      pagination: false,
      select: { studentName: true, reference: true, country: true, status: true, createdAt: true },
      populate: { countries: { name: true } },
      user: req.user ?? undefined, overrideAccess: false,
    });
    return docs;
  } catch {
    return [];
  }
}

export async function loadDashboardData(req: PayloadRequest) {
  const now = new Date().toISOString();
  const closed = ["enrolled", "closed"];

  const [totalLeads, totalDocuments, countries, universities, newLeads, needsUpdate, leadsDue, appsDue, byStatus, leads, applications] = await Promise.all([
    count(req, "leads"),
    count(req, "documents"),
    count(req, "countries"),
    count(req, "universities"),
    count(req, "leads", { status: { equals: "new" } }),
    count(req, "documents", { reviewStatus: { equals: "needs-update" } }),
    count(req, "leads", { and: [{ followUpAt: { less_than_equal: now } }, { status: { not_in: ["not-proceeding", "application-started"] } }] }),
    count(req, "applications", { and: [{ nextActionAt: { less_than_equal: now } }, { status: { not_in: closed } }] }),
    Promise.all(APPLICATION_STATUSES.map((s) => count(req, "applications", { status: { equals: s.value } }))),
    recentLeads(req),
    recentApplications(req),
  ]);

  const openApps = byStatus.reduce((total, amount, index) =>
    closed.includes(APPLICATION_STATUSES[index].value) ? total : total + amount, 0);
  return { totalLeads, totalDocuments, countries, universities, newLeads, openApps, needsUpdate, leadsDue, appsDue, byStatus, leads, applications };
}
