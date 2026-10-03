'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const questions = [
  ['How do I start my study-abroad journey?', 'Book an appointment and tell us about your academic background, interests, preferred destinations and budget. An adviser will help you identify your next steps.'],
  ['Do I need to choose a country or university first?', 'No. We can help you compare destinations, courses and entry requirements before you build a shortlist.'],
  ['What should I bring to my appointment?', 'Bring your academic certificates and transcripts if available, any language test results, and your questions. You can still book an initial conversation if you are gathering these documents.'],
  ['Can you help with applications and documents?', 'Yes. Our team explains the requirements for your chosen courses and helps you organise your application documents and timeline.'],
  ['Are admission, scholarships or visas guaranteed?', 'No. Universities, scholarship providers and immigration authorities make their own decisions. We provide guidance and application support.'],
  ['When should I contact GAP?', 'Start early so you have time to compare courses, prepare documents and meet the deadlines for your chosen intake.'],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return <section aria-labelledby="home-faq-title" className="border-t border-border">
    <div className="mx-auto max-w-7xl px-5 pt-12 pb-6 lg:px-8 lg:pt-16 lg:pb-8">
      <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-widest text-primary">Frequently asked questions</p><h2 id="home-faq-title" className="mt-3 font-display text-3xl sm:text-4xl">A little clarity before you begin.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Find answers to common questions about appointments, applications and your next steps.</p></div>
      <div className="mx-auto mt-7 grid w-full gap-3 lg:mt-8 lg:w-4/5">{questions.map(([question, answer], index) => {
        const expanded = open === index;
        return <button key={question} type="button" aria-expanded={expanded} aria-controls={`home-faq-answer-${index}`} onClick={() => setOpen(expanded ? null : index)} className="w-full cursor-pointer rounded-2xl border border-border bg-surface px-4 py-3 text-left transition-[transform,border-color,background-color] duration-300 hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-safe:hover:scale-[1.01] motion-reduce:transition-none sm:px-5 sm:py-4">
          <span className="flex min-h-11 items-center justify-between gap-5"><span className="text-base font-medium sm:text-lg">{question}</span><ChevronDown aria-hidden="true" size={18} className={`shrink-0 text-primary transition-transform duration-300 motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`} /></span>
          <span id={`home-faq-answer-${index}`} aria-hidden={!expanded} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><span className="min-h-0 overflow-hidden"><span className="block pt-3 text-sm leading-6 sm:text-base text-muted-foreground">{answer}</span></span></span>
        </button>;
      })}</div>
    </div>
  </section>;
}
