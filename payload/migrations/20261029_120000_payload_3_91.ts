import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

// Payload 3.91 throttles password-reset emails per account (auth.forgotPassword.minRequestInterval,
// on by default) and the cloud storage plugin stores each upload's object key.
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  if (payload.db.schemaName !== 'gap') throw new Error('This migration requires DATABASE_SCHEMA=gap.');
  await db.execute(sql`
    ALTER TABLE "gap"."users" ADD COLUMN IF NOT EXISTS "reset_password_requested_at" timestamp(3) with time zone;
    ALTER TABLE "gap"."media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;
    ALTER TABLE "gap"."documents" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;
  `);
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  if (payload.db.schemaName !== 'gap') throw new Error('This migration requires DATABASE_SCHEMA=gap.');
  await db.execute(sql`
    ALTER TABLE "gap"."documents" DROP COLUMN IF EXISTS "_objectkey";
    ALTER TABLE "gap"."media" DROP COLUMN IF EXISTS "_objectkey";
    ALTER TABLE "gap"."users" DROP COLUMN IF EXISTS "reset_password_requested_at";
  `);
}
