import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Compass, GraduationCap, CalendarDays, Files, MessageCircle } from 'lucide-react';
import { SectionHeading } from '../section-heading';

type NewsItem = { title: string; slug?: string; shortBlurb?: string; publishedDate?: string; coverImageUrl?: string | null };
const topics = ['Study destination checklist: where should you start?', 'How to prepare a stronger university application', 'What to consider when choosing your program', 'Planning your timeline for studying abroad', 'Documents to prepare before you apply', 'Making your first counselling session count'];
const icons = [Compass, BookOpen, GraduationCap, CalendarDays, Files, MessageCircle];

export function NewsFeed({ items = [] }: { items?: NewsItem[] }) {
  const news: NewsItem[] = items.length ? items.slice(0, 6) : topics.map(title => ({ title }));
  return <section className="bg-surface"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
    <SectionHeading eyebrow="News feed" title="Useful things to know before you go." />
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{news.map((item, index) => {
      const Icon = icons[index % icons.length];
      return <article key={item.slug || item.title} className="group overflow-hidden rounded-3xl border border-border bg-background transition-[border-color,box-shadow] duration-200 hover:border-input hover:shadow-lg hover:shadow-primary/5">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {item.coverImageUrl ? <Image src={item.coverImageUrl} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-surface to-brand-soft"><Icon aria-hidden="true" className="size-16 text-primary/65" strokeWidth={1} /></div>}
        </div>
        <div className="p-6"><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">GAP Journal</p><h3 className="mt-3 font-display text-2xl leading-tight">{item.title}</h3>{item.shortBlurb && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.shortBlurb}</p>}<Link href={item.slug ? '/news/' + item.slug : '/news'} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-primary">Read more<span className="sr-only">: {item.title}</span><ArrowUpRight aria-hidden="true" size={17} className="transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" /></Link></div>
      </article>;
    })}</div>
  </div></section>;
}
