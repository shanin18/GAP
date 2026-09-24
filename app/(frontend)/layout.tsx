import type { Metadata, Viewport } from "next";
import { SectionReveals } from "@/components/section-reveals";
import { DestinationsProvider } from "@/components/destinations-provider";
import { getGlobeDestinations } from "@/lib/globe-destinations";
import { fraunces, manrope } from "@/lib/fonts";
import "./globals.css";
import { WebsiteContentProvider } from "@/components/website-content-provider";
import { getWebsiteContent } from "@/lib/website-content-server";
import { getSiteSettings } from "@/lib/cms-queries";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Pages are built once and served from cache, then refreshed in the background
// at most every 5 minutes (instead of querying the database on every request).
// Lower the number if you need edits from Payload to appear sooner.
export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings?.siteName || "Global Admission Platform";
  const title = settings?.seoTitle || `${name} | Study Abroad Guidance`;
  const description =
    settings?.seoDescription ||
    "Human-led study abroad counselling, university selection and admission support.";
  return {
    metadataBase: new URL(siteUrl),
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
    },
    twitter: { card: "summary_large_image" },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const destinations = await getGlobeDestinations();
  const content = await getWebsiteContent();
  const settings = await getSiteSettings();
  return (
    <html lang="en" data-scroll-behavior="smooth" data-theme="dark">
      <body
        // Extensions such as Grammarly add body attributes before hydration.
        suppressHydrationWarning
        className={`${fraunces.variable} ${manrope.variable} pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0`}
      >
        <DestinationsProvider destinations={destinations}>
          <WebsiteContentProvider content={content}>
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
