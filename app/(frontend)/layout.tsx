import type { Metadata, Viewport } from "next";
import { cookies } from 'next/headers';
import { ThemeProvider } from '@/components/theme-provider';
import { SectionReveals } from '@/components/section-reveals';
import { fraunces, manrope } from "@/lib/fonts";
import "./globals.css";
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export const dynamic = "force-dynamic";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Global Admission Platform | Study Abroad Guidance",
    template: "%s | Global Admission Platform",
  },
  description:
    "Human-led study abroad counselling, university selection and admission support.",
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
  const theme = (await cookies()).get('gap-theme')?.value === 'dark' ? 'dark' : 'light';
  return (
    <html lang="en" data-scroll-behavior="smooth" data-theme={theme}>
      <body className={`${fraunces.variable} ${manrope.variable} pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0`}>
        <ThemeProvider initialTheme={theme}>{children}<SectionReveals /></ThemeProvider>
      </body>
    </html>
  );
}
