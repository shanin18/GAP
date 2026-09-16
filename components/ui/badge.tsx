import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  className,
  children,
  variant = 'default',
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'outline' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide',
        variant === 'default'
          ? 'bg-[var(--surface)] text-[var(--primary)]'
          : 'border border-[var(--border)] text-[var(--muted)]',
        className,
      )}
    >
      {children}
    </span>
  );
}
