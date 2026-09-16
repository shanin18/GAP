import { getCms } from '@/lib/payload';

export async function getAdminOverview() {
  const payload = await getCms();
  const [newLeads, activeApplications, documentCases, offers, recentApplications, recentLeads] = await Promise.all([
    payload.count({ collection: 'leads', where: { status: { equals: 'new' } } }),
    payload.count({ collection: 'applications', where: { status: { not_in: ['enrolled','closed'] } } }),
    payload.count({ collection: 'applications', where: { status: { equals: 'documents-required' } } }),
    payload.count({ collection: 'applications', where: { status: { equals: 'offer-received' } } }),
    payload.find({ collection: 'applications', sort: '-updatedAt', limit: 6, depth: 1 }),
    payload.find({ collection: 'leads', sort: '-createdAt', limit: 6, depth: 1 }),
  ]);
  return {
    metrics: { newLeads: newLeads.totalDocs, activeApplications: activeApplications.totalDocs, documentCases: documentCases.totalDocs, offers: offers.totalDocs },
    recentApplications: recentApplications.docs,
    recentLeads: recentLeads.docs,
  };
}
