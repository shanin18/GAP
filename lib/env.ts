import { normalizeDatabaseUrl } from "./database-url";
const production = process.env.NODE_ENV === "production";
function required(name: string, value?: string) {
  if (production && !value)
    throw new Error(`Missing required environment variable: ${name}`);
  return value || "";
}
export const env = {
  databaseUrl: normalizeDatabaseUrl(
    required("DATABASE_URL", process.env.DATABASE_URL),
  ),
  databaseSchema: process.env.DATABASE_SCHEMA || "public",
  payloadSecret:
    required("PAYLOAD_SECRET", process.env.PAYLOAD_SECRET) ||
    "development-only-secret-change-me",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};
