import { getCms } from '@/lib/payload';

import type { Country, News, Service, University } from '@/payload-types';
import type { Where } from 'payload';

export type CmsService = Service;
export type CmsCountry = Country;
export type CmsNews = News;
export type CmsUniversity = University;
export type CmsTestimonial = { id: string; studentName: string; universityName?: string; quote: string; photoUrl?: string | null; rating?: number | null; sortOrder?: number | null };

export async function getTestimonials(limit = 6): Promise<CmsTestimonial[]> {
  try {
    const payload = await getCms();
    const result = await payload.find({ overrideAccess: false, collection: 'testimonials', sort: 'sortOrder', limit, depth: 1 });
    return result.docs.map((doc) => ({
      id: String(doc.id), studentName: doc.studentName, quote: doc.quote,
      photoUrl: doc.photoUrl, rating: doc.rating, sortOrder: doc.sortOrder,
      universityName: typeof doc.university === 'object' && doc.university ? doc.university.name : undefined,
    }));
  } catch { return []; }
}

export async function getPublishedNews(limit = 6): Promise<CmsNews[]> {
  try {
    const payload = await getCms();
    const result = await payload.find({ overrideAccess: false,
      collection: 'news',
      where: { status: { equals: 'published' } },
      sort: '-publishedDate',
      limit,
    });
    return result.docs as CmsNews[];
  } catch {
    return [];
  }
}

export async function getNewsBySlug(slug: string): Promise<CmsNews | null> {
  try {
    const payload = await getCms();
    const result = await payload.find({ overrideAccess: false,
      collection: 'news',
      where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
      limit: 1,
    });
    return (result.docs[0] as CmsNews | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function getServices(): Promise<CmsService[]> {
  try {
    const payload = await getCms();
    const result = await payload.find({ overrideAccess: false,
      collection: 'services',
      sort: 'sortOrder',
      limit: 50,
    });
    return result.docs as CmsService[];
  } catch {
    return [];
  }
}

export async function getCountries(): Promise<CmsCountry[]> {
  try {
    const payload = await getCms();
    const result = await payload.find({ overrideAccess: false,
      collection: 'countries',
      pagination: false,
      depth: 0,
    });
    return result.docs as CmsCountry[];
  } catch {
    return [];
  }
}

export async function getCountryBySlug(slug: string): Promise<CmsCountry | null> {
  try {
    const payload = await getCms();
    const result = await payload.find({ overrideAccess: false,
      collection: 'countries',
      where: { slug: { equals: slug } },
      limit: 1,
    });
    return (result.docs[0] as CmsCountry | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function getUniversities(options?: { countrySlug?: string; featured?: boolean; limit?: number }): Promise<CmsUniversity[]> {
  try {
    const payload = await getCms();
    const conditions: Where[] = [{ status: { equals: 'published' } }];
    if (options?.featured !== undefined) conditions.push({ featured: { equals: options.featured } });

    if (options?.countrySlug) {
      const countries = await payload.find({ overrideAccess: false,
        collection: 'countries',
        where: { slug: { equals: options.countrySlug } },
        limit: 1,
      });
      if (!countries.docs[0]) return [];
      conditions.push({ country: { equals: countries.docs[0].id } });
    }

    const result = await payload.find({ overrideAccess: false,
      collection: 'universities',
      where: { and: conditions },
      sort: 'name',
      limit: options?.limit ?? 100,
      depth: 1,
    });
    return result.docs as CmsUniversity[];
  } catch {
    return [];
  }
}

export async function getUniversityBySlug(slug: string): Promise<CmsUniversity | null> {
  try {
    const payload = await getCms();
    const result = await payload.find({ overrideAccess: false,
      collection: 'universities',
      where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
      limit: 1,
      depth: 1,
    });
    return (result.docs[0] as CmsUniversity | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function getSiteSettings() {
  try {
    const payload = await getCms();
    const result = await payload.find({ collection: 'site-settings', overrideAccess: false, limit: 1, sort: 'createdAt', depth: 0 });
    return result.docs[0] ?? null;
  } catch {
    return null;
  }
}
