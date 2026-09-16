import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import { SiteFooter } from "@/components/site-footer";
import {
  Hero,
  About,
  AcademicGuidance,
  HowGapWorks,
  Testimonials,
  NewsFeed,
  Partners,
  FinalCta,
} from "@/components/sections/FinalCta";
import { getPublishedNews, getTestimonials } from "@/lib/cms-queries";

export default async function HomePage() {
  const [news, testimonials] = await Promise.all([
    getPublishedNews(6),
    getTestimonials(6),
  ]);
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <About />
        <AcademicGuidance />
        <HowGapWorks />
        <Testimonials items={testimonials} />
        <NewsFeed items={news} />
        <Partners />
        <FinalCta />
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
