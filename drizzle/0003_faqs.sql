CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_faqs_category" CHECK ("faqs"."category" in ('randevu', 'uygulama', 'bakim', 'hijyen'))
);
--> statement-breakpoint
CREATE INDEX "ix_faqs_category_sort" ON "faqs" USING btree ("category","sort_order");