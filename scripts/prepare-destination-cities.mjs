import { destinationGuides } from '../lib/destination-study-guides.ts';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import sharp from 'sharp';
const headers = { 'User-Agent': 'GAPWebsiteAssets/1.0 (educational destination guide)' };
const slug = value => value.toLowerCase().replaceAll("'", '').replace(/[^a-z0-9]+/g, '-');
await mkdir('public/images/destination-cities', { recursive: true });
const credits = JSON.parse(await readFile('lib/destination-city-images.json', 'utf8').catch(() => '[]'));
const request = async (...args) => { for (let attempt=0; attempt<4; attempt++) { await new Promise(resolve => setTimeout(resolve, 1200)); const result=await fetch(...args); if (result.status !== 429 && result.status !== 503) return result; await new Promise(resolve => setTimeout(resolve, 6000)); } throw new Error('image service temporarily limited'); };
const jobs = destinationGuides.flatMap(guide => guide.cities.map(city => ({ guide, city }))).filter(job => !credits.some(image => image.country === job.guide.name && image.city === job.city));
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const { guide, city } = jobs[next++];
    try {
      const title = { Krakow: 'Kraków', Wroclaw: 'Wrocław', Klaipeda: 'Klaipėda', 'Saint Julian\'s': 'St. Julian\'s', Zurich: 'Zürich' }[city] || city;
      const response = await request(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&redirects=1&prop=pageimages&piprop=original%7Cthumbnail&pithumbsize=960&format=json`, { headers });
      if (!response.ok) throw new Error('city lookup');
      const page = Object.values((await response.json()).query.pages)[0];
      const original = page.original?.source;
      if (!original || !page.thumbnail?.source) throw new Error('no photograph');
      const filename = decodeURIComponent(new URL(original).pathname.split('/').pop());
      const infoResponse = await request(`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(`File:${filename}`)}&prop=imageinfo&iiprop=extmetadata&format=json`, { headers });
      const info = Object.values((await infoResponse.json()).query.pages)[0].imageinfo?.[0]?.extmetadata;
      const license = info?.LicenseShortName?.value || '';
      if (!/CC|public domain|PD|CC0/i.test(license)) throw new Error('license not suitable');
      const photo = await request(page.thumbnail.source, { headers });
      if (!photo.ok) throw new Error('image download');
      const image = await sharp(Buffer.from(await photo.arrayBuffer())).resize(720, 480, { fit: 'cover' }).webp({ quality: 72, effort: 5 }).toBuffer();
      const path = `/images/destination-cities/${guide.slug}-${slug(city)}.webp`;
      await writeFile(`public${path}`, image);
      credits.push({ country: guide.name, city, path, source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`, artist: (info.Artist?.value || 'Wikimedia contributor').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(), license, licenseUrl: info.LicenseUrl?.value || '', bytes: image.length });
      console.log(`Prepared ${city}: ${Math.round(image.length / 1024)} KB`);
    } catch (error) { console.log(`Needs image: ${city} (${error.message})`); }
  }
}
await Promise.all(Array.from({ length: 1 }, worker));
await writeFile('lib/destination-city-images.json', JSON.stringify(credits.sort((a, b) => a.country.localeCompare(b.country) || a.city.localeCompare(b.city)), null, 2));
console.log(`Prepared ${credits.length}/${destinationGuides.reduce((n, guide) => n + guide.cities.length, 0)} licensed city photos.`);
