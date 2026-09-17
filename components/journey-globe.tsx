'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe2, Pause, Play } from 'lucide-react';
import type { Globe } from 'cobe';

export function JourneyGlobe() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const pauseRef = useRef(paused);
  useEffect(() => { pauseRef.current = paused; }, [paused]);

  useEffect(() => {
    const element = host.current;
    const surface = canvas.current;
    if (!element || !surface) return;
    let disposed = false;
    let visible = false;
    let loading = false;
    let globe: Globe | undefined;
    let frame = 0;
    let phi = 2.3;
    let previous = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const palette = () => document.documentElement.dataset.theme === 'dark'
      ? { dark: 1, baseColor: [.55, .75, .62] as [number, number, number], glowColor: [.067, .102, .086] as [number, number, number] }
      : { dark: 0, baseColor: [.16, .4, .29] as [number, number, number], glowColor: [1, 1, 1] as [number, number, number] };
    function tick(time: number) {
      if (disposed || !visible || document.hidden || reduced.matches) return;
      if (time - previous >= 32) {
        if (!pauseRef.current) phi += Math.min(time - previous, 64) * .00015;
        globe?.update({ phi });
        previous = time;
      }
      frame = requestAnimationFrame(tick);
    }
    function resume() {
      cancelAnimationFrame(frame);
      previous = performance.now();
      if (globe && visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
    }
    async function load() {
      if (loading || globe) return;
      loading = true;
      try {
        const { default: createGlobe } = await import('cobe');
        if (disposed) return;
        const size = element!.clientWidth * pixelRatio;
        globe = createGlobe(surface!, {
          width: size, height: size, devicePixelRatio: pixelRatio,
          phi, theta: .25, diffuse: 1.5, mapSamples: 8000, mapBrightness: 5,
          ...palette(), markerColor: [.84, .65, .29],
          markers: [
            { location: [23.81, 90.41], size: .07 },
            { location: [-33.87, 151.21], size: .06 },
            { location: [43.65, -79.38], size: .06 },
            { location: [-36.85, 174.76], size: .06 },
          ],
        });
        setReady(true);
        resume();
      } catch { /* The accessible SVG fallback remains visible without WebGL. */ }
    }
    const near = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { void load(); near.disconnect(); }
    }, { rootMargin: '150px' });
    const viewport = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; resume(); });
    const resize = new ResizeObserver(() => {
      const size = element.clientWidth * pixelRatio;
      globe?.update({ width: size, height: size });
    });
    const theme = new MutationObserver(() => globe?.update(palette()));
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    near.observe(element); viewport.observe(element); resize.observe(element);
    reduced.addEventListener('change', resume);
    document.addEventListener('visibilitychange', resume);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      near.disconnect(); viewport.disconnect(); resize.disconnect(); theme.disconnect();
      reduced.removeEventListener('change', resume);
      document.removeEventListener('visibilitychange', resume);
      globe?.destroy();
    };
  }, []);

  return <div ref={host} className="relative size-full" aria-label="A globe connecting your study destinations" role="group">
    {!ready && <Globe2 aria-hidden="true" className="absolute inset-0 size-full p-4 text-primary/70" strokeWidth={.7} />}
    <canvas ref={canvas} aria-hidden="true" className="size-full" />
    {ready && <button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Resume globe rotation' : 'Pause globe rotation'} aria-pressed={paused} className="absolute -bottom-5 left-1/2 grid size-11 -translate-x-1/2 place-items-center rounded-full border border-border bg-background/95 text-primary motion-reduce:hidden">{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button>}
  </div>;
}
