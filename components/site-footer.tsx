import Link from 'next/link';
import { getSiteSettings } from '@/lib/cms-queries';
import { ApplyNowDialog } from './ui/apply-now-dialog';

const destinations = [['australia', 'Australia'], ['canada', 'Canada'], ['new-zealand', 'New Zealand']];

export async function SiteFooter() {
  const settings = await getSiteSettings();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div><Link href="/" className="inline-flex min-h-11 items-center font-display text-3xl">GAP<span className="text-primary">.</span></Link><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">Global education guidance from first conversation to final departure.</p></div>
        <div><h2 className="font-bold">Explore</h2><div className="mt-3 grid justify-items-start text-sm text-muted-foreground"><Link className="inline-flex min-h-11 items-center" href="/">Home</Link><Link className="inline-flex min-h-11 items-center" href="/services">Services</Link></div></div>
        <div><h2 className="font-bold">Destinations</h2><div className="mt-3 grid text-sm text-muted-foreground">{destinations.map(([slug, name]) => <Link className="inline-flex min-h-11 items-center" key={slug} href={'/country/' + slug}>{name}</Link>)}</div></div>
        <div><h2 className="font-bold">Contact</h2><address className="mt-4 text-sm not-italic leading-6 text-muted-foreground">
          {settings?.address && <p className="whitespace-pre-line">{settings.address}</p>}
          {settings?.phone && <a className="flex min-h-11 items-center" href={'tel:' + settings.phone.replace(/[^+0-9]/g, '')}>{settings.phone}</a>}
          {settings?.email && <a className="flex min-h-11 items-center break-all" href={'mailto:' + settings.email}>{settings.email}</a>}
          {!settings?.address && !settings?.phone && !settings?.email && <p>Start a conversation with our team about your study plans.</p>}
        </address><ApplyNowDialog triggerClass="mt-4" /></div>
      </div>
      <div className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {settings?.siteName || 'Global Admission Platform'}. All rights reserved.</div>
    </footer>
  );
}
