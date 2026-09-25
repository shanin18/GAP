import { getPayload } from "payload";
import catalog from "../lib/website-content-defaults.json";
import details from "../lib/service-details-defaults.json";
import countryDefaults from "../lib/country-content-defaults.json";
import { seedData } from "../payload/seed-data";
import type { WebsiteContent } from "../payload-types";

// Add missing content only. Existing editorial changes are preserved on repeat runs.
process.env.PAYLOAD_PUSH_SCHEMA = process.env.NODE_ENV === "production" ? "false" : "true";
const { default: config } = await import("../payload/payload.config");
const payload = await getPayload({ config });
try {
  for (const section of catalog) {
    const result = await payload.find({
      collection: "website-content",
      where: { key: { equals: section.key } },
      limit: 1,
      depth: 0,
    });
    if (!result.docs.length) {
      await payload.create({
        collection: "website-content",
        data: {
          key: section.key as WebsiteContent["key"],
          title: section.title,
          enabled: true,
          sortOrder: section.sortOrder,
          entries: section.entries as {
            key: string;
            kind: "text" | "image" | "link";
            label: string;
            value: string;
          }[],
        },
        context: { disableRevalidate: true },
      });
      console.log(`Created ${section.title}`);
    } else {
      const doc = result.docs[0];
      const keys = new Set(doc.entries?.map((entry) => entry.key));
      if (section.entries.some((entry) => !keys.has(entry.key))) {
        // The collection hook adds missing defaults while retaining saved values and uploads.
        await payload.update({
          collection: "website-content",
          id: doc.id,
          data: { entries: doc.entries },
          context: { disableRevalidate: true },
        });
        console.log(`Added missing fields to ${section.title}`);
      }
    }
  }
  const services = await payload.find({
    collection: "services",
    pagination: false,
  });
  if (!services.docs.length) {
    for (const [index, service] of seedData.services.entries()) {
      const detail =
        details[service.title.toLowerCase() as keyof typeof details];
      await payload.create({
        collection: "services",
        data: {
          ...service,
          icon: (["MessageCircle", "Search", "FileCheck2", "Plane"] as const)[
            index
          ],
          introduction: detail.intro,
          points: detail.points.map((text) => ({ text })),
        },
        context: { disableRevalidate: true },
      });
    }
  } else {
    for (const service of services.docs) {
      const detail =
        details[service.title.toLowerCase() as keyof typeof details];
      if (detail && service.introduction == null && service.points == null) {
        await payload.update({
          collection: "services",
          id: service.id,
          data: {
            introduction: detail.intro,
            points: detail.points.map((text) => ({ text })),
          },
          context: { disableRevalidate: true },
        });
      }
    }
  }
  const countries = await payload.find({
    collection: "countries",
    pagination: false,
    depth: 0,
  });
  for (const country of countries.docs) {
    const initial =
      countryDefaults[country.slug as keyof typeof countryDefaults];
    if (initial && country.introduction == null) {
      await payload.update({
        collection: "countries",
        id: country.id,
        data: {
          introduction: initial.intro,
          ...(country.highlights?.length
            ? {}
            : { highlights: initial.facts.map((text) => ({ text })) }),
        },
        context: { disableRevalidate: true },
      });
    }
  }
  if (!(await payload.count({ collection: "site-settings" })).totalDocs) {
    await payload.create({
      collection: "site-settings",
      data: { siteName: "Global Admission Platform" },
      context: { disableRevalidate: true },
    });
  }
  console.log(
    "Website content initialization complete. Existing content preserved.",
  );
} finally {
  await payload.destroy();
}
