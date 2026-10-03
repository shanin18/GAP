'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export type PurposeSlide = { title: string; text: string; detail: string; image: string; alt: string };

export function AboutPurpose({ slides }: { slides: PurposeSlide[] }) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || slides.length < 2) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => { if (timer) clearInterval(timer); timer = undefined; };
    const sync = () => {
      stop();
      if (visible && !document.hidden && !motion.matches && !element.matches(':hover') && !element.contains(document.activeElement)) {
        timer = setInterval(() => setActive(value => (value + 1) % slides.length), 6500);
      }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.25 });
    observer.observe(element);
    element.addEventListener('mouseenter', stop);
    element.addEventListener('mouseleave', sync);
    element.addEventListener('focusin', stop);
    element.addEventListener('focusout', sync);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    return () => {
      stop(); observer.disconnect();
      element.removeEventListener('mouseenter', stop); element.removeEventListener('mouseleave', sync);
      element.removeEventListener('focusin', stop); element.removeEventListener('focusout', sync);
      document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', sync);
    };
  }, [slides.length]);
  return <section ref={ref} aria-labelledby="about-purpose-title" className="relative overflow-hidden border-b border-border">
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
      <div className="relative isolate overflow-hidden rounded-3xl bg-surface/60 p-5 sm:p-8 lg:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-[3rem_7rem_3rem_3rem] sm:aspect-[5/4]">
            {slides.map((slide, i) => <Image key={slide.title} src={slide.image} alt={i === active ? slide.alt : ''} aria-hidden={i !== active} fill sizes="(min-width: 1024px) 500px, (min-width: 640px) 512px, 90vw" className={`object-cover transition-opacity duration-700 motion-reduce:transition-none ${i === active ? 'opacity-100' : 'opacity-0'}`} />)}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Our purpose</p>
            <h2 id="about-purpose-title" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">A clearer path to your next chapter.</h2>
            <div className="mt-6 grid">{slides.map((slide, i) => <div key={slide.title} aria-hidden={i !== active} inert={i !== active} className={`col-start-1 row-start-1 transition-[opacity,transform] duration-500 motion-reduce:transition-none ${i === active ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              <h3 className="text-lg font-semibold text-primary sm:text-xl">{slide.title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{slide.text}</p><p className="mt-3 text-sm leading-7 text-muted-foreground">{slide.detail}</p>
            </div>)}</div>
            <div className="mt-6 flex flex-wrap gap-3" aria-label="Choose a purpose">{slides.map((slide, i) => <button key={slide.title} type="button" onClick={() => setActive(i)} aria-label={slide.title} aria-pressed={i === active} className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-primary"><span className={`h-1 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${i === active ? 'w-10 bg-primary' : 'w-5 bg-primary/25 hover:bg-primary/60'}`} /></button>)}</div>
          </div>
        </div>
        <p aria-hidden="true" className="pointer-events-none mt-7 select-none text-[clamp(2.5rem,9vw,7rem)] font-semibold leading-none tracking-widest text-primary/10">PURPOSE</p>
      </div>
    </div>
  </section>;
}
