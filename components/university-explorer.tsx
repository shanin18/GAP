'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { UniversityCard } from '@/components/university-card';
import type { CmsUniversity } from '@/lib/cms-queries';

export function UniversityExplorer({ universities }: { universities: CmsUniversity[] }) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('all');

  const countries = useMemo(() => Array.from(new Set(universities.map((u) => typeof u.country === 'object' ? u.country?.name : undefined).filter(Boolean) as string[])).sort(), [universities]);
  const filtered = useMemo(() => universities.filter((u) => {
    const countryName = typeof u.country === 'object' ? u.country?.name : '';
    const haystack = `${u.name} ${u.city ?? ''} ${countryName ?? ''}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase()) && (country === 'all' || countryName === country);
  }), [universities, query, country]);

  return <div>
    <div className="grid gap-3 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-[1fr_auto]">
      <label className="flex min-h-12 items-center gap-3 rounded-xl bg-[var(--background)] px-4">
        <Search size={18} className="text-[var(--muted)]"/><span className="sr-only">Search universities</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search university or city" className="w-full bg-transparent outline-none"/>
      </label>
      <select aria-label="Filter by country" value={country} onChange={(e) => setCountry(e.target.value)} className="min-h-12 rounded-xl border-0 bg-[var(--background)] px-4 font-semibold outline-none">
        <option value="all">All countries</option>{countries.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </div>
    {filtered.length ? <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((u) => <UniversityCard key={u.id ?? u.slug} university={u}/>)}</div> :
      <div className="mt-8 rounded-[1.75rem] border border-dashed border-[var(--border)] p-12 text-center"><h2 className="font-display text-2xl">No universities found</h2><p className="mt-2 text-[var(--muted)]">Try a different university name, city, or country.</p></div>}
  </div>;
}
