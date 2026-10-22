CREATE TABLE "services" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"summary" text NOT NULL,
	"suitable_for" text,
	"body" text,
	"aftercare" text,
	"durability_text" text,
	"duration_minutes" integer NOT NULL,
	"refill_interval_days" integer,
	"price_minor" bigint,
	"price_display_override" text,
	"faqs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cover_image_path" text,
	"is_bookable" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_services_category" CHECK ("services"."category" in ('kalici-oje', 'jel', 'protez', 'nail-art', 'manikur-pedikur', 'bakim')),
	CONSTRAINT "ck_services_price_display" CHECK ("services"."price_display_override" is null or "services"."price_display_override" in ('contact', 'show')),
	CONSTRAINT "ck_services_slug" CHECK ("services"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "ck_services_duration" CHECK ("services"."duration_minutes" between 5 and 600),
	CONSTRAINT "ck_services_refill" CHECK ("services"."refill_interval_days" is null or "services"."refill_interval_days" between 1 and 365),
	CONSTRAINT "ck_services_price" CHECK ("services"."price_minor" is null or "services"."price_minor" >= 0)
);
--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "pricing" jsonb DEFAULT '{"display":"contact"}'::jsonb NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_services_slug" ON "services" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ix_services_category_sort" ON "services" USING btree ("category","sort_order");