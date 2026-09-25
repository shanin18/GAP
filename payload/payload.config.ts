import { buildConfig, type CollectionConfig } from "payload";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
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
import { WebsiteContent } from "./collections/WebsiteContent";
import { Media } from "./collections/Media";

export default buildConfig({
  admin: {
    theme: "dark",
    user: Users.slug,
    importMap: { importMapFile: "app/(payload)/admin/importMap.ts" },
    meta: { titleSuffix: " | GAP Workspace" },
    components: {
      graphics: {
        Logo: "/components/admin/_Brand#Logo",
        Icon: "/components/admin/_Brand#Icon",
      },
      beforeLogin: ["/components/admin/_Brand#LoginIntro"],
      views: {
        dashboard: { Component: "/components/admin/Dashboard#Dashboard" },
      },
      Nav: "/components/admin/CollectionLinks#CollectionLinks",
      actions: ["/components/admin/_Brand#WebsiteLink"],
    },
  },
  collections: [
    WebsiteContent,
    Media,
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
  ].map((collection): CollectionConfig => ({
    ...collection,
    admin: {
      ...collection.admin,
      components: {
        ...collection.admin?.components,
        edit: {
          ...collection.admin?.components?.edit,
          SaveButton: "/components/admin/FormActions#BottomSaveButton",
          SaveDraftButton: "/components/admin/FormActions#BottomSaveDraftButton",
          PublishButton: "/components/admin/FormActions#BottomPublishButton",
        },
      },
    },
    fields: [
      ...collection.fields,
      {
        name: "formActions",
        type: "ui",
        admin: {
          components: { Field: "/components/admin/FormActions#FormActions" },
        },
      },
    ],
  })),
  editor: lexicalEditor(),
  db: postgresAdapter({
    // Schema inspection over a remote connection is slow. Sync explicitly after
    // collection changes with npm run cms:sync (or cms:initialize).
    push: process.env.PAYLOAD_PUSH_SCHEMA === "true",
    migrationDir: "./payload/migrations",
    schemaName: env.databaseSchema,
    pool: { connectionString: env.databaseUrl, connectionTimeoutMillis: 10000 },
  }),
  secret: env.payloadSecret,
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress:
          process.env.EMAIL_FROM_ADDRESS ?? process.env.SMTP_USER ?? "",
        defaultFromName: "Global Admission Platform",
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 465),
          secure: Number(process.env.SMTP_PORT ?? 465) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        } as any,
      })
    : undefined,
  graphQL: { disable: true },
  upload: { limits: { fileSize: 10_000_000 } },
  typescript: { outputFile: "payload-types.ts" },
});
