import { getPayload } from 'payload';
import catalog from '../lib/website-content-defaults.json';

process.env.PAYLOAD_PUSH_SCHEMA = 'false';
process.env.SMTP_HOST = '';
const { default: config } = await import('../payload/payload.config');
const payload = await getPayload({ config });
try {
  const { docs } = await payload.find({ collection: 'website-content', pagination: false, depth: 0 });
  for (const doc of docs) {
    if (!['home-hero', 'home-about', 'home-process', 'trust-strip', 'enquiry-form', 'application-form'].includes(doc.key)
      && !doc.entries?.some(entry => entry.original === 'Apply Now' || entry.original === 'Apply now')) continue;
    const section = catalog.find(item => item.key === doc.key);
    if (!section) continue;
    const entries = doc.entries?.map(entry => {
      const original = entry.original;
      const changeCTA = original === 'Apply Now' || original === 'Apply now';
      return changeCTA ? { ...entry, value: 'Book an appointment' } : entry;
    });
    // The collection hook reconciles new catalogue keys and keeps unrelated edits.
    await payload.update({ collection: 'website-content', id: doc.id, context: { disableRevalidate: true }, data: {
      entries,
      ...(doc.key === 'home-about' ? { enabled: false } : {}),
      ...(doc.key === 'home-process' ? { enabled: true, sortOrder: 10 } : {}),
    } });
  }
  console.log('Updated homepage order and editable copy. Existing unrelated content preserved.');
} finally { await payload.destroy(); }
