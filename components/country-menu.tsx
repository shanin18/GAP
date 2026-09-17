'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Globe2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const destinations = [
  { name: 'Australia', slug: 'australia' },
  { name: 'Canada', slug: 'canada' },
  { name: 'New Zealand', slug: 'new-zealand' },
];


export function CountryMenu({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return <DropdownMenu><DropdownMenuTrigger asChild>
    <Button variant="ghost" className={cn('group rounded-xl', mobile ? 'h-full flex-col gap-1 px-1 py-2 text-[11px]' : 'px-3', pathname.startsWith('/country/') ? 'bg-secondary text-primary' : 'text-muted-foreground')}>
      {mobile && <Globe2 aria-hidden="true" size={20} />}
      <span className="inline-flex items-center gap-1">Countries{!mobile && <ChevronDown aria-hidden="true" size={15} className="transition-transform duration-200 group-data-[state=open]:rotate-180" />}</span>
    </Button>
  </DropdownMenuTrigger><DropdownMenuContent aria-label="Study destinations" side={mobile ? 'top' : 'bottom'} align="start">
    {destinations.map(({ name, slug }) => <DropdownMenuItem key={slug} asChild><Link href={'/country/' + slug} aria-current={pathname === '/country/' + slug ? 'page' : undefined} className="justify-between aria-[current=page]:text-primary">{name}{pathname === '/country/' + slug && <Check aria-hidden="true" size={16} />}</Link></DropdownMenuItem>)}
  </DropdownMenuContent></DropdownMenu>;
}

