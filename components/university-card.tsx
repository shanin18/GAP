import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { CmsUniversity } from '@/lib/cms-queries';

export function UniversityCard({ university }: { university: CmsUniversity }) {
  const country = typeof university.country === 'object' ? university.country?.name : undefined;
  return (
    <article className="group flex h-full flex-col rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-[var(--surface)]">
          {university.logoUrl ? <img src={university.logoUrl} alt="" className="h-full w-full object-contain p-2" /> : <span className="font-display text-xl">{university.name.slice(0, 2).toUpperCase()}</span>}
        </div>
        {university.featured && <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">Featured</span>}
      </div>
      <div className="mt-8 flex items-center gap-2 text-sm text-[var(--muted)]"><MapPin size={15}/><span>{[university.city, country].filter(Boolean).join(', ') || 'International destination'}</span></div>
      <h2 className="mt-3 font-display text-2xl leading-tight">{university.name}</h2>
      <p className="mt-4 line-clamp-3 leading-7 text-[var(--muted)]">{university.description}</p>
      <Link href={`/universities/${university.slug}`} className="mt-8 inline-flex items-center gap-2 font-semibold text-[var(--primary)]">View university <ArrowUpRight size={17}/></Link>
    </article>
  );
}
