export type CountrySummary = {
  name: string;
  slug: string;
  heroImageUrl?: string;
  body?: unknown;
};

export type ServiceSummary = {
  title: string;
  icon?: string;
  shortDescription: string;
};

export async function getCountryBySlug(slug: string): Promise<CountrySummary | null> {
  // Stage 5 boundary: replace with Payload Local API query after the admin route is mounted.
  const countries: CountrySummary[] = [
    { name: 'Australia', slug: 'australia' },
    { name: 'Canada', slug: 'canada' },
    { name: 'New Zealand', slug: 'new-zealand' },
  ];
  return countries.find((country) => country.slug === slug) ?? null;
}
