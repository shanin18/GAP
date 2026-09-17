'use client';

import { useId, useState } from 'react';
import { CalendarCheck, MessageCircle, Plane, Send } from 'lucide-react';
import { JourneyGlobe } from '../journey-globe';
import { SectionHeading } from '../section-heading';
import { cn } from '@/lib/utils';

const steps = [
  { icon: MessageCircle, title: 'Consultation', position: 'left-1/2 top-0 -translate-x-1/2', description: 'Discuss your goals, academic background and preferred destinations with a GAP adviser.' },
  { icon: Send, title: 'Apply', position: 'right-0 top-1/2 -translate-y-1/2', description: 'Build your shortlist and prepare your application with clear guidance on the documents you need.' },
  { icon: CalendarCheck, title: 'Appointment', position: 'bottom-0 left-1/2 -translate-x-1/2', description: 'Meet your adviser to review progress, discuss your options and plan the next steps.' },
  { icon: Plane, title: 'Fly', position: 'left-0 top-1/2 -translate-y-1/2', description: 'Prepare for departure and arrive ready for your new chapter abroad.' },
];

export function HowGapWorks() {
  const [selected, setSelected] = useState(0);
  const id = useId().replace(/:/g, '');
  return (
    <section id="process" className="scroll-mt-20 bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-28">
        <div><SectionHeading eyebrow="How GAP works" title="One step at a time, all the way to the globe." text="From your first consultation to departure, GAP helps you take each step with confidence." /><p className="mt-5 text-sm text-muted-foreground">Choose a step to explore your journey.</p></div>
        <div className="min-w-0">
          <div className="relative mx-auto aspect-square w-full max-w-xl">
            <svg viewBox="0 0 400 400" aria-hidden="true" className="absolute inset-0 size-full text-primary/35">
              <defs><marker id={id + '-arrow'} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L6 3.5 L0 7" fill="none" stroke="currentColor" strokeWidth="1.5" /></marker></defs>
              {[0, 90, 180, 270].map(rotation => <path key={rotation} d="M 248 69 A 140 140 0 0 1 331 152" transform={'rotate(' + rotation + ' 200 200)'} fill="none" stroke="currentColor" strokeWidth="2" markerEnd={'url(#' + id + '-arrow)'} />)}
            </svg>
            <div className="absolute left-1/2 top-1/2 z-10 size-28 -translate-x-1/2 -translate-y-1/2 sm:size-52"><JourneyGlobe /></div>
            <ol aria-label="Your study abroad journey" className="pointer-events-none absolute inset-0">
              {steps.map(({ icon: Icon, title, position }, index) => <li key={title} className={'absolute w-24 sm:w-36 ' + position}>
                <button type="button" aria-pressed={selected === index} aria-controls={id + '-description'} onClick={() => setSelected(index)} className="pointer-events-auto group flex min-h-11 w-full flex-col items-center rounded-2xl p-1 text-center outline-offset-4">
                  <span className={cn('grid size-14 place-items-center rounded-full border transition-[background-color,color,border-color,box-shadow] duration-200 sm:size-20', selected === index ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15' : 'border-border bg-background text-primary group-hover:border-primary group-hover:bg-brand-soft')}><Icon aria-hidden="true" className="size-6 sm:size-8" /></span>
                  <span className="mt-2 text-xs font-bold sm:text-base"><span className="sr-only">Step {index + 1}: </span>{title}</span>
                </button>
              </li>)}
            </ol>
          </div>
          <div id={id + '-description'} aria-live="polite" aria-atomic="true" className="mx-auto mt-6 min-h-36 max-w-xl rounded-2xl border border-border bg-background p-6"><p className="text-xs font-bold uppercase tracking-widest text-primary">Step {selected + 1} of 4</p><h3 className="mt-2 font-display text-2xl">{steps[selected].title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{steps[selected].description}</p></div>
        </div>
      </div>
    </section>
  );
}
