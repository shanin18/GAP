import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, MapPin, CheckCircle2 } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MobileNav } from '@/components/mobile-nav';
import { ApplyNowDialog } from '@/components/ui/apply-now-dialog';
import { getUniversityBySlug, getUniversities } from '@/lib/cms-queries';

export async function generateStaticParams() {
  const universities = await getUniversities();
  return universities.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const university = await getUniversityBySlug(slug);
  if (!university) return { title: 'University | GAP' };
  return {
    title: university.seoTitle || `${university.name} | GAP`,
    description: university.seoDescription || university.description,
  };
}

export default async function UniversityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const university = await getUniversityBySlug(slug);
  if (!university) notFound();
  const country = typeof university.country === 'object' ? university.country : undefined;
  const highlights = university.highlights?.map((item) => item.text).filter(Boolean) ?? [];

  return <><SiteHeader/><main>
    <section className="border-b border-[var(--border)]"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <Link href="/universities" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft size={16}/> All universities</Link>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_.45fr] lg:items-end">
        <div><div className="flex size-20 items-center justify-center overflow-hidden rounded-3xl bg-[var(--surface)]">{university.logoUrl ? <img src={university.logoUrl} alt="" className="h-full w-full object-contain p-3"/> : <span className="font-display text-2xl">{university.name.slice(0,2).toUpperCase()}</span>}</div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary mt-8">University profile</p><h1 className="max-w-4xl font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] tracking-tight mt-4">{university.name}</h1>
          <p className="mt-5 flex items-center gap-2 text-muted-foreground"><MapPin size={18}/>{[university.city, country?.name].filter(Boolean).join(', ')}</p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end"><ApplyNowDialog triggerClass="rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-primary-foreground"/>
          {university.websiteUrl && <a href={university.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-6 py-3 font-semibold">University website <ExternalLink size={16}/></a>}
        </div>
      </div>
    </div></section>
    <section><div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.2fr_.8fr] lg:px-8 lg:py-24">
      <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Overview</p><h2 className="mt-3 font-display text-4xl">About {university.name}</h2><p className="mt-6 max-w-3xl whitespace-pre-line text-lg leading-8 text-muted-foreground">{university.description}</p></div>
      <aside className="rounded-3xl bg-[var(--surface)] p-8"><h2 className="font-display text-2xl">Why consider this university?</h2>
        <div className="mt-6 space-y-4">{(highlights.length ? highlights : ['Discuss suitable programs with a GAP counsellor','Review entry requirements for your profile','Build a clear application plan']).map((item) => <div key={item} className="flex gap-3"><CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[var(--primary)]"/><span className="leading-6">{item}</span></div>)}</div>
        {country?.slug && <Link href={`/country/${country.slug}`} className="mt-8 inline-flex font-semibold text-[var(--primary)]">Explore studying in {country.name}</Link>}
      </aside>
    </div></section>
  </main><SiteFooter/><MobileNav/></>;
}
