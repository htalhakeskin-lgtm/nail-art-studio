-- Extensions Drizzle cannot model (04-veri §9). btree_gist: appointment overlap exclusion
-- constraint (BR-RND-003). pg_trgm: Turkish-insensitive search keys.
CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;
