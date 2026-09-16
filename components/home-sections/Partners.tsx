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
        <div className="mt-10 overflow-hidden">
          <div className="flex w-max gap-3 animate-[marquee_38s_linear_infinite]">
            {[...partners, ...partners].map((p, i) => (
              <div
  className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--background)] px-[18px] py-[13px] text-sm font-bold transition-all hover:-translate-y-0.5 hover:bg-[#d9efb7]"
  key={`${p}-${i}`}
>
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
