"use client";
import { useWebsiteContent } from "@/components/website-content-provider";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { CalendarCheck, MessageCircle, Plane, Send } from "lucide-react";
import { cn } from "@/lib/utils";

/** How long each step stays active before moving on (ms). */
const DWELL = 3600;

/** One quarter of the circle: from a step to the next one, clockwise. */
const ARC = "M 248 69 A 140 140 0 0 1 331 152";

/** Arrowhead drawn as its own stroke at the end of the arc (tip sits on the arc's end point). */
const HEAD = "M 333.6 142.3 L 331 152 L 322.8 146.3";

/** After the line finishes, the arrowhead draws in over this long (ms). */
const HEAD_TIME = 380;

const steps = [
  {
    icon: MessageCircle,
    title: "Consultation",
    position: "left-1/2 top-0 -translate-x-1/2",
    description:
      "Discuss your goals, academic background and preferred destinations with a GAP adviser.",
  },
  {
    icon: Send,
    title: "Apply",
    position: "right-0 top-1/2 -translate-y-1/2",
    description:
      "Build your shortlist and prepare your application with clear guidance on the documents you need.",
  },
  {
    icon: CalendarCheck,
    title: "Appointment",
    position: "bottom-0 left-1/2 -translate-x-1/2",
    description:
      "Meet your adviser to review progress, discuss your options and plan the next steps.",
  },
  {
    icon: Plane,
    title: "Fly",
    position: "left-0 top-1/2 -translate-y-1/2",
    description:
      "Prepare for departure and arrive ready for your new chapter abroad.",
  },
];

