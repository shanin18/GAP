"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  children,
  exact = false,
}: {
  href: string;
  children: ReactNode;
  /** Match only this exact path (use for "/") */
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      prefetch={true}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center px-3 transition-colors duration-200 ease-out hover:text-primary hover:bg-secondary rounded-xl",
        active ? "text-primary" : "text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
