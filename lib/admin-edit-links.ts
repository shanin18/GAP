import "server-only";
import { getWebsiteContent } from "./website-content-server";

export type EditLink = { label: string; href: string };

const admin = "/admin/collections";

/** A record in the admin, e.g. this country. */
export const recordLink = (label: string, collection: string, id: number | string): EditLink => ({
  label,
  href: `${admin}/${collection}/${id}`,
});

/** A whole list in the admin, e.g. all universities. */
export const listLink = (label: string, collection: string): EditLink => ({
  label,
  href: `${admin}/${collection}`,
});

/** The Website Content record that holds a page's text. Uses the cached content, so no extra query. */
export async function pageTextLink(label: string, key: string): Promise<EditLink> {
  const id = (await getWebsiteContent())[key]?.id;
  return id ? recordLink(label, "website-content", id) : listLink(label, "website-content");
}

/** Offered on every page, after the page's own links. */
export const sharedLinks: EditLink[] = [
  listLink("All website text (header, footer, menus…)", "website-content"),
];
