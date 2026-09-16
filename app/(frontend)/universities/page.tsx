import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MobileNav } from '@/components/mobile-nav';
import { UniversityExplorer } from '@/components/university-explorer';
import { getUniversities } from '@/lib/cms-queries';

export const metadata: Metadata = {
  title: 'Universities | GAP',
  description: 'Explore universities and study destinations supported by Global Admission Platform.',
};

export default async function UniversitiesPage() {
  const universities = await getUniversities();
  return <><SiteHeader/><main>
    <section className="border-b border-[var(--border)]"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <p className="eyebrow">University discovery</p><h1 className="display-xl mt-4">Find a university that fits <em>your direction.</em></h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">Explore GAP-supported institutions by destination and location, then speak with our team about programs and admission requirements.</p>
    </div></section>
    <section><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      {universities.length ? <UniversityExplorer universities={universities}/> :
        <div className="rounded-[2rem] bg-[var(--surface)] p-10 text-center sm:p-16"><h2 className="font-display text-3xl">University directory coming soon</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-[var(--muted)]">Universities can be added and published from Payload CMS. Published institutions will appear here automatically.</p></div>}
    </div></section>
  </main><SiteFooter/><MobileNav/></>;
}
