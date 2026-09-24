import { RichText } from "@payloadcms/richtext-lexical/react";

import { getSectionText } from "@/lib/website-content-server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { ApplyNowDialog } from "@/components/ui/apply-now-dialog";
import { getNewsBySlug, getPublishedNews } from "@/lib/cms-queries";

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
            <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
              >
                <ArrowLeft size={16} />
                {t(" Back to journal")}
              </Link>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary mt-10">
                {t("GAP Journal")}
              </p>
              <h1 className="mt-4 font-display text-4xl leading-[1.12] sm:text-5xl">
                {t(article.title)}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                {t(article.shortBlurb)}
              </p>
              <time className="mt-7 block text-sm text-muted-foreground">
                {new Date(article.publishedDate).toLocaleDateString("en", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </div>
          </header>
          {article.coverImageUrl ? (
            <div className="mx-auto max-w-6xl px-5 pt-10 lg:px-8">
              <img
                src={article.coverImageUrl}
                alt=""
                className="aspect-[16/8] w-full rounded-3xl object-cover"
              />
            </div>
          ) : null}
          <div className="mx-auto grid max-w-4xl gap-12 px-5 py-14 lg:px-8 lg:py-20">
            <div className="text-lg leading-8 text-foreground">
              <div className="[&_p]:mb-5 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-3xl [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6">
                {article.content ? (
                  <RichText data={article.content} />
                ) : (
                  <p>{article.shortBlurb}</p>
                )}
              </div>
            </div>
            <aside className="rounded-3xl bg-[var(--primary)] p-8 text-primary-foreground sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[.15em] text-primary-foreground/60">
                {t("Need personal guidance?")}
              </p>
              <h2 className="mt-3 font-display text-3xl">
                {t("Turn your research into a clear application plan.")}
              </h2>
              <ApplyNowDialog triggerClass="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-[var(--primary)]" />
            </aside>
          </div>
        </article>
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
