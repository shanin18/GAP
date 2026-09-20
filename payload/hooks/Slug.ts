import type { FieldHook } from "payload";

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Fills the slug from another field when it is empty, and always keeps it URL-safe. */
export const slugFrom =
  (source: string): FieldHook =>
  ({ value, data, operation }) => {
    if (typeof value === "string" && value.trim()) return slugify(value);
    if (operation === "create" && data?.[source])
      return slugify(String(data[source]));
    return value;
  };
