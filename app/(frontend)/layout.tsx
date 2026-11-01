import type { Metadata, Viewport } from "next";
import { SectionReveals } from "@/components/section-reveals";
import { DestinationsProvider } from "@/components/destinations-provider";
import { getGlobeDestinations } from "@/lib/globe-destinations";
import { fraunces, manrope } from "@/lib/fonts";
import "./globals.css";
import { WebsiteContentProvider } from "@/components/website-content-provider";
import { getWebsiteContent } from "@/lib/website-content-server";
import { getSiteSettings } from "@/lib/cms-queries";
import { DEFAULT_DESCRIPTION, DEFAULT_SHARE_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/components/json-ld";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Production pages use ISR; public CMS reads also have a shared Data Cache.
// Both expire after an hour as a fallback: CMS saves refresh them immediately (payload/hooks/revalidate.ts).
export const revalidate = 3600;

// Defaults only: every page sets its own title, canonical URL and sharing preview via lib/seo.ts.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings?.siteName || SITE_NAME;
  const title = settings?.seoTitle || `${name} | Study Abroad Guidance`;
  const description = settings?.seoDescription || DEFAULT_DESCRIPTION;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${name}`,
    },
    description,
    icons: {
      icon: [{ url: settings?.faviconUrl || "/images/_gap-logo.webp" }],
    },
    openGraph: {
      type: "website",
      siteName: name,
      title,
      description,
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", images: [DEFAULT_SHARE_IMAGE.url] },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [destinations, content, settings] = await Promise.all([
    getGlobeDestinations(),
    getWebsiteContent(),
    getSiteSettings(),
  ]);
  // Server-rendered sections don't need to travel in the client context.
  const clientSections = new Set([
    "mobile-navigation", "country-menu", "home-process", "university-filters",
    "enquiry-form", "home-guidance", "university-card",
  ]);
  const clientContent = Object.fromEntries(
    Object.entries(content).filter(([key]) => clientSections.has(key)),
  );
  return (
    <html lang="en" data-scroll-behavior="smooth" data-theme="dark">
      <body
        // Extensions such as Grammarly add body attributes before hydration.
        suppressHydrationWarning
        className={`${fraunces.variable} ${manrope.variable} pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0`}
      >
        <JsonLd data={[organizationJsonLd(settings), websiteJsonLd(settings?.siteName)]} />
        <DestinationsProvider destinations={destinations}>
          <WebsiteContentProvider content={clientContent}>
            {settings?.maintenanceMode ? (
              <main className="mx-auto max-w-2xl px-5 py-24 text-center">
                <h1 className="font-display text-4xl">{settings.siteName}</h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  {settings.maintenanceMessage}
                </p>
              </main>
            ) : (
              children
            )}
            <SectionReveals />
          </WebsiteContentProvider>
        </DestinationsProvider>
      </body>
    </html>
  );
}
