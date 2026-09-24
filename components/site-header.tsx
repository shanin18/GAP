import { getSectionText } from "@/lib/website-content-server";
import Link from "next/link";
import Image from "next/image";
import { ApplyNowDialog } from "./ui/apply-now-dialog";
import { CountryMenu } from "./country-menu";
import { NavLink } from "./NavLink";

export async function SiteHeader() {
  const t = await getSectionText("header");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <Link
          href="/"
          aria-label={t("GAP home")}
          className="inline-flex shrink-0 items-center py-2"
        >
          <Image
            src={t("/images/gap-logo.webp")}
            alt={t("Global Admission Platform")}
            width={90}
            height={64}
            priority
            className="h-14 w-auto rounded-md sm:h-16"
          />
        </Link>
        <nav
          aria-label={t("Main navigation")}
          className="hidden items-center gap-5 text-sm font-semibold md:flex"
        >
          <NavLink href="/" exact>
            {t("Home")}
          </NavLink>
          <CountryMenu />
          <NavLink href="/services">{t("Services")}</NavLink>
          <NavLink href="/about">{t("About")}</NavLink>
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ApplyNowDialog />
        </div>
      </div>
    </header>
  );
}
