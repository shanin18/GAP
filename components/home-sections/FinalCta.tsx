import { getGlobeDestinations } from "@/lib/globe-destinations";

import { getSectionText } from "@/lib/website-content-server";
import Link from "next/link";
import { ApplyNowDialog } from "../ui/apply-now-dialog";

export async function FinalCta() {
  const t = await getSectionText("home-cta");
  const destinations = (await getGlobeDestinations()).map((d) => ({
    name: d.name,
    href: `/country/${d.slug}`,
  }));

  return (
    <section className="px-5 pb-20 lg:px-8 lg:pb-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[color-mix(in_oklch,var(--primary)_14%,var(--background))] via-background to-background p-8 sm:p-12 lg:p-16">
        {/* Decorative globe with a slow orbiting dot (hidden from assistive tech) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-28 size-[24rem] opacity-60 sm:-right-16 sm:size-[30rem] lg:-right-10 lg:bottom-auto lg:top-1/2 lg:size-[34rem] lg:-translate-y-1/2 lg:opacity-100"
        >
          <svg viewBox="0 0 400 400" className="size-full text-primary/25">
            <g fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="200" cy="200" r="150" />
              <ellipse cx="200" cy="200" rx="75" ry="150" />
              <ellipse cx="200" cy="200" rx="115" ry="150" />
              <line x1="200" y1="50" x2="200" y2="350" />
              <line x1="50" y1="200" x2="350" y2="200" />
              <path d="M 76 130 H 324" />
              <path d="M 76 270 H 324" />
            </g>
          </svg>
          {/* Orbit ring */}
          <div className="absolute inset-[6%] rounded-full border border-dashed border-primary/25" />
          <span className="absolute inset-[6%] animate-[spin_36s_linear_infinite] motion-reduce:animate-none">
            <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_14px_var(--primary)]" />
          </span>
        </div>

        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
            {t("Ready when you are")}
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            {t("Let's map your route to the world.")}
          </h2>
          <p className="mt-5 max-w-md leading-8 text-muted-foreground sm:text-lg">
            {t(
              "Tell us where you would like to study, and a GAP adviser will help you take the first step.",
            )}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <ApplyNowDialog />
            <p className="text-sm text-muted-foreground">
              {t("or explore")}{" "}
              {destinations.map((d, i) => (
                <span key={d.href}>
                  <Link
                    href={d.href}
                    className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {d.name}
                  </Link>
                  {i < destinations.length - 2
                    ? ", "
                    : i === destinations.length - 2
                      ? " or "
                      : ""}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
