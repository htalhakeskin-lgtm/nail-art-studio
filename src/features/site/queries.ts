import "server-only";

import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { siteDefaults } from "@/config/site-defaults";
import { db } from "@/server/db/client";
import { siteSettings } from "@/server/db/schema";
import { logger } from "@/server/logger";

import { type SiteSettings, siteSettingsSchema } from "./schemas";

/** Panel actions that edit site_settings call updateTag(SITE_SETTINGS_TAG). */
export const SITE_SETTINGS_TAG = "site-settings";

const fallback: SiteSettings = siteSettingsSchema.parse(siteDefaults);

type SectionKey = keyof SiteSettings;

function section<K extends SectionKey>(key: K, value: unknown): SiteSettings[K] {
  const parsed = siteSettingsSchema.shape[key].safeParse(value);
  if (parsed.success) return parsed.data as SiteSettings[K];
  logger.warn("site_settings.invalid_section", { section: key });
  return fallback[key];
}

/**
 * Company details, contact, hours and SEO defaults. Cached for every visitor; a section that
 * is missing or malformed falls back to src/config/site-defaults.ts so the site never breaks.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(SITE_SETTINGS_TAG);

  try {
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "singleton"))
      .limit(1);
    if (!row) return fallback;
    return {
      company: section("company", row.company),
      contact: section("contact", row.contact),
      openingHours: section("openingHours", row.openingHours),
      social: section("social", row.social),
      theme: section("theme", row.theme),
      features: section("features", row.features),
      seo: section("seo", row.seo),
      pricing: section("pricing", row.pricing),
    };
  } catch (error) {
    // Build without a database (first deploy, local build): render with the defaults.
    logger.error("site_settings.read_failed", { error: String(error) });
    return fallback;
  }
}
