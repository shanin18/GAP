import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { TrustStrip } from "../trust-strip";
import { ApplyNowDialog } from "../ui/apply-now-dialog";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-hero-start to-hero-end">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-28">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">Global education, human guidance</p>
          <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(2.5rem,4.5vw,4.25rem)] leading-[0.98] tracking-[-0.055em]">
            Your next chapter, <em>without borders.</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            Personal guidance, trusted university choices, and practical
            admission support for students planning to study abroad.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ApplyNowDialog triggerClass="min-h-11 min-w-11 rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-primary-foreground" />
            <a
              href="#process"
              className="min-h-11 min-w-11 rounded-full border border-[var(--border)] px-6 py-3 font-semibold transition-colors hover:bg-[var(--surface)]"
            >
              How it works
            </a>
          </div>
          <div className="mt-7">
            <TrustStrip />
          </div>
          <div className="mt-10 flex gap-8 text-sm">
            <div>
              <strong className="font-display text-2xl">3</strong>
              <span className="ml-2 text-muted-foreground">
                launch destinations
              </span>
            </div>
            <div>
              <strong className="font-display text-2xl">1:1</strong>
              <span className="ml-2 text-muted-foreground">guidance</span>
            </div>
          </div>
        </div>
<div className="min-w-0">
          <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-background shadow-xl shadow-primary/5">
            <Image src="/images/study-abroad-hero.webp" alt="Illustration of a globe, a university, study notes and an airplane" width={1536} height={1024} sizes="(max-width: 1023px) 100vw, 50vw" preload className="aspect-[3/2] w-full object-cover" />
            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4"><p className="font-display text-xl sm:text-2xl">From ambition to admission.</p><ArrowUpRight aria-hidden="true" className="shrink-0 text-primary" /></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Explore study destinations">
            {[['australia', 'Australia'], ['canada', 'Canada'], ['new-zealand', 'New Zealand']].map(([slug, name]) => <Link key={slug} href={'/country/' + slug} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-brand-soft"><MapPin size={15} aria-hidden="true" />{name}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}
          </div>
        </div>
      </div>
    </section>
  );
}
