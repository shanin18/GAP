import { TrustStrip } from "../trust-strip";
import { ApplyNowDialog } from "../ui/apply-now-dialog";

export function Hero() {
  return (
    <section className="hero-wrap">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-28">
        <div>
          <p className="eyebrow">Global education, human guidance</p>
          <h1 className="display-xl mt-5">
            Your next chapter starts <em>globally.</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            Personal guidance, trusted university choices, and practical
            admission support for students planning to study abroad.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ApplyNowDialog triggerClass="touch-target rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white" />
            <a
              href="#process"
              className="touch-target rounded-full border border-[var(--border)] px-6 py-3 font-semibold"
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
        <div className="hero-art">
          <div className="hero-card">
            <span>GAP</span>
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