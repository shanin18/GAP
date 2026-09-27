import { getPayload, type CollectionSlug, type Where } from 'payload';

process.env.PAYLOAD_PUSH_SCHEMA = 'false';
process.env.SMTP_HOST = '';
const { default: config } = await import('../payload/payload.config');
const payload = await getPayload({ config });
const context = { disableRevalidate: true };
async function update(collection: CollectionSlug, where: Where, data: any) {
  const result = await payload.find({ collection, where, depth: 0, limit: 2 });
  if (result.docs.length !== 1) throw new Error(`Expected exactly one seeded ${collection} record; found ${result.docs.length}`);
  await payload.update({ collection, id: result.docs[0].id, data, context });
  console.log(`Updated ${collection}/${result.docs[0].id}`);
}
try {
  const names = ['Ayesha Rahman', 'Rafiul Islam', 'Nusrat Jahan', 'Tanvir Ahmed', 'Farhana Karim', 'Sadia Hasan', 'Arif Chowdhury', 'Mehedi Hossain'];
  const programmes = ['Business Management', 'Computer Science', 'Public Health', 'Civil Engineering', 'Data Analytics', 'International Business', 'Accounting', 'Environmental Studies'];
  for (const [i, studentName] of names.entries()) {
    await update('applications', { reference: { equals: `DEMO-QA-${String(i + 1).padStart(3, '0')}` } }, {
      studentName, intake: 'September 2027',
      message: `I would like to study ${programmes[i]} and need guidance on entry requirements, tuition fees and scholarship options.`,
      nextAction: ['Arrange an initial counselling call', 'Review academic transcripts', 'Request a clearer certificate scan', 'Confirm the programme shortlist', 'Check the university submission', 'Review offer conditions', 'Confirm arrival arrangements', 'Record the reason for closing the case'][i],
      internalNotes: `Fictional QA student. Interested in ${programmes[i]}. This record is test data; do not contact or submit to an institution.`,
    });
    if (i < 5) await update('leads', { email: { equals: `demo.qa.lead${i + 1}@example.invalid` } }, {
      name: studentName, interestedCountry: 'Canada',
      message: `I am interested in ${programmes[i]} for the September 2027 intake. Could you help me understand the application process?`,
      staffNotes: 'Fictional QA enquiry. Discuss academic background, budget and English-language requirements at the next follow-up.',
    });
  }
  await update('leads', { email: { equals: 'demo.qa.unassigned@example.invalid' } }, {
    name: 'Imran Hossain', interestedCountry: 'Australia', message: 'I recently completed my undergraduate degree and would like advice on postgraduate study options.',
    staffNotes: 'Fictional QA enquiry awaiting allocation. Admin should assign a counsellor.',
  });
  await update('countries', { slug: { equals: 'demo-qa-destination' } }, {
    name: 'Canada — Test Destination', introduction: 'Explore study options, programme selection and application planning. This is a test destination record for QA, not official destination guidance.',
    highlights: [{ text: 'Programme and institution selection' }, { text: 'Application and document preparation' }],
    steps: [{ title: 'Plan your studies', text: 'Discuss your academic background, budget and preferred intake.' }, { title: 'Prepare your application', text: 'Gather transcripts, language evidence and supporting documents.' }],
  });
  await update('universities', { slug: { equals: 'demo-qa-university' } }, {
    name: 'Maplebridge University', city: 'Toronto', description: 'Fictional institution for QA. Use this draft profile to test university selection and application relationships. Not a real university or partner.',
  });
  await update('services', { title: { in: ['DEMO QA counselling', 'Study Planning Consultation'] } }, {
    title: 'Study Planning Consultation', shortDescription: 'Discuss your academic goals, preferred destinations and next steps. Test service for QA.',
    introduction: 'A sample consultation service covering study goals, programme selection and application preparation. This is test content.',
    points: [{ text: 'Review academic background and interests' }, { text: 'Discuss destinations, budget and intake' }, { text: 'Prepare an application checklist' }],
  });
  await update('news', { slug: { equals: 'demo-qa-news' } }, {
    title: 'Preparing for the September Intake: An Application Checklist', shortBlurb: 'Plan your shortlist, organise academic records and prepare questions for your counsellor. Fictional draft article for QA.',
  });
  await update('testimonials', { studentName: { in: ['DEMO QA Student Review', 'Ayesha Rahman'] } }, {
    studentName: 'Ayesha Rahman', quote: 'Fictional QA testimonial: The counselling session helped me organise my shortlist and understand which documents to prepare. Not a real student endorsement.',
  });
  await update('media', { filename: { equals: 'demo-qa-image.png' } }, { alt: 'Study planning sample artwork — QA placeholder' });
  for (let i = 1; i <= 3; i++) await update('documents', { filename: { equals: `demo-qa-document-${i}.png` } }, {
    reviewNote: ['Sample academic transcript received; awaiting review.', 'Sample certificate scan needs a clearer replacement.', 'Sample academic record review completed.'][i - 1] + ' Fictional QA placeholder, not an actual certificate.',
  });
  console.log('Refined seeded records. Test identifiers, assignments, statuses and unpublished flags preserved.');
} finally { await payload.destroy(); }
