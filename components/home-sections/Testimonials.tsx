import { Quote } from "lucide-react";
import { SectionHeading } from "../section-heading";
import { EmptyState } from "../ui/empty-state";
import { ApplyNowDialog } from "../ui/apply-now-dialog";
import { TestimonialShowcase, type Testimonial } from "./TestimonialShowcase";

// TEMPORARY: placeholder data for previewing the design. Delete before launch.
const PREVIEW_ITEMS: Testimonial[] = [
  {
    studentName: "Student One",
    universityName: "University of Example, Canada",
    quote:
      "I came in with a dozen questions and no plan. By the end I had a shortlist I actually trusted.",
  },
  {
    studentName: "Student Two",
    universityName: "Example Institute, Australia",
    quote:
      "Every step was explained clearly, and I always knew what was coming next.",
  },
  {
    studentName: "Student Three",
    universityName: "Sample College, New Zealand",
    quote:
      "My family and I could finally make the decision together, without any pressure.",
  },
];

export function Testimonials({ items = [] }: { items?: Testimonial[] }) {

  const list = items.length ? items : PREVIEW_ITEMS;
  return (
    <section>
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="What our clients say"
          title="Confidence feels different when you don't have to do it alone."
        />
        <div className="mt-12 lg:mt-16">
          {list.length ? (
            <TestimonialShowcase items={list} />
          ) : (
            <EmptyState
              icon={<Quote size={24} />}
              title="Student stories are on their way."
              description="In the meantime, meet an adviser and find out how we can support your study plans."
            >
              <ApplyNowDialog triggerContent="Talk to an adviser" />
            </EmptyState>
          )}
        </div>
      </div>
    </section>
  );
}