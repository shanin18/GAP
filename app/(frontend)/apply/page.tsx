import { getSectionText } from "@/lib/website-content-server";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { ApplicationForm } from "@/components/application-form";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getSectionText("apply-page");
  return {
    title: t("Start an Application | GAP"),
    description: t(
      "Start your study-abroad application with Global Admission Platform.",
    ),
  };
}
export default async function ApplyPage() {
  const t = await getSectionText("apply-page");
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-[var(--border)]">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {t("Student application")}
            </p>
            <h1 className="max-w-4xl font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] tracking-tight mt-4">
              {t("Turn your plan into an ")}
              <em>{t("application.")}</em>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {t(
                "Share your destination, study level, and preferred university. GAP can then review the profile and guide the next steps.",
              )}
            </p>
          </div>
        </section>
        <section>
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[.65fr_1.35fr] lg:px-8 lg:py-24">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                {t("What happens next")}
              </p>
              <h2 className="mt-3 font-display text-4xl">
                {t("A visible application journey.")}
              </h2>
              <ol className="mt-8 space-y-5 text-muted-foreground">
                {[
                  "Application submitted",
                  "Profile reviewed by GAP",
                  "Documents prepared",
                  "Application sent to university",
                  "Offer and enrollment progress",
                ].map((x, i) => (
                  <li key={x} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-sm font-semibold text-[var(--primary)]">
                      {i + 1}
                    </span>
                    <span className="pt-1">{t(x)}</span>
                  </li>
                ))}
              </ol>
            </div>
            <ApplicationForm />
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
