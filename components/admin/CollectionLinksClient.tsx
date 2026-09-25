"use client";

import { Link, useConfig, useNav } from "@payloadcms/ui";
import { formatAdminURL } from "payload/shared";
import { useEffect, useRef } from "react";
import {
  Briefcase,
  ClipboardList,
  FileText,
  Folder,
  Globe,
  GraduationCap,
  Image,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Quote,
  Settings,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

export type NavItem = { slug: string; label: string; href: string; badge: number };
export type NavGroup = { title: string; items: NavItem[] };

const ICONS = {
  "website-content": FileText,
  media: Image,
  leads: UserPlus,
  applications: ClipboardList,
  documents: FileText,
  countries: Globe,
  universities: GraduationCap,
  services: Briefcase,
  testimonials: Quote,
  news: Newspaper,
  "site-settings": Settings,
  users: Users,
} as const;

export function CollectionLinksClient({
  dashboardHref,
  groups,
}: {
  dashboardHref: string;
  groups: NavGroup[];
}) {
  const pathname = usePathname();
  const { config } = useConfig();
  const sidebar = useRef<HTMLElement>(null);
  const { navOpen, navRef, hydrated, shouldAnimate, setNavOpen } = useNav();

  useEffect(() => {
    if (window.matchMedia("(max-width: 1024px)").matches) setNavOpen(false);
  }, [pathname, setNavOpen]);

  useEffect(() => {
    if (!navOpen || !window.matchMedia("(max-width: 1024px)").matches) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const page = sidebar.current?.parentElement?.querySelector<HTMLElement>(".template-default__wrap");
    const wasInert = page?.inert ?? false;
    const overflow = document.body.style.overflow;
    if (page) page.inert = true;
    document.body.style.overflow = "hidden";
    sidebar.current?.querySelector<HTMLButtonElement>(".nav__mobile-close")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
      if (event.key !== "Tab") return;
      const items = Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]') ?? [])
        .filter((item) => item.getClientRects().length > 0);
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    const media = window.matchMedia("(max-width: 1024px)");
    const onResize = () => setNavOpen(false);
    media.addEventListener("change", onResize);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      if (page) page.inert = wasInert;
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onResize);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [navOpen, setNavOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
    <button
      type="button"
      className={`gap-nav-backdrop${navOpen ? " gap-nav-backdrop--open" : ""}`}
      aria-label="Close navigation"
      tabIndex={-1}
      onClick={() => setNavOpen(false)}
    />
    <aside
      ref={sidebar}
      className={[
        "nav",
        navOpen && "nav--nav-open",
        hydrated && "nav--nav-hydrated",
        shouldAnimate && "nav--nav-animate",
      ]
        .filter(Boolean)
        .join(" ")}
      inert={!navOpen || undefined}
    >
      <div className="gap-nav__header">
        <span className="gap-nav__brand">GAP Workspace</span>
        <button
          type="button"
          className="nav__mobile-close"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="nav__scroll" ref={navRef}>
        <nav className="nav__wrap" aria-label="Admin navigation">
          <div className="gap-nav">
            <Link
              href={dashboardHref}
              prefetch={false}
              className="nav__link gap-nav__link"
              aria-current={pathname === dashboardHref ? "page" : undefined}
            >
              <LayoutDashboard size={18} aria-hidden="true" />
              <span className="nav__link-label">Dashboard</span>
            </Link>

            {groups.map((group) => (
              <div className="gap-nav__group" key={group.title}>
                <p className="gap-nav-heading">{group.title}</p>
                {group.items.map(({ slug, label, href, badge }) => {
                  const Icon = ICONS[slug as keyof typeof ICONS] ?? Folder;
                  return (
                    <Link
                      key={slug}
                      id={`nav-${slug}`}
                      href={href}
                      prefetch={false}
                      className="nav__link gap-nav__link"
                      aria-current={isActive(href) ? "page" : undefined}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span className="nav__link-label">{label}</span>
                      {badge > 0 && (
                        <span className="gap-nav__badge" aria-label={`${badge} waiting`}>
                          {badge > 99 ? "99+" : badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="nav__controls">
            <Link className="nav__log-out gap-nav__logout" prefetch={false}
              href={formatAdminURL({ adminRoute: config.routes.admin, path: config.admin.routes.logout })}>
              <LogOut size={18} aria-hidden="true" />
              <span>Logout</span>
            </Link>
          </div>
        </nav>
      </div>
    </aside>
    </>
  );
}
