"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Globe2, Search } from "lucide-react";

export function CountryExplorer({ countries }: { countries: { name: string; slug: string; heroImageUrl?: string | null }[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase();
  const filtered = countries.filter(country => `${country.name} ${country.slug} ${country.slug === 'united-kingdom' ? 'UK Britain' : country.slug === 'united-states' ? 'USA America' : ''}`.toLocaleLowerCase().includes(normalized));
  return <div>
    <label htmlFor="country-search" className="mb-3 block font-semibold">Search countries</label>
    <div className="relative max-w-xl">
      <Search size={20} aria-hidden="true" className="pointer-events-none absolute left-4 top-4 text-muted-foreground" />
      <input id="country-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by country name…" className="min-h-13 w-full rounded-2xl border border-border bg-surface py-3 pl-12 pr-4 outline-none focus-visible:ring-2 focus-visible:ring-primary" />
    </div>
    <p role="status" className="my-6 text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'country' : 'countries'} found</p>
    {filtered.length ? <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((country, index) => <li key={country.slug}><Link href={`/country/${country.slug}`} prefetch={false} className="group block h-full overflow-hidden rounded-3xl border border-border bg-surface/40 transition-colors hover:border-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary">
        {country.heroImageUrl && <div className="relative aspect-[16/10]"><Image src={country.heroImageUrl} alt="" loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} fill sizes="(min-width: 1280px) 390px, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, 90vw" className="object-cover" /></div>}
        <div className="flex min-h-32 items-center gap-4 p-6">
        <Globe2 size={28} aria-hidden="true" className="shrink-0 text-primary" />
        <div className="min-w-0 flex-1"><h2 className="font-display text-2xl">{country.name}</h2><p className="mt-1 text-sm text-muted-foreground">Explore study opportunities</p></div>
        <ArrowRight size={18} aria-hidden="true" className="shrink-0 text-primary" />
        </div>
      </Link></li>)}
    </ul> : <div className="rounded-3xl border border-border p-8"><h2 className="font-display text-2xl">No matching countries</h2><p className="mt-2 text-muted-foreground">Try another name or clear your search to browse all destinations.</p><button type="button" onClick={() => setQuery('')} className="mt-4 min-h-11 font-semibold text-primary underline">Clear search</button></div>}
  </div>;
}
