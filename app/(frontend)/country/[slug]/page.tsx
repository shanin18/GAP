import Image from "next/image";
import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { ApplyNowDialog } from "@/components/ui/apply-now-dialog";
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Quote,
} from "lucide-react";
import {
  getCountries,
  getCountryBySlug,
  getUniversities,
} from "@/lib/cms-queries";
import { UniversityCard } from "@/components/university-card";

const fallbackCountries = {
  australia: {
    name: "Australia",
    intro:
      "A welcoming destination for ambitious students looking for globally recognised education.",
    facts: [
      "Globally recognised universities",
      "Wide range of programs",
      "Strong student support",
    ],
  },
  canada: {
    name: "Canada",
    intro:
      "Build your next chapter in a destination known for diverse communities and strong education options.",
    facts: [
      "Internationally respected institutions",
      "Diverse study choices",
      "Student-focused communities",
    ],
  },
  "new-zealand": {
    name: "New Zealand",
    intro:
      "Explore a focused study experience surrounded by a distinctive culture and environment.",
    facts: [
      "Quality education options",
      "Supportive communities",
      "Distinctive study experience",
    ],
  },
};

/* -------------------------------------------------------------------------- */
/*  Content that is not in the CMS yet                                         */
/* -------------------------------------------------------------------------- */

/**
 * TEMPORARY: while true, the reviews and articles sections show fictional sample content
 * so you can see the layout. Set to false (and delete the sample arrays) before launch,
 * or replace them with real CMS data. Those sections then hide themselves when empty.
 */
const SHOW_PREVIEW_CONTENT = true;

type Review = { name: string; detail: string; quote: string };
type Post = { title: string; excerpt: string; category: string; href?: string };

const PREVIEW_REVIEWS: Review[] = [
  {
    name: "Student One",
    detail: "Bachelor's applicant",
    quote:
      "I arrived with a dozen questions and no plan. After two conversations I had a shortlist I trusted.",
  },
  {
    name: "Student Two",
    detail: "Master's applicant",
    quote:
      "Every step was explained clearly, and I always knew what came next and what I needed to prepare.",
  },
  {
    name: "Student Three",
    detail: "Parent of a student",
    quote:
      "We could finally make the decision as a family, without feeling pressured by anyone.",
  },
];

const PREVIEW_POSTS: Post[] = [
  {
    title: "How to build a study-abroad shortlist you can trust",
    excerpt:
      "A simple way to compare programs by fit, cost and career direction instead of by reputation alone.",
    category: "Planning",
  },
  {
    title: "Documents to start preparing before you apply",
    excerpt:
      "A practical checklist to get ahead early, so deadlines feel calm instead of rushed.",
    category: "Admissions",
  },
  {
    title: "What to expect in your first month abroad",
    excerpt:
      "Settling in, meeting people and finding your rhythm: a realistic look at the first weeks.",
    category: "Student life",
  },
];

/**
 * Optional photos per country slug. Put files in /public and list them here, e.g.
 * canada: ["/images/countries/canada-1.jpg", "/images/countries/canada-2.jpg", ...]
 * Empty slots show a light placeholder. Keep each image under about 150 KB.
 */
const COUNTRY_PHOTOS: Record<string, string[]> = {};

const PHOTO_CAPTIONS = ["Campus life", "City living", "Study spaces", "Community"];

const REVIEW_TITLE = "Students who started with a conversation";

const routeSteps = (country: string) => [
  {
    title: "Talk to an adviser",
    text: `Share your goals and ask anything about studying in ${country}.`,
  },
  {
    title: "Build your shortlist",
    text: "Compare universities and programs that fit your profile and budget.",
  },
  {
    title: "Apply with support",
    text: "Prepare documents and submit your applications accurately and on time.",
  },
  {
    title: "Get ready to fly",
    text: "Prepare for departure so you arrive informed and confident.",
  },
];

const highlightIcons = [GraduationCap, ClipboardCheck, CalendarDays];

