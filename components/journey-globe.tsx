"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let disposed = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let idle = 0;
    let timer = 0;
    let cleanup: (() => void) | undefined;
    const initialize = async () => {
      const { default: createGlobe } = await import("cobe");
      if (disposed) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
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

      if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) {
        setUnavailable(true);
        return;
      }
      const globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: size(),
        height: size(),
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
        markers: markers.map((m) => ({
          id: m.id,
          location: m.location,
          size: 0.03,
        })),
      } as any);

      // COBE inserts a canvas holder; explicitly fill the square on Safari too.
      const canvasHolder = canvas.parentElement;
      if (canvasHolder && canvasHolder !== wrap) {
        canvasHolder.style.position = 'absolute';
        canvasHolder.style.inset = '0';
      }

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

          // Same spherical projection as COBE, without CSS anchor positioning.
          for (const marker of markers) {
            const el = labelRefs.current[marker.id];
            if (!el) continue;
            const lat = marker.location[0] * Math.PI / 180;
            const lon = marker.location[1] * Math.PI / 180 - Math.PI;
            const x = -Math.cos(lat) * Math.cos(lon) * 0.81;
            const y = Math.sin(lat) * 0.81;
            const z = Math.cos(lat) * Math.sin(lon) * 0.81;
            const px = Math.cos(s.phi) * x + Math.sin(s.phi) * z;
            const py = Math.sin(s.phi) * Math.sin(s.theta) * x + Math.cos(s.theta) * y - Math.cos(s.phi) * Math.sin(s.theta) * z;
            const depth = -Math.sin(s.phi) * Math.cos(s.theta) * x + Math.sin(s.theta) * y + Math.cos(s.phi) * Math.cos(s.theta) * z;
            const shown = depth >= 0;
            el.style.left = ((px + 1) * 50) + '%';
            el.style.top = ((1 - py) * 50) + '%';
            el.style.opacity = shown ? '1' : '0';
            el.style.pointerEvents = shown ? 'auto' : 'none';
            el.tabIndex = shown ? 0 : -1;
            el.setAttribute('aria-hidden', String(!shown));
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
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
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
        globe.update({ width: w, height: w } as any);
      });
      ro.observe(wrap);

      const io = new IntersectionObserver(([entry]) => {
        s.visible = entry.isIntersecting;
        prev = performance.now();
      });
      io.observe(wrap);

      const fade = requestAnimationFrame(() => (canvas.style.opacity = "1"));

      cleanup = () => {
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
        const holder = canvas.parentElement;
        if (holder && holder !== wrap) { wrap.insertBefore(canvas, holder); holder.remove(); }
      };
    };

    // Let navigation paint first. On mobile, do not allocate a WebGL context
    // until the globe approaches the viewport below the hero copy.
    const start = () => {
      observer.disconnect();
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          const run = () => {
            void initialize().catch(() => {
              if (!disposed) setUnavailable(true);
            });
          };
          if (typeof window.requestIdleCallback === "function")
            idle = window.requestIdleCallback(run, { timeout: 1500 });
          else timer = window.setTimeout(run, 32);
        });
      });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
      },
      { rootMargin: "100px" },
    );
    observer.observe(wrap);
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      if (idle) window.cancelIdleCallback(idle);
      clearTimeout(timer);
      cleanup?.();
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
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          cursor: "grab",
          touchAction: "pan-y",
          opacity: 0,
          transition: "opacity 0.8s ease",
        }}
      />

      {unavailable && (
        <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-3 rounded-full border border-primary/20 bg-surface p-8">
          {markers.map((marker) => (
            <Link
              key={marker.id}
              href={marker.href ?? `/country/${marker.id}`}
              className="rounded-full border border-border px-4 py-3 text-sm text-primary"
            >
              {marker.label}
            </Link>
          ))}
        </div>
      )}

      {!unavailable && markers.map((m) => (
        <Link
          key={m.id}
          href={m.href ?? `/country/${m.id}`}
          tabIndex={-1}
          aria-hidden="true"
          ref={(el) => {
            labelRefs.current[m.id] = el;
          }}
          className="absolute cursor-pointer whitespace-nowrap rounded-full border border-white/15 bg-[#0f1a16]/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          style={
            {
              pointerEvents: "none", // toggled per frame based on visibility
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, calc(-100% - 8px))',
              opacity: 0,
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
