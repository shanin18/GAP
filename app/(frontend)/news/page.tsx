import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MobileNav } from '@/components/mobile-nav';
import { getPublishedNews } from '@/lib/cms-queries';

export const metadata = { title: 'GAP Journal | Global Admission Platform', description: 'Study-abroad guidance, application advice and destination insights from GAP.' };

export default async function NewsPage() {
  const articles = await getPublishedNews(24);
  return <><SiteHeader/><main>
    <section className="border-b border-[var(--border)]"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">GAP Journal</p><h1 className="max-w-4xl font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] tracking-tight mt-4">Useful guidance for your <em>next move.</em></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Practical articles about destinations, university applications and preparing to study abroad.</p></div></section>
    <section><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      {articles.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <article key={article.id ?? article.slug} className="transition-transform duration-200 motion-safe:hover:-translate-y-1 overflow-hidden rounded-[1.75rem] border border-[var(--border)]"><div className="aspect-[16/9] bg-[var(--surface)]">{article.coverImageUrl ? <img src={article.coverImageUrl} alt="" className="h-full w-full object-cover"/> : null}</div><div className="p-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">{new Date(article.publishedDate).toLocaleDateString('en', {month:'short', day:'numeric', year:'numeric'})}</p><h2 className="mt-3 font-display text-2xl leading-tight">{article.title}</h2><p className="mt-3 line-clamp-3 leading-7 text-muted-foreground">{article.shortBlurb}</p><Link href={`/news/${article.slug}`} className="mt-6 inline-flex items-center gap-2 font-semibold">Read article <ArrowUpRight size={17}/></Link></div></article>)}</div> : <div className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center"><h2 className="font-display text-3xl">Journal articles are coming soon.</h2><p className="mx-auto mt-3 max-w-xl text-muted-foreground">Published articles from Payload CMS will appear here automatically.</p></div>}
    </div></section>
  </main><SiteFooter/><MobileNav/></>;
}
