import type { Metadata, Viewport } from "next";
import { SectionReveals } from "@/components/section-reveals";
import { DestinationsProvider } from "@/components/destinations-provider";
import { getGlobeDestinations } from "@/lib/globe-destinations";
import { fraunces, manrope } from "@/lib/fonts";
import "./globals.css";
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
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Global Admission Platform | Study Abroad Guidance",
    template: "%s | Global Admission Platform",
  },
  description:
    "Human-led study abroad counselling, university selection and admission support.",
  icons: {
    icon: [{ url: "/images/_gap-logo.webp", type: "image/webp" }],
  },
  openGraph: {
    type: "website",
    siteName: "Global Admission Platform",
    title: "Global Admission Platform | Study Abroad Guidance",
    description:
      "Human-led study abroad counselling, university selection and admission support.",
  },
  twitter: { card: "summary_large_image" },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const destinations = await getGlobeDestinations();
  return (
    <html lang="en" data-scroll-behavior="smooth" data-theme="dark">
      <body
        className={`${fraunces.variable} ${manrope.variable} pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0`}
      >
        <DestinationsProvider destinations={destinations}>
          {children}
          <SectionReveals />
        </DestinationsProvider>
      </body>
    </html>
  );
}