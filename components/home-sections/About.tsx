import Image from "next/image";
import { SectionHeading } from "../section-heading";

/**
 * Add your own photos to /public/images and set the paths here.
 * Until then, a lightweight CSS placeholder is shown (no extra requests).
 */
const PHOTOS = {
  main: {
    src: undefined as string | undefined, // e.g. "/images/about-students.jpg"
    alt: "A student talking with a GAP counsellor",
  },
  side: {
    src: undefined as string | undefined, // e.g. "/images/about-campus.jpg"
    alt: "A university campus",
  },
};

const principles = [
  {
    title: "Honest advice",
    body: "If a course, university or country is not the right fit, we will tell you, even when it is not what you hoped to hear.",
  },
  {
    title: "Your pace, your family",
    body: "Big decisions take time. We explain every option clearly so you and your family can decide without pressure.",
  },
  {
    title: "Clear next steps",
    body: "After every conversation you know what has been done, what comes next, and what we need from you.",
  },
];

function Photo({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 20%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 55%), radial-gradient(color-mix(in oklch, var(--primary) 30%, transparent) 1px, transparent 1.5px)",
            backgroundSize: "100% 100%, 18px 18px",
          }}
        />
      )}
      {/* Keeps captions readable over any photo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
      />
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="border-y border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-28">
        {/* Intro */}
        <div className="flex flex-col gap-6 w-full">
          <SectionHeading
            eyebrow="About us"
            title="A clearer path to your next chapter."
          />
          <p className="max-w-4xl leading-8 text-muted-foreground sm:text-lg sm:leading-9">
            GAP brings counselling, university and program selection, and
            admission support into one guided journey. The goal is simple: help
            students make informed choices and move forward with confidence.
          </p>
        </div>

        {/* Bento */}
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:mt-20">
          {/* Large photo with caption */}
          <div className="relative md:row-span-2">
            <Photo
              {...PHOTOS.main}
              priority={false}
              className="h-full min-h-[22rem]"
            />
            <p className="absolute inset-x-0 bottom-0 max-w-sm p-6 font-display text-2xl leading-tight text-white sm:p-8 sm:text-3xl">
              Good guidance starts with a conversation, not a form.
            </p>
          </div>

          {/* Promise card */}
          <div className="flex flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <p className="font-display text-2xl leading-snug sm:text-3xl">
              We are built around one idea: every student deserves a person who
              knows their story.
            </p>
            <p className="mt-6 leading-7 text-muted-foreground">
              That is why every student is guided one-to-one, from the first
              question about where to study to the day the offer letter arrives.
            </p>
          </div>

          {/* Second photo + destinations */}
          <div className="relative">
            <Photo {...PHOTOS.side} className="h-full min-h-[13rem]" />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-6">
              <p className="text-sm font-semibold text-white">
                Now guiding students to
              </p>
              <ul className="flex flex-wrap gap-2 text-xs font-semibold">
                {["Australia", "Canada", "New Zealand"].map((c) => (
                  <li
                    key={c}
                    className="rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
