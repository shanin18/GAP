import Link from 'next/link';
import { ApplyNowDialog } from './ui/apply-now-dialog';
import { CountryMenu } from './country-menu';
import { ThemeToggle } from './theme-provider';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <Link href="/" aria-label="GAP home" className="inline-flex min-h-11 items-center font-display text-2xl font-semibold tracking-tight">GAP<span className="text-primary">.</span></Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-5 text-sm font-semibold md:flex">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-xl px-3 hover:bg-secondary">Home</Link>
          <CountryMenu />
          <Link href="/services" className="inline-flex min-h-11 items-center rounded-xl px-3 hover:bg-secondary">Services</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2"><ThemeToggle /><ApplyNowDialog /></div>
      </div>
    </header>
  );
}
