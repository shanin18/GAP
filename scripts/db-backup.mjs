// npm run db:backup
// Saves a full copy of the site's database (the "gap" schema) to backups/gap-YYYY-MM-DD-HHMM.dump
// and keeps the newest KEEP files. Needs PostgreSQL's pg_dump, version >= the database server's.
// Restore instructions: docs/DEPLOYMENT.md → "Database backups".
import nextEnv from "@next/env";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const KEEP = 8;
const DIR = "backups";

nextEnv.loadEnvConfig(process.cwd(), false);
const raw = process.env.DATABASE_URL;
if (!raw) fail("DATABASE_URL is not set in .env");
const url = new URL(raw);
const supabase = /\.supabase\.(co|com)$/i.test(url.hostname);
// pg_dump needs a session connection: Supabase's transaction pooler (6543) can't run it
if (supabase && url.port === "6543") url.port = "5432";

const pgDump = [
  process.env.PG_DUMP_PATH,
  "C:/Program Files/PostgreSQL/18/bin/pg_dump.exe",
  "C:/Program Files/PostgreSQL/17/bin/pg_dump.exe",
  "pg_dump",
].find((candidate) => candidate && (candidate === "pg_dump" || existsSync(candidate)));

// Verified TLS: Supabase's CA comes from lib/supabase-ca.ts; other hosts use the system store
let caFile;
const env = { ...process.env, PGPASSWORD: decodeURIComponent(url.password), PGSSLMODE: "verify-full" };
if (supabase) {
  const pem = readFileSync("lib/supabase-ca.ts", "utf8").match(/`([\s\S]+?)`/)?.[1];
  if (!pem) fail("Could not read the Supabase certificate from lib/supabase-ca.ts");
  caFile = join(tmpdir(), `gap-supabase-ca-${process.pid}.crt`);
  writeFileSync(caFile, pem);
  env.PGSSLROOTCERT = caFile;
} else {
  env.PGSSLROOTCERT = "system";
}

mkdirSync(DIR, { recursive: true });
const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
const file = join(DIR, `gap-${stamp}.dump`);
const schema = process.env.DATABASE_SCHEMA || "gap";

console.log(`Backing up schema "${schema}" from ${url.hostname} …`);
const result = spawnSync(pgDump, [
  "--format=custom", "--no-owner", "--no-privileges", `--schema=${schema}`,
  "--host", url.hostname, "--port", url.port || "5432",
  "--username", decodeURIComponent(url.username),
  "--dbname", url.pathname.slice(1) || "postgres",
  "--file", file,
], { env, encoding: "utf8" });
if (caFile) rmSync(caFile, { force: true });

if (result.error || result.status !== 0) {
  rmSync(file, { force: true });
  fail(result.error?.code === "ENOENT"
    ? "pg_dump not found. Install PostgreSQL's command-line tools, or set PG_DUMP_PATH."
    : `pg_dump failed:\n${(result.stderr || "").trim()}`);
}

const old = readdirSync(DIR).filter((f) => /^gap-.*\.dump$/.test(f)).sort().reverse().slice(KEEP);
for (const f of old) rmSync(join(DIR, f));
console.log(`Saved ${file} (${Math.round(statSync(file).size / 1024)} KB).${old.length ? ` Removed ${old.length} older backup(s); keeping the newest ${KEEP}.` : ""}`);
console.log("Keep a copy somewhere else too (e.g. a private cloud folder): this folder lives only on this computer.");

function fail(message) {
  console.error(message);
  process.exit(1);
}
