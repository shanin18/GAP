import { SUPABASE_ROOT_CA } from "./supabase-ca";

const isSupabase = (host: string) => /\.supabase\.(co|com)$/i.test(host);

/** Preserve pg's current certificate verification without its compatibility warning. */
export function normalizeDatabaseUrl(value: string) {
  if (!value) return value;
  const url = new URL(value);
  // Supabase signs its certificates with its own CA: TLS is configured by databaseSsl() instead,
  // and pg would let URL ssl settings override it.
  if (isSupabase(url.hostname)) {
    for (const key of ["sslmode", "sslrootcert", "sslcert", "sslkey", "uselibpqcompat"]) url.searchParams.delete(key);
    return url.toString();
  }
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

/** Verified TLS for Supabase (its CA isn't in the system store). Other hosts use the URL's sslmode. */
export function databaseSsl(value: string) {
  if (!value || !isSupabase(new URL(value).hostname)) return undefined;
  return { ca: SUPABASE_ROOT_CA, rejectUnauthorized: true };
}
