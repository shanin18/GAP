"use client";

import {
  Children,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./card-carousel.module.css";

export function CardCarousel({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activated, setActivated] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [overflow, setOverflow] = useState(false);
  const [dragging, setDragging] = useState(false);
  const count = Children.count(children);
  const cycle = useRef(0);
  const move = useCallback(() => {
    const element = track.current;
    if (!element) return;
    const step =
      (element.firstElementChild?.getBoundingClientRect().width ?? 0) + 24;
    const next = element.scrollLeft + step;
    element.scrollTo({ left: next, behavior: reduced ? "instant" : "smooth" });
  }, [reduced]);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setActivated(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    const measure = () => {
      const first = element.children[0] as HTMLElement | undefined;
      const middle = element.children[count] as HTMLElement | undefined;
      if (!first || !middle) return;
      const previous = cycle.current;
      cycle.current = middle.offsetLeft - first.offsetLeft;
      setOverflow(cycle.current - 24 > element.clientWidth + 2);
      if (cycle.current !== previous)
        element.scrollTo({ left: middle.offsetLeft, behavior: "instant" });
    };
    const settle = () => {
      const middle = element.children[count] as HTMLElement | undefined;
      if (!middle || !cycle.current) return;
      const start = middle.offsetLeft;
      if (
        element.scrollLeft < start - 5 ||
        element.scrollLeft >= start + cycle.current - 5
      ) {
        const remainder =
          (((element.scrollLeft - start) % cycle.current) + cycle.current) %
          cycle.current;
        const offset = remainder >= cycle.current - 5 ? 0 : remainder;
        element.scrollTo({ left: start + offset, behavior: "instant" });
      }
      setDragging(false);
    };
    measure();
    element.addEventListener("scrollend", settle);
    const release = () => setDragging(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    return () => {
      preference.removeEventListener("change", sync);
      observer.disconnect();
      resize.disconnect();
      element.removeEventListener("scrollend", settle);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [count, activated]);

  useEffect(() => {
    if (hovered || focused || dragging || !visible || reduced || !overflow)
      return;
    const timer = setInterval(() => {
      if (!document.hidden) move();
    }, 4500);
    return () => clearInterval(timer);
  }, [hovered, focused, dragging, visible, reduced, overflow, move]);

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label="News and study guidance"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovered(false);
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div
        ref={track}
        className={styles.track}
        onPointerDown={() => setDragging(true)}
      >
        {(activated ? [0, 1, 2] : [1]).map((copy) =>
          Children.map(children, (child, index) => (
            <div
              key={`${copy}-${index}`}
              inert={copy !== 1}
              aria-hidden={copy !== 1 ? true : undefined}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}`}
              className="flex w-full shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] [&>article]:w-full"
            >
              {child}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
