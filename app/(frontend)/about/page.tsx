import { getSectionText } from "@/lib/website-content-server";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  HeartHandshake,
  ListChecks,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { ApplyNowDialog } from "@/components/ui/apply-now-dialog";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getSectionText("about-page");
  return {
    title: t("About"),
    description: t(
      "Get to know Global Admission Platform and our personal approach to study-abroad counselling, university selection and admission support.",
    ),
  };
}

const values = [
  {
    icon: HeartHandshake,
    title: "People come first",
    text: "Your background, ambitions and concerns shape the conversation. We take time to understand your story before helping you plan your next step.",
  },
  {
    icon: Compass,
    title: "Choices with purpose",
    text: "We help you compare destinations, universities and programs around your academic interests, budget and future plans.",
  },
  {
    icon: ListChecks,
    title: "Clarity at every step",
    text: "From preparing documents to understanding enrollment, we break the journey into practical steps so you know what comes next.",
  },
];

export default async function AboutPage() {
  const t = await getSectionText("about-page");

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-border bg-surface/40">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 size-[32rem] rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:py-20 lg:grid-cols-[1.3fr_1fr] lg:gap-20 lg:px-8 lg:py-24">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                {t("About GAP")}
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight">
                {t("Global education.")}
                <br />
                <em>{t("Human guidance.")}</em>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                {t(
                  "Global Admission Platform brings counselling, university and program selection, and admission support into one guided journey. We help students make informed choices and move forward with confidence.",
                )}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-surface p-7 sm:p-10">
              <HeartHandshake
                aria-hidden="true"
                className="text-primary"
                size={40}
                strokeWidth={1.5}
              />
              <p className="mt-8 font-display text-3xl leading-tight sm:text-4xl">
                {t(
                  "Every student has a story. Your study plans should reflect yours.",
                )}
              </p>
              <p className="mt-6 leading-7 text-muted-foreground">
                {t(
                  "Personal, one-to-one guidance from your first question to your next chapter.",
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {t("Our purpose")}
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              {t("A clearer path to your next chapter.")}
            </h2>
          </div>
          <div className="space-y-5 leading-8 text-muted-foreground sm:text-lg">
            <p>
              {t(
                "Studying abroad starts with big questions: where to go, what to study and how to get there. Our purpose is to make those decisions easier to understand, with guidance that puts your goals at the centre.",
              )}
            </p>
            <p>
              {t(
                "We bring the steps together, from exploring your options and building a university shortlist to preparing applications and getting ready for departure. You can start with a clear ambition or simply a question.",
              )}
            </p>
          </div>
        </section>

        <section className="border-y border-border bg-surface/30">
          <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {t("Our approach")}
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              {t("Built around you.")}
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {values.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-3xl border border-border bg-background p-6 sm:p-8"
                >
                  <Icon aria-hidden="true" size={28} className="text-primary" />
                  <h3 className="mt-6 font-display text-2xl">{t(title)}</h3>
                  <p className="mt-4 leading-7 text-muted-foreground">
                    {t(text)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
          <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-border bg-secondary p-7 sm:p-10 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">
                {t("Your next chapter starts with a conversation.")}
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                {t(
                  "Tell us where you are now and where you would like to go. We will help you explore the next steps.",
                )}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-4">
              <ApplyNowDialog />
              <Link
                href="/services"
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-primary hover:underline"
              >
                {t("Explore services ")}
                <ArrowUpRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
