CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"staff_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"blocked_until" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"customer_email" text,
	"note" text,
	"preferred_channel" text,
	"reference_gallery_item_id" uuid,
	"source" text NOT NULL,
	"utm" jsonb,
	"manage_token_hash" text,
	"manage_token_expires_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" text,
	"cancel_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_appointments_status" CHECK ("appointments"."status" in ('pending', 'confirmed', 'completed', 'no_show', 'cancelled')),
	CONSTRAINT "ck_appointments_source" CHECK ("appointments"."source" in ('online', 'admin')),
	CONSTRAINT "ck_appointments_range" CHECK ("appointments"."starts_at" < "appointments"."ends_at" and "appointments"."ends_at" <= "appointments"."blocked_until")
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"title" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_off" (
	"id" uuid PRIMARY KEY NOT NULL,
	"staff_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"kind" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_time_off_range" CHECK ("time_off"."starts_at" < "time_off"."ends_at"),
	CONSTRAINT "ck_time_off_kind" CHECK ("time_off"."kind" in ('leave', 'holiday', 'block'))
);
--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "booking" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_reference_gallery_item_id_gallery_items_id_fk" FOREIGN KEY ("reference_gallery_item_id") REFERENCES "public"."gallery_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_off" ADD CONSTRAINT "time_off_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_appointments_code" ON "appointments" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_appointments_manage_token" ON "appointments" USING btree ("manage_token_hash");--> statement-breakpoint
CREATE INDEX "ix_appointments_staff_starts" ON "appointments" USING btree ("staff_id","starts_at");--> statement-breakpoint
CREATE INDEX "ix_appointments_status_starts" ON "appointments" USING btree ("status","starts_at");--> statement-breakpoint
CREATE INDEX "ix_appointments_phone" ON "appointments" USING btree ("customer_phone");--> statement-breakpoint
CREATE INDEX "ix_appointments_service" ON "appointments" USING btree ("service_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_staff_slug" ON "staff" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ix_time_off_staff_starts" ON "time_off" USING btree ("staff_id","starts_at");