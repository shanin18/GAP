import { getSectionText } from "@/lib/website-content-server";
import Image from "next/image";
import {
  Check,
  MessageCircle,
  Search,
  FileCheck2,
  Plane,
  ChevronDown,
  GraduationCap,
  BriefcaseBusiness,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { getServices } from "@/lib/cms-queries";
import { ApplyNowDialog } from "@/components/ui/apply-now-dialog";
import { EditorialImage } from "@/components/editorial-image";

const iconMap = { MessageCircle, Search, FileCheck2, Plane };

const faqs = () => [
  {
    q: "Do I need to choose a university before I contact GAP?",
    a: "No. Many students start with only a rough idea. An adviser helps you compare options and build a shortlist that fits your goals.",
  },
  {
    q: "Can I compare destinations with other options?",
    a: "Yes. You can explore more than one destination before you decide, and an adviser can help you weigh them up side by side.",
  },
  {
    q: "What does GAP help with?",
    a: "Counselling, university and program selection, admission and enrollment support, and guidance to prepare you for departure.",
  },
  {
    q: "When should I get started?",
    a: "As early as you can. Intakes and deadlines vary by university and program, so an early conversation gives you more time to prepare.",
  },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type Icon = typeof MessageCircle;

function Visual({
  index,
  title,
  Icon,
  image,
}: {
  index: number;
  title: string;
  Icon: Icon;
  image?: string;
}) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 25%, color-mix(in oklch, var(--primary) 24%, transparent), transparent 58%), radial-gradient(color-mix(in oklch, var(--primary) 28%, transparent) 1px, transparent 1.5px)",
              backgroundSize: "100% 100%, 20px 20px",
            }}
          />
          <div
            className="absolute inset-0 grid place-items-center"
            aria-hidden="true"
          >
            <span className="grid size-24 place-items-center rounded-full border border-primary/30 bg-background/80 text-primary shadow-[0_0_60px_color-mix(in_oklch,var(--primary)_30%,transparent)] sm:size-28">
              <Icon size={38} />
            </span>
          </div>
        </>
      )}
      <span
        aria-hidden="true"
        className="absolute bottom-3 left-5 font-display text-6xl leading-none text-foreground/15 sm:text-7xl"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="sr-only">{title}</span>
    </div>
  );
}

export default async function ServicesPage() {
  const t = await getSectionText("services-page");

  const cmsServices = await getServices();
  const counselling = [
    { title: "Academic Counselling", id: "academic-counselling", Icon: GraduationCap, eyebrow: "Plan your education", outcome: "A clear academic direction", fallback: "Explore your strengths, review your qualifications and choose courses that fit your learning goals.", points: ["Review your academic background", "Compare subjects and entry routes", "Build your course shortlist"] },
    { title: "Career Counselling", id: "career-counselling", Icon: BriefcaseBusiness, eyebrow: "Plan your future", outcome: "A practical career direction", fallback: "Connect your education with your career interests and identify the skills you want to develop.", points: ["Explore career interests and strengths", "Connect courses with career goals", "Plan your skills and professional development"] },
  ];
  const services = cmsServices.filter(service => !counselling.some(section => section.title.toLowerCase() === service.title.trim().toLowerCase())).map(
    (service) =>
      [
        service.title,
        service.shortDescription,
        iconMap[service.icon as keyof typeof iconMap] ?? MessageCircle,
        service,
      ] as const,
  );

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-surface/40">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 size-[32rem] rounded-full bg-[color-mix(in_oklch,var(--primary)_14%,transparent)] blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {t("Services")}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] tracking-tight">
              {t("Guidance that turns ")}
              <em>{t("plans")}</em>
              {t(" into progress.")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {t(
                "A repeatable, human-led support system for students preparing to study abroad.",
              )}
            </p>

            {/* Jump links */}
            <nav aria-label={t("Services")} className="mt-10">
              <ul className="flex flex-wrap gap-3">
                {services.map(([title], i) => (
                  <li key={title}>
                    <a
                      href={`#${slugify(title)}`}
                      className="group inline-flex min-h-11 items-center gap-3 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <span className="font-display text-primary/70 group-hover:text-inherit">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        {counselling.map(({ title, id, Icon, eyebrow, fallback, points }, index) => {
          const content = cmsServices.find(service => service.title.trim().toLowerCase() === title.toLowerCase());
          const items = content?.points?.length ? content.points.map(point => point.text) : points;
          return <section key={id} id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-24 border-b border-border ${index === 1 ? 'bg-surface/40' : ''}`}>
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-24">
              <div>
                <Icon size={36} aria-hidden="true" className="mb-6 text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
                <h2 id={`${id}-title`} className="mt-3 font-display text-4xl sm:text-5xl">{title}</h2>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">{content?.introduction || content?.shortDescription || fallback}</p>
                <ol className="mt-6 divide-y divide-border">{items.map((text, i) => <li key={text} className="flex items-start gap-4 py-4 first:pt-0"><span className="shrink-0 pt-1 text-sm font-semibold text-primary">{String(i + 1).padStart(2, '0')}</span><p className="leading-7 text-muted-foreground">{text}</p></li>)}</ol>
                <ApplyNowDialog triggerClass="mt-8" />
              </div>
              <EditorialImage src={content?.imageUrl} alt={title === "Academic Counselling" ? "Study materials for academic planning" : "Career planning and guidance"} />
            </div>
          </section>;
        })}

        {/* Service by service */}
        <section>
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            {services.map(([title, text, Icon, service], i) => {
              const slug = slugify(title);
              const detail = {
                intro: service.introduction || text,
                points: service.points?.map((point) => point.text) ?? [],
              };
              return (
                <article
                  key={title}
                  id={slug}
                  className="scroll-mt-24 border-b border-border py-16 last:border-b-0 md:py-20 lg:py-24"
                >
                  <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                    <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                      <p className="font-display text-lg text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h2 className="mt-2 font-display text-3xl leading-tight tracking-[-0.02em] sm:text-4xl lg:text-5xl">
                        {title}
                      </h2>
                      <p className="mt-5 max-w-xl leading-8 text-muted-foreground sm:text-lg">
                        {detail?.intro ?? text}
                      </p>

                      {detail.points.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                            {t("What we do")}
                          </h3>
                          <ul className="mt-4 space-y-3">
                            {detail.points.map((point) => (
                              <li key={point} className="flex gap-3 leading-7">
                                <span
                                  aria-hidden="true"
                                  className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklch,var(--primary)_18%,var(--surface))] text-primary"
                                >
                                  <Check size={12} strokeWidth={3} />
                                </span>
                                <span className="text-muted-foreground">
                                  {point}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                      <Visual
                        index={i}
                        title={title}
                        Icon={Icon}
                        image={service.imageUrl || undefined}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-[var(--border)]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                {t("Questions")}
              </p>
              <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
                {t("Good to know before you start.")}
              </h2>
            </div>
            <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {faqs().map(({ q, a }) => (
                <details key={t(q)} className="group py-5">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-xl [&::-webkit-details-marker]:hidden">
                    {t(q)}
                    <ChevronDown
                      aria-hidden="true"
                      size={20}
                      className="shrink-0 text-primary transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                    {t(a)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
