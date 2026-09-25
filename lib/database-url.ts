/** Preserve pg's current certificate verification without its compatibility warning. */
export function normalizeDatabaseUrl(value: string) {
  if (!value) return value;
  const url = new URL(value);
  const mode = url.searchParams.get("sslmode");
  if (
    url.searchParams.get("uselibpqcompat") !== "true" &&
    mode &&
    ["prefer", "require", "verify-ca"].includes(mode)
  ) {
    url.searchParams.set("sslmode", "verify-full");
    return url.toString();
  }
  return value;
}
