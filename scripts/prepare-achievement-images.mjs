import fs from 'node:fs/promises';
import sharp from 'sharp';
await fs.mkdir('public/images/achievements', { recursive: true });
const manifest = [];
for (const [key, id] of [['recognition', 'fyN_dAzrG8A'], ['milestones', '1M5TbuRlG6A']]) {
  const source = `https://unsplash.com/photos/${id}`;
  const page = await fetch(source);
  if (!page.ok) throw new Error(String(page.status));
  const match = (await page.text()).match(/<meta property="og:image" content="([^"]+)"/);
  if (!match) throw new Error('Missing image');
  const url = new URL(match[1].replaceAll('&amp;', '&'));
  if (url.hostname !== 'images.unsplash.com') throw new Error('Unexpected host');
  url.search = '?w=1500&fit=max&q=85';
  const response = await fetch(url);
  if (!response.ok) throw new Error(String(response.status));
  const data = await sharp(Buffer.from(await response.arrayBuffer())).rotate().resize(1200, 900, { fit: 'cover', position: 'attention' }).webp({ quality: 78, effort: 6 }).toBuffer();
  await fs.writeFile(`public/images/achievements/${key}.webp`, data);
  manifest.push({ key, source, license: 'https://unsplash.com/license', bytes: data.length, purpose: 'Stock illustration for a sample recognition entry; not a GAP award' });
  console.log(`${key}: ${Math.round(data.length / 1024)} KB`);
}
await fs.writeFile('lib/achievement-image-sources.json', JSON.stringify(manifest, null, 2) + '\n');
