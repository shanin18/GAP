import fs from 'node:fs/promises';
import { getPayload } from 'payload';
import { publicMediaURL } from '../lib/cloudinary-storage';

process.env.PAYLOAD_PUSH_SCHEMA = 'false';
process.env.SMTP_HOST = '';
const { default: config } = await import('../payload/payload.config');
const payload = await getPayload({ config });
const context = { disableRevalidate: true };
const manifest: { key: string; source: string; license: string; alt: string; file: string; bytes: number; width: number; height: number }[] = JSON.parse(await fs.readFile('.image-work/manifest.json', 'utf8'));
const urls = new Map<string, string>();
const report: object[] = [];
try {
  for (const image of manifest) {
    const filename = `gap-stock-${image.key}.webp`;
    const { docs } = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1 });
    const media = docs[0] ?? await payload.create({ collection: 'media', context, data: { alt: `${image.alt}. Stock photograph, not GAP premises or staff. Source: ${image.source}` }, file: { name: filename, mimetype: 'image/webp', size: image.bytes, data: await fs.readFile(image.file) } });
    if (!media.filename) throw new Error(`Missing filename for ${image.key}`);
    const url = process.env.UPLOAD_STORAGE === 'cloudinary' ? publicMediaURL(media.filename) : `/api/media/file/${media.filename}`;
    urls.set(image.key, url);
    report.push({ ...image, file: undefined, url, mediaId: media.id });
    console.log(`Media ready: ${image.key}`);
  }
  const countries = await payload.find({ collection: 'countries', pagination: false, depth: 0 });
  for (const country of countries.docs) {
    const url = urls.get(country.slug);
    if (url && !country.heroImageUrl?.trim()) {
      await payload.update({ collection: 'countries', id: country.id, context, data: { heroImageUrl: url } });
      console.log(`Country image: ${country.name}`);
    }
  }
  const serviceImages: Record<string, string> = { 'Academic Counselling': 'academic', 'Career Counselling': 'career', 'Counselling': 'planning', 'University & Program Selection': 'study', 'Admission & Enrollment': 'planning', 'Pre-departure Guidance': 'departure', 'Study Planning Consultation': 'career' };
  const services = await payload.find({ collection: 'services', pagination: false, depth: 0 });
  for (const service of services.docs) {
    const url = urls.get(serviceImages[service.title]);
    if (url && (!service.imageUrl?.trim() || service.imageUrl.includes('demo-qa-image'))) {
      await payload.update({ collection: 'services', id: service.id, context, data: { imageUrl: url } });
      console.log(`Service image: ${service.title}`);
    }
  }
  const news = await payload.find({ collection: 'news', pagination: false, depth: 0 });
  for (const post of news.docs) {
    if (!post.coverImageUrl?.trim() || post.coverImageUrl.includes('demo-qa-image')) await payload.update({ collection: 'news', id: post.id, context, data: { coverImageUrl: urls.get('planning') } });
  }
  await fs.writeFile('lib/stock-image-sources.json', JSON.stringify(report, null, 2) + '\n');
  console.log(`Imported ${manifest.length} WebP photos. Total: ${Math.round(manifest.reduce((n, i) => n + i.bytes, 0) / 1024)} KB.`);
} finally { await payload.destroy(); }
