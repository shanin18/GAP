'use client';
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import motion from './motion.module.css';
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
 return <DialogPrimitive.Portal><DialogPrimitive.Overlay className={cn(motion.overlay, "fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm")}/><DialogPrimitive.Content className={cn(motion.surface, 'fixed left-1/2 top-1/2 z-[60] grid max-h-[calc(100dvh-2rem)] w-[calc(100%_-_2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] border border-[var(--border)] bg-[var(--background)] p-6 pt-16 shadow-2xl outline-none sm:p-8 sm:pt-16', className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-[var(--border)] transition-[background-color,transform] duration-200 motion-safe:active:scale-95 hover:bg-[var(--surface)]"><X size={18}/><span className="sr-only">Close</span></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;
}
