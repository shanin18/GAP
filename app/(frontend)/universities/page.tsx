import { getSectionText } from "@/lib/website-content-server";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { UniversityExplorer } from "@/components/university-explorer";
import { getUniversities } from "@/lib/cms-queries";
import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ApplyNowDialog } from "@/components/ui/apply-now-dialog";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getSectionText("universities-page");
  return {
    title: t("Universities | GAP"),
    description: t(
      "Explore universities and study destinations supported by Global Admission Platform.",
    ),
  };
}

export default async function UniversitiesPage() {
  const t = await getSectionText("universities-page");

  const universities = await getUniversities();
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-[var(--border)]">
          <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {t("University discovery")}
            </p>
            <h1 className="max-w-4xl font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] tracking-tight mt-4">
              {t("Find a university that fits ")}
              <em>{t("your direction.")}</em>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {t(
                "Explore GAP-supported institutions by destination and location, then speak with our team about programs and admission requirements.",
              )}
            </p>
          </div>
        </section>
        <section>
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
            {universities.length ? (
              <UniversityExplorer universities={universities} />
            ) : (
              <EmptyState
                icon={<GraduationCap size={24} />}
                title={t("Let's find your university together.")}
                description={t(
                  "Our university directory is being prepared. An adviser can help you explore destinations and build a shortlist that fits your goals.",
                )}
              >
                <ApplyNowDialog triggerContent={t("Get university guidance")} />
              </EmptyState>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
