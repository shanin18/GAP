import { getPayload } from 'payload';

// Renames the "Counselling" service to "Student Counselling". Safe to run more than once.
process.env.PAYLOAD_PUSH_SCHEMA = 'false';
process.env.SMTP_HOST = '';
const { default: config } = await import('../payload/payload.config');
const payload = await getPayload({ config });
try {
  const { docs } = await payload.find({
    collection: 'services', pagination: false, depth: 0,
    where: { title: { equals: 'Counselling' } },
  });
  for (const doc of docs) {
    await payload.update({ collection: 'services', id: doc.id, data: { title: 'Student Counselling' } });
  }
  console.log(docs.length ? `Renamed ${docs.length} service(s) to "Student Counselling".` : 'No service titled "Counselling" found; nothing to change.');
} finally { await payload.destroy(); }
