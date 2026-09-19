'use client';

import { Link, Logout, useNav } from '@payloadcms/ui';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function CollectionLinksClient({ items }: { items: { slug: string; label: string; href: string }[] }) {
  const pathname = usePathname();
  const { navOpen, navRef, hydrated, shouldAnimate, setNavOpen } = useNav();
  return <aside className={['nav', navOpen && 'nav--nav-open', hydrated && 'nav--nav-hydrated', shouldAnimate && 'nav--nav-animate'].filter(Boolean).join(' ')} inert={!navOpen || undefined}>
    <div className="nav__scroll" ref={navRef}>
    <nav className="nav__wrap" aria-label="Admin collections"><div className="gap-collection-links">
    <p className="gap-nav-heading">Workspace</p>
    {items.map(({ slug, label, href }) => <Link key={slug} id={`nav-${slug}`} href={href} prefetch={false} className="nav__link" aria-current={pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined}>
      <span className="nav__link-label">{label}</span>
    </Link>)}
    </div><div className="nav__controls"><Logout /></div></nav>
    <div className="nav__header"><div className="nav__header-content"><button type="button" className="nav__mobile-close" aria-label="Close menu" onClick={() => setNavOpen(false)}><X size={20} aria-hidden="true" /></button></div></div>
    </div>
  </aside>;
}
