import { GraduationCap } from "lucide-react";

export function Partners() {
  const partners = [
    "Monash University",
    "University of Auckland",
    "University of Toronto",
    "Deakin University",
    "University of Sydney",
  ];

  return (
    <section>
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <p className="eyebrow text-center">Our partners</p>
        <div className="marquee mt-10">
          <div className="marquee-track">
            {[...partners, ...partners].map((p, i) => (
              <div className="partner-pill" key={`${p}-${i}`}>
                <GraduationCap size={18} />
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
