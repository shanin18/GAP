'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export function AnimatedDisclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <div className="h-fit overflow-hidden rounded-xl border border-border bg-surface transition-colors duration-200 hover:border-primary/40 motion-reduce:transition-none">
    <h3><button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)} className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left text-sm font-medium transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none sm:px-5">
      <span>{title}</span><ChevronDown size={18} aria-hidden="true" className={`shrink-0 text-primary transition-transform duration-300 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
    </button></h3>
    <div id={id} aria-hidden={!open} inert={!open} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 overflow-hidden"><div className="px-4 pb-5 text-sm leading-7 text-muted-foreground sm:px-5">{children}</div></div></div>
  </div>;
}
