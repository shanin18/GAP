import Image from 'next/image';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MobileNav } from '@/components/mobile-nav';
import { ApplyNowDialog } from '@/components/ui/apply-now-dialog';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { getCountries, getCountryBySlug, getUniversities } from '@/lib/cms-queries';
import { UniversityCard } from '@/components/university-card';

const fallbackCountries = {
  australia: { name:'Australia', intro:'A welcoming destination for ambitious students looking for globally recognised education.', facts:['Globally recognised universities','Wide range of programs','Strong student support'] },
  canada: { name:'Canada', intro:'Build your next chapter in a destination known for diverse communities and strong education options.', facts:['Internationally respected institutions','Diverse study choices','Student-focused communities'] },
  'new-zealand': { name:'New Zealand', intro:'Explore a focused study experience surrounded by a distinctive culture and environment.', facts:['Quality education options','Supportive communities','Distinctive study experience'] },
};

export async function generateStaticParams() {
  const cmsCountries = await getCountries();
  if (cmsCountries.length) return cmsCountries.map((country) => ({ slug: country.slug }));
  return Object.keys(fallbackCountries).map((slug) => ({ slug }));
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [cmsCountry, universities] = await Promise.all([getCountryBySlug(slug), getUniversities({ countrySlug: slug, limit: 6 })]);
  const fallback = fallbackCountries[slug as keyof typeof fallbackCountries];
  const country = cmsCountry ?? (fallback ? { ...fallback, slug } : null);
  if (!country) notFound();

  const facts = !cmsCountry && fallback ? fallback.facts : ['Explore partner universities', 'Review entry requirements', 'Plan your application timeline'];

  return <><SiteHeader/><main>
    <section className="border-b border-border bg-surface/40"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Study destination</p><h1 className="max-w-4xl font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] tracking-tight mt-4">Study in <em>{country.name}.</em></h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{!cmsCountry && fallback ? fallback.intro : 'Discover study options, admission guidance, and university pathways for this destination.'}</p>
      <ApplyNowDialog triggerClass="mt-8 rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-primary-foreground"/>
      {cmsCountry?.heroImageUrl && <div className="relative mt-10 aspect-[16/7] overflow-hidden rounded-3xl"><Image src={cmsCountry.heroImageUrl} alt={`${country.name} study destination`} fill sizes="(max-width: 1023px) 100vw, 1200px" className="object-cover" /></div>}
    </div></section>
    <section><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <div className="grid gap-5 md:grid-cols-3">{facts.map((fact, i) => <article className="rounded-[1.5rem] border border-[var(--border)] p-7" key={fact}><span className="text-sm text-muted-foreground">0{i+1}</span><h2 className="mt-10 font-display text-2xl">{fact}</h2></article>)}</div>
      <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_.8fr]"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Why this destination</p><h2 className="mt-3 font-display text-4xl">Choose with your goals in mind.</h2>{cmsCountry?.body ? <RichText data={cmsCountry.body} className="mt-5 max-w-2xl leading-8 text-muted-foreground [&_p]:mb-4 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-3xl [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5" /> : <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">GAP combines destination guidance, university selection, and application support into one practical journey.</p>}</div>
        <div className="rounded-[2rem] bg-[var(--surface)] p-8"><GraduationCap size={28} className="text-[var(--primary)]"/><h3 className="mt-7 font-display text-2xl">Partner universities</h3><p className="mt-3 text-muted-foreground">Explore university options and discuss the right fit for your goals with a GAP adviser.</p><a href="/services" className="mt-6 inline-flex items-center gap-2 font-semibold">Explore support <ArrowRight size={17}/></a></div>
      </div>
    </div></section>
    {universities.length > 0 && <section className="border-t border-[var(--border)]"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">University options</p><div className="mt-3 flex flex-wrap items-end justify-between gap-5"><h2 className="font-display text-4xl">Explore universities in {country.name}</h2><a href="/universities" className="font-semibold text-[var(--primary)]">View all universities</a></div><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{universities.map((university) => <UniversityCard key={university.id ?? university.slug} university={university}/>)}</div></div></section>}
  </main><SiteFooter/><MobileNav/></>;
}
