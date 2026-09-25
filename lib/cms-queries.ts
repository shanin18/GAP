import { publicCmsCache } from "./public-cms-cache";
import { getCms } from "@/lib/payload";

import type { Country, News, Service, University } from "@/payload-types";
import type { Where } from "payload";

export type CmsService = Service;
export type CmsCountry = Country;
export type CmsCountrySummary = Pick<Country, "id" | "name" | "slug">;
export type CmsNews = News;
export type CmsUniversity = University;
export type CmsTestimonial = {
  id: string;
  studentName: string;
  universityName?: string;
  quote: string;
  photoUrl?: string | null;
  rating?: number | null;
  sortOrder?: number | null;
};

/**
 * Error policy.
 * Never cache an outage as an empty list, missing settings or a 404.
 */
function fail<T>(scope: string, error: unknown, _fallback: T): T {
  console.error(`[cms] ${scope} failed:`, error);
  throw error;
}

export const getTestimonials = publicCmsCache(
  "getTestimonials",
  ["testimonials", "universities", "countries"],
  async (
    limit: number = 6,
    countrySlug?: string,
  ): Promise<CmsTestimonial[]> => {
    try {
      const payload = await getCms();
      const where: Where | undefined = countrySlug
        ? {
            or: [
              { "country.slug": { equals: countrySlug } },
              { country: { exists: false } },
            ],
          }
        : undefined;
      // Visitors only get published testimonials: the collection's read rule adds that filter
      const result = await payload.find({
        overrideAccess: false,
        collection: "testimonials",
        where,
        sort: "sortOrder",
        limit,
        depth: 1,
        populate: {
          universities: { name: true },
          countries: { name: true, slug: true },
        },
      });
      return result.docs.map((doc) => ({
        id: String(doc.id),
        studentName: doc.studentName,
        quote: doc.quote,
        photoUrl: doc.photoUrl,
        rating: doc.rating,
        sortOrder: doc.sortOrder,
        universityName:
          typeof doc.university === "object" && doc.university
            ? doc.university.name
            : undefined,
      }));
    } catch (error) {
      return fail("getTestimonials", error, []);
    }
  },
);

export const getPublishedNews = publicCmsCache(
  "getPublishedNews",
  ["news"],
  async (limit: number = 6): Promise<CmsNews[]> => {
    try {
      const payload = await getCms();
      const result = await payload.find({
        overrideAccess: false,
        collection: "news",
        where: { status: { equals: "published" } },
        sort: "-publishedDate",
        limit,
        depth: 0,
      });
      return result.docs as CmsNews[];
    } catch (error) {
      return fail("getPublishedNews", error, []);
    }
  },
);

export const getNewsBySlug = publicCmsCache(
  "getNewsBySlug",
  ["news"],
  async (slug: string): Promise<CmsNews | null> => {
    try {
      const payload = await getCms();
      const result = await payload.find({
        overrideAccess: false,
        collection: "news",
        where: {
          and: [
            { slug: { equals: slug } },
            { status: { equals: "published" } },
          ],
        },
        limit: 1,
        depth: 0,
      });
      return (result.docs[0] as CmsNews | undefined) ?? null;
    } catch (error) {
      return fail("getNewsBySlug", error, null);
    }
  },
);

async function read_getCountryNews(
  related?: (number | News)[] | null,
): Promise<CmsNews[]> {
  const ids =
    related?.map((post) => (typeof post === "object" ? post.id : post)) ?? [];
  if (!ids.length) return [];
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "news",
    overrideAccess: false,
    where: { id: { in: ids } },
    depth: 0,
    pagination: false,
  });
  return ids.flatMap((id) => docs.find((post) => post.id === id) ?? []);
}

export const getServices = publicCmsCache(
  "getServices",
  ["services"],
  async (): Promise<CmsService[]> => {
    try {
      const payload = await getCms();
      const result = await payload.find({
        overrideAccess: false,
        collection: "services",
        sort: "sortOrder",
        limit: 50,
        depth: 0,
      });
      return result.docs as CmsService[];
    } catch (error) {
      return fail("getServices", error, []);
    }
  },
);

export const getCountries = publicCmsCache(
  "getCountries",
  ["countries"],
  async (): Promise<CmsCountrySummary[]> => {
    try {
      const payload = await getCms();
      const result = await payload.find({
        overrideAccess: false,
        collection: "countries",
        sort: "name",
        pagination: false,
        depth: 0,
        select: { name: true, slug: true },
      });
      return result.docs;
    } catch (error) {
      return fail("getCountries", error, []);
    }
  },
);

