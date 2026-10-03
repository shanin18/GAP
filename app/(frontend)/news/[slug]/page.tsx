import { FinalCta } from "@/components/home-sections/FinalCta";
import Image from "next/image";
import { stockImage } from "@/lib/stock-images";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { getSectionText } from "@/lib/website-content-server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { getNewsBySlug, getPublishedNews } from "@/lib/cms-queries";
import { newsLabel } from "@/lib/news-label";

export async function generateStaticParams() {
  const articles = await getPublishedNews(100);
  return articles.map((article) => ({ slug: article.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return {};
  return {
    title: article.seoTitle || `${article.title} | GAP Journal`,
    description: article.seoDescription || article.shortBlurb,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getSectionText("article-page");

  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();
  return (
    <>
      <SiteHeader />
      <main>
        <article>
          <header className="border-b border-[var(--border)]">
            <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
              >
                <ArrowLeft size={16} />
                {t(" Back to blogs & events")}
              </Link>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary mt-10">
                {t(newsLabel(article))}
              </p>
              <h1 className="mt-4 font-display text-4xl leading-[1.12] sm:text-5xl">
                {t(article.title)}
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                {t(article.shortBlurb)}
              </p>
              <time className="mt-7 block text-sm text-muted-foreground">
                {new Date(article.publishedDate).toLocaleDateString("en", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              {article.entryType === "event" && (
                <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
                  {article.eventDate && <p><span className="font-semibold">Event starts: </span><time dateTime={article.eventDate}>{new Date(article.eventDate).toLocaleString("en", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Dhaka" })} (Bangladesh time)</time></p>}
                  {article.eventLocation && <p className="mt-2"><span className="font-semibold">Location: </span>{article.eventLocation}</p>}
                </div>
              )}
            </div>
          </header>
          {(
            <div className="mx-auto max-w-7xl px-5 pt-10 lg:px-8">
              <Image
                src={article.coverImageUrl || stockImage("planning")!}
                width={1440}
                height={720}
                sizes="(min-width: 1280px) 1216px, (min-width: 1024px) calc(100vw - 64px), calc(100vw - 40px)"
                alt=""
                className="aspect-[16/8] w-full rounded-3xl object-cover"
              />
            </div>
          )}
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 lg:px-8 lg:py-20">
            <div className="text-lg leading-8 text-foreground">
              <div className="[&_p]:mb-5 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-3xl [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6">
                {article.content ? (
                  <RichText data={article.content} />
                ) : (
                  <p>{article.shortBlurb}</p>
                )}
              </div>
            </div>

          </div>
        </article>
        <FinalCta />
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
