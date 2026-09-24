"use client";
import { useWebsiteContent } from "@/components/website-content-provider";

import { useEffect, useRef, useState } from "react";
import { FileCheck2, MessageCircle, Search } from "lucide-react";
import { SectionHeading } from "../section-heading";
import { cn } from "@/lib/utils";

const guidance = [
  {
    icon: MessageCircle,
    title: "Counselling",
    text: "Understand your goals, profile and options with practical one-to-one guidance.",
  },
  {
    icon: Search,
    title: "Selection of University & Program",
    text: "Compare destinations, universities and programs that fit your academic direction.",
  },
  {
    icon: FileCheck2,
    title: "University Admission / Enrollment",
    text: "Get structured support through applications, documents and enrollment steps.",
  },
];

const DOT = 48; // px, matches size-12

export function AcademicGuidance() {
  const t = useWebsiteContent("home-guidance");

  const listRef = useRef<HTMLOListElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const list = listRef.current;
      const track = trackRef.current;
      const fill = fillRef.current;
      const dots = dotRefs.current.filter(Boolean) as HTMLSpanElement[];
      if (!list || !track || !fill || dots.length === 0) return;

      // Line runs from the first dot's centre to the last dot's centre
      const first = dots[0].offsetTop + DOT / 2;
      const last = dots[dots.length - 1].offsetTop + DOT / 2;
      const trackH = Math.max(last - first, 0);
      track.style.top = `${first}px`;
      track.style.height = `${trackH}px`;

      // Scroll trigger: 60% down the viewport
      const trigger = window.innerHeight * 0.6;
      const top = list.getBoundingClientRect().top;
      const filled = Math.min(Math.max(trigger - top - first, 0), trackH);
      fill.style.height = `${filled}px`;

      // A step lights up when the fill reaches its dot
      let n = -1;
      dots.forEach((d, i) => {
        const b = d.getBoundingClientRect();
        if (b.top + b.height / 2 <= trigger) n = i;
      });
      setActive((prev) => (prev === n ? prev : n));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section>
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow={t("Academic guidance")}
          title={t("Support at the moments that matter.")}
          text={t("Three practical stages, connected by one consistent team.")}
        />

        <ol ref={listRef} className="relative mx-auto mt-14 max-w-5xl">
          {/* Centre line: grey track + mint fill that grows with scroll */}
          <div
            ref={trackRef}
            aria-hidden="true"
            className="absolute left-6 w-px -translate-x-1/2 bg-[var(--border)] md:left-1/2"
          >
            <div
              ref={fillRef}
              className="absolute left-0 top-0 w-full bg-primary"
            />
          </div>

          {guidance.map((x, i) => {
            const Icon = x.icon;
            const on = i <= active;
            const left = i % 2 === 0; // desktop: even steps sit left of the line

            return (
              <li
                key={x.title}
                className="grid grid-cols-[3rem_1fr] gap-x-5 pb-14 last:pb-0 md:grid-cols-[1fr_3rem_1fr] md:gap-x-10"
              >
                {/* Index dot on the line */}
                <span
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  className={cn(
                    "relative z-10 col-start-1 row-start-1 grid size-12 place-items-center rounded-full border bg-background font-display text-lg transition-[background-color,color,border-color,box-shadow] duration-300 md:col-start-2",
                    on
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_6px_color-mix(in_oklch,var(--primary)_18%,transparent)]"
                      : "border-[var(--border)] text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>

                {/* Content */}
                <div
                  className={cn(
                    "col-start-2 row-start-1 pt-1 transition-opacity duration-500 md:max-w-md",
                    left
                      ? "md:col-start-1 md:ml-auto md:text-right"
                      : "md:col-start-3",
                    on ? "opacity-100" : "opacity-45",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3",
                      left && "md:flex-row-reverse",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl transition-colors duration-300",
                        on
                          ? "bg-[color-mix(in_oklch,var(--primary)_18%,var(--surface))] text-primary"
                          : "bg-[var(--surface)] text-muted-foreground",
                      )}
                    >
                      <Icon size={20} />
                    </span>
                    <h3 className="font-display text-2xl leading-tight">
                      {t(x.title)}
                    </h3>
                  </div>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {t(x.text)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
