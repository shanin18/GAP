import { SiteHeader } from "@/components/site-header";
import { Fragment } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/home-sections/Hero";
import { About } from "@/components/home-sections/About";
import { AcademicGuidance } from "@/components/home-sections/AcademicGuidance";
import { HowGapWorks } from "@/components/home-sections/HowGapWorks";
import { Testimonials } from "@/components/home-sections/Testimonials";
import { NewsFeed } from "@/components/home-sections/NewsFeed";
import { Partners } from "@/components/home-sections/Partners";
import { FinalCta } from "@/components/home-sections/FinalCta";
import {
  getPublishedNews,
  getTestimonials,
  getUniversities,
} from "@/lib/cms-queries";
import { getWebsiteContent } from "@/lib/website-content-server";

export default async function HomePage() {
  const [news, testimonials, partners] = await Promise.all([
    getPublishedNews(6),
    getTestimonials(6),
    getUniversities({ featured: true }),
  ]);
  const content = await getWebsiteContent();
  const sections = [
    { key: "home-hero", element: <Hero /> },
    { key: "home-about", element: <About /> },
    { key: "home-guidance", element: <AcademicGuidance /> },
    { key: "home-process", element: <HowGapWorks /> },
    {
      key: "home-testimonials",
      element: <Testimonials items={testimonials} />,
    },
    { key: "home-news", element: <NewsFeed items={news} /> },
    {
      key: "home-partners",
      element: (
        <Partners
          items={partners.map(({ id, name, logoUrl }) => ({
            id,
            name,
            logoUrl,
          }))}
        />
      ),
    },
    { key: "home-cta", element: <FinalCta /> },
  ]
    .map((section, index) => ({
      ...section,
      order: content[section.key]?.sortOrder ?? index * 10,
    }))
    .filter((section) => content[section.key]?.enabled !== false)
    .sort((a, b) => a.order - b.order);
  return (
    <>
      <SiteHeader />
      <main>
        {sections.map(({ key, element }) => (
          <Fragment key={key}>{element}</Fragment>
        ))}
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
