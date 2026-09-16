'use client';
import Link from 'next/link';
import { Home, Globe2, BriefcaseBusiness, Send } from 'lucide-react';
const items=[['/',Home,'Home'],['/country/australia',Globe2,'Countries'],['/services',BriefcaseBusiness,'Services'],['/apply',Send,'Apply']] as const;
export function MobileNav(){return <nav className="mobile-nav fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--background)]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden"><div className="grid grid-cols-4">{items.map(([href,Icon,label])=><Link key={label} href={href as string} className="touch-target flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold text-[var(--muted)] active:scale-[.97]"><Icon size={20}/><span>{label as string}</span></Link>)}</div></nav>}
