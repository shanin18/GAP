import { Quote } from "lucide-react";
import { SectionHeading } from "../section-heading";

export function Testimonials({
  items = [],
}: {
  items?: Array<{
    studentName: string;
    universityName?: string;
    quote: string;
  }>;
}) {
  const fallbackTestimonials = [
    [
      "Ayesha Rahman",
      "Monash University",
      "The guidance made a complicated process feel clear and manageable.",
    ],
    [
      "Tanvir Hasan",
      "University of Auckland",
      "I always knew what the next step was and who to ask.",
    ],
    [
      "Nabila Islam",
      "University of Toronto",
      "GAP helped me choose with confidence instead of guessing.",
    ],
  ];

  const testimonials = items.length
    ? items.map((x) => [
        x.studentName,
        x.universityName || "GAP student",
        x.quote,
      ])
    : fallbackTestimonials;
  return (
    <section>
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="What our clients say"
          title="Confidence feels different when you don't have to do it alone."
        />
        <div className="mt-12 flex snap-x gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:overflow-visible">
          {testimonials.map(([name, uni, quote]) => (
            <article
              key={name}
              className="min-w-[85%] snap-start rounded-[1.75rem] border border-[var(--border)] p-7 sm:min-w-[55%] md:min-w-0"
            >
              <Quote size={28} className="text-[var(--primary)]" />
              <p className="mt-7 font-display text-2xl leading-snug">
                “{quote}”
              </p>
              <div className="mt-8 border-t border-[var(--border)] pt-5">
                <strong>{name}</strong>
                <p className="mt-1 text-sm text-[var(--muted)]">{uni}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
