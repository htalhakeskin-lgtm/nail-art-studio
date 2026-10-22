CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"body" text NOT NULL,
	"service_id" uuid,
	"is_sample" boolean DEFAULT true NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ix_testimonials_sort" ON "testimonials" USING btree ("sort_order");