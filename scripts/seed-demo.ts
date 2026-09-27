import { getPayload, type CollectionSlug, type Where } from 'payload';
import sharp from 'sharp';
import catalog from '../lib/website-content-defaults.json';

// Explicitly run against the configured database. Never push schema or send mail.
process.env.PAYLOAD_PUSH_SCHEMA = 'false';
process.env.SMTP_HOST = '';
const { default: config } = await import('../payload/payload.config');
const payload = await getPayload({ config });
const context = { disableRevalidate: true };
const summary: string[] = [];

// Stable identifiers make retries safe and preserve changes made during QA.
async function ensure(collection: CollectionSlug, where: Where, data: any, file?: { data: Buffer; name: string; mimetype: string; size: number }) {
  const existing = await payload.find({ collection, where, limit: 1, depth: 0 });
  if (existing.docs.length) { summary.push(`Kept ${collection}/${existing.docs[0].id}`); return existing.docs[0] as any; }
  const doc = await payload.create({ collection, data, file, context, overrideAccess: true });
  summary.push(`Created ${collection}/${doc.id}`);
  return doc as any;
}

try {
  const accounts = await payload.find({ collection: 'users', pagination: false, depth: 0 });
  const admin = accounts.docs.find(u => u.role === 'admin');
  const staff = accounts.docs.filter(u => u.role === 'editor');
  if (!admin || !staff.length) throw new Error('An existing admin and staff account are required. No accounts or passwords were changed.');
  const image = await sharp(Buffer.from('<svg width="640" height="360" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="360" fill="#19382d"/><text x="320" y="170" text-anchor="middle" fill="#b8d8bd" font-size="44">DEMO QA SAMPLE</text><text x="320" y="220" text-anchor="middle" fill="white" font-size="20">Fictional data - not a real document</text></svg>')).png().toBuffer();
  const file = (name: string) => ({ data: image, name, mimetype: 'image/png', size: image.length });
  const media = await ensure('media', { filename: { equals: 'demo-qa-image.png' } }, { alt: 'DEMO QA sample image' }, file('demo-qa-image.png'));
  const country = await ensure('countries', { slug: { equals: 'demo-qa-destination' } }, {
    name: 'DEMO QA Destination', slug: 'demo-qa-destination', heroImageUrl: media.url,
    introduction: 'Fictional destination for testing only. Remove before launch.',
    highlights: [{ text: 'DEMO: destination highlights' }],
    steps: [{ title: 'DEMO: prepare your application', text: 'Test the enquiry, application and document workflow.' }],
    gallery: [{ imageUrl: media.url, caption: 'DEMO QA placeholder' }],
  });
  const university = await ensure('universities', { slug: { equals: 'demo-qa-university' } }, {
    name: 'DEMO QA University', slug: 'demo-qa-university', country: country.id, city: 'Demo City',
    description: 'Fictional university for manual QA. Not a real partner.', logoUrl: media.url, status: 'draft', featured: false,
  });
  await ensure('services', { title: { in: ['DEMO QA counselling', 'Study Planning Consultation'] } }, {
    title: 'DEMO QA counselling', icon: 'MessageCircle', shortDescription: 'Fictional service for testing only.',
    introduction: 'Use this record to test editing service content.', points: [{ text: 'DEMO: review study plans' }], imageUrl: media.url, sortOrder: 999,
  });
  await ensure('news', { slug: { equals: 'demo-qa-news' } }, {
    title: 'DEMO QA news article', slug: 'demo-qa-news', shortBlurb: 'Fictional draft article for editing and publication checks.',
    coverImageUrl: media.url, status: 'draft', publishedDate: new Date().toISOString(),
  });
  await ensure('testimonials', { or: [{ studentName: { equals: 'DEMO QA Student Review' } }, { and: [{ studentName: { equals: 'Ayesha Rahman' } }, { quote: { contains: 'Fictional QA testimonial:' } }] }] }, {
    studentName: 'DEMO QA Student Review', university: university.id, country: country.id,
    quote: 'DEMO ONLY: this is a fictional review for testing the CMS. Do not publish as a real testimonial.', rating: 4, published: false, photoUrl: media.url,
  });
  const statuses = ['submitted', 'profile-review', 'documents-required', 'ready-to-apply', 'university-submitted', 'offer-received', 'enrolled', 'closed'] as const;
  for (const [index, status] of statuses.entries()) {
    const owner = index === 7 ? admin : staff[index % staff.length];
    const reference = `DEMO-QA-${String(index + 1).padStart(3, '0')}`;
    const app = await ensure('applications', { reference: { equals: reference } }, {
      reference, studentName: `DEMO QA Student ${index + 1}`, email: `demo.qa.student${index + 1}@example.invalid`,
      phone: '00000000000', country: country.id, university: university.id, studyLevel: 'Undergraduate', intake: 'DEMO September intake',
      message: 'Fictional application for QA. Safe to delete.', sourcePage: '/demo-qa', status,
      priority: index === 2 ? 'urgent' : 'normal', assignedTo: owner.id,
      nextAction: 'DEMO: review the case and contact the student',
      nextActionAt: new Date(Date.now() + (index < 3 ? -1 : 2) * 86400000).toISOString(), internalNotes: 'DEMO QA record. No real student data.',
    });
    if (index < 3) {
      const document = await ensure('documents', { and: [{ application: { equals: app.id } }, { filename: { equals: `demo-qa-document-${index + 1}.png` } }] }, {
        application: app.id, documentType: 'academic', uploadedBy: owner.id, reviewStatus: ['received', 'needs-update', 'approved'][index],
        reviewNote: 'DEMO image only. This is not an actual student certificate.',
      }, file(`demo-qa-document-${index + 1}.png`));
      if (!app.documents?.length) await payload.update({ collection: 'applications', id: app.id, context, data: {
        documents: [{ label: 'DEMO academic certificate', status: index === 1 ? 'needs-update' : index === 2 ? 'approved' : 'received', file: document.id }],
      } });
    }
    if (index < 5) await ensure('leads', { email: { equals: `demo.qa.lead${index + 1}@example.invalid` } }, {
      name: `DEMO QA Enquiry ${index + 1}`, email: `demo.qa.lead${index + 1}@example.invalid`, interestedCountry: country.name,
      message: 'Fictional enquiry for flow testing.', sourcePage: '/demo-qa',
      status: ['new', 'contacted', 'qualified', 'application-started', 'not-proceeding'][index], assignedTo: owner.id,
      followUpAt: new Date(Date.now() + (index < 2 ? -1 : 2) * 86400000).toISOString(),
      ...(index === 3 ? { application: app.id } : {}), staffNotes: 'DEMO QA. Practice follow-up, rescheduling and conversion.',
    });
  }
  await ensure('leads', { email: { equals: 'demo.qa.unassigned@example.invalid' } }, {
    name: 'DEMO QA Unassigned Enquiry', email: 'demo.qa.unassigned@example.invalid', status: 'new',
    message: 'Admin: assign this lead to staff to test allocation.', sourcePage: '/demo-qa',
  });
  // Singleton/catalog content: fill missing records only, never overwrite existing text/settings.
  for (const section of catalog) await ensure('website-content', { key: { equals: section.key } }, { key: section.key });
  const settings = await payload.find({ collection: 'site-settings', limit: 1 });
  if (!settings.docs.length) await ensure('site-settings', { siteName: { equals: 'DEMO QA GAP' } }, {
    siteName: 'DEMO QA GAP', email: 'demo.qa@example.invalid', address: 'DEMO address for testing', maintenanceMode: false,
  });
  else summary.push('Kept existing site settings');
  console.log(summary.join('\n'));
  console.log(`Demo seed complete. Used ${staff.length} existing staff account(s) and the existing admin. No passwords changed or emails sent.`);
} finally {
  await payload.destroy();
}
