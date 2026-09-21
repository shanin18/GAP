"use client";

import { Link, Logout, useNav } from "@payloadcms/ui";
import {
  Briefcase,
  ClipboardList,
  FileText,
  Folder,
  Globe,
  GraduationCap,
  LayoutDashboard,
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
  const { navOpen, navRef, hydrated, shouldAnimate, setNavOpen } = useNav();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
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
            <Logout />
          </div>
        </nav>
        <div className="nav__header">
          <div className="nav__header-content">
            <button
              type="button"
              className="nav__mobile-close"
              aria-label="Close menu"
              onClick={() => setNavOpen(false)}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
