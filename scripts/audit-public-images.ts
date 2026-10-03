import { getPayload } from 'payload';
process.env.PAYLOAD_PUSH_SCHEMA = 'false';
process.env.SMTP_HOST = '';
const { default: config } = await import('../payload/payload.config');
const payload = await getPayload({ config });
try {
  for (const collection of ['countries', 'services', 'news', 'universities', 'website-content'] as const) {
    const { docs } = await payload.find({ collection, pagination: false, depth: 0 });
    console.log(JSON.stringify({ collection, docs: docs.map((d: any) => ({ id: d.id, name: d.name ?? d.title ?? d.key, slug: d.slug, status: d.status, heroImageUrl: d.heroImageUrl, imageUrl: d.imageUrl, coverImageUrl: d.coverImageUrl, gallery: d.gallery, images: d.entries?.filter((e: any) => /image|\.webp|\.jpg|unsplash/i.test(e.original ?? '')).map((e: any) => ({ key: e.key, original: e.original, value: e.value })) })) }));
  }
} finally { await payload.destroy(); }
