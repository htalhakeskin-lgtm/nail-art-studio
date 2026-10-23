"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { type Fail, ok } from "@/lib/result";
import { adminAction } from "@/server/action";
import { diffFields, recordAudit } from "@/server/audit";
import { db } from "@/server/db/client";
import { siteSettings } from "@/server/db/schema";

import { getSiteSettings, SITE_SETTINGS_TAG } from "./queries";
import {
  businessSettingsSchema,
  type BusinessSettingsValues,
  businessSettingsValues,
} from "./settings-schemas";

/**
 * SCR-110: business details, contact, Instagram and the search snippet. They feed the header,
 * footer, WhatsApp links, NailSalon JSON-LD and page titles, so the cache tag is refreshed.
 */
export const saveBusinessSettings = adminAction({
  schema: businessSettingsSchema,
  permission: "settings.edit",
  handler: async (values, ctx) => {
    const settings = await getSiteSettings();
    const company = {
      ...settings.company,
      name: values.name,
      owner: values.owner,
      tagline: values.tagline,
      address: values.address,
      district: values.district,
      city: values.city,
    };
    const contact = {
      ...settings.contact,
      phone: values.phone,
      whatsapp: values.whatsapp,
      email: values.email,
      whatsappMessage: values.whatsappMessage,
    };
    const social = { ...settings.social, instagram: values.instagram };
    const seo = {
      ...settings.seo,
      defaultTitle: values.defaultTitle,
      defaultDescription: values.defaultDescription,
    };

    const [row] = await db
      .update(siteSettings)
      .set({ company, contact, social, seo })
      .where(eq(siteSettings.id, "singleton"))
      .returning({ id: siteSettings.id });
    if (!row) {
      await db.insert(siteSettings).values({ id: "singleton", company, contact, social, seo });
    }
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "settings.business",
      entity: "site_settings",
      entityId: "singleton",
      changes: diffFields(
        { ...settings.company, ...settings.contact, ...settings.social, ...settings.seo },
        { ...company, ...contact, ...social, ...seo },
      ),
      ip: ctx.ip,
    });
    updateTag(SITE_SETTINGS_TAG);
    return ok({ saved: true });
  },
});

export type BusinessSettingsState = { error?: Fail; values?: BusinessSettingsValues };

/** Redirects back with a confirmation; on failure returns the error and what was typed. */
export async function submitBusinessSettings(
  _previous: BusinessSettingsState,
  formData: FormData,
): Promise<BusinessSettingsState> {
  const values = businessSettingsValues(formData);
  const result = await saveBusinessSettings(values);
  if (!result.ok) return { error: result, values };
  redirect("/panel/ayarlar?kaydedildi=1");
}
