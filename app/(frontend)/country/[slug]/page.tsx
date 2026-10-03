import { stockImage } from "@/lib/stock-images";
import { FinalCta } from "@/components/home-sections/FinalCta";
import { getSectionText } from "@/lib/website-content-server";
import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { CountryGuide } from "@/components/country-guide";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { ApplyNowDialog } from "@/components/ui/apply-now-dialog";
import { ArrowRight, Quote } from "lucide-react";
import {
  getCountries,
  getTestimonials,
  getCountryNews,
  getCountryBySlug,
  getCountryUniversities,
} from "@/lib/cms-queries";
import { UniversityCard } from "@/components/university-card";

export async function generateStaticParams() {
  const cmsCountries = await getCountries();
  return cmsCountries.map((country) => ({ slug: country.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const country = await getCountryBySlug((await params).slug);
  return country
    ? {
        title: country.seoTitle || `Study in ${country.name}`,
        description:
          country.seoDescription || country.introduction || undefined,
      }
    : {};
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getSectionText("country-page");

  const { slug } = await params;
  const [cmsCountry, allCountries, testimonials] = await Promise.all([
    getCountryBySlug(slug),
    getCountries(),
    getTestimonials(3, slug),
  ]);
  if (!cmsCountry) notFound();
  const country = cmsCountry;
  const universities = await getCountryUniversities(country);

  const others = allCountries.filter((d) => d.slug !== slug);
  const reviews = testimonials.map((r) => ({
    name: r.studentName,
    detail: r.universityName,
    quote: r.quote,
  }));
  const posts = (await getCountryNews(country.relatedNews)).map((post) => ({
    title: post.title,
    excerpt: post.shortBlurb,
    category: t("GAP Journal"),
    href: "/news/" + post.slug,
    imageUrl: post.coverImageUrl || stockImage("planning"),
  }));
  const photos = (country.gallery ?? []).map((photo) => ({
    caption: photo.caption,
    src: photo.imageUrl || country.heroImageUrl || stockImage("study"),
  }));




  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-surface/40">
          {country.heroImageUrl && (
            <Image
              src={country.heroImageUrl}
              alt=""
              fill
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              className={`object-cover opacity-20 ${slug === 'australia' ? 'lg:object-bottom' : ''}`}
            />
          )}
          <div className="relative mx-auto max-w-7xl px-5 py-16 md:py-24 lg:px-8 lg:py-28">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {t("Study destination")}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.02] tracking-tight">
              {t("Study in ")}
              <em>{country.name}.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {country.introduction ||
                t(
                  "Discover study options, admission guidance, and university pathways for this destination.",
                )}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ApplyNowDialog />
              {universities.length > 0 && (
                <a
                  href="#universities"
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {t("See universities ")}
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </section>

        {country.body && <CountryGuide body={country.body} countryName={country.name}
          universities={universities.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2">{universities.map(university => <UniversityCard key={university.id} university={university} />)}</div> : <Link href="/universities" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">Explore university options →</Link>}
          articles={posts.length ? <ul className="mt-6 grid gap-5 sm:grid-cols-2">{posts.map(post => <li key={post.href}><Link href={post.href} className="group block">{post.imageUrl && <Image src={post.imageUrl} alt="" width={640} height={400} sizes="(min-width: 1024px) 400px, 90vw" className="aspect-[16/10] w-full rounded-xl object-cover" />}<h3 className="mt-3 font-display text-xl group-hover:text-primary">{post.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p></Link></li>)}</ul> : <Link href="/news" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">Explore GAP articles →</Link>}
        />}
        {/* Photo mosaic */}
        {photos.length > 0 && <section className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {t("Student life")}
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
              {t("A glimpse of life in ")}
              {country.name}.
            </h2>
            <div className="mt-10 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] md:grid-cols-4 md:gap-4">
              {photos.map(({ caption, src }, i) => (
                <figure
                  key={caption}
                  className={
                    "relative overflow-hidden rounded-3xl border border-border bg-[var(--surface)] " +
                    (i === 0
                      ? "col-span-2 row-span-2"
                      : i === 3
                        ? "col-span-2 md:col-span-1"
                        : "")
                  }
                >
                  {src && <Image src={src} alt={`${caption} in ${country.name}`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-500 motion-safe:hover:scale-105 motion-reduce:transition-none" />}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
                  />
                  <figcaption className="absolute bottom-4 left-5 text-sm font-semibold text-white">
                    {t(caption)}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="border-t border-[var(--border)]">
            <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                {t("Reviews")}
              </p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
                {t("Students who started with a conversation")}
              </h2>
              <ul className="mt-10 grid gap-5 md:grid-cols-3">
                {reviews.map((r) => (
                  <li
                    key={r.name}
                    className="flex flex-col rounded-3xl bg-[var(--surface)] p-7"
                  >
                    <Quote
                      aria-hidden="true"
                      size={28}
                      className="text-primary/40"
                    />
                    <blockquote className="mt-4 flex-1 font-display text-xl leading-snug">
                      â€œ{t(r.quote)}â€
                    </blockquote>
                    <p className="mt-6 font-semibold">{r.name}</p>
                    <p className="text-sm text-muted-foreground">{r.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <FinalCta />

        {/* Other destinations */}
        {others.length > 0 && (
          <section className="border-t border-[var(--border)]">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-4 px-5 py-12 lg:px-8">
              <p className="font-display text-2xl">
                {t("Exploring other destinations?")}
              </p>
              <ul className="flex flex-wrap gap-3">
                {others.slice(0, 3).map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/country/${d.slug}`}
                      className="inline-flex min-h-11 items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      {d.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
