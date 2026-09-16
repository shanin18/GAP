import { NextResponse } from "next/server";
import { getCountries, getUniversities } from "@/lib/cms-queries";
export async function GET() {
  const [countries, universities] = await Promise.all([
    getCountries(),
    getUniversities(),
  ]);
  return NextResponse.json({
    countries: countries.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    universities: universities.map((u) => ({
      id: u.id,
      name: u.name,
      country: typeof u.country === "object" ? u.country?.id : u.country,
    })),
  });
}
