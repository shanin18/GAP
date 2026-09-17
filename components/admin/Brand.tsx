import Link from 'next/link';
import { ArrowUpRight, Globe2, ClipboardList } from 'lucide-react';

export function Logo() {
  return <div className="gap-admin-brand"><span className="gap-admin-wordmark">GAP<span>.</span></span><span className="gap-admin-brand-caption">Global Admission Platform</span></div>;
}
export function Icon() { return <span className="gap-admin-icon" aria-label="GAP">GAP<span>.</span></span>; }
export function WebsiteLink() { return <Link className="gap-admin-link" href="/">View website <ArrowUpRight size={16} aria-hidden="true" /></Link>; }
export function LoginIntro() {
  return <div className="gap-admin-login-intro"><span className="gap-admin-eyebrow">Team workspace</span><p>Welcome back. Help someone take their next step.</p></div>;
}
export function DashboardIntro() {
  return <section className="gap-admin-welcome" aria-labelledby="gap-workspace-heading">
    <div><span className="gap-admin-eyebrow">Global Admission Platform</span><h1 id="gap-workspace-heading">Good guidance starts here.</h1><p>Manage your content and keep every student's next step in view.</p><div className="gap-admin-quick-links"><Link href="/staff"><ClipboardList size={17} aria-hidden="true" /> Student pipeline</Link><Link href="/"><Globe2 size={17} aria-hidden="true" /> Visit website</Link></div></div>
    <Globe2 className="gap-admin-welcome-globe" aria-hidden="true" strokeWidth={.8} />
  </section>;
}
