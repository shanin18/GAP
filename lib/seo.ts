import type { Metadata } from "next";

export const SITE_NAME = "Global Admission Platform";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const DEFAULT_DESCRIPTION =
  "Human-led study abroad guidance: counselling, university and course selection, application and admission support, and pre-departure help for students.";

/** Shown when a page has no image of its own (1200 × 630, see public/images/og-default.jpg). */
export const DEFAULT_SHARE_IMAGE = { url: "/images/og-default.jpg", width: 1200, height: 630, alt: SITE_NAME };

/**
 * Title, description, canonical URL and sharing preview for one page.
 * Next replaces (doesn't merge) openGraph per page, so every page sets all of it here:
 * otherwise shared links show the site's default title instead of the page's.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  absoluteTitle = false,
}: {
  title: string;
  description?: string | null;
  /** Path of the page, e.g. "/about"; resolved against NEXT_PUBLIC_SITE_URL */
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  /** Use the title as-is, without the " | Global Admission Platform" suffix */
  absoluteTitle?: boolean;
}): Metadata {
  const text = description?.trim() || DEFAULT_DESCRIPTION;
  const images = [image ? { url: image } : DEFAULT_SHARE_IMAGE];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: text,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title,
      description: text,
      url: path,
      images,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description: text, images: images.map((i) => i.url) },
  };
}

/** Absolute URL for structured data, which (unlike metadata) isn't resolved against metadataBase. */
export const absoluteUrl = (pathOrUrl: string) =>
  /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
