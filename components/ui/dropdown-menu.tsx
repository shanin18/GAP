'use client';
import * as React from 'react';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import motion from './motion.module.css';

export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;
export function DropdownMenuContent({ className, sideOffset = 8, ...props }: React.ComponentProps<typeof Menu.Content>) {
  return <Menu.Portal><Menu.Content sideOffset={sideOffset} collisionPadding={12} className={cn(motion.surface, 'z-[70] min-w-48 max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl shadow-primary/10 outline-none origin-[var(--radix-dropdown-menu-content-transform-origin)]', className)} {...props} /></Menu.Portal>;
}
export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof Menu.Item>) {
  return <Menu.Item className={cn('relative flex min-h-11 cursor-default select-none items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors duration-150 data-[highlighted]:bg-secondary data-[highlighted]:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className)} {...props} />;
}

