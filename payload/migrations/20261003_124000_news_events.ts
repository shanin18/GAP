import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  if (payload.db.schemaName !== 'gap') throw new Error('This migration requires DATABASE_SCHEMA=gap.');
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "gap"."enum_news_entry_type" AS ENUM ('blog', 'event');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    ALTER TABLE "gap"."news" ADD COLUMN IF NOT EXISTS "entry_type" "gap"."enum_news_entry_type" DEFAULT 'blog';
    ALTER TABLE "gap"."news" ADD COLUMN IF NOT EXISTS "event_date" timestamp(3) with time zone;
    ALTER TABLE "gap"."news" ADD COLUMN IF NOT EXISTS "event_location" varchar;
  `);
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  if (payload.db.schemaName !== 'gap') throw new Error('This migration requires DATABASE_SCHEMA=gap.');
  await db.execute(sql`
    ALTER TABLE "gap"."news" DROP COLUMN IF EXISTS "event_location", DROP COLUMN IF EXISTS "event_date", DROP COLUMN IF EXISTS "entry_type";
    DROP TYPE IF EXISTS "gap"."enum_news_entry_type";
  `);
}
