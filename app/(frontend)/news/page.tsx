import { stockImage } from "@/lib/stock-images";
import { getSectionText } from "@/lib/website-content-server";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { getNewsPage } from "@/lib/cms-queries";
import { cardVariants } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ApplyNowDialog } from "@/components/ui/apply-now-dialog";
import { cn } from "@/lib/utils";
import { newsLabel } from "@/lib/news-label";
export const metadata = {
  title: "Blogs & Events",
  description:
    "Study-abroad guidance, application advice and destination insights from GAP.",
};
export default async function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const t = await getSectionText("news-page");

  const requestedPage = Number((await searchParams).page || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const { docs: articles, totalPages } = await getNewsPage(page);
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {t("Blogs & events")}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.1] tracking-tight">
              {t("Useful guidance for your ")}
              <em>{t("next move.")}</em>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {t(
                "Explore study-abroad blogs, upcoming events and announcements from GAP.",
              )}
            </p>
          </div>
        </section>
        <section>
          <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
            {articles.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <article
                    key={article.id ?? article.slug}
                    className={cn(
                      cardVariants({ interactive: true, padding: "none" }),
                      "group flex flex-col overflow-hidden",
                    )}
                  >
                    <div className="relative aspect-[16/9] bg-muted">
                      <Image src={article.coverImageUrl || stockImage("planning")!} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{t(newsLabel(article))}</p>
                      <time
                        dateTime={article.eventDate || article.publishedDate}
                        className="text-xs font-semibold text-muted-foreground"
                      >
                        {new Date(article.eventDate || article.publishedDate).toLocaleDateString(
                          "en",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "Asia/Dhaka",
                          },
                        )}
                      </time>
                      <h2 className="mt-3 font-display text-2xl leading-tight">
                        {t(article.title)}
                      </h2>
                      <p className="mt-3 line-clamp-3 leading-7 text-muted-foreground">
                        {t(article.shortBlurb)}
                      </p>
                      <Link
                        href={`/news/${article.slug}`}
                        className="mt-auto inline-flex min-h-11 items-center gap-2 rounded-lg pt-6 font-semibold text-primary transition-colors duration-200 hover:text-foreground active:opacity-80"
                      >
                        {t(article.entryType === "event" ? "View event " : "Read blog ")}
                        <span className="sr-only">{t(article.title)}</span>
                        <ArrowUpRight aria-hidden="true" size={17} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen size={24} />}
                title={t("Fresh guidance is on its way.")}
                description={t(
                  "Our next articles are being prepared. For advice on your own study plans, start a conversation with an adviser.",
                )}
              >
                <ApplyNowDialog />
              </EmptyState>
            )}
            {totalPages > 1 && (
              <nav aria-label="Blogs and events pages" className="mt-10 flex items-center justify-center gap-5">
                {page > 1 && <Link href={`/news?page=${page - 1}`} className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-semibold hover:bg-primary/10">Previous</Link>}
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                {page < totalPages && <Link href={`/news?page=${page + 1}`} className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-semibold hover:bg-primary/10">Next</Link>}
              </nav>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
