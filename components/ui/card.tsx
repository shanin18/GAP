import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const cardVariants = cva('min-w-0 rounded-3xl border border-border bg-card text-card-foreground shadow-sm', {
  variants: {
    interactive: {
      true: 'transition-[border-color,box-shadow,translate] duration-200 ease-out hover:border-primary/30 hover:shadow-md focus-within:border-primary/40 focus-within:shadow-md motion-safe:hover:-translate-y-1',
      false: '',
    },
    padding: { none: '', default: 'p-6 sm:p-8' },
  },
  defaultVariants: { interactive: false, padding: 'default' },
});

export function Card({ className, interactive, padding, ...props }: ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return <div className={cn(cardVariants({ interactive, padding }), className)} {...props} />;
}
