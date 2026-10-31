import { EditThisPage } from "@/components/edit-this-page";
import { listLink, sharedLinks } from "@/lib/admin-edit-links";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { CountryExplorer } from "@/components/country-explorer";
import { getCountries } from "@/lib/cms-queries";

export const metadata: Metadata = { title: "All countries | GAP", description: "Explore study destinations and search for the country that fits your education plans." };

export default async function CountriesPage() {
  const countries = await getCountries();
  return <><SiteHeader /><main className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
    <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Study destinations</p>
    <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] tracking-tight">Find your next chapter.</h1>
    <p className="mb-10 mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Explore all countries, compare your options and discover where your study journey could take you.</p>
    <CountryExplorer countries={countries.map(({ name, slug, heroImageUrl }) => ({ name, slug, heroImageUrl }))} />
  </main><SiteFooter /><MobileNav /><EditThisPage links={[listLink("Countries", "countries"), ...sharedLinks]} /></>;
}
