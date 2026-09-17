'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { Button } from '../ui/button';

type Partner = { id: number; name: string; logoUrl?: string | null };

export function Partners({ items = [] }: { items?: Partner[] }) {
  const [paused, setPaused] = useState(false);
  return (
    <section aria-labelledby="partners-heading">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <h2 id="partners-heading" className="text-center text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Our partners</h2>
        {items.length ? <>
          <div className="mt-8 flex justify-center"><Button variant="ghost" onClick={() => setPaused(!paused)} aria-pressed={paused} className="motion-reduce:hidden">{paused ? <Play aria-hidden="true" size={16} /> : <Pause aria-hidden="true" size={16} />}{paused ? 'Resume logos' : 'Pause logos'}</Button></div>
          <div className="mt-4 overflow-hidden motion-reduce:overflow-x-auto">
            <div className="flex w-max animate-[marquee_38s_linear_infinite] motion-reduce:animate-none" style={{ animationPlayState: paused ? 'paused' : 'running' }}>
              {[0, 1].map(copy => <ul key={copy} aria-hidden={copy === 1 ? true : undefined} className={'flex shrink-0 items-center gap-4 pr-4 ' + (copy === 1 ? 'motion-reduce:hidden' : '')}>
                {items.map(partner => <li key={partner.id} className="flex h-28 w-56 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4">
                  {partner.logoUrl && <Image src={partner.logoUrl} alt="" width={160} height={56} className="h-14 w-40 object-contain" />}
                  <span className="text-center text-sm font-semibold text-primary">{partner.name}</span>
                </li>)}
              </ul>)}
            </div>
          </div>
        </> : <p className="mt-6 text-center text-sm text-muted-foreground">Partner information will be available soon.</p>}
      </div>
    </section>
  );
}
