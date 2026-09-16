import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "../section-heading";

export function NewsFeed({
  items = [],
}: {
  items?: Array<{
    title: string;
    slug?: string;
    shortBlurb?: string;
    publishedDate?: string;
  }>;
}) {
  const fallbackNews = [
    "Study destination checklist: where should you start?",
    "How to prepare a stronger university application",
    "What to consider when choosing your program",
    "Planning your timeline for studying abroad",
    "Documents to prepare before you apply",
    "Making your first counselling session count",
  ];

  const news = items.length ? items.map((x) => x.title) : fallbackNews;
  return (
    <section className="bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="flex items-end justify-between gap-5">
          <SectionHeading
            eyebrow="News feed"
            title="Useful things to know before you go."
          />
          <span className="hidden text-sm text-[var(--muted)] sm:block">
            Latest {Math.min(news.length, 6)}
          </span>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n, i) => (
            <article
              key={n}
              className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#b9c8bd]"
            >
              <div className="aspect-[16/9] rounded-2xl bg-[#dfe8df] p-5">
                <span className="text-sm font-semibold">0{i + 1}</span>
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">
                GAP Journal
              </p>
              <h3 className="mt-2 font-display text-2xl leading-tight">{n}</h3>
              <a
                href={items[i]?.slug ? `/news/${items[i].slug}` : "/news"}
                className="mt-5 inline-flex items-center gap-1 text-sm font-bold"
              >
                Read more <ArrowUpRight size={16} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
