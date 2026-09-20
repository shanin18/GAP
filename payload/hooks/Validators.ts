const isHttpUrl = (value: string) => {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

/** Optional full link, e.g. https://example.com */
export const optionalUrl = (value: string | null | undefined) => {
  if (!value) return true;
  return isHttpUrl(value) || "Enter a full link starting with https://";
};

/** Optional full link OR a site path such as /images/photo.webp */
export const urlOrPath = (value: string | null | undefined) => {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return (
    isHttpUrl(value) ||
    "Enter a full link (https://...) or a path starting with /"
  );
};
