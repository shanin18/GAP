"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type Testimonial = {
  studentName: string;
  universityName?: string;
  quote: string;
  photoUrl?: string | null;
  rating?: number | null;
};

/** How long each story stays on screen before moving on (ms). */
const DWELL = 8000;

function Avatar({
  name,
  photoUrl,
  className,
}: {
  name: string;
  photoUrl?: string | null;
  className: string;
}) {
  return photoUrl ? (
    <Image
      src={photoUrl}
      alt=""
      width={64}
      height={64}
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-secondary font-display text-primary",
        className,
      )}
    >
      {name.charAt(0)}
    </span>
  );
}

export function TestimonialShowcase({ items }: { items: Testimonial[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [runId, setRunId] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const many = items.length > 1;
  const autoplay = many && !reduceMotion;
  const paused = hovered || focused || !inView || tabHidden;

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const el = rootRef.current;
    const io = el
      ? new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
          threshold: 0.3,
        })
      : null;
    if (el && io) io.observe(el);
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const go = (i: number) => {
    setActive(i);
    setRunId((r) => r + 1);
    setHovered(false);
  };

  const total = String(items.length).padStart(2, "0");

  // Swipe left/right on the quote (mobile)
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start || !many) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    go((active + (dx < 0 ? 1 : -1) + items.length) % items.length);
  };

  const progressStyle = (running: boolean) =>
    running && autoplay
      ? {
          animation: `tst-fill ${DWELL}ms linear forwards`,
          animationPlayState: paused
            ? ("paused" as const)
            : ("running" as const),
        }
      : undefined;

  return (
    <div
      ref={rootRef}
      className="relative grid gap-6 lg:grid-cols-[1.5fr_.7fr] lg:gap-16"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) =>
        setFocused(
          e.target instanceof HTMLElement && e.target.matches(":focus-visible"),
        )
      }
      onBlur={() => setFocused(false)}
    >
      <style>{`
        @keyframes tst-fill { from { transform: scaleX(0) } to { transform: scaleX(1) } }
      `}</style>

      {/* Soft mint glow behind the quote */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-0 size-[26rem] rounded-full bg-[color-mix(in_oklch,var(--primary)_9%,transparent)] blur-3xl"
      />

      {/* Mobile: story-style segmented progress bars on top (tap a segment to jump) */}
      {many && (
        <div
          role="group"
          aria-label="Choose a student story"
          className="flex gap-1.5 lg:hidden"
        >
          {items.map(({ studentName }, i) => (
            <button
              key={`${studentName}-${i}`}
              type="button"
              aria-label={`Story ${i + 1}: ${studentName}`}
              aria-pressed={i === active}
              onClick={() => go(i)}
              className="group flex min-h-11 flex-1 items-center"
            >
              <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-[var(--border)]">
                <span
                  key={i === active ? runId : "static"}
                  className="absolute inset-0 origin-left rounded-full bg-primary"
                  style={
                    i === active
                      ? (progressStyle(true) ?? undefined)
                      : { transform: i < active ? "scaleX(1)" : "scaleX(0)" }
                  }
                />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Featured story: every quote shares one grid cell, so height never jumps */}
      <div
        className="relative"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="mb-6 flex items-center gap-4 text-primary">
          <Quote aria-hidden="true" size={44} className="opacity-40" />
          {many && (
            <span className="font-display text-lg tabular-nums text-muted-foreground">
              <span className="text-foreground">
                {String(active + 1).padStart(2, "0")}
              </span>{" "}
              / {total}
            </span>
          )}
        </div>

        <div className="grid" aria-live={autoplay ? "off" : "polite"}>
          {items.map(
            ({ studentName, universityName, quote, photoUrl, rating }, i) => {
              const on = i === active;
              return (
                <figure
                  key={`${studentName}-${i}`}
                  aria-hidden={!on}
                  className={cn(
                    "col-start-1 row-start-1 transition-[opacity,transform,visibility] duration-500",
                    on
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-3 opacity-0",
                  )}
                >
                  <blockquote className="font-display text-2xl leading-[1.2] tracking-[-0.02em] sm:text-4xl sm:leading-[1.15] lg:text-5xl">
                    “{quote}”
                  </blockquote>
                  {rating != null && (
                    <div
                      className="mt-6 flex gap-1 text-primary"
                      aria-label={`${rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          size={16}
                          aria-hidden="true"
                          className={
                            index < rating ? "fill-current" : "opacity-30"
                          }
                        />
                      ))}
                    </div>
                  )}
                  <figcaption className="mt-8 flex items-center gap-4 sm:mt-10">
                    <Avatar
                      name={studentName}
                      photoUrl={photoUrl}
                      className="size-14 text-xl"
                    />
                    <div className="min-w-0">
                      <p className="text-lg font-semibold">{studentName}</p>
                      {universityName && (
                        <p className="mt-0.5 text-muted-foreground">
                          {universityName}
                        </p>
                      )}
                    </div>
                  </figcaption>
                </figure>
              );
            },
          )}
        </div>
      </div>

      {/* One hidden element drives the auto-advance for both layouts below */}
      {autoplay && (
        <span
          key={runId}
          aria-hidden="true"
          className="pointer-events-none absolute size-px opacity-0"
          style={progressStyle(true)}
          onAnimationEnd={(e) => {
            if (e.animationName === "tst-fill") go((active + 1) % items.length);
          }}
        />
      )}

      {/* Desktop: story list with a progress line under the active student */}
      {many && (
        <ul
          aria-label="Choose a student story"
          className="hidden lg:flex lg:flex-col lg:justify-center lg:gap-2"
        >
          {items.map(({ studentName, universityName, photoUrl }, i) => {
            const on = i === active;
            return (
              <li key={`${studentName}-${i}`}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => go(i)}
                  className={cn(
                    "group relative flex min-h-14 w-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left transition-colors",
                    on ? "bg-[var(--surface)]" : "hover:bg-[var(--surface)]/60",
                  )}
                >
                  <Avatar
                    name={studentName}
                    photoUrl={photoUrl}
                    className={cn(
                      "size-10 text-base transition-opacity",
                      on ? "opacity-100" : "opacity-60 group-hover:opacity-100",
                    )}
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate font-semibold transition-colors",
                        on ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {studentName}
                    </span>
                    {universityName && (
                      <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                        {universityName}
                      </span>
                    )}
                  </span>

                  {on && (
                    <span
                      key={runId}
                      aria-hidden="true"
                      className="absolute inset-x-4 bottom-0 h-0.5 origin-left bg-primary"
                      style={progressStyle(true) ?? { transform: "scaleX(1)" }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
