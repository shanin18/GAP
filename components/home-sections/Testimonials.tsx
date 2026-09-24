import { getSectionText } from "@/lib/website-content-server";
import { Quote } from "lucide-react";
import { SectionHeading } from "../section-heading";
import { EmptyState } from "../ui/empty-state";
import { ApplyNowDialog } from "../ui/apply-now-dialog";
import { TestimonialShowcase, type Testimonial } from "./TestimonialShowcase";

export async function Testimonials({ items = [] }: { items?: Testimonial[] }) {
  const t = await getSectionText("home-testimonials");

  const list = items;
  return (
    <section>
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow={t("What our clients say")}
          title={t(
            "Confidence feels different when you don't have to do it alone.",
          )}
        />
        <div className="mt-12 lg:mt-16">
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
              <ApplyNowDialog triggerContent={t("Talk to an adviser")} />
            </EmptyState>
          )}
        </div>
      </div>
    </section>
  );
}
