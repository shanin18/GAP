"use client";
import { ApplyNowDialog } from "../ui/apply-now-dialog";
export function FinalCta() {
  return (
    <section className="px-5 pb-20 lg:px-8 lg:pb-28">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-[var(--primary)] p-8 text-white sm:p-12 lg:flex-row lg:items-center">
        <div>
          <p className="eyebrow text-white/70">Ready when you are</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">
            Let's map your route to the world.
          </h2>
        </div>
        <ApplyNowDialog triggerClass="touch-target rounded-full bg-white px-6 py-3 font-semibold text-[var(--primary)]" />
      </div>
    </section>
  );
}
