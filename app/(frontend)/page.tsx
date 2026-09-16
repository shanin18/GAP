import { SiteHeader } from "@/components/site-header";
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
