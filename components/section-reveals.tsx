'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Progressive enhancement: server-rendered content is visible without JavaScript.
export function SectionReveals() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  useEffect(() => {
    const routeChanged = previousPath.current !== pathname;
    previousPath.current = pathname;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
    const seen = new WeakSet<Element>();
    const mains = new WeakSet<Element>();
    const pending = new Map<Element, Animation>();
    const active = new Set<Animation>();
    let scanFrame = 0;

    function track(animation: Animation) {
      active.add(animation);
      animation.finished.then(() => active.delete(animation)).catch(() => active.delete(animation));
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        pending.get(entry.target)?.play();
        pending.delete(entry.target);
      }
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    const layout = new ResizeObserver(scheduleScan);

    function scan() {
      if (preference.matches) return;
      document.querySelectorAll('main').forEach(main => {
        if (mains.has(main)) return;
        mains.add(main);
        layout.observe(main);
        if (routeChanged) {
          // An incoming fade only: no delay to navigation, no form-state reset.
          const fade = main.animate([{ opacity: .65 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
          fade.id = 'gap-route-enter';
          track(fade);
        }
      });
      document.querySelectorAll('main > section > div:not([aria-hidden="true"]), main > header > div').forEach(element => {
        if (seen.has(element)) return;
        const bounds = element.getBoundingClientRect();
        // Next can mount a streamed route while its content is still hidden.
        // Wait for layout before classifying anything as above the fold.
        if (bounds.height === 0 || bounds.width === 0) return;
        seen.add(element);
        // Leave above-the-fold content and restored scroll positions untouched.
        if (bounds.top < window.innerHeight) return;
        const reveal = element.animate([
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
        reveal.id = 'gap-section-reveal';
        reveal.pause();
        track(reveal);
        pending.set(element, reveal);
        observer.observe(element);
      });
      // Release detached nodes during client navigation or streamed replacement.
      for (const [element, animation] of pending) {
        if (!element.isConnected) { animation.cancel(); pending.delete(element); observer.unobserve(element); }
      }
    }
    function scheduleScan() {
      cancelAnimationFrame(scanFrame);
      scanFrame = requestAnimationFrame(scan);
    }
    function showFocused(event: FocusEvent) {
      for (const [element, animation] of pending) {
        if (event.target instanceof Node && element.contains(event.target)) {
          animation.finish(); pending.delete(element); observer.unobserve(element);
        }
      }
    }
    function stopMotion() {
      observer.disconnect();
      active.forEach(animation => animation.cancel());
      pending.clear();
    }
    function preferenceChanged() { if (preference.matches) stopMotion(); else scan(); }
    // Includes streamed CMS sections and client-side route content.
    const mutations = new MutationObserver(scheduleScan);
    mutations.observe(document.body, { childList: true, subtree: true });
    scan();
    document.addEventListener('focusin', showFocused);
    preference.addEventListener('change', preferenceChanged);
    return () => {
      mutations.disconnect(); layout.disconnect(); cancelAnimationFrame(scanFrame); stopMotion();
      document.removeEventListener('focusin', showFocused);
      preference.removeEventListener('change', preferenceChanged);
    };
  }, [pathname]);
  return null;
}
