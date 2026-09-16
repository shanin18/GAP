import { Globe2, GraduationCap, MessageCircle, Plane, Send } from "lucide-react";
import { SectionHeading } from "../section-heading";
import { motion } from "framer-motion";
const process = [
  { icon: MessageCircle, title: "Consultation" },
  { icon: Send, title: "Apply" },
  { icon: Globe2, title: "Globe" },
  { icon: GraduationCap, title: "Appointment" },
  { icon: Plane, title: "Fly" },
];

export function HowGapWorks() {
  return (
    <section id="process" className="bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="How GAP works"
          title="One step at a time, all the way to the globe."
          text="A simple journey with clear hand-offs between every stage."
        />
        <div className="process-track mt-14">
          {process.map((x, i) => {
            const I = x.icon;
            return (
              <motion.div
                key={x.title}
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.92 }}
                viewport={{ once: true }}
                className={`process-node ${i === 2 ? "process-center" : ""}`}
              >
                <div className="process-icon">
                  <I size={22} />
                </div>
                <span>{x.title}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}