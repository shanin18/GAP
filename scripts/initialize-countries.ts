import { getPayload } from 'payload';
import config from '../payload/payload.config';

// Explicit one-time initialization; never runs during requests or startup.
// Re-running preserves existing records and does not overwrite their content.
const payload = await getPayload({ config });
try {
  for (const [name, slug] of [
    ['Australia', 'australia'],
    ['Canada', 'canada'],
    ['New Zealand', 'new-zealand'],
  ]) {
    const existing = await payload.find({ collection: 'countries', where: { slug: { equals: slug } }, limit: 1, depth: 0 });
    if (existing.docs.length) { console.log(`Preserved ${name}`); continue; }
    await payload.create({ collection: 'countries', data: { name, slug } });
    console.log(`Created ${name}`);
  }
} finally {
  await payload.destroy();
}
