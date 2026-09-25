import { getSectionText } from "@/lib/website-content-server";
import { JourneyGlobe } from "../journey-globe";
import { getGlobeDestinations } from "@/lib/globe-destinations";

import { TrustStrip } from "../trust-strip";
import { ApplyNowDialog } from "../ui/apply-now-dialog";

export async function Hero() {
  const t = await getSectionText("home-hero");

  const destinations = await getGlobeDestinations();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-hero-start to-hero-end">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-[36rem] rounded-full bg-[color-mix(in_oklch,var(--primary)_16%,transparent)] blur-3xl"
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-24">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">
            {t("Global education, human guidance")}
          </p>
          <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(2.5rem,4.5vw,4.25rem)] leading-[0.98] tracking-[-0.055em]">
            {t("Your next chapter, ")}
            <em>{t("without borders.")}</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            {t(
              "Personal guidance, trusted university choices, and practical admission support for students planning to study abroad.",
            )}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ApplyNowDialog triggerClass="min-h-11 min-w-11 rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-primary-foreground" />
            <a
              href="#process"
              className="min-h-11 min-w-11 rounded-full border border-[var(--border)] px-6 py-3 font-semibold transition-colors hover:bg-[var(--surface)]"
            >
              {t("How it works")}
            </a>
          </div>
          <div className="mt-7">
            <TrustStrip />
          </div>
          <div className="mt-10 flex gap-8 text-sm">
            <div>
              <strong className="font-display text-2xl">
                {destinations.length}
              </strong>
              <span className="ml-2 text-muted-foreground">
                {t("launch destinations")}
              </span>
            </div>
            <div>
              <strong className="font-display text-2xl">{t("1:1")}</strong>
              <span className="ml-2 text-muted-foreground">
                {t("guidance")}
              </span>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <JourneyGlobe
            markers={destinations.flatMap((destination) =>
              destination.location
                ? [
                    {
                      id: destination.slug,
                      label: destination.name,
                      location: destination.location,
                      href: `/country/${destination.slug}`,
                    },
                  ]
                : [],
            )}
          />
        </div>
      </div>
    </section>
  );
}
