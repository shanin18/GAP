'use client';
import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import motion from './motion.module.css';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return <SelectPrimitive.Trigger className={cn('group flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2 text-left text-base text-foreground shadow-xs outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-primary/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 data-[state=open]:border-ring data-[placeholder]:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate', className)} {...props}>{children}<SelectPrimitive.Icon asChild><ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>;
}
export function SelectContent({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content position="popper" sideOffset={6} collisionPadding={12} className={cn(motion.surface, 'z-[80] max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl shadow-primary/10 origin-[var(--radix-select-content-transform-origin)]', className)} {...props}>
    <SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center"><ChevronUp size={16} /></SelectPrimitive.ScrollUpButton>
    <SelectPrimitive.Viewport className="p-1.5">{children}</SelectPrimitive.Viewport>
    <SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center"><ChevronDown size={16} /></SelectPrimitive.ScrollDownButton>
  </SelectPrimitive.Content></SelectPrimitive.Portal>;
}
export function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return <SelectPrimitive.Item className={cn('relative flex min-h-11 cursor-default select-none items-center rounded-xl py-2 pl-3 pr-9 text-sm outline-none transition-colors duration-150 data-[highlighted]:bg-secondary data-[highlighted]:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className)} {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator className="absolute right-3"><Check size={16} /></SelectPrimitive.ItemIndicator></SelectPrimitive.Item>;
}

