import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthenticatedStaff } from '@/lib/security';
import { getAdminOverview } from '@/lib/admin-queries';
import { Users, ClipboardList, FileClock, GraduationCap, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string,string> = {
  submitted:'Submitted','profile-review':'Profile review','documents-required':'Documents required',
  'ready-to-apply':'Ready to apply','university-submitted':'University submitted','offer-received':'Offer received',
  enrolled:'Enrolled',closed:'Closed'
};

export default async function StaffDashboard() {
  const user = await getAuthenticatedStaff();
  if (!user) redirect('/admin/login?redirect=/staff');
  let data;
  try { data = await getAdminOverview(); } catch { redirect('/admin'); }
  const cards = [
    ['New leads', data.metrics.newLeads, Users],
    ['Active applications', data.metrics.activeApplications, ClipboardList],
    ['Waiting for documents', data.metrics.documentCases, FileClock],
    ['Offers received', data.metrics.offers, GraduationCap],
  ] as const;

  return <main className="min-h-screen bg-[var(--surface)]">
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">GAP operations</p><h1 className="mt-3 font-display text-4xl sm:text-5xl">Student pipeline</h1><p className="mt-3 text-[var(--muted)]">A quick operational view. Edit records and permissions in Payload Admin.</p></div><Link href="/admin" className="rounded-full bg-[var(--primary)] px-5 py-3 font-semibold text-white">Open Payload Admin</Link></div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label,value,Icon])=><article key={label} className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)] p-6"><Icon size={22} className="text-[var(--primary)]"/><strong className="mt-8 block font-display text-4xl">{value}</strong><span className="mt-1 block text-sm text-[var(--muted)]">{label}</span></article>)}</div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-6 sm:p-8"><div className="flex items-center justify-between"><h2 className="font-display text-2xl">Recent applications</h2><Link href="/admin/collections/applications" className="text-sm font-semibold text-[var(--primary)]">Manage <ArrowUpRight className="inline" size={15}/></Link></div><div className="mt-6 divide-y divide-[var(--border)]">{data.recentApplications.map((item:any)=><div key={item.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto]"><div><strong>{item.studentName}</strong><p className="mt-1 text-sm text-[var(--muted)]">{item.reference} · {item.email}</p></div><span className="w-fit rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold">{statusLabels[item.status] ?? item.status}</span></div>)}</div></section>
        <section className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-6 sm:p-8"><div className="flex items-center justify-between"><h2 className="font-display text-2xl">Recent leads</h2><Link href="/admin/collections/leads" className="text-sm font-semibold text-[var(--primary)]">Manage <ArrowUpRight className="inline" size={15}/></Link></div><div className="mt-6 divide-y divide-[var(--border)]">{data.recentLeads.map((lead:any)=><div key={lead.id} className="py-4"><div className="flex items-center justify-between gap-3"><strong>{lead.name}</strong><span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold capitalize">{lead.status ?? 'new'}</span></div><p className="mt-1 text-sm text-[var(--muted)]">{lead.email}{lead.interestedCountry ? ` · ${lead.interestedCountry}` : ''}</p></div>)}</div></section>
      </div>
    </div>
  </main>;
}
