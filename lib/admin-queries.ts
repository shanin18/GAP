import type { TypedUser } from 'payload';
import { getCms } from '@/lib/payload';

export async function getAdminOverview(user: TypedUser) {
  const payload = await getCms();
  const [newLeads, activeApplications, documentCases, offers, recentApplications, recentLeads] = await Promise.all([
    payload.count({ user, overrideAccess: false, collection: 'leads', where: { status: { equals: 'new' } } }),
    payload.count({ user, overrideAccess: false, collection: 'applications', where: { status: { not_in: ['enrolled','closed'] } } }),
    payload.count({ user, overrideAccess: false, collection: 'applications', where: { status: { equals: 'documents-required' } } }),
    payload.count({ user, overrideAccess: false, collection: 'applications', where: { status: { equals: 'offer-received' } } }),
    payload.find({ user, overrideAccess: false, collection: 'applications', sort: '-updatedAt', limit: 6, depth: 1 }),
    payload.find({ user, overrideAccess: false, collection: 'leads', sort: '-createdAt', limit: 6, depth: 1 }),
  ]);
  return {
    metrics: { newLeads: newLeads.totalDocs, activeApplications: activeApplications.totalDocs, documentCases: documentCases.totalDocs, offers: offers.totalDocs },
    recentApplications: recentApplications.docs,
    recentLeads: recentLeads.docs,
  };
}