export async function generateStaticParams() {
  const cmsCountries = await getCountries();
  if (cmsCountries.length)
    return cmsCountries.map((country) => ({ slug: country.slug }));
  return Object.keys(fallbackCountries).map((slug) => ({ slug }));
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [cmsCountry, universities, allCountries] = await Promise.all([
    getCountryBySlug(slug),
    getUniversities({ countrySlug: slug, limit: 6 }),
    getCountries(),
  ]);
  const fallback = fallbackCountries[slug as keyof typeof fallbackCountries];
  const country = cmsCountry ?? (fallback ? { ...fallback, slug } : null);
  if (!country) notFound();

  const facts =
    !cmsCountry && fallback
      ? fallback.facts
      : [
          "Explore partner universities",
          "Review entry requirements",
          "Plan your application timeline",
        ];

  const destinations = allCountries.length
    ? allCountries.map((c) => ({ slug: c.slug, name: c.name }))
    : Object.entries(fallbackCountries).map(([s, c]) => ({ slug: s, name: c.name }));
  const others = destinations.filter((d) => d.slug !== slug);

  const reviews = SHOW_PREVIEW_CONTENT ? PREVIEW_REVIEWS : [];
  const posts = SHOW_PREVIEW_CONTENT ? PREVIEW_POSTS : [];

  // Gallery: the CMS image (if any) leads, then any photos listed above
  const photos = PHOTO_CAPTIONS.map((caption, i) => ({
    caption,
    src:
      (i === 0 && cmsCountry?.heroImageUrl) ||
      COUNTRY_PHOTOS[slug]?.[i] ||
      undefined,
  }));

  const dotted = {
    backgroundImage:
      "radial-gradient(circle at 30% 25%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 58%), radial-gradient(color-mix(in oklch, var(--primary) 26%, transparent) 1px, transparent 1.5px)",
    backgroundSize: "100% 100%, 20px 20px",
  } as const;

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-surface/40">
          <div className="mx-auto max-w-7xl px-5 py-16 md:py-24 lg:px-8 lg:py-28">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              Study destination
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.02] tracking-tight">
              Study in <em>{country.name}.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {!cmsCountry && fallback
                ? fallback.intro
                : "Discover study options, admission guidance, and university pathways for this destination."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ApplyNowDialog triggerClass="rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-primary-foreground" />
              {universities.length > 0 && (
                <a
                  href="#universities"
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
                >
                  See universities <ArrowRight size={17} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section>
          <div className="mx-auto max-w-7xl px-5 pt-16 md:pt-20 lg:px-8 lg:pt-24">
            <ul className="grid gap-8 md:grid-cols-3 md:gap-10">
              {facts.map((fact, i) => {
                const Icon = highlightIcons[i % highlightIcons.length];
                return (
                  <li key={fact} className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_oklch,var(--primary)_14%,var(--surface))] text-primary"
                    >
                      <Icon size={22} />
                    </span>
                    <h2 className="pt-1 font-display text-2xl leading-tight">{fact}</h2>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Why this destination */}
        <section>
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-16 lg:px-8 lg:py-28">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                Why this destination
              </p>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-[-0.02em] sm:text-5xl">
                Choose with your goals in mind.
              </h2>
            </div>
            <div>
              {cmsCountry?.body ? (
                <RichText
                  data={cmsCountry.body}
                  className="max-w-2xl leading-8 text-muted-foreground sm:text-lg [&_p]:mb-4 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-3xl [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5"
                />
              ) : (
                <p className="max-w-2xl leading-8 text-muted-foreground sm:text-lg">
                  GAP combines destination guidance, university selection, and
                  application support into one practical journey, so you can
                  compare {country.name} with your goals, your budget and your
                  plans for the future.
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <ApplyNowDialog triggerContent="Talk to an adviser" />
                <Link
                  href="/services"
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Explore our support <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Photo mosaic */}
        <section className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              Student life
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
              A glimpse of life in {country.name}.
            </h2>
            <div className="mt-10 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] md:grid-cols-4 md:gap-4">
              {photos.map(({ caption, src }, i) => (
                <figure
                  key={caption}
                  className={
                    "relative overflow-hidden rounded-3xl border border-border bg-[var(--surface)] " +
                    (i === 0 ? "col-span-2 row-span-2" : i === 3 ? "col-span-2 md:col-span-1" : "")
                  }
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={`${caption} in ${country.name}`}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div aria-hidden="true" className="absolute inset-0" style={dotted} />
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
                  />
                  <figcaption className="absolute bottom-4 left-5 text-sm font-semibold text-white">
                    {caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Route to the country */}
        <section className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              Your route
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
              From first question to {country.name}.
            </h2>
            <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {routeSteps(country.name).map((step, i) => (
                <li key={step.title}>
                  <span className="grid size-12 place-items-center rounded-full border border-primary/50 font-display text-lg text-primary">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 font-display text-2xl leading-tight">{step.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Universities */}
        {universities.length > 0 && (
          <section id="universities" className="scroll-mt-20 border-t border-[var(--border)]">
            <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                University options
              </p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
                <h2 className="font-display text-4xl">
                  Explore universities in {country.name}
                </h2>
                <Link
                  href="/universities"
                  className="font-semibold text-[var(--primary)] underline-offset-4 hover:underline"
                >
                  View all universities
                </Link>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {universities.map((university) => (
                  <UniversityCard
                    key={university.id ?? university.slug}
                    university={university}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="border-t border-[var(--border)]">
            <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                Reviews
              </p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
                {REVIEW_TITLE}
              </h2>
              <ul className="mt-10 grid gap-5 md:grid-cols-3">
                {reviews.map((r) => (
                  <li
                    key={r.name}
                    className="flex flex-col rounded-3xl bg-[var(--surface)] p-7"
                  >
                    <Quote aria-hidden="true" size={28} className="text-primary/40" />
                    <blockquote className="mt-4 flex-1 font-display text-xl leading-snug">
                      “{r.quote}”
                    </blockquote>
                    <p className="mt-6 font-semibold">{r.name}</p>
                    <p className="text-sm text-muted-foreground">{r.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Articles */}
        {posts.length > 0 && (
          <section className="border-t border-[var(--border)]">
            <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                From the blog
              </p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
                Read before you decide.
              </h2>
              <ul className="mt-10 grid gap-6 md:grid-cols-3">
                {posts.map((post) => {
                  const inner = (
                    <>
                      <div
                        aria-hidden="true"
                        className="aspect-[16/10] rounded-2xl border border-border"
                        style={dotted}
                      />
                      <p className="mt-5 text-xs font-bold uppercase tracking-widest text-primary">
                        {post.category}
                      </p>
                      <h3 className="mt-2 font-display text-2xl leading-tight group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mt-3 leading-7 text-muted-foreground">{post.excerpt}</p>
                      {post.href && (
                        <span className="mt-4 inline-flex items-center gap-2 font-semibold text-primary">
                          Read more <ArrowRight size={16} aria-hidden="true" />
                        </span>
                      )}
                    </>
                  );
                  return (
                    <li key={post.title}>
                      {post.href ? (
                        <Link href={post.href} className="group block">
                          {inner}
                        </Link>
                      ) : (
                        <div className="group">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* Closing call to action */}
        <section className="px-5 pb-16 lg:px-8 lg:pb-20">
          <div className="mx-auto max-w-7xl rounded-3xl bg-[var(--primary)] p-8 text-primary-foreground sm:p-12 lg:p-16">
            <h2 className="max-w-2xl font-display text-4xl leading-[1.05] tracking-[-0.02em] sm:text-5xl">
              Ready to plan your journey to {country.name}?
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-primary-foreground/70 sm:text-lg">
              Start with a conversation and we will help you understand your next step.
            </p>
            <ApplyNowDialog triggerClass="mt-8 border border-primary-foreground/30 bg-background text-foreground hover:bg-secondary hover:text-secondary-foreground" />
          </div>
        </section>

        {/* Other destinations */}
        {others.length > 0 && (
          <section className="border-t border-[var(--border)]">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-4 px-5 py-12 lg:px-8">
              <p className="font-display text-2xl">Exploring other destinations?</p>
              <ul className="flex flex-wrap gap-3">
                {others.map((d) => (
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