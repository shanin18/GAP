'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Enhance server-rendered content after hydration; content stays visible without JS.
export function SectionReveals() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const animation = entry.target.animate([
          { opacity: .15, transform: 'translateY(24px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation)).catch(() => {});
      });
    }, { threshold: .08 });
    document.querySelectorAll('main > section > div, main > header > div').forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight * .85) observer.observe(element);
    });
    const stop = () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); };
    preference.addEventListener('change', stop);
    return () => { stop(); preference.removeEventListener('change', stop); };
  }, [pathname]);
  return null;
}
