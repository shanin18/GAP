import fs from 'node:fs/promises';
import sharp from 'sharp';
import { getPayload } from 'payload';
import { publicMediaURL } from '../lib/cloudinary-storage';

process.env.PAYLOAD_PUSH_SCHEMA = 'false';
process.env.SMTP_HOST = '';
const { default: config } = await import('../payload/payload.config');
const payload = await getPayload({ config });
const manifest = JSON.parse(await fs.readFile('lib/stock-image-sources.json', 'utf8'));
try {
  for (const [key, id] of [['australia', 'QJXf1XtLS0Y']]) {
    const filename = `gap-stock-${key}.webp`;
    const source = `https://unsplash.com/photos/${id}`;
    const { docs } = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1 });
    let media = docs[0];
    let bytes = media?.filesize ?? 0;
    if (!media) {
      const page = await fetch(source, { signal: AbortSignal.timeout(30000) });
      if (!page.ok) throw new Error(`Photo source: ${page.status}`);
      const html = await page.text();
      const match = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (!match) throw new Error('Missing photo source');
      const url = new URL(match[1].replaceAll('&amp;', '&'));
      if (url.hostname !== 'images.unsplash.com') throw new Error('Unexpected image host');
      url.search = '?w=1440&h=900&fit=crop&q=85';
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`Image download: ${response.status}`);
      const data = await sharp(Buffer.from(await response.arrayBuffer())).resize(1440, 900).webp({ quality: 78, effort: 6 }).toBuffer();
      bytes = data.length;
      await fs.mkdir('.image-work', { recursive: true });
      await fs.writeFile(`.image-work/${key}.webp`, data);
      media = await payload.create({ collection: 'media', context: { disableRevalidate: true }, data: { alt: `Sydney Opera House and Harbour Bridge, Australia. Source: ${source}` }, file: { name: filename, mimetype: 'image/webp', size: bytes, data } });
    }
    if (!media.filename) throw new Error('Missing media filename');
    const url = publicMediaURL(media.filename);
    if (!manifest.some((item: {key: string}) => item.key === key)) manifest.push({ key, source, license: 'https://unsplash.com/license', alt: 'Sydney Opera House and Harbour Bridge, Australia', bytes, width: 1440, height: 900, url, mediaId: media.id });
    const countries = await payload.find({ collection: 'countries', where: { slug: { equals: 'australia' } }, limit: 1, depth: 0 });
    if (!countries.docs[0]) throw new Error('Australia record missing');
    await payload.update({ collection: 'countries', id: countries.docs[0].id, context: { disableRevalidate: true }, data: { heroImageUrl: url } });
    console.log(`${key}: ${Math.round(bytes / 1024)} KB`);
  }
  await fs.writeFile('lib/stock-image-sources.json', JSON.stringify(manifest, null, 2) + '\n');
} finally { await payload.destroy(); }
