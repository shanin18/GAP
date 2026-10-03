import fs from 'node:fs/promises';
import sharp from 'sharp';
const photos = [['direction', 'EP8lBWLFLkg'], ['choices', 'sOENhFWZ-FU'], ['application', '45u1mboQtQE'], ['departure', 'wqd_LnJKjyE']];
await fs.mkdir('public/images/purpose', { recursive: true });
const manifest = [];
for (const [key, id] of photos) {
  const source = `https://unsplash.com/photos/${id}`;
  const page = await fetch(source, { signal: AbortSignal.timeout(30000) });
  if (!page.ok) throw new Error(`${key}: HTTP ${page.status}`);
  const match = (await page.text()).match(/<meta property="og:image" content="([^"]+)"/);
  if (!match) throw new Error('Missing photo');
  const url = new URL(match[1].replaceAll('&amp;', '&'));
  if (url.hostname !== 'images.unsplash.com') throw new Error('Unexpected host');
  url.search = '?w=1800&fit=max&q=90';
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('Photo download failed');
  const input = Buffer.from(await response.arrayBuffer());
  let output;
  for (const quality of [80, 76, 72, 68]) {
    output = await sharp(input).rotate().resize(1440, 1152, { fit: 'cover', position: 'attention' }).webp({ quality, effort: 6 }).toBuffer();
    if (output.length < 190000) break;
  }
  const file = `public/images/purpose/${key}.webp`;
  await fs.writeFile(file, output);
  manifest.push({ key, source, license: 'https://unsplash.com/license', file, width: 1440, height: 1152, bytes: output.length });
  console.log(`${key}: ${Math.round(output.length / 1024)} KB`);
}
await fs.writeFile('lib/purpose-image-sources.json', JSON.stringify(manifest, null, 2) + '\n');
const tiles = await Promise.all(manifest.map(async (p, i) => ({ input: await sharp(p.file).resize(320, 256).toBuffer(), left: i * 320, top: 0 })));
await sharp({ create: { width: 1280, height: 256, channels: 3, background: '#14231b' } }).composite(tiles).webp().toFile('.image-work/purpose-preview.webp');
