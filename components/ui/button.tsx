import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' };
export function Button({ className, variant='default', ...props }: ButtonProps) {
  return <button className={cn('inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50', variant==='default' && 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:-translate-y-0.5 hover:opacity-95', variant==='outline' && 'border border-[var(--border)] bg-transparent hover:-translate-y-0.5 hover:border-[var(--primary)]', variant==='ghost' && 'hover:bg-[var(--surface)]', className)} {...props} />;
}
