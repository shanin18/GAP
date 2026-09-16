import { TrustStrip } from "../trust-strip";
import { ApplyNowDialog } from "../ui/apply-now-dialog";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f8faf6] to-[#e8f2e0]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-28">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">Global education, human guidance</p>
          <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(3.25rem,7vw,6.6rem)] leading-[0.98] tracking-[-0.055em]">
            triggerClass="min-h-11 min-w-11 rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5"
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            Personal guidance, trusted university choices, and practical
            admission support for students planning to study abroad.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ApplyNowDialog triggerClass="touch-target rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white" />
            <a
              href="#process"
              className="min-h-11 min-w-11 rounded-full border border-[var(--border)] px-6 py-3 font-semibold transition-colors hover:bg-[var(--surface)]"
            >
              How it works
            </a>
          </div>
          <div className="mt-7">
            <TrustStrip />
          </div>
          <div className="mt-10 flex gap-8 text-sm">
            <div>
              <strong className="font-display text-2xl">3</strong>
              <span className="ml-2 text-[var(--muted)]">
                launch destinations
              </span>
            </div>
            <div>
              <strong className="font-display text-2xl">1:1</strong>
              <span className="ml-2 text-[var(--muted)]">guidance</span>
            </div>
          </div>
        </div>
<div className="grid min-h-[25rem] place-items-center">
  <div className="flex min-h-96 w-full max-w-[31rem] rotate-2 flex-col justify-between rounded-[2.25rem] border border-[#17352d2e] bg-gradient-to-br from-white/70 to-[#d9efb7] p-8 text-[#17352d] shadow-2xl transition-all duration-300 hover:rotate-0 hover:-translate-y-1">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#17352d] font-extrabold tracking-tighter text-white">
  GAP
</span>
            <p className="font-display text-4xl leading-tight sm:text-5xl">
              From ambition
              <br />
              to admission.
            </p>
            <div className="mt-12 flex items-center justify-between text-sm">
              <span>Plan</span>
              <span>Prepare</span>
              <span>Go</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}