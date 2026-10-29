import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import * as flags from "country-flag-icons/string/3x2";
import { getGlobeDestinations } from "@/lib/globe-destinations";
import { getSectionText } from "@/lib/website-content-server";
import { SectionHeading } from "../section-heading";

// Flags are embedded on the server: no extra requests and no client JavaScript.
function flagSrc(code: string | null) {
  const svg = code ? (flags as Record<string, string | undefined>)[code] : undefined;
  return svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : null;
}

/** Every destination from the CMS, with its flag, linking to the country guide. */
export async function DestinationFlags() {
  // Copy is edited under Home / Hero, as this section continues the hero's "Top destinations"
  const [t, destinations] = await Promise.all([getSectionText("home-hero"), getGlobeDestinations()]);
  if (!destinations.length) return null;
  return (
    <section aria-labelledby="destination-flags-heading" className="border-y border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div id="destination-flags-heading">
            <SectionHeading eyebrow={t("Top destinations")} title={t("Where would you like to study?")} />
          </div>
          <Link href="/countries" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline">
            {t("Compare all destinations")}
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
          {destinations.map(({ name, slug, code }) => {
            const src = flagSrc(code);
            return (
              <li key={slug}>
                <Link
                  href={`/country/${slug}`}
                  aria-label={name}
                  className="group block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {/* The inner layer scales, so the link's hover area stays still under the cursor.
                      clip-path keeps the rounded clip during the transform (Safari drops overflow clipping there). */}
                  <span className="relative isolate block aspect-[3/2] overflow-hidden rounded-xl bg-primary/10 [clip-path:inset(0_round_0.75rem)] transition-transform duration-300 ease-out motion-safe:group-hover:scale-95 motion-safe:group-focus-visible:scale-95">
                    {src && <img src={src} alt="" width={240} height={160} className="absolute inset-0 size-full object-cover" />}
                    {/* Hover / keyboard focus: gray overlay with the name and an arrow to the country page.
                        It overhangs the flag by 1px so anti-aliased flag edges never show around it. */}
                    <span
                      aria-hidden="true"
                      className={`absolute -inset-px flex items-center justify-center gap-1.5 bg-neutral-900/75 px-2 text-center text-sm font-semibold text-white transition-opacity duration-300 ${src ? "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" : ""}`}
                    >
                      {name}
                      <ArrowRight size={16} className="shrink-0 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
                    </span>
                  </span>
                  {/* Touch screens can't hover: show the name under the flag instead */}
                  <span aria-hidden="true" className="mt-2 hidden text-center text-xs font-semibold leading-snug [@media(hover:none)]:block">
                    {name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
