"use client";

import createGlobe from "cobe";
import Link from "next/link";
import { useEffect, useRef } from "react";

type Loc = [number, number];
export type GlobeMarker = {
  id: string;
  location: Loc;
  label: string;
  href?: string; // defaults to /countries/{id}
};

const DEFAULT_MARKERS: GlobeMarker[] = [
  { id: "australia", location: [-25.27, 133.77], label: "Australia" },
  { id: "canada", location: [56.13, -106.35], label: "Canada" },
  { id: "new-zealand", location: [-40.9, 174.89], label: "New Zealand" },
];

type Props = {
  markers?: GlobeMarker[];
  markerColor?: [number, number, number];
  baseColor?: [number, number, number];
  glowColor?: [number, number, number];
  dark?: number;
  diffuse?: number;
  mapBrightness?: number;
  autoSpeed?: number; // radians per frame at 60fps
  className?: string;
};

const BASE_THETA = 0.25;

export function JourneyGlobe({
  markers = DEFAULT_MARKERS,
  // Dark, mint-tinted defaults to match the page. Tweak freely.
  markerColor = [0.66, 0.84, 0.73],
  baseColor = [0.16, 0.26, 0.22],
  glowColor = [0.09, 0.17, 0.14],
  dark = 1,
  diffuse = 1.2,
  mapBrightness = 6,
  autoSpeed = 0.003,
  className = "",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const s = {
      phi: 0.6,
      theta: BASE_THETA,
      vPhi: 0,
      vTheta: 0,
      auto: 1,
      dragging: false,
      hover: false,
      lastX: 0,
      lastY: 0,
      lastT: 0,
      visible: true,
      raf: 0,
    };

    const size = () => Math.max(1, wrap.offsetWidth);

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size() * dpr,
      height: size() * dpr,
      phi: s.phi,
      theta: s.theta,
      dark,
      diffuse,
      mapSamples: 16000,
      mapBrightness,
      baseColor,
      markerColor,
      glowColor,
      markerElevation: 0.01,
      markers: markers.map((m) => ({ id: m.id, location: m.location, size: 0.03 })),
    } as any);

    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 16.667, 3);
      prev = now;

      if (s.visible) {
        if (!s.dragging) {
          const friction = Math.pow(0.94, dt);
          s.vPhi *= friction;
          s.vTheta *= friction;

          // Pause while hovered/focused, or while momentum is still settling
          const moving = Math.abs(s.vPhi) > 0.0008;
          const target = moving || s.hover ? 0 : 1;
          s.auto += (target - s.auto) * Math.min(0.06 * dt, 1);

          s.theta += (BASE_THETA - s.theta) * Math.min(0.02 * dt, 1);
        }

        s.phi += (s.vPhi + (reduceMotion ? 0 : autoSpeed * s.auto)) * dt;
        s.theta += s.vTheta * dt;
        s.theta = Math.max(-0.5, Math.min(0.9, s.theta));

        globe.update({ phi: s.phi, theta: s.theta } as any);

        // Only labels on the visible side are clickable
        for (const id in labelRefs.current) {
          const el = labelRefs.current[id];
          if (!el) continue;
          const shown = parseFloat(getComputedStyle(el).opacity) > 0.5;
          el.style.pointerEvents = shown ? "auto" : "none";
          el.tabIndex = shown ? 0 : -1;
        }
      }
      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);

    // ---- Drag ----
    const onDown = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastT = performance.now();
      s.vPhi = 0;
      s.vTheta = 0;
      s.auto = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!s.dragging) return;
      const now = performance.now();
      const dt = Math.max((now - s.lastT) / 16.667, 0.5);
      const k = 3.2 / size();
      const dPhi = (e.clientX - s.lastX) * k;
      const dTheta = (e.clientY - s.lastY) * k;
      s.phi += dPhi;
      s.theta = Math.max(-0.5, Math.min(0.9, s.theta + dTheta));
      s.vPhi = s.vPhi * 0.5 + (dPhi / dt) * 0.5;
      s.vTheta = 0;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastT = now;
    };
    const onUp = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.dragging = false;
      if (performance.now() - s.lastT > 80) s.vPhi = 0;
      s.vPhi = Math.max(-0.08, Math.min(0.08, s.vPhi));
      canvas.releasePointerCapture?.(e.pointerId);
      canvas.style.cursor = "grab";
    };

    // ---- Hover / focus pause (covers the globe AND its labels) ----
    const onEnter = () => (s.hover = true);
    const onLeave = () => (s.hover = false);

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("focusin", onEnter);
    wrap.addEventListener("focusout", onLeave);

    const ro = new ResizeObserver(() => {
      const w = size();
      globe.update({ width: w * dpr, height: w * dpr } as any);
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting;
      prev = performance.now();
    });
    io.observe(wrap);

    const fade = requestAnimationFrame(() => (canvas.style.opacity = "1"));

    return () => {
      cancelAnimationFrame(s.raf);
      cancelAnimationFrame(fade);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("focusin", onEnter);
      wrap.removeEventListener("focusout", onLeave);
      globe.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(markers), dark, diffuse, mapBrightness, autoSpeed]);

  return (
    <div
      ref={wrapRef}
      className={`relative mx-auto aspect-square w-full max-w-[560px] select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-label="Interactive globe showing study destinations"
        role="img"
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          touchAction: "pan-y",
          opacity: 0,
          transition: "opacity 0.8s ease",
        }}
      />

      {markers.map((m) => (
        <Link
          key={m.id}
          href={m.href ?? `/country/${m.id}`}
          ref={(el) => {
            labelRefs.current[m.id] = el;
          }}
          className="absolute cursor-pointer whitespace-nowrap rounded-full border border-white/15 bg-[#0f1a16]/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          style={
            {
              pointerEvents: "none", // toggled per frame based on visibility
              positionAnchor: `--cobe-${m.id}`,
              bottom: "anchor(top)",
              left: "anchor(center)",
              translate: "-50% -8px",
              opacity: `var(--cobe-visible-${m.id}, 0)`,
              filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 6px))`,
              transition:
                "opacity 0.35s ease, filter 0.35s ease, background-color .2s, color .2s, border-color .2s",
            } as React.CSSProperties
          }
        >
          {m.label}
        </Link>
      ))}
    </div>
  );
}