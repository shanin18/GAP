import { AboutPurpose } from "@/components/about-purpose";

import { AnimatedCounter } from "@/components/animated-counter";
import { FinalCta } from "@/components/home-sections/FinalCta";
import Image from "next/image";
import { getCountries } from "@/lib/cms-queries";

import { getSectionText } from "@/lib/website-content-server";
import type { Metadata } from "next";
import {
  Compass,
  HeartHandshake,
  ListChecks,
  GraduationCap,
  Plane,



} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getSectionText("about-page");
  return {
    title: t("About"),
    description: t(
      "Get to know Global Admission Platform and our personal approach to study-abroad counselling, university selection and admission support.",
    ),
  };
}

const values = [
  {
    icon: HeartHandshake,
    title: "People come first",
    text: "Your background, ambitions and concerns shape the conversation. We take time to understand your story before helping you plan your next step.",
  },
  {
    icon: Compass,
    title: "Choices with purpose",
    text: "We help you compare destinations, universities and programs around your academic interests, budget and future plans.",
  },
  {
    icon: ListChecks,
    title: "Clarity at every step",
    text: "From preparing documents to understanding enrollment, we break the journey into practical steps so you know what comes next.",
  },
];

export default async function AboutPage() {
  const [t, countries] = await Promise.all([
    getSectionText("about-page"),
    getCountries(),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative isolate overflow-hidden border-b border-border bg-background text-foreground">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_65%_30%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_65%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pt-12 pb-10 sm:pt-16 lg:grid-cols-[1fr_1.05fr] lg:gap-x-12 lg:gap-y-8 lg:px-8 lg:pt-16 lg:pb-0">
            <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
              <h1 className="mt-5 font-semibold text-[clamp(2.5rem,4.5vw,4rem)] leading-[1.08] tracking-tight">{t("Hello, we are GAP.")}</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">{t("We guide you through your study-abroad journey, from choosing a destination and course to preparing applications and getting ready for departure. Your goals shape every step.")}</p>

            </div>
            <div className="relative mx-auto w-full max-w-xl self-end lg:col-start-2 lg:row-start-1 lg:row-span-2">
              
              <div className="relative aspect-[9/10] overflow-hidden [mask-image:linear-gradient(to_bottom,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black_90%,transparent)] lg:aspect-[9/11]">
                <svg aria-hidden="true" viewBox="0 0 600 700" className="absolute inset-0 size-full text-primary/15" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M20 650V390L150 300L280 380V650M150 300V170L310 70L460 160V650M310 70V650M460 160L580 240V650M0 650H600M0 665H600" />
                  {[220, 280, 340, 400, 460, 520, 580].map(y => <g key={y}><path d={`M175 ${y}L285 ${y - 65}V${y - 35}L175 ${y + 30}ZM335 ${y - 65}L435 ${y - 5}V${y + 25}L335 ${y - 35}ZM480 ${y}L555 ${y + 45}V${y + 70}L480 ${y + 25}Z`} /></g>)}
                </svg>
                <Image src="/images/about-student-generated.webp" alt="A student holding a passport and a model airplane" fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 580px, (min-width: 640px) 560px, 90vw" className="object-contain object-bottom" />
              </div>
            </div>
              <dl className="grid grid-cols-2 lg:col-start-1 lg:row-start-2 lg:mb-14 gap-3 rounded-[2.5rem] bg-surface p-3 sm:gap-4">
                {[{ value: String(countries.length), label: "Study destinations", Icon: Compass }, { value: "4", label: "Stages in your journey", Icon: GraduationCap }, { value: "1:1", label: "Personal guidance, from your first question", Icon: HeartHandshake }].map(({ value, label, Icon }, i) => <div key={label} className={`relative rounded-[2rem] bg-background/60 p-5 sm:p-7 ${i === 2 ? 'col-span-2' : ''}`}>
                  <div className="flex items-center justify-between gap-3"><span aria-hidden="true" className="text-xs text-muted-foreground">{String(i + 1).padStart(3, "0")}</span><span className="grid size-10 place-items-center rounded-full bg-surface sm:size-12"><Icon size={20} aria-hidden="true" className="text-primary" /></span></div>
                  <dd className="mt-5 text-4xl font-semibold leading-none sm:text-5xl">{i < 2 ? <AnimatedCounter value={Number(value)} /> : value}</dd><dt className="mt-3 text-sm leading-6 text-muted-foreground">{t(label)}</dt>
                </div>)}
              </dl>
          </div>
        </section>

        <AboutPurpose slides={[
          { title: t("Discover your direction"), text: t("Your interests, strengths and ambitions are the starting point. We help you turn a broad study goal into a focused academic plan."), detail: t("Compare subjects and entry routes with your background and future goals in mind."), image: "/images/purpose/direction.webp", alt: "Students studying at tables in a library" },
          { title: t("Make informed choices"), text: t("Choose with clarity. Explore destinations, universities and courses around your academic profile, budget and preferred student experience."), detail: t("Understand the differences before deciding which path feels right for you."), image: "/images/purpose/choices.webp", alt: "Students walking through a university campus" },
          { title: t("Apply with confidence"), text: t("Bring your plans together with clear application steps. We help you organise documents, review requirements and prepare for important deadlines."), detail: t("A practical timeline makes the process easier to understand and manage."), image: "/images/purpose/application.webp", alt: "A person working on a laptop and writing an application plan" },
          { title: t("Prepare for your next chapter"), text: t("Your journey continues beyond the application. Prepare for departure with guidance that helps you arrive informed and ready for student life."), detail: t("Discuss accommodation, campus support and the everyday questions that matter before you travel."), image: "/images/purpose/departure.webp", alt: "Travellers walking through an airport terminal" },
        ]} />


        <section aria-labelledby="about-achievements-title" className="border-t border-border">
          <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-widest text-primary">{t("Recognition & milestones")}</p><h2 id="about-achievements-title" className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl">{t("Our achievements")}</h2></div>
              <p className="max-w-sm text-xs leading-6 text-muted-foreground">Preview gallery with stock imagery. Replace these sample entries with verified GAP awards.</p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:mt-10 lg:gap-8">
              {[
                { title: "Excellence in student guidance", caption: "Recognition showcase", image: "/images/achievements/recognition.webp", year: "2025" },
                { title: "Growing through collaboration", caption: "Partnership milestone showcase", image: "/images/achievements/milestones.webp", year: "2024" },
              ].map(({ title, caption, image, year }, index) => <figure key={title} className="group">
                <div className="relative overflow-hidden rounded-2xl bg-surface sm:rounded-3xl">
                  <Image src={image} alt="Stock award photograph illustrating a sample gallery entry" width={1200} height={900} sizes="(min-width: 1280px) 600px, (min-width: 768px) 45vw, 90vw" className="aspect-[4/3] w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-xs text-primary sm:left-6 sm:top-6">Sample entry</span>
                  <p className="absolute bottom-5 left-5 right-5 font-display text-2xl text-white sm:bottom-6 sm:left-6 sm:text-3xl">{title}</p>
                </div>
                <figcaption className="flex items-center justify-between gap-4 border-b border-border px-1 py-5"><div><span className="text-xs text-primary">{String(index + 1).padStart(2, "0")}</span><p className="mt-1 text-sm font-medium sm:text-base">{caption}</p></div><span className="shrink-0 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">{year}<span className="sr-only"> — illustrative sample year</span></span></figcaption>
              </figure>)}
            </div>
          </div>
        </section>


        <section aria-labelledby="about-approach-title">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-16 lg:px-8 lg:py-16">
            <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {t("Our approach")}
            </p>
            <h2 id="about-approach-title" className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              {t("Built around you.")}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">{t("Personal guidance, thoughtful choices and clear next steps. These principles shape how we work with you.")}</p>
            </div>
            <div className="divide-y divide-border">
              {values.map(({ icon: Icon, title, text }, index) => (
                <article
                  key={title}
                  className="group grid grid-cols-[2.5rem_1fr] gap-4 py-6 first:pt-0 last:pb-0 sm:grid-cols-[3rem_1fr] sm:gap-6"
                >
                  <span aria-hidden="true" className="pt-1 text-sm font-medium tabular-nums text-primary/60">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                  <div className="flex items-center gap-3"><Icon aria-hidden="true" size={20} className="shrink-0 text-primary" /><h3 className="font-display text-xl sm:text-2xl">{t(title)}</h3></div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                    {t(text)}
                  </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <FinalCta />
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
