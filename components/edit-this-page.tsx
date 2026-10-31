"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import type { EditLink } from "@/lib/admin-edit-links";

export const ADMIN_MARKER_COOKIE = "gap-admin";
/** Browser tab name shared by every Edit link and the admin panel itself */
export const ADMIN_TAB_NAME = "gap-admin";

/**
 * Floating "Edit this page" menu for admins browsing the public site. It renders nothing for visitors:
 * the admin panel sets a marker cookie (components/admin/AdminMarker.tsx), so pages stay fully cached and
 * make no extra requests. The links only lead to the admin, which still requires logging in.
 */
export function EditThisPage({ links }: { links: EditLink[] }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAdmin(document.cookie.split("; ").includes(`${ADMIN_MARKER_COOKIE}=1`));
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!isAdmin || !links.length) return null;
  return (
    <div
      ref={root}
      className="fixed right-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-2 md:right-6 md:bottom-6"
    >
      {open && (
        <ul
          id={menuId}
          className="w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-background py-2 text-sm shadow-xl"
        >
          <li className="px-4 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Edit in the admin
          </li>
          {links.map((link) => (
            <li key={link.href + link.label}>
              <a
                href={link.href}
                // A named target reuses (and switches to) the admin tab when one is open, else opens one tab.
                // Same-site link, so keeping the opener is safe; "noopener" would force a new tab every time.
                target={ADMIN_TAB_NAME}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10 focus-visible:outline-none"
              >
                {link.label}
                <ExternalLink size={14} aria-hidden="true" className="shrink-0 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Pencil size={16} aria-hidden="true" />
        Edit this page
      </button>
    </div>
  );
}
