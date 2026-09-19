import type { ReactNode } from 'react';
import { Card } from './card';

export function EmptyState({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children?: ReactNode }) {
  return <Card className="flex flex-col items-center text-center">
    <div aria-hidden="true" className="mb-5 grid size-14 place-items-center rounded-2xl bg-secondary text-primary">{icon}</div>
    <h2 className="font-display text-2xl leading-tight">{title}</h2>
    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
    {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
  </Card>;
}
