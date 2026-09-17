import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MobileNav } from '@/components/mobile-nav';
import { ApplyNowDialog } from '@/components/ui/apply-now-dialog';
import { MessageCircle, Search, FileCheck2, Plane } from 'lucide-react';
import { getServices } from '@/lib/cms-queries';

const fallbackServices = [
  ['Counselling','Understand your goals and identify a practical study-abroad direction.',MessageCircle],
  ['University & Program Selection','Compare suitable universities and programs around your academic goals.',Search],
  ['Admission & Enrollment','Move through applications, documents and enrollment with structured support.',FileCheck2],
  ['Pre-departure Guidance','Prepare for the transition from admission to your departure.',Plane],
] as const;

const iconMap = { MessageCircle, Search, FileCheck2, Plane };

export default async function ServicesPage() {
  const cmsServices = await getServices();
  const services = cmsServices.length
    ? cmsServices.map((service) => [service.title, service.shortDescription, iconMap[service.icon as keyof typeof iconMap] ?? MessageCircle] as const)
    : fallbackServices;

  return <><SiteHeader/><main>
    <section className="border-b border-border bg-surface/40"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Services</p><h1 className="max-w-4xl font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] tracking-tight mt-4">Guidance that turns <em>plans</em> into progress.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">A repeatable, human-led support system for students preparing to study abroad.</p>
    </div></section>
    <section><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <div className="grid gap-4 md:grid-cols-2">{services.map(([title, text, Icon], i) =>
        <article className="transition-transform duration-200 motion-safe:hover:-translate-y-1 rounded-[1.75rem] border border-[var(--border)] p-8" key={title}>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--primary)]"><Icon size={23}/></div>
          <span className="mt-10 block text-sm text-muted-foreground">0{i+1}</span><h2 className="mt-2 font-display text-3xl">{title}</h2>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">{text}</p>
        </article>)}</div>
      <div className="mt-16 rounded-[2rem] bg-[var(--primary)] p-8 text-primary-foreground sm:p-12"><h2 className="font-display text-4xl">Not sure where to begin?</h2>
        <p className="mt-3 max-w-xl leading-7 text-primary-foreground/70">Start with a conversation and we'll help you understand your next step.</p>
        <ApplyNowDialog triggerClass="mt-7 rounded-full bg-white px-6 py-3 font-semibold text-[var(--primary)]"/>
      </div>
    </div></section>
  </main><SiteFooter/><MobileNav/></>;
}
