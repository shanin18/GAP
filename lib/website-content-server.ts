import "server-only";
import { cache } from "react";
import { getCms } from "./payload";
import { sectionReader, type ContentSnapshot } from "./website-content";

export const getWebsiteContent = cache(async (): Promise<ContentSnapshot> => {
  const payload = await getCms();
  const { docs } = await payload.find({
    collection: "website-content",
    overrideAccess: false,
    pagination: false,
    depth: 1,
  });
  return Object.fromEntries(
    docs.map((doc) => [
      doc.key,
      {
        ...doc,
        entries: doc.entries?.map((entry) => ({
          key: entry.key,
          value:
            typeof entry.image === "object" && entry.image?.url
              ? entry.image.url
              : entry.value,
        })),
      },
    ]),
  );
});

export async function getSectionText(key: string) {
  return sectionReader((await getWebsiteContent())[key]);
}
