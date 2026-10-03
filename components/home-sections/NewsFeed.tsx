import { getSectionText } from "@/lib/website-content-server";
import Image from "next/image";
import { stockImage } from "@/lib/stock-images";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "../section-heading";
import { cardVariants } from "../ui/card";
import { CardCarousel } from "../ui/card-carousel";
import { cn } from "@/lib/utils";
import type { News } from "@/payload-types";
import { newsLabel } from "@/lib/news-label";

export async function NewsFeed({ items = [] }: { items?: News[] }) {
  const t = await getSectionText("home-news");
  const news = items.filter((item) => item.slug).slice(0, 6);
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
        <div className="relative flex flex-col items-center gap-5 text-center lg:px-32">
          <SectionHeading eyebrow={t("News feed")} title={t("Blogs & upcoming events.")} />
          <Link href="/news" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2">
            {t("See more")} <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8">
          {news.length ? (
            <CardCarousel>
              {news.map((item) => (
                <article key={item.slug} className={cn(cardVariants({ interactive: true, padding: "none" }), "group flex flex-col overflow-hidden")}>
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <Image src={item.coverImageUrl || stockImage("planning")!} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover transition-transform duration-200 ease-out motion-safe:group-hover:scale-105" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">{t(newsLabel(item))}</p>
                    {item.entryType === "event" && item.eventDate && <time dateTime={item.eventDate} className="mt-2 text-sm text-muted-foreground">{new Date(item.eventDate).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" })}</time>}
                    <h3 className="mt-3 font-display text-2xl leading-tight">{t(item.title)}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{t(item.shortBlurb)}</p>
                    <Link href={`/news/${item.slug}`} className="mt-auto inline-flex min-h-11 items-center gap-2 rounded-lg pt-5 text-sm font-bold text-primary transition-colors hover:text-primary/75">
                      {t(item.entryType === "event" ? "View event" : "Read blog")}
                      <span className="sr-only">: {t(item.title)}</span>
                      <ArrowUpRight aria-hidden="true" size={17} />
                    </Link>
                  </div>
                </article>
              ))}
            </CardCarousel>
          ) : <p className="text-center text-muted-foreground">{t("Blogs and event announcements are coming soon.")}</p>}
        </div>
      </div>
    </section>
  );
}
