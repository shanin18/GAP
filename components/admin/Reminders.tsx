'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@payloadcms/ui';
import Link from 'next/link';
import { Bell, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';

type ReminderData = { total: number; items: { id: string; label: string; date: string; href: string }[] };

export function Reminders() {
  const { user } = useAuth();
  const [data, setData] = useState<ReminderData | null>(null);
  const [failed, setFailed] = useState(false);
  const panel = useRef<HTMLDetailsElement>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(3);
  useEffect(() => {
    const resize = () => setPageSize(window.innerHeight < 600 ? 1 : window.innerWidth < 640 ? 2 : 3);
    const dismiss = (event: PointerEvent) => {
      if (panel.current && !panel.current.contains(event.target as Node)) panel.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && panel.current?.open) {
        panel.current.open = false;
        panel.current.querySelector('summary')?.focus();
      }
    };
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  const pages = Math.max(1, Math.ceil((data?.items.length ?? 0) / pageSize));
  const currentPage = Math.min(page, pages - 1);
  const close = () => {
    if (panel.current) {
      panel.current.open = false;
      panel.current.querySelector('summary')?.focus();
    }
  };
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const response = await fetch('/api/admin/reminders', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('Reminders unavailable');
        const next = await response.json();
        if (!controller.signal.aborted) { setData(next); setFailed(false); }
      } catch { if (!controller.signal.aborted) setFailed(true); }
      finally { pending = false; }
    }
    setData(null);
    void refresh();
    const timer = setInterval(refresh, 15_000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => { controller.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', refresh); window.removeEventListener('focus', refresh); };
  }, [user?.id]);
  if (!user) return null;
  return <details className="gap-reminders" ref={panel}>
    <summary aria-label={`Reminders${data ? `, ${data.total} due` : ''}`}>
      <Bell size={18} aria-hidden="true" /><span className="gap-reminders-label">Reminders</span>
      <span className="gap-reminders-count" aria-live="polite">{failed ? '!' : data?.total ?? '…'}</span>
    </summary>
    <div className="gap-reminders-panel">
      <div className="gap-reminders-heading">
        <div><strong>{user.role === 'admin' ? 'Team reminders' : 'Your reminders'}</strong><p>Follow-ups that need attention</p></div>
        <button type="button" onClick={close} aria-label="Close reminders"><X size={18} /></button>
      </div>
      {failed ? <p className="gap-reminders-state" role="status">Unable to refresh. Retrying automatically.</p> : !data ? <p className="gap-reminders-state">Loading reminders…</p> : data.total === 0 ? <div className="gap-reminders-empty"><CheckCircle2 size={30} aria-hidden="true" /><strong>You’re all caught up</strong><p>No follow-ups due right now.</p></div> : null}
      {!!data?.items.length && <ul className="gap-reminders-list">{data.items.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map(item => <li key={item.id}><Link href={item.href} onClick={() => { if (panel.current) panel.current.open = false; }}><span><strong>{item.label}</strong><small>{item.id.startsWith('lead-') ? 'Lead' : 'Application'} · {new Date(item.date).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</small></span><ChevronRight size={18} aria-hidden="true" /></Link></li>)}</ul>}
      {pages > 1 && <nav className="gap-reminders-pagination" aria-label="Reminder pages"><button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} aria-label="Previous reminders"><ChevronLeft size={18} /></button><span aria-live="polite">{currentPage + 1} / {pages}</span><button type="button" disabled={currentPage === pages - 1} onClick={() => setPage(currentPage + 1)} aria-label="Next reminders"><ChevronRight size={18} /></button></nav>}
      {data && data.total > data.items.length && <p className="gap-reminders-state">Showing {data.items.length} of {data.total}. Find more in Leads and Applications.</p>}
      <footer className="gap-reminders-footer">Auto-refreshes every 15 seconds</footer>
    </div>
  </details>;
}
