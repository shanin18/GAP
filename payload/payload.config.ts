import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { Users } from "./collections/Users";
import { Countries } from "./collections/Countries";
import { Universities } from "./collections/Universities";
import { Services } from "./collections/Services";
import { Testimonials } from "./collections/Testimonials";
import { News } from "./collections/News";
import { Leads } from "./collections/Leads";
import { SiteSettings } from "./collections/SiteSettings";
import { Applications } from "./collections/Applications";
import { Documents } from "./collections/Documents";
import { env } from "../lib/env";

export default buildConfig({
  admin: {
    theme: "dark",
    user: Users.slug,
    importMap: { importMapFile: "app/(payload)/admin/importMap.ts" },
    meta: { titleSuffix: " | GAP Workspace" },
    components: {
      graphics: {
        Logo: "/components/admin/Brand#Logo",
        Icon: "/components/admin/Brand#Icon",
      },
      beforeLogin: ["/components/admin/Brand#LoginIntro"],
      beforeDashboard: ["/components/admin/Brand#DashboardIntro"],
      Nav: "/components/admin/CollectionLinks#CollectionLinks",
      actions: ["/components/admin/Brand#WebsiteLink"],
    },
  },
  collections: [
    Users,
    Countries,
    Universities,
    Services,
    Testimonials,
    News,
    Leads,
    Applications,
    Documents,
    SiteSettings,
  ],
  editor: lexicalEditor(),
  db: postgresAdapter({
    schemaName: env.databaseSchema,
    pool: { connectionString: env.databaseUrl, connectionTimeoutMillis: 10000 },
  }),
  secret: env.payloadSecret,
  graphQL: { disable: true },
  upload: { limits: { fileSize: 10_000_000 } },
  typescript: { outputFile: "payload-types.ts" },
});
