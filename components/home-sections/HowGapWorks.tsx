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
        <div className="process-track mt-14">
          {process.map((x, i) => {
            const I = x.icon;
            return (
              <div key={x.title} className="process-node">
                <div className="process-icon">
                  <I size={22} />
                </div>
                <span>{x.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
