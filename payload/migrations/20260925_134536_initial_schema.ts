import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "gap"."enum_website_content_entries_kind" AS ENUM('text', 'image', 'link');
  CREATE TYPE "gap"."enum_website_content_key" AS ENUM('home-hero', 'home-about', 'home-guidance', 'home-process', 'home-testimonials', 'home-news', 'home-partners', 'home-cta', 'trust-strip', 'header', 'footer', 'mobile-navigation', 'country-menu', 'enquiry-form', 'application-form', 'university-filters', 'university-card', 'about-page', 'services-page', 'universities-page', 'university-page', 'country-page', 'news-page', 'article-page', 'apply-page');
  CREATE TYPE "gap"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "gap"."enum_universities_status" AS ENUM('draft', 'published');
  CREATE TYPE "gap"."enum_services_icon" AS ENUM('MessageCircle', 'Search', 'FileCheck2', 'Plane');
  CREATE TYPE "gap"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "gap"."enum_leads_status" AS ENUM('new', 'contacted', 'qualified', 'application-started', 'not-proceeding');
  CREATE TYPE "gap"."enum_applications_documents_status" AS ENUM('required', 'received', 'approved', 'needs-update');
  CREATE TYPE "gap"."enum_applications_study_level" AS ENUM('Foundation', 'Undergraduate', 'Postgraduate', 'PhD', 'Other');
  CREATE TYPE "gap"."enum_applications_status" AS ENUM('submitted', 'profile-review', 'documents-required', 'ready-to-apply', 'university-submitted', 'offer-received', 'enrolled', 'closed');
  CREATE TYPE "gap"."enum_applications_priority" AS ENUM('low', 'normal', 'high', 'urgent');
  CREATE TYPE "gap"."enum_documents_document_type" AS ENUM('identity', 'academic', 'english', 'financial', 'other');
  CREATE TYPE "gap"."enum_documents_review_status" AS ENUM('received', 'approved', 'needs-update');
  CREATE TYPE "gap"."enum_site_settings_social_links_platform" AS ENUM('facebook', 'instagram', 'linkedin', 'youtube');
  CREATE TABLE "gap"."website_content_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"kind" "gap"."enum_website_content_entries_kind",
  	"label" varchar,
  	"value" varchar,
  	"image_id" integer,
  	"original" varchar
  );
  
  CREATE TABLE "gap"."website_content" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"key" "gap"."enum_website_content_key" NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gap"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "gap"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "gap"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "gap"."enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "gap"."countries_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "gap"."countries_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_url" varchar NOT NULL,
  	"caption" varchar NOT NULL
  );
  
  CREATE TABLE "gap"."countries_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "gap"."countries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"hero_image_url" varchar,
  	"introduction" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gap"."countries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"news_id" integer,
  	"universities_id" integer
  );
  
  CREATE TABLE "gap"."universities_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "gap"."universities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"country_id" integer NOT NULL,
  	"city" varchar,
  	"logo_url" varchar,
  	"website_url" varchar,
  	"description" varchar NOT NULL,
  	"featured" boolean DEFAULT false,
  	"status" "gap"."enum_universities_status" DEFAULT 'published' NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gap"."services_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "gap"."services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon" "gap"."enum_services_icon",
  	"short_description" varchar NOT NULL,
  	"introduction" varchar,
  	"image_url" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gap"."testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_name" varchar NOT NULL,
  	"university_id" integer,
  	"country_id" integer,
  	"quote" varchar NOT NULL,
  	"rating" numeric DEFAULT 5,
  	"photo_url" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gap"."news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"cover_image_url" varchar,
  	"short_blurb" varchar NOT NULL,
  	"content" jsonb,
  	"published_date" timestamp(3) with time zone NOT NULL,
  	"status" "gap"."enum_news_status" DEFAULT 'draft' NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gap"."leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"interested_country" varchar,
  	"message" varchar,
  	"source_page" varchar,
  	"status" "gap"."enum_leads_status" DEFAULT 'new' NOT NULL,
  	"assigned_to_id" integer,
  	"follow_up_at" timestamp(3) with time zone,
  	"application_id" integer,
  	"staff_notes" varchar,
  	"email_verified" boolean DEFAULT false,
  	"verification_token" varchar,
  	"verified_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gap"."applications_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"status" "gap"."enum_applications_documents_status" DEFAULT 'required',
  	"file_id" integer
  );
  
  CREATE TABLE "gap"."applications_status_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" varchar NOT NULL,
  	"note" varchar,
  	"changed_at" timestamp(3) with time zone NOT NULL,
  	"changed_by_id" integer
  );
  
  CREATE TABLE "gap"."applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"student_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"country_id" integer NOT NULL,
  	"university_id" integer,
  	"study_level" "gap"."enum_applications_study_level" NOT NULL,
  	"intake" varchar,
  	"message" varchar,
  	"source_page" varchar,
  	"status" "gap"."enum_applications_status" DEFAULT 'submitted' NOT NULL,
  	"priority" "gap"."enum_applications_priority" DEFAULT 'normal',
  	"assigned_to_id" integer,
  	"next_action" varchar,
  	"next_action_at" timestamp(3) with time zone,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gap"."documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"application_id" integer NOT NULL,
  	"document_type" "gap"."enum_documents_document_type" NOT NULL,
  	"uploaded_by_id" integer NOT NULL,
  	"review_status" "gap"."enum_documents_review_status" DEFAULT 'received',
  	"review_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "gap"."site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "gap"."enum_site_settings_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "gap"."site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Global Admission Platform' NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"favicon_url" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"facebook_url" varchar,
  	"instagram_url" varchar,
  	"linkedin_url" varchar,
  	"maintenance_mode" boolean DEFAULT false,
  	"maintenance_message" varchar DEFAULT 'We are updating our website. Please check back soon.',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gap"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "gap"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gap"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"website_content_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"countries_id" integer,
  	"universities_id" integer,
  	"services_id" integer,
  	"testimonials_id" integer,
  	"news_id" integer,
  	"leads_id" integer,
  	"applications_id" integer,
  	"documents_id" integer,
  	"site_settings_id" integer
  );
  
  CREATE TABLE "gap"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gap"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "gap"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "gap"."website_content_entries" ADD CONSTRAINT "website_content_entries_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "gap"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."website_content_entries" ADD CONSTRAINT "website_content_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "gap"."website_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "gap"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."countries_highlights" ADD CONSTRAINT "countries_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "gap"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."countries_gallery" ADD CONSTRAINT "countries_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "gap"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."countries_steps" ADD CONSTRAINT "countries_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "gap"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."countries_rels" ADD CONSTRAINT "countries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "gap"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."countries_rels" ADD CONSTRAINT "countries_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "gap"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."countries_rels" ADD CONSTRAINT "countries_rels_universities_fk" FOREIGN KEY ("universities_id") REFERENCES "gap"."universities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."universities_highlights" ADD CONSTRAINT "universities_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "gap"."universities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."universities" ADD CONSTRAINT "universities_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "gap"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."services_points" ADD CONSTRAINT "services_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "gap"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."testimonials" ADD CONSTRAINT "testimonials_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "gap"."universities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."testimonials" ADD CONSTRAINT "testimonials_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "gap"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."leads" ADD CONSTRAINT "leads_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "gap"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."leads" ADD CONSTRAINT "leads_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "gap"."applications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."applications_documents" ADD CONSTRAINT "applications_documents_file_id_documents_id_fk" FOREIGN KEY ("file_id") REFERENCES "gap"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."applications_documents" ADD CONSTRAINT "applications_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "gap"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."applications_status_history" ADD CONSTRAINT "applications_status_history_changed_by_id_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "gap"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."applications_status_history" ADD CONSTRAINT "applications_status_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "gap"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."applications" ADD CONSTRAINT "applications_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "gap"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."applications" ADD CONSTRAINT "applications_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "gap"."universities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."applications" ADD CONSTRAINT "applications_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "gap"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."documents" ADD CONSTRAINT "documents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "gap"."applications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."documents" ADD CONSTRAINT "documents_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "gap"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gap"."site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "gap"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "gap"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_website_content_fk" FOREIGN KEY ("website_content_id") REFERENCES "gap"."website_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "gap"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "gap"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_countries_fk" FOREIGN KEY ("countries_id") REFERENCES "gap"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_universities_fk" FOREIGN KEY ("universities_id") REFERENCES "gap"."universities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "gap"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "gap"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "gap"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "gap"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "gap"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "gap"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_settings_fk" FOREIGN KEY ("site_settings_id") REFERENCES "gap"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "gap"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gap"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "gap"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "website_content_entries_order_idx" ON "gap"."website_content_entries" USING btree ("_order");
  CREATE INDEX "website_content_entries_parent_id_idx" ON "gap"."website_content_entries" USING btree ("_parent_id");
  CREATE INDEX "website_content_entries_image_idx" ON "gap"."website_content_entries" USING btree ("image_id");
  CREATE UNIQUE INDEX "website_content_key_idx" ON "gap"."website_content" USING btree ("key");
  CREATE INDEX "website_content_updated_at_idx" ON "gap"."website_content" USING btree ("updated_at");
  CREATE INDEX "website_content_created_at_idx" ON "gap"."website_content" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "gap"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "gap"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "gap"."media" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "gap"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "gap"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "gap"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "gap"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "gap"."users" USING btree ("email");
  CREATE INDEX "countries_highlights_order_idx" ON "gap"."countries_highlights" USING btree ("_order");
  CREATE INDEX "countries_highlights_parent_id_idx" ON "gap"."countries_highlights" USING btree ("_parent_id");
  CREATE INDEX "countries_gallery_order_idx" ON "gap"."countries_gallery" USING btree ("_order");
  CREATE INDEX "countries_gallery_parent_id_idx" ON "gap"."countries_gallery" USING btree ("_parent_id");
  CREATE INDEX "countries_steps_order_idx" ON "gap"."countries_steps" USING btree ("_order");
  CREATE INDEX "countries_steps_parent_id_idx" ON "gap"."countries_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "countries_slug_idx" ON "gap"."countries" USING btree ("slug");
  CREATE INDEX "countries_updated_at_idx" ON "gap"."countries" USING btree ("updated_at");
  CREATE INDEX "countries_created_at_idx" ON "gap"."countries" USING btree ("created_at");
  CREATE INDEX "countries_rels_order_idx" ON "gap"."countries_rels" USING btree ("order");
  CREATE INDEX "countries_rels_parent_idx" ON "gap"."countries_rels" USING btree ("parent_id");
  CREATE INDEX "countries_rels_path_idx" ON "gap"."countries_rels" USING btree ("path");
  CREATE INDEX "countries_rels_news_id_idx" ON "gap"."countries_rels" USING btree ("news_id");
  CREATE INDEX "countries_rels_universities_id_idx" ON "gap"."countries_rels" USING btree ("universities_id");
  CREATE INDEX "universities_highlights_order_idx" ON "gap"."universities_highlights" USING btree ("_order");
  CREATE INDEX "universities_highlights_parent_id_idx" ON "gap"."universities_highlights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "universities_slug_idx" ON "gap"."universities" USING btree ("slug");
  CREATE INDEX "universities_country_idx" ON "gap"."universities" USING btree ("country_id");
  CREATE INDEX "universities_featured_idx" ON "gap"."universities" USING btree ("featured");
  CREATE INDEX "universities_status_idx" ON "gap"."universities" USING btree ("status");
  CREATE INDEX "universities_updated_at_idx" ON "gap"."universities" USING btree ("updated_at");
  CREATE INDEX "universities_created_at_idx" ON "gap"."universities" USING btree ("created_at");
  CREATE INDEX "services_points_order_idx" ON "gap"."services_points" USING btree ("_order");
  CREATE INDEX "services_points_parent_id_idx" ON "gap"."services_points" USING btree ("_parent_id");
  CREATE INDEX "services_updated_at_idx" ON "gap"."services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "gap"."services" USING btree ("created_at");
  CREATE INDEX "testimonials_university_idx" ON "gap"."testimonials" USING btree ("university_id");
  CREATE INDEX "testimonials_country_idx" ON "gap"."testimonials" USING btree ("country_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "gap"."testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "gap"."testimonials" USING btree ("created_at");
  CREATE UNIQUE INDEX "news_slug_idx" ON "gap"."news" USING btree ("slug");
  CREATE INDEX "news_status_idx" ON "gap"."news" USING btree ("status");
  CREATE INDEX "news_updated_at_idx" ON "gap"."news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "gap"."news" USING btree ("created_at");
  CREATE INDEX "leads_email_idx" ON "gap"."leads" USING btree ("email");
  CREATE INDEX "leads_status_idx" ON "gap"."leads" USING btree ("status");
  CREATE INDEX "leads_assigned_to_idx" ON "gap"."leads" USING btree ("assigned_to_id");
  CREATE INDEX "leads_follow_up_at_idx" ON "gap"."leads" USING btree ("follow_up_at");
  CREATE INDEX "leads_application_idx" ON "gap"."leads" USING btree ("application_id");
  CREATE INDEX "leads_updated_at_idx" ON "gap"."leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "gap"."leads" USING btree ("created_at");
  CREATE INDEX "applications_documents_order_idx" ON "gap"."applications_documents" USING btree ("_order");
  CREATE INDEX "applications_documents_parent_id_idx" ON "gap"."applications_documents" USING btree ("_parent_id");
  CREATE INDEX "applications_documents_file_idx" ON "gap"."applications_documents" USING btree ("file_id");
  CREATE INDEX "applications_status_history_order_idx" ON "gap"."applications_status_history" USING btree ("_order");
  CREATE INDEX "applications_status_history_parent_id_idx" ON "gap"."applications_status_history" USING btree ("_parent_id");
  CREATE INDEX "applications_status_history_changed_by_idx" ON "gap"."applications_status_history" USING btree ("changed_by_id");
  CREATE UNIQUE INDEX "applications_reference_idx" ON "gap"."applications" USING btree ("reference");
  CREATE INDEX "applications_email_idx" ON "gap"."applications" USING btree ("email");
  CREATE INDEX "applications_country_idx" ON "gap"."applications" USING btree ("country_id");
  CREATE INDEX "applications_university_idx" ON "gap"."applications" USING btree ("university_id");
  CREATE INDEX "applications_status_idx" ON "gap"."applications" USING btree ("status");
  CREATE INDEX "applications_priority_idx" ON "gap"."applications" USING btree ("priority");
  CREATE INDEX "applications_assigned_to_idx" ON "gap"."applications" USING btree ("assigned_to_id");
  CREATE INDEX "applications_next_action_at_idx" ON "gap"."applications" USING btree ("next_action_at");
  CREATE INDEX "applications_updated_at_idx" ON "gap"."applications" USING btree ("updated_at");
  CREATE INDEX "applications_created_at_idx" ON "gap"."applications" USING btree ("created_at");
  CREATE INDEX "documents_application_idx" ON "gap"."documents" USING btree ("application_id");
  CREATE INDEX "documents_uploaded_by_idx" ON "gap"."documents" USING btree ("uploaded_by_id");
  CREATE INDEX "documents_updated_at_idx" ON "gap"."documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "gap"."documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "gap"."documents" USING btree ("filename");
  CREATE INDEX "site_settings_social_links_order_idx" ON "gap"."site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "gap"."site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_updated_at_idx" ON "gap"."site_settings" USING btree ("updated_at");
  CREATE INDEX "site_settings_created_at_idx" ON "gap"."site_settings" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "gap"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "gap"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "gap"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "gap"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "gap"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "gap"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "gap"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_website_content_id_idx" ON "gap"."payload_locked_documents_rels" USING btree ("website_content_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "gap"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "gap"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_countries_id_idx" ON "gap"."payload_locked_documents_rels" USING btree ("countries_id");
  CREATE INDEX "payload_locked_documents_rels_universities_id_idx" ON "gap"."payload_locked_documents_rels" USING btree ("universities_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "gap"."payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "gap"."payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "gap"."payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "gap"."payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_applications_id_idx" ON "gap"."payload_locked_documents_rels" USING btree ("applications_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "gap"."payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_site_settings_id_idx" ON "gap"."payload_locked_documents_rels" USING btree ("site_settings_id");
  CREATE INDEX "payload_preferences_key_idx" ON "gap"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "gap"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "gap"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "gap"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "gap"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "gap"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "gap"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "gap"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "gap"."payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "gap"."website_content_entries" CASCADE;
  DROP TABLE "gap"."website_content" CASCADE;
  DROP TABLE "gap"."media" CASCADE;
  DROP TABLE "gap"."users_sessions" CASCADE;
  DROP TABLE "gap"."users" CASCADE;
  DROP TABLE "gap"."countries_highlights" CASCADE;
  DROP TABLE "gap"."countries_gallery" CASCADE;
  DROP TABLE "gap"."countries_steps" CASCADE;
  DROP TABLE "gap"."countries" CASCADE;
  DROP TABLE "gap"."countries_rels" CASCADE;
  DROP TABLE "gap"."universities_highlights" CASCADE;
  DROP TABLE "gap"."universities" CASCADE;
  DROP TABLE "gap"."services_points" CASCADE;
  DROP TABLE "gap"."services" CASCADE;
  DROP TABLE "gap"."testimonials" CASCADE;
  DROP TABLE "gap"."news" CASCADE;
  DROP TABLE "gap"."leads" CASCADE;
  DROP TABLE "gap"."applications_documents" CASCADE;
  DROP TABLE "gap"."applications_status_history" CASCADE;
  DROP TABLE "gap"."applications" CASCADE;
  DROP TABLE "gap"."documents" CASCADE;
  DROP TABLE "gap"."site_settings_social_links" CASCADE;
  DROP TABLE "gap"."site_settings" CASCADE;
  DROP TABLE "gap"."payload_kv" CASCADE;
  DROP TABLE "gap"."payload_locked_documents" CASCADE;
  DROP TABLE "gap"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "gap"."payload_preferences" CASCADE;
  DROP TABLE "gap"."payload_preferences_rels" CASCADE;
  DROP TABLE "gap"."payload_migrations" CASCADE;
  DROP TYPE "gap"."enum_website_content_entries_kind";
  DROP TYPE "gap"."enum_website_content_key";
  DROP TYPE "gap"."enum_users_role";
  DROP TYPE "gap"."enum_universities_status";
  DROP TYPE "gap"."enum_services_icon";
  DROP TYPE "gap"."enum_news_status";
  DROP TYPE "gap"."enum_leads_status";
  DROP TYPE "gap"."enum_applications_documents_status";
  DROP TYPE "gap"."enum_applications_study_level";
  DROP TYPE "gap"."enum_applications_status";
  DROP TYPE "gap"."enum_applications_priority";
  DROP TYPE "gap"."enum_documents_document_type";
  DROP TYPE "gap"."enum_documents_review_status";
  DROP TYPE "gap"."enum_site_settings_social_links_platform";`)
}
