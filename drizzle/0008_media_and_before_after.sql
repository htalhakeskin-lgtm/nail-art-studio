CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"base_path" text NOT NULL,
	"driver" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"original_bytes" integer NOT NULL,
	"original_mime" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_media_assets_driver" CHECK ("media_assets"."driver" in ('blob', 'db'))
);
--> statement-breakpoint
CREATE TABLE "media_files" (
	"key" text PRIMARY KEY NOT NULL,
	"content" "bytea" NOT NULL,
	"content_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gallery_items" ADD COLUMN "media_id" uuid;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD COLUMN "before_image_path" text;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD COLUMN "before_image_alt" text;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD COLUMN "before_media_id" uuid;--> statement-breakpoint
CREATE INDEX "ix_media_assets_created" ON "media_assets" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_before_media_id_media_assets_id_fk" FOREIGN KEY ("before_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD CONSTRAINT "ck_gallery_items_before" CHECK (("gallery_items"."before_image_path" is null) = ("gallery_items"."before_image_alt" is null));