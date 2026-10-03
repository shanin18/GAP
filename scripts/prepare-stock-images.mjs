import fs from 'node:fs/promises';
import sharp from 'sharp';

const photos = [
  ['austria','5SjAaqqCCmY','Vienna skyline'], ['canada','g3V_S1HaSjk','Toronto skyline'],
  ['denmark','zpEnz-NylIA','Copenhagen canal'], ['finland','vqcsN5Aq3T8','Helsinki waterfront'],
  ['germany','0rarcry1u78','Berlin skyline'], ['lithuania','HdofToH0dQg','Vilnius old town'],
  ['malta','SUawlysrJlg','Valletta waterfront'], ['new-zealand','yRAlbTrxkVE','Auckland harbour'],
  ['poland','SI8H2lRaM-E','Warsaw skyline'], ['sweden','2WP6etuxw98','Stockholm waterfront'],
  ['switzerland','XRZC5cWIQ0k','Zurich riverfront'], ['united-kingdom','E0ROFCstqWw','London skyline'],
  ['united-states','bvmZDUoLeuM','New York skyline'],
  ['academic','klbApl9mxr0','Student studying in a library'], ['career','pUAM5hPaCRI','Notebook and laptop for planning'],
  ['planning','6e7F96dBlAA','Notebook for study planning'], ['study','HNjWq8WPyoY','Study materials and books'],
  ['departure','j1dj50Td7CQ','View from an airplane window'],
];
const dir = '.image-work';
await fs.mkdir(dir, { recursive: true });
const manifest = [];
for (const [key, id, alt] of photos) {
  const source = `https://unsplash.com/photos/${id}`;
  const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${key}: source HTTP ${response.status}`);
  const html = await response.text();
  const match = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (!match) throw new Error(`${key}: no image`);
  const url = new URL(match[1].replaceAll('&amp;', '&'));
  if (url.hostname !== 'images.unsplash.com') throw new Error(`${key}: unexpected image host`);
  url.search = '?w=1600&fit=max&q=85';
  const image = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!image.ok) throw new Error(`${key}: image HTTP ${image.status}`);
  const input = Buffer.from(await image.arrayBuffer());
  let output;
  const width = photos.findIndex(p => p[0] === key) < 13 ? 1440 : 1100;
  for (const quality of [80, 74, 68, 62]) {
    output = await sharp(input).rotate().resize({ width, height: Math.round(width * 0.625), fit: 'cover', position: 'attention', withoutEnlargement: true }).webp({ quality, effort: 6 }).toBuffer();
    if (output.length <= 220000) break;
  }
  if (output.length > 260000) throw new Error(`${key}: exceeds image budget`);
  const file = `${dir}/${key}.webp`;
  await fs.writeFile(file, output);
  const meta = await sharp(output).metadata();
  manifest.push({ key, source, license: 'https://unsplash.com/license', alt, file, bytes: output.length, width: meta.width, height: meta.height });
  console.log(`${key}: ${Math.round(output.length / 1024)} KB (${meta.width}x${meta.height})`);
}
await fs.writeFile(`${dir}/manifest.json`, JSON.stringify(manifest, null, 2));
const tiles = await Promise.all(manifest.map(async (photo, i) => ({ input: await sharp(photo.file).resize(240, 160, { fit: 'cover' }).toBuffer(), left: (i % 4) * 240, top: Math.floor(i / 4) * 160 })));
await sharp({ create: { width: 960, height: Math.ceil(photos.length / 4) * 160, channels: 3, background: '#ffffff' } }).composite(tiles).webp().toFile(`${dir}/preview.webp`);
