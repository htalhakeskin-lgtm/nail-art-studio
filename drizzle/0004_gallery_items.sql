CREATE TABLE "gallery_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"number" integer GENERATED ALWAYS AS IDENTITY (sequence name "gallery_items_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"style" text NOT NULL,
	"colors" text[] NOT NULL,
	"length" text NOT NULL,
	"technique" text NOT NULL,
	"duration_minutes" integer,
	"image_path" text NOT NULL,
	"image_width" integer NOT NULL,
	"image_height" integer NOT NULL,
	"image_alt" text NOT NULL,
	"credit_name" text,
	"credit_url" text,
	"instagram_url" text,
	"is_representative" boolean DEFAULT false NOT NULL,
	"consent_obtained_at" timestamp with time zone,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_gallery_items_style" CHECK ("gallery_items"."style" in ('sade', 'french', 'simli', 'ombre', 'desenli', 'cicekli', 'rengarenk')),
	CONSTRAINT "ck_gallery_items_colors" CHECK (cardinality("gallery_items"."colors") > 0 and "gallery_items"."colors" <@ array['pembe', 'nude', 'beyaz', 'kirmizi', 'mor', 'mavi', 'yesil', 'sari', 'turuncu', 'siyah', 'altin']::text[]),
	CONSTRAINT "ck_gallery_items_length" CHECK ("gallery_items"."length" in ('kisa', 'orta', 'uzun')),
	CONSTRAINT "ck_gallery_items_technique" CHECK ("gallery_items"."technique" in ('kalici-oje', 'jel', 'protez')),
	CONSTRAINT "ck_gallery_items_consent" CHECK (not "gallery_items"."is_published" or "gallery_items"."is_representative" or "gallery_items"."consent_obtained_at" is not null),
	CONSTRAINT "ck_gallery_items_slug" CHECK ("gallery_items"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE UNIQUE INDEX "ux_gallery_items_slug" ON "gallery_items" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_gallery_items_number" ON "gallery_items" USING btree ("number");--> statement-breakpoint
CREATE INDEX "ix_gallery_items_published_sort" ON "gallery_items" USING btree ("is_published","sort_order");