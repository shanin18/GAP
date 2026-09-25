import { revalidatePath, revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import { cmsTag } from "../../lib/cms-cache-tags";

/**
 * Rebuild the public pages right after an editor saves, so changes show up
 * immediately instead of after the 5-minute revalidate window.
 * try/catch keeps seed scripts and `payload run` from crashing outside Next.js.
 */
function refreshSite(collection: string) {
  try {
    revalidateTag(cmsTag(collection), { expire: 0 });
    if (
      ["countries", "site-settings", "website-content", "media"].includes(
        collection,
      )
    ) {
      revalidatePath("/", "layout");
    } else {
      revalidatePath("/", "page");
      if (collection === "services") revalidatePath("/services");
      if (collection === "universities") {
        revalidatePath("/universities");
        revalidatePath("/universities/[slug]", "page");
        revalidatePath("/apply");
      }
      if (collection === "news") {
        revalidatePath("/news");
        revalidatePath("/news/[slug]", "page");
      }
      if (["universities", "news", "testimonials"].includes(collection))
        revalidatePath("/country/[slug]", "page");
      revalidatePath("/sitemap.xml");
    }
  } catch {
    /* not running inside Next.js */
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({
  doc,
  req,
  collection,
}) => {
  if (!req.context?.disableRevalidate) refreshSite(collection.slug);
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({
  doc,
  req,
  collection,
}) => {
  if (!req.context?.disableRevalidate) refreshSite(collection.slug);
  return doc;
};
