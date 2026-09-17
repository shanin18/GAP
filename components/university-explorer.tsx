'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
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
        <Search size={18} className="text-muted-foreground"/><span className="sr-only">Search universities</span>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search university or city" className="border-0 bg-transparent"/>
      </label>
      <Select value={country} onValueChange={setCountry}><SelectTrigger aria-label="Filter by country" className="min-h-12 sm:min-w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All countries</SelectItem>{countries.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
    </div>
    {filtered.length ? <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((u) => <UniversityCard key={u.id ?? u.slug} university={u}/>)}</div> :
      <div className="mt-8 rounded-[1.75rem] border border-dashed border-[var(--border)] p-12 text-center"><h2 className="font-display text-2xl">No universities found</h2><p className="mt-2 text-muted-foreground">Try a different university name, city, or country.</p></div>}
  </div>;
}
