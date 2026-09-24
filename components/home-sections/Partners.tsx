import { getSectionText } from "@/lib/website-content-server";
import Image from "next/image";

type Partner = { id: number; name: string; logoUrl?: string | null };

/** Each card is w-56 (224px) + gap-4 (16px). */
const CARD = 240;
/** Scroll speed in px per second. */
const SPEED = 55;
/** Each half of the track must be at least this wide so the loop never shows a gap. */
const MIN_HALF = 2400;

export async function Partners({
  items: incoming = [],
}: {
  items?: Partner[];
}) {
  const t = await getSectionText("home-partners");

  const items = incoming;

  // Repeat the list inside each half until it is wide enough for any screen
  const repeats = items.length
    ? Math.max(1, Math.ceil(MIN_HALF / (items.length * CARD)))
    : 0;
  const half = Array.from({ length: repeats }, (_, r) =>
    items.map((partner) => ({ partner, dup: r > 0 })),
  ).flat();
  const duration = Math.round((half.length * CARD) / SPEED);

  return (
    <section aria-labelledby="partners-heading">
      <style>{`
        @keyframes partners-loop {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
        .partners-track { animation: partners-loop var(--d) linear infinite }
        .partners-wrap:hover .partners-track,
        .partners-wrap:focus-within .partners-track { animation-play-state: paused }
        @media (prefers-reduced-motion: reduce) {
          .partners-track { animation: none }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <h2
          id="partners-heading"
          className="text-center text-xs font-extrabold uppercase tracking-[0.16em] text-primary"
        >
          {t("Our partners")}
        </h2>

        {items.length ? (
          <div
            role="region"
            aria-label={t("Partner institutions")}
            tabIndex={0}
            className="partners-wrap mt-10 overflow-hidden rounded-2xl outline-offset-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]"
          >
            <div
              className="partners-track flex w-max"
              style={{ "--d": `${duration}s` } as React.CSSProperties}
            >
              {[0, 1].map((copy) => (
                <ul
                  key={copy}
                  aria-hidden={copy === 1 ? true : undefined}
                  className={
                    "flex shrink-0 items-center gap-4 pr-4 " +
                    (copy === 1 ? "motion-reduce:hidden" : "")
                  }
                >
                  {half.map(({ partner, dup }, i) => (
                    <li
                      key={`${partner.id}-${i}`}
                      aria-hidden={dup ? true : undefined}
                      className="flex h-28 w-56 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4"
                    >
                      {partner.logoUrl && (
                        <Image
                          src={partner.logoUrl}
                          alt=""
                          width={160}
                          height={56}
                          className="h-14 w-40 object-contain"
                        />
                      )}
                      <span className="text-center text-sm font-semibold text-primary">
                        {partner.name}
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("Partner information will be available soon.")}
          </p>
        )}
      </div>
    </section>
  );
}
