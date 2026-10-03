import { getSectionText } from "@/lib/website-content-server";
import { Quote } from "lucide-react";
import { SectionHeading } from "../section-heading";
import { EmptyState } from "../ui/empty-state";
import { ApplyNowDialog } from "../ui/apply-now-dialog";
import { TestimonialShowcase, type Testimonial } from "./TestimonialShowcase";
import { stockImage } from "@/lib/stock-images";

export async function Testimonials({ items = [] }: { items?: Testimonial[] }) {
  const t = await getSectionText("home-testimonials");

  const preview = items.length === 0;
  const list = preview ? [
    { studentName: 'Ayesha Rahman', universityName: 'Undergraduate applicant', rating: 5, quote: 'Having someone explain the options helped me turn a long list of questions into a clear study plan.' },
    { studentName: 'Rafiul Islam', universityName: 'Postgraduate applicant', rating: 5, quote: 'The document checklist made the next steps easier to understand. I felt more prepared for my application.' },
    { studentName: 'Nusrat Jahan', universityName: 'Prospective international student', rating: 4, quote: 'Talking through my goals and budget helped me understand which questions to ask before choosing a programme.' },
  ].map((item, index) => ({ ...item, photoUrl: stockImage(`preview-portrait-${index + 1}`) })) : items;
  return (
    <section>
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
        <div className="flex justify-center text-center">
        <SectionHeading
          eyebrow={t("What our clients say")}
          title={t(
            "Confidence feels different when you don't have to do it alone.",
          )}
        />
        </div>
        <div className="mt-8">
          {list.length ? (
            <TestimonialShowcase items={list} />
          ) : (
            <EmptyState
              icon={<Quote size={24} />}
              title={t("Student stories are on their way.")}
              description={t(
                "In the meantime, meet an adviser and find out how we can support your study plans.",
              )}
            >
              <ApplyNowDialog />
            </EmptyState>
          )}
        </div>
      </div>
    </section>
  );
}