export const getCountryBySlug = publicCmsCache(
  "getCountryBySlug",
  ["countries", "universities"],
  async (slug: string): Promise<CmsCountry | null> => {
    try {
      const payload = await getCms();
      const result = await payload.find({
        overrideAccess: false,
        collection: "countries",
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0, // the page only needs the country's own fields
        select: { universityList: false },
      });
      return (result.docs[0] as CmsCountry | undefined) ?? null;
    } catch (error) {
      return fail("getCountryBySlug", error, null);
    }
  },
);

async function read_getUniversities(options?: {
  countrySlug?: string;
  featured?: boolean;
  limit?: number;
}): Promise<CmsUniversity[]> {
  try {
    const payload = await getCms();
    const conditions: Where[] = [{ status: { equals: "published" } }];
    if (options?.featured !== undefined)
      conditions.push({ featured: { equals: options.featured } });
    // One query instead of two: filter through the relationship directly
    if (options?.countrySlug)
      conditions.push({ "country.slug": { equals: options.countrySlug } });

    const result = await payload.find({
      overrideAccess: false,
      collection: "universities",
      where: { and: conditions },
      sort: "name",
      limit: options?.limit ?? 100,
      depth: 1,
      populate: { countries: { name: true, slug: true } },
    });
    return result.docs as CmsUniversity[];
  } catch (error) {
    return fail("getUniversities", error, []);
  }
}

async function read_getCountryUniversities(
  country: CmsCountry,
): Promise<CmsUniversity[]> {
  const ids =
    country.relatedUniversities?.map((item) =>
      typeof item === "object" ? item.id : item,
    ) ?? [];
  if (!ids.length)
    return getUniversities({ countrySlug: country.slug, limit: 6 });
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "universities",
    overrideAccess: false,
    where: { id: { in: ids } },
    pagination: false,
    depth: 1,
    populate: { countries: { name: true, slug: true } },
  });
  return ids.flatMap(
    (id) => docs.find((university) => university.id === id) ?? [],
  );
}

export const getUniversityBySlug = publicCmsCache(
  "getUniversityBySlug",
  ["universities", "countries"],
  async (slug: string): Promise<CmsUniversity | null> => {
    try {
      const payload = await getCms();
      const result = await payload.find({
        overrideAccess: false,
        collection: "universities",
        where: {
          and: [
            { slug: { equals: slug } },
            { status: { equals: "published" } },
          ],
        },
        limit: 1,
        depth: 1,
        populate: { countries: { name: true, slug: true } },
      });
      return (result.docs[0] as CmsUniversity | undefined) ?? null;
    } catch (error) {
      return fail("getUniversityBySlug", error, null);
    }
  },
);

export const getSiteSettings = publicCmsCache(
  "getSiteSettings",
  ["site-settings"],
  async () => {
    try {
      const payload = await getCms();
      const result = await payload.find({
        collection: "site-settings",
        overrideAccess: false,
        limit: 1,
        sort: "createdAt",
        depth: 0,
      });
      return result.docs[0] ?? null;
    } catch (error) {
      return fail("getSiteSettings", error, null);
    }
  },
);

/** Light-weight lists for the application form: only ids and names, no related documents. */
export const getApplicationOptions = publicCmsCache(
  "getApplicationOptions",
  ["countries", "universities"],
  async () => {
    const payload = await getCms();
    const [countries, universities] = await Promise.all([
      payload.find({
        collection: "countries",
        overrideAccess: false,
        pagination: false,
        depth: 0,
        sort: "name",
        select: { name: true, slug: true },
      }),
      payload.find({
        collection: "universities",
        overrideAccess: false,
        pagination: false,
        depth: 0,
        sort: "name",
        where: { status: { equals: "published" } },
        select: { name: true, country: true },
      }),
    ]);
    return {
      countries: countries.docs.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
      universities: universities.docs.map((u) => ({
        id: u.id,
        name: u.name,
        country: typeof u.country === "object" ? u.country?.id : u.country,
      })),
    };
  },
);

export const getUniversities = publicCmsCache(
  "getUniversities",
  ["universities", "countries"],
  read_getUniversities,
);
export const getCountryNews = publicCmsCache(
  "getCountryNews",
  ["news"],
  read_getCountryNews,
);
export const getCountryUniversities = publicCmsCache(
  "getCountryUniversities",
  ["universities", "countries"],
  read_getCountryUniversities,
);
