import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

// Simpler student pipeline. Existing records move to the nearest remaining stage first.
// Leads:        qualified -> contacted
// Applications: submitted / profile-review / ready-to-apply -> documents-required
// Study level becomes optional so a lead can be converted before it is known.
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  if (payload.db.schemaName !== 'gap') throw new Error('This migration requires DATABASE_SCHEMA=gap.');
  await db.execute(sql`
    UPDATE "gap"."leads" SET "status" = 'contacted' WHERE "status" = 'qualified';
    ALTER TYPE "gap"."enum_leads_status" RENAME TO "enum_leads_status_old";
    CREATE TYPE "gap"."enum_leads_status" AS ENUM('new', 'contacted', 'application-started', 'not-proceeding');
    ALTER TABLE "gap"."leads" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "gap"."leads" ALTER COLUMN "status" TYPE "gap"."enum_leads_status" USING "status"::text::"gap"."enum_leads_status";
    ALTER TABLE "gap"."leads" ALTER COLUMN "status" SET DEFAULT 'new';
    DROP TYPE "gap"."enum_leads_status_old";

    UPDATE "gap"."applications" SET "status" = 'documents-required' WHERE "status" IN ('submitted', 'profile-review', 'ready-to-apply');
    ALTER TYPE "gap"."enum_applications_status" RENAME TO "enum_applications_status_old";
    CREATE TYPE "gap"."enum_applications_status" AS ENUM('documents-required', 'university-submitted', 'offer-received', 'enrolled', 'closed');
    ALTER TABLE "gap"."applications" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "gap"."applications" ALTER COLUMN "status" TYPE "gap"."enum_applications_status" USING "status"::text::"gap"."enum_applications_status";
    ALTER TABLE "gap"."applications" ALTER COLUMN "status" SET DEFAULT 'documents-required';
    DROP TYPE "gap"."enum_applications_status_old";

    ALTER TABLE "gap"."applications" ALTER COLUMN "study_level" DROP NOT NULL;
  `);
}

// Restores the previous value lists. Records keep their simplified stage.
export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  if (payload.db.schemaName !== 'gap') throw new Error('This migration requires DATABASE_SCHEMA=gap.');
  await db.execute(sql`
    UPDATE "gap"."applications" SET "study_level" = 'Other' WHERE "study_level" IS NULL;
    ALTER TABLE "gap"."applications" ALTER COLUMN "study_level" SET NOT NULL;

    ALTER TYPE "gap"."enum_applications_status" RENAME TO "enum_applications_status_new";
    CREATE TYPE "gap"."enum_applications_status" AS ENUM('submitted', 'profile-review', 'documents-required', 'ready-to-apply', 'university-submitted', 'offer-received', 'enrolled', 'closed');
    ALTER TABLE "gap"."applications" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "gap"."applications" ALTER COLUMN "status" TYPE "gap"."enum_applications_status" USING "status"::text::"gap"."enum_applications_status";
    ALTER TABLE "gap"."applications" ALTER COLUMN "status" SET DEFAULT 'submitted';
    DROP TYPE "gap"."enum_applications_status_new";

    ALTER TYPE "gap"."enum_leads_status" RENAME TO "enum_leads_status_new";
    CREATE TYPE "gap"."enum_leads_status" AS ENUM('new', 'contacted', 'qualified', 'application-started', 'not-proceeding');
    ALTER TABLE "gap"."leads" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "gap"."leads" ALTER COLUMN "status" TYPE "gap"."enum_leads_status" USING "status"::text::"gap"."enum_leads_status";
    ALTER TABLE "gap"."leads" ALTER COLUMN "status" SET DEFAULT 'new';
    DROP TYPE "gap"."enum_leads_status_new";
  `);
}
