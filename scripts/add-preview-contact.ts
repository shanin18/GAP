import { getPayload } from 'payload';

process.env.PAYLOAD_PUSH_SCHEMA = 'false';
process.env.SMTP_HOST = '';
const { default: config } = await import('../payload/payload.config');
const payload = await getPayload({ config });
try {
  const { docs } = await payload.find({ collection: 'site-settings', limit: 1, depth: 0 });
  const settings = docs[0];
  const data = {
    ...(!settings?.address?.trim() ? { address: 'Sample office — Dhaka, Bangladesh\nFull address to be confirmed.' } : {}),
    ...(!settings?.phone?.trim() ? { phone: 'To be confirmed' } : {}),
    ...(!settings?.email?.trim() ? { email: 'hello@example.com' } : {}),
  };
  if (settings) {
    if (Object.keys(data).length) await payload.update({ collection: 'site-settings', id: settings.id, context: { disableRevalidate: true }, data });
  } else {
    await payload.create({ collection: 'site-settings', context: { disableRevalidate: true }, data: { siteName: 'Global Admission Platform', ...data } });
  }
  console.log('Added preview contact details only where empty; existing details preserved.');
} finally { await payload.destroy(); }
