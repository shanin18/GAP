import Image from "next/image";
import { Star } from "lucide-react";
import { cardVariants } from "../ui/card";
import { CardCarousel } from "../ui/card-carousel";
import { cn } from "@/lib/utils";

export type Testimonial = {
  studentName: string;
  universityName?: string;
  quote: string;
  photoUrl?: string | null;
  rating?: number | null;
};

export function TestimonialShowcase({ items }: { items: Testimonial[] }) {
  return (
    <CardCarousel>
      {items.map(({ studentName, universityName, quote, photoUrl, rating }, index) => (
        <figure
          key={`${studentName}-${index}`}
          className={cn(cardVariants({ interactive: true, padding: "none" }), "flex flex-col rounded-[2rem] border-2 p-6 sm:p-7")}
        >
          <div className="flex flex-1 flex-col">
            {rating != null && (
              <div className="mb-4 flex gap-1 text-primary" role="img" aria-label={`${rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, star) => (
                  <Star key={star} size={16} aria-hidden="true" className={star < rating ? "fill-current" : "opacity-30"} />
                ))}
              </div>
            )}
            <blockquote className="mb-8 whitespace-pre-line text-base leading-7 text-foreground">
              &ldquo;{quote}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-4 border-t border-dashed border-border pt-5">
              {photoUrl ? (
                <Image src={photoUrl} alt="" width={56} height={56} className="size-14 shrink-0 rounded-full object-cover" />
              ) : (
                <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-xl font-semibold text-primary">{studentName.charAt(0)}</span>
              )}
              <div className="min-w-0">
                <p className="text-lg font-semibold leading-snug">{studentName}</p>
                {universityName && <p className="mt-1 text-sm leading-6 text-muted-foreground">{universityName}</p>}
              </div>
            </figcaption>
          </div>
        </figure>
      ))}
    </CardCarousel>
  );
}
