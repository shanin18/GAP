import type { MetadataRoute } from "next";
import {
  getCountries,
  getPublishedNews,
  getUniversities,
} from "@/lib/cms-queries";
import { SITE_URL } from "@/lib/seo";

// Rebuilt hourly, and immediately when CMS content changes (see payload/hooks/revalidate.ts)
export const revalidate = 3600;

/** Real "last changed" dates only: a date that changes on every rebuild teaches Google to ignore them. */
const changed = (...dates: (string | null | undefined)[]) => {
  const valid = dates.filter((d): d is string => Boolean(d)).map((d) => new Date(d)).filter((d) => !Number.isNaN(d.getTime()));
  return valid.length ? new Date(Math.max(...valid.map((d) => d.getTime()))) : undefined;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [countries, news, universities] = await Promise.all([
    getCountries(),
    getPublishedNews(100),
    getUniversities({ limit: 200 }),
  ]);
  const page = (path: string, lastModified?: Date) => ({ url: `${SITE_URL}${path}`, ...(lastModified ? { lastModified } : {}) });
  return [
    page("/", changed(...countries.map((c) => c.updatedAt), ...news.map((n) => n.updatedAt))),
    page("/about"),
    page("/services"),
    page("/countries", changed(...countries.map((c) => c.updatedAt))),
    page("/universities", changed(...universities.map((u) => u.updatedAt))),
    page("/news", changed(...news.map((n) => n.updatedAt))),
    ...countries.map((c) => page(`/country/${c.slug}`, changed(c.updatedAt))),
    ...news.map((n) => page(`/news/${n.slug}`, changed(n.updatedAt, n.publishedDate))),
    ...universities.map((u) => page(`/universities/${u.slug}`, changed(u.updatedAt))),
  ];
}
