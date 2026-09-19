import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MobileNav } from '@/components/mobile-nav';
import { getPublishedNews } from '@/lib/cms-queries';
import { cardVariants } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ApplyNowDialog } from '@/components/ui/apply-now-dialog';
import { cn } from '@/lib/utils';
export const metadata = { title: 'GAP Journal', description: 'Study-abroad guidance, application advice and destination insights from GAP.' };
export default async function NewsPage() {
  const articles = await getPublishedNews(24);
  return <><SiteHeader /><main>
    <section className="border-b border-border"><div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">GAP Journal</p><h1 className="mt-4 max-w-4xl font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.1] tracking-tight">Useful guidance for your <em>next move.</em></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Practical articles about destinations, university applications and preparing to study abroad.</p></div></section>
    <section><div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
      {articles.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{articles.map(article => <article key={article.id ?? article.slug} className={cn(cardVariants({ interactive: true, padding: 'none' }), 'group flex flex-col overflow-hidden')}>
        <div className="relative aspect-[16/9] bg-muted">{article.coverImageUrl ? <Image src={article.coverImageUrl} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover" /> : <div className="grid h-full place-items-center"><BookOpen aria-hidden="true" size={48} className="text-primary/60" strokeWidth={1} /></div>}</div>
        <div className="flex flex-1 flex-col p-6"><time dateTime={article.publishedDate} className="text-xs font-semibold text-muted-foreground">{new Date(article.publishedDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time><h2 className="mt-3 font-display text-2xl leading-tight">{article.title}</h2><p className="mt-3 line-clamp-3 leading-7 text-muted-foreground">{article.shortBlurb}</p><Link href={`/news/${article.slug}`} className="mt-auto inline-flex min-h-11 items-center gap-2 rounded-lg pt-6 font-semibold text-primary transition-colors duration-200 hover:text-foreground active:opacity-80">Read article <span className="sr-only">{article.title}</span><ArrowUpRight aria-hidden="true" size={17} /></Link></div>
      </article>)}</div> : <EmptyState icon={<BookOpen size={24} />} title="Fresh guidance is on its way." description="Our next articles are being prepared. For advice on your own study plans, start a conversation with an adviser."><ApplyNowDialog triggerContent="Ask an adviser" /></EmptyState>}
    </div></section>
  </main><SiteFooter /><MobileNav /></>;
}
