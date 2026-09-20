import { revalidatePath } from 'next/cache';
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';

/**
 * Rebuild the public pages right after an editor saves, so changes show up
 * immediately instead of after the 5-minute revalidate window.
 * try/catch keeps seed scripts and `payload run` from crashing outside Next.js.
 */
function refreshSite() {
  try {
    revalidatePath('/', 'layout');
  } catch {
    /* not running inside Next.js */
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.disableRevalidate) refreshSite();
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (!req.context?.disableRevalidate) refreshSite();
  return doc;
};
