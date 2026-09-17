import { SectionHeading } from "../section-heading";

export function About() {
  return (
    <section className="border-y border-[var(--border)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[.7fr_1.3fr] lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="About us"
          title="A clearer path to your next chapter."
        />
        <div>
          <p className="font-display text-3xl leading-tight sm:text-4xl">
            Study abroad should feel exciting — not overwhelming.
          </p>
          <p className="mt-6 max-w-2xl leading-8 text-muted-foreground">
            GAP brings together counselling, university and program selection,
            and admission support into one guided journey. The goal is simple:
            help students make informed choices and move forward with
            confidence.
          </p>
        </div>
      </div>
    </section>
  );
}