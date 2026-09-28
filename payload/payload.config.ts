import { buildConfig, type CollectionConfig, type ClientUser } from "payload";
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
import { invalidateAdminReads } from "../lib/admin-read-cache";
import { isAdmin } from './access';
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage';
import { cloudinaryAdapter, publicMediaURL } from '../lib/cloudinary-storage';

const contentCollections = new Set(['website-content', 'media', 'countries', 'universities', 'services', 'testimonials', 'news', 'site-settings']);

export default buildConfig({
  plugins: [cloudStoragePlugin({
    enabled: process.env.UPLOAD_STORAGE === 'cloudinary',
    collections: {
      media: { adapter: cloudinaryAdapter, generateFileURL: ({ filename }) => publicMediaURL(filename) },
      documents: { adapter: cloudinaryAdapter },
    },
  })],
  admin: {
    theme: "dark",
    user: Users.slug,
    importMap: { importMapFile: "app/(payload)/admin/importMap.ts" },
    meta: { titleSuffix: " | GAP Workspace" },
    components: {
      providers: ['/components/admin/UploadProgress#UploadProgress'],
      graphics: {
        Logo: "/components/admin/_Brand#Logo",
        Icon: "/components/admin/_Brand#Icon",
      },
      beforeLogin: ["/components/admin/_Brand#LoginIntro"],
      views: {
        dashboard: { Component: "/components/admin/Dashboard#Dashboard" },
      },
      Nav: "/components/admin/CollectionLinks#CollectionLinks",
      actions: ["/components/admin/Reminders#Reminders", "/components/admin/_Brand#WebsiteLink"],
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
    access: contentCollections.has(collection.slug) ? {
      ...collection.access,
      create: async (args) => args.req.user?.role === 'admin'
        && (collection.access?.create ? await collection.access.create(args) : true),
      update: isAdmin,
    } : collection.access,
    hooks: {
      ...collection.hooks,
      afterChange: [...(collection.hooks?.afterChange ?? []), ({ req, doc }) => {
        invalidateAdminReads(req.payload);
        return doc;
      }],
      afterDelete: [...(collection.hooks?.afterDelete ?? []), ({ req, doc }) => {
        invalidateAdminReads(req.payload);
        return doc;
      }],
    },
    admin: {
      ...collection.admin,
      ...(contentCollections.has(collection.slug) ? { hidden: ({ user }: { user: ClientUser }) => user?.role !== 'admin' } : {}),
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
    pool: { connectionString: env.databaseUrl, connectionTimeoutMillis: 10000, idleTimeoutMillis: 60000, keepAlive: true },
  }),
  secret: env.payloadSecret,
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        // Validate credentials on actual sends, not during builds/migration generation.
        skipVerify: true,
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
  // Vercel buffers multipart uploads: stay below its 4.5 MB request limit.
  upload: { limits: { fileSize: process.env.VERCEL === '1' ? 4_000_000 : 10_000_000 } },
  typescript: { outputFile: "payload-types.ts" },
});
