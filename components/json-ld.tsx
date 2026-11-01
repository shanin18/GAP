import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";

type Data = Record<string, unknown>;

/** Structured data for search engines. "<" is escaped so CMS text can't close the script tag. */
export function JsonLd({ data }: { data: Data | Data[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

type Settings = {
  siteName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  socialLinks?: { url?: string | null }[] | null;
} | null;

// Placeholder contact details must never be published to search engines.
const realEmail = (v?: string | null) => (v && !/@example\.|\.invalid$/i.test(v) ? v : undefined);
const realPhone = (v?: string | null) => (v && (v.match(/\d/g)?.length ?? 0) >= 7 ? v : undefined);
const realAddress = (v?: string | null) =>
  v && !/sample|to be confirmed|tbc/i.test(v) ? v.replace(/\s+/g, " ").trim() : undefined;

export function organizationJsonLd(settings: Settings): Data {
  const sameAs = [
    settings?.facebookUrl,
    settings?.instagramUrl,
    settings?.linkedinUrl,
    ...(settings?.socialLinks ?? []).map((link) => link.url),
  ].filter((url): url is string => Boolean(url && /^https:\/\//.test(url)));
  const email = realEmail(settings?.email);
  const telephone = realPhone(settings?.phone);
  const address = realAddress(settings?.address);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: settings?.siteName || SITE_NAME,
    alternateName: "GAP",
    url: SITE_URL,
    logo: absoluteUrl("/images/gap-logo.webp"),
    ...(email ? { email } : {}),
    ...(telephone ? { telephone } : {}),
    ...(address ? { address } : {}),
    ...(email || telephone ? { contactPoint: { "@type": "ContactPoint", contactType: "customer support", ...(email ? { email } : {}), ...(telephone ? { telephone } : {}) } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd(name?: string | null): Data {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: name || SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

type Article = {
  title: string;
  slug: string;
  shortBlurb?: string | null;
  entryType?: string | null;
  eventDate?: string | null;
  eventLocation?: string | null;
  publishedDate?: string | null;
  updatedAt?: string | null;
};

/** An event becomes an Event (eligible for Google's event listings); everything else a BlogPosting. */
export function articleJsonLd(article: Article, image: string): Data {
  const url = absoluteUrl(`/news/${article.slug}`);
  const organization = { "@id": `${SITE_URL}/#organization` };
  const location = article.eventLocation?.trim() ?? "";
  const online = /online|virtual|zoom|webinar/i.test(location);
  const venueKnown = Boolean(location) && !/to be confirmed|tbc|tba/i.test(location);
  // Google rejects in-person events without a venue, so those stay blog posts until the venue is set
  if (article.entryType === "event" && article.eventDate && (online || venueKnown)) {
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: article.title,
      description: article.shortBlurb ?? undefined,
      startDate: article.eventDate,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: online
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
      location: online
        ? { "@type": "VirtualLocation", url }
        : { "@type": "Place", name: location, address: location },
      image: [absoluteUrl(image)],
      organizer: organization,
      url,
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title.slice(0, 110),
    description: article.shortBlurb ?? undefined,
    image: [absoluteUrl(image)],
    datePublished: article.publishedDate ?? undefined,
    dateModified: article.updatedAt ?? article.publishedDate ?? undefined,
    author: organization,
    publisher: organization,
    mainEntityOfPage: url,
  };
}

/** Home › … › current page, shown by Google above the result's title. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): Data {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
