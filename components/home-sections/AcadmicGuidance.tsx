import { motion } from "framer-motion";
import { SectionHeading } from "../section-heading";
import { FileCheck2, MessageCircle, Search } from "lucide-react";

const guidance = [
  {
    icon: MessageCircle,
    title: "Counselling",
    text: "Understand your goals, profile and options with practical one-to-one guidance.",
  },
  {
    icon: Search,
    title: "Selection of University & Program",
    text: "Compare destinations, universities and programs that fit your academic direction.",
  },
  {
    icon: FileCheck2,
    title: "University Admission / Enrollment",
    text: "Get structured support through applications, documents and enrollment steps.",
  },
];

export function AcademicGuidance() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Academic guidance"
          title="Support at the moments that matter."
          text="Three practical stages, connected by one consistent team."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {guidance.map((x, i) => {
            const I = x.icon;
            return (
              <motion.article
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                key={x.title}
                className="card-lift rounded-[1.75rem] border border-[var(--border)] p-7 sm:p-8"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--primary)]">
                  <I size={23} />
                </div>
                <p className="mt-10 text-sm font-semibold text-[var(--muted)]">
                  0{i + 1}
                </p>
                <h3 className="mt-2 font-display text-2xl leading-tight">
                  {x.title}
                </h3>
                <p className="mt-4 leading-7 text-[var(--muted)]">{x.text}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
