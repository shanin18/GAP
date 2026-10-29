import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

// The public /apply page was removed: every student now starts as a lead.
// Its two Website Content sections go with it (their entries cascade).
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  if (payload.db.schemaName !== 'gap') throw new Error('This migration requires DATABASE_SCHEMA=gap.');
  await db.execute(sql`
    DELETE FROM "gap"."website_content" WHERE "key" IN ('application-form', 'apply-page');
    ALTER TYPE "gap"."enum_website_content_key" RENAME TO "enum_website_content_key_old";
    CREATE TYPE "gap"."enum_website_content_key" AS ENUM('home-hero', 'home-about', 'home-guidance', 'home-process', 'home-testimonials', 'home-news', 'home-partners', 'home-cta', 'trust-strip', 'header', 'footer', 'mobile-navigation', 'country-menu', 'enquiry-form', 'university-filters', 'university-card', 'about-page', 'services-page', 'universities-page', 'university-page', 'country-page', 'news-page', 'article-page');
    ALTER TABLE "gap"."website_content" ALTER COLUMN "key" TYPE "gap"."enum_website_content_key" USING "key"::text::"gap"."enum_website_content_key";
    DROP TYPE "gap"."enum_website_content_key_old";
  `);
}

// Restores the allowed section names; the deleted section records are not recreated.
export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  if (payload.db.schemaName !== 'gap') throw new Error('This migration requires DATABASE_SCHEMA=gap.');
  await db.execute(sql`
    ALTER TYPE "gap"."enum_website_content_key" RENAME TO "enum_website_content_key_new";
    CREATE TYPE "gap"."enum_website_content_key" AS ENUM('home-hero', 'home-about', 'home-guidance', 'home-process', 'home-testimonials', 'home-news', 'home-partners', 'home-cta', 'trust-strip', 'header', 'footer', 'mobile-navigation', 'country-menu', 'enquiry-form', 'application-form', 'university-filters', 'university-card', 'about-page', 'services-page', 'universities-page', 'university-page', 'country-page', 'news-page', 'article-page', 'apply-page');
    ALTER TABLE "gap"."website_content" ALTER COLUMN "key" TYPE "gap"."enum_website_content_key" USING "key"::text::"gap"."enum_website_content_key";
    DROP TYPE "gap"."enum_website_content_key_new";
  `);
}
