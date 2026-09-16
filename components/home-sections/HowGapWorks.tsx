import {
  Globe2,
  GraduationCap,
  MessageCircle,
  Plane,
  Send,
} from "lucide-react";
import { SectionHeading } from "../section-heading";
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
        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {process.map((x, i) => {
            const I = x.icon;
            return (
              <div key={x.title} className="group text-center">
                <div className="mx-auto grid size-[6.5rem] place-items-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--primary)] transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[#d9efb7]">
                  <I size={22} />
                </div>
                <span className="mt-3 block text-sm font-extrabold">
  {x.title}
</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
