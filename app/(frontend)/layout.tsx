import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
export const dynamic = "force-dynamic";
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
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
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable}`}>
        {children}
      </body>
    </html>
  );
}
