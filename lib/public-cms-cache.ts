import "server-only";
import { createHash } from "node:crypto";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { cmsTag } from "./cms-cache-tags";

const databaseKey = createHash("sha256")
  .update(
    `${process.env.DATABASE_URL ?? ""}|${process.env.DATABASE_SCHEMA ?? "public"}`,
  )
  .digest("hex")
  .slice(0, 16);

/** Public, anonymous reads only. Never wrap auth, private documents or CRM queries. */
export function publicCmsCache<Args extends unknown[], Result>(
  key: string,
  collections: string[],
  read: (...args: Args) => Promise<Result>,
  seconds = 300,
) {
  // This app uses route-segment ISR rather than Cache Components. The supported
  // Data Cache API preserves that model and also caches database reads in dev.
  const revision = createHash("sha256")
    .update(read.toString())
    .digest("hex")
    .slice(0, 12);
  const measuredRead = async (...args: Args) => {
    const started = performance.now();
    try {
      return await read(...args);
    } finally {
      if (process.env.CMS_CACHE_DEBUG === "true") {
        console.info(
          `[cms-cache] MISS ${key} ${Math.round(performance.now() - started)}ms`,
        );
      }
    }
  };
  return cache(
    unstable_cache(
      measuredRead,
      ["gap-public-v1", databaseKey, key, revision],
      {
        tags: collections.map(cmsTag),
        revalidate: seconds,
      },
    ),
  );
}
