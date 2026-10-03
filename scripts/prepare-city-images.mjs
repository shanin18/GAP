import fs from 'node:fs/promises';
import sharp from 'sharp';

const photos = [
  ['vancouver', 'ga56QgNmBxU'], ['montreal', 'CL9Pl-5fXBU'],
  ['ottawa', 'C2keINMOhIE'], ['quebec-city', 'djlipMcj3QM'],
  ['edmonton', 'XfpSr1OBtio'], ['winnipeg', 'uzp3jisBY7Y'], ['calgary', 'ymsyHoqD0XE'],
];
await fs.mkdir('public/images/cities', { recursive: true });
await fs.mkdir('.image-work', { recursive: true });
const manifest = [];
for (const [city, id] of photos) {
  const source = `https://unsplash.com/photos/${id}`;
  const file = `public/images/cities/${city}.webp`;
  let data;
  try { data = await fs.readFile(file); } catch {
    const page = await fetch(source, { signal: AbortSignal.timeout(30000) });
    if (!page.ok) throw new Error(`${city}: source HTTP ${page.status}`);
    const html = await page.text();
    const match = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (!match) throw new Error(`${city}: missing photo`);
    const url = new URL(match[1].replaceAll('&amp;', '&'));
    if (url.hostname !== 'images.unsplash.com') throw new Error('Unexpected source host');
    url.search = '?w=1000&fit=max&q=85';
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`${city}: download HTTP ${response.status}`);
    const input = Buffer.from(await response.arrayBuffer());
    for (const quality of [78, 70, 62]) {
      data = await sharp(input).rotate().resize(720, 480, { fit: 'cover', position: 'attention' }).webp({ quality, effort: 6 }).toBuffer();
      if (data.length < 100000) break;
    }
    await fs.writeFile(file, data);
  }
  manifest.push({ city, source, license: 'https://unsplash.com/license', file, bytes: data.length });
  console.log(`${city}: ${Math.round(data.length / 1024)} KB`);
}
await fs.writeFile('lib/city-image-sources.json', JSON.stringify(manifest, null, 2) + '\n');
const tiles = await Promise.all(manifest.map(async (photo, i) => ({ input: await sharp(photo.file).resize(240, 160).toBuffer(), left: (i % 4) * 240, top: Math.floor(i / 4) * 160 })));
await sharp({ create: { width: 960, height: 320, channels: 3, background: '#14231b' } }).composite(tiles).webp().toFile('.image-work/cities-preview.webp');