export function HowGapWorks() {
  const t = useWebsiteContent("home-process");

  const id = useId().replace(/:/g, "");
  const diagramRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState(0);
  const [runId, setRunId] = useState(0); // restarts the arc animation on click
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );

    const el = diagramRef.current;
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
    setSelected(i);
    setRunId((r) => r + 1);
    setHovered(false); // resume right after a click, even with the cursor still over
  };

  const paused = hovered || focused || !inView || tabHidden;
  const current = steps[selected];

  return (
    <section id="process" className="scroll-mt-20 bg-surface">
      <style>{`
        @keyframes gap-draw { from { stroke-dashoffset: 1.03 } to { stroke-dashoffset: 0 } }
        @keyframes gap-fade { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        .gap-fade { animation: gap-fade .5s cubic-bezier(.2,.7,.2,1) both }
        @media (prefers-reduced-motion: reduce) { .gap-fade { animation: none } }
      `}</style>

      <h2 className="sr-only">
        {t("One step at a time, all the way to the globe.")}
      </h2>

      <div className="mx-auto grid max-w-7xl gap-x-12 gap-y-8 px-5 py-16 md:py-20 lg:grid-cols-[.8fr_1.2fr] lg:grid-rows-[1fr_auto_auto_1fr] lg:px-8 lg:py-24">
        {/* Eyebrow only */}
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary lg:col-start-1 lg:row-start-2">
          {t("How GAP works")}
        </p>

        {/* Diagram */}
        <div
          ref={diagramRef}
          className="min-w-0 lg:col-start-2 lg:row-span-4 lg:row-start-1"
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={(e) =>
            setFocused(
              e.target instanceof HTMLElement &&
                e.target.matches(":focus-visible"),
            )
          }
          onBlur={() => setFocused(false)}
        >
          <div className="relative mx-auto aspect-square w-full max-w-xl">
            <div
              className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_oklch,var(--primary)_18%,transparent)] blur-3xl sm:size-64"
              aria-hidden="true"
            />

            <svg
              viewBox="0 0 400 400"
              aria-hidden="true"
              className="absolute inset-0 size-full text-primary/35"
            >
              {[0, 1, 2, 3].map((i) => {
                const rotate = `rotate(${i * 90} 200 200)`;
                const isCurrent = i === selected && !reduceMotion;
                const isDone = i < selected;

                return (
                  <g key={i} transform={rotate}>
                    {/* Bright line: draws while its step is active, stays lit after */}
                    <path
                      key={isCurrent ? `line-${runId}` : "line-idle"}
                      d={ARC}
                      pathLength={1}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="1 2"
                      strokeDashoffset={isCurrent ? 1.03 : 0}
                      style={{
                        opacity: isCurrent || isDone ? 1 : 0,
                        transition: "opacity .5s ease",
                        ...(isCurrent
                          ? {
                              animation: `gap-draw ${DWELL}ms linear forwards`,
                              animationPlayState: paused ? "paused" : "running",
                            }
                          : null),
                      }}
                    />

                    {/* Arrowhead: drawn after the line completes, then the next step starts */}
                    <path
                      key={isCurrent ? `head-${runId}` : "head-idle"}
                      d={HEAD}
                      pathLength={1}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="1 2"
                      strokeDashoffset={isCurrent ? 1.03 : 0}
                      style={{
                        opacity: isCurrent || isDone ? 1 : 0,
                        transition: "opacity .5s ease",
                        ...(isCurrent
                          ? {
                              animation: `gap-draw ${HEAD_TIME}ms ease-out ${DWELL}ms both`,
                              animationPlayState: paused ? "paused" : "running",
                            }
                          : null),
                      }}
                      onAnimationEnd={(e) => {
                        if (e.animationName === "gap-draw")
                          go((selected + 1) % steps.length);
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Logo */}
            <div className="absolute left-1/2 top-1/2 z-10 size-28 -translate-x-1/2 -translate-y-1/2 sm:size-52">
              <div className="relative size-full overflow-hidden rounded-full border border-primary/20 bg-background">
                <Image
                  src={t("/images/gap-logo.webp")}
                  alt={t("GAP logo")}
                  fill
                  sizes="(min-width: 640px) 208px, 112px"
                  className="object-contain p-5 sm:p-9"
                />
              </div>
            </div>

            <ol
              aria-label={t("Your study abroad journey")}
              className="pointer-events-none absolute inset-0"
            >
              {steps.map(({ title, position, icon: Icon }, index) => (
                <li key={title} className={"absolute w-24 sm:w-36 " + position}>
                  <button
                    type="button"
                    aria-pressed={selected === index}
                    aria-controls={id + "-description"}
                    onClick={() => go(index)}
                    className="pointer-events-auto group flex min-h-11 w-full flex-col items-center rounded-2xl p-1 text-center"
                  >
                    <span
                      className={cn(
                        "grid size-14 place-items-center rounded-full border transition-colors duration-300 sm:size-20",
                        selected === index
                          ? "border-primary bg-primary text-primary-foreground"
                          : index < selected
                            ? "border-primary/60 bg-background text-primary"
                            : "border-border bg-background text-primary group-hover:bg-secondary",
                      )}
                    >
                      <Icon aria-hidden="true" className="size-6 sm:size-8" />
                    </span>
                    <span
                      className={cn(
                        "mt-2 text-xs font-bold transition-colors sm:text-base",
                        selected === index
                          ? "text-foreground"
                          : "text-foreground/80",
                      )}
                    >
                      <span className="sr-only">
                        {t("Step ")}
                        {index + 1}:{" "}
                      </span>
                      {t(title)}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Step detail: beside the diagram on desktop, below it on mobile */}
        <div
          id={id + "-description"}
          className="mx-auto w-full max-w-xl lg:col-start-1 lg:row-start-3 lg:mx-0 lg:max-w-none"
        >
          <div key={selected} className="gap-fade">
            {/* <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Step {selected + 1} of {steps.length}
            </p> */}
            <h3 className="font-display text-3xl leading-tight tracking-[-0.02em] sm:text-4xl">
              {t(current.title)}
            </h3>
            <p className="mt-4 max-w-md leading-8 text-muted-foreground">
              {t(current.description)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
