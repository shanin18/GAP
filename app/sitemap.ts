import type { MetadataRoute } from 'next';
import { getCountries, getPublishedNews, getUniversities } from '@/lib/cms-queries';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const [countries, news, universities] = await Promise.all([getCountries(), getPublishedNews(100), getUniversities({ limit: 200 })]);
  const fixed = ['', '/services', '/universities', '/news', '/apply'].map(path => ({ url: `${base}${path}`, lastModified: new Date() }));
  return [...fixed, ...countries.map(x=>({url:`${base}/country/${x.slug}`,lastModified:new Date()})), ...news.map(x=>({url:`${base}/news/${x.slug}`,lastModified:new Date(x.publishedDate)})), ...universities.map(x=>({url:`${base}/universities/${x.slug}`,lastModified:new Date()}))];
}
