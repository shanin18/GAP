import { getSectionText } from "@/lib/website-content-server";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Compass,
  GraduationCap,
  CalendarDays,
  Files,
  MessageCircle,
} from "lucide-react";
import { SectionHeading } from "../section-heading";
import { cardVariants } from "../ui/card";
import { CardCarousel } from "../ui/card-carousel";
import { cn } from "@/lib/utils";

type NewsItem = {
  title: string;
  slug?: string;
  shortBlurb?: string;
  publishedDate?: string;
  coverImageUrl?: string | null;
};
const icons = [
  Compass,
  BookOpen,
  GraduationCap,
  CalendarDays,
  Files,
  MessageCircle,
];

export async function NewsFeed({ items = [] }: { items?: NewsItem[] }) {
  const t = await getSectionText("home-news");

  const guidance = !items.length;
  const news: NewsItem[] = guidance
    ? [
        {
          title: "Find your study destination",
          shortBlurb:
            "Explore your options and discuss the destination that suits your goals.",
        },
        {
          title: "Choose a course with confidence",
          shortBlurb:
            "Connect your interests and ambitions with a study plan that fits.",
        },
        {
          title: "Plan your university application",
          shortBlurb:
            "Get guidance on choosing a university and preparing your next steps.",
        },
        {
          title: "Think ahead about your intake",
          shortBlurb:
            "Talk with an adviser about your preferred start date and application timeline.",
        },
        {
          title: "Prepare your documents",
          shortBlurb:
            "Ask which academic records and supporting documents your application needs.",
        },
        {
          title: "Speak with a GAP adviser",
          shortBlurb:
            "Bring your questions and get personal guidance for your study journey.",
        },
      ]
    : items.slice(0, 6);
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow={t("News feed")}
          title={t("Useful things to know before you go.")}
        />
        <div className="mt-8">
          <CardCarousel>
            {news.map((item, index) => {
              const Icon = icons[index % icons.length];
              return (
                <article
                  key={item.slug || item.title}
                  className={cn(
                    cardVariants({ interactive: true, padding: "none" }),
                    "group flex flex-col overflow-hidden",
                  )}
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {item.coverImageUrl ? (
                      <Image
                        src={item.coverImageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        className="object-cover transition-transform duration-200 ease-out motion-safe:group-hover:scale-105"
                      />
                    ) : (
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-surface via-surface to-primary/10">
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 opacity-[0.15]"
                          style={{
                            backgroundImage:
                              "radial-gradient(currentColor 1px, transparent 1px)",
                            backgroundSize: "16px 16px",
                            color: "var(--primary)",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex size-16 items-center justify-center rounded-2xl bg-background/80 shadow-lg shadow-black/5 backdrop-blur-sm transition-transform duration-200 ease-out motion-safe:group-hover:scale-110">
                            <Icon
                              aria-hidden="true"
                              className="size-8 text-primary"
                              strokeWidth={1.4}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {guidance ? t("Study guidance") : t("GAP Journal")}
                    </p>
                    <h3 className="mt-3 font-display text-2xl leading-tight">
                      {t(item.title)}
                    </h3>
                    {item.shortBlurb && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {t(item.shortBlurb)}
                      </p>
                    )}
                    <Link
                      href={
                        guidance
                          ? "/services"
                          : item.slug
                            ? "/news/" + item.slug
                            : "/news"
                      }
                      className="mt-auto inline-flex min-h-11 items-center gap-2 rounded-lg pt-5 text-sm font-bold text-primary transition-colors duration-200 hover:text-primary/75"
                    >
                      {guidance ? t("Explore our support") : t("Read more")}
                      <span className="sr-only">: {t(item.title)}</span>
                      <ArrowUpRight
                        aria-hidden="true"
                        size={17}
                        className="transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>
                </article>
              );
            })}
          </CardCarousel>
        </div>
      </div>
    </section>
  );
}
