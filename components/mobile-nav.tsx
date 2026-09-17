'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BriefcaseBusiness, Send } from 'lucide-react';
import { CountryMenu } from './country-menu';
import { ApplyNowDialog } from './ui/apply-now-dialog';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();
  const linkClass = (active: boolean) => cn('flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition-colors motion-safe:active:scale-[.97]', active ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary');
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-1">
        <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} className={linkClass(pathname === '/')}><Home aria-hidden="true" size={20} /><span>Home</span></Link>
        <CountryMenu mobile />
        <Link href="/services" aria-current={pathname === '/services' ? 'page' : undefined} className={linkClass(pathname === '/services')}><BriefcaseBusiness aria-hidden="true" size={20} /><span>Services</span></Link>
        <ApplyNowDialog triggerClass="min-h-11 flex-col gap-1 rounded-xl px-1 py-2 text-[11px]" triggerContent={<><Send aria-hidden="true" size={20} /><span>Apply Now</span></>} />
      </div>
    </nav>
  );
}
