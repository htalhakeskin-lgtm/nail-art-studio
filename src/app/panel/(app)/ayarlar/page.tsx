import type { Metadata, Route } from "next";
import Link from "next/link";

import { requirePanelUser } from "@/features/panel";
import { getSiteSettings } from "@/features/site";
import { BusinessSettingsForm } from "@/features/site/forms";
import { formatPhone } from "@/lib/format";

export const metadata: Metadata = { title: "Ayarlar" };

const elsewhere: { href: Route; title: string; hint: string }[] = [
  {
    href: "/panel/musaitlik",
    title: "Çalışma saatleri ve randevu kuralları",
    hint: "Açılış / kapanış, izinler, aralık ve önceden alma süresi",
  },
  { href: "/panel/hizmetler", title: "Fiyat gösterimi", hint: "Fiyatlar sitede görünsün mü" },
  { href: "/panel/icerik", title: "Sayfa metinleri", hint: "Hakkında, süreç, hijyen, SSS" },
];

/**
 * SCR-110 (plan §12 "Ayarlar"): business details, contact channels, Instagram and the search
 * snippet. Owner and admin only (settings.edit). WhatsApp appointment templates stay fixed in
 * code (K-44): they must never carry a price or a promotion.
 */
export default async function SettingsPage({ searchParams }: PageProps<"/panel/ayarlar">) {
  await requirePanelUser("settings.edit");
  const [{ kaydedildi }, settings] = await Promise.all([searchParams, getSiteSettings()]);

  return (
    <>
      <h1 className="text-3xl font-medium">Ayarlar</h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Buradaki bilgiler sitenin üst ve alt bölümünde, WhatsApp bağlantılarında, haritada ve arama
        sonuçlarında kullanılır.
      </p>
      {kaydedildi === "1" && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-success-muted px-4 py-3 font-semibold text-success"
        >
          Ayarlar kaydedildi. Site güncellendi.
        </p>
      )}
      <div className="mt-8">
        <BusinessSettingsForm
          initial={{
            name: settings.company.name,
            owner: settings.company.owner,
            tagline: settings.company.tagline,
            address: settings.company.address,
            district: settings.company.district,
            city: settings.company.city,
            phone: formatPhone(settings.contact.phone),
            whatsapp: formatPhone(settings.contact.whatsapp),
            email: settings.contact.email,
            whatsappMessage: settings.contact.whatsappMessage,
            instagram: settings.social.instagram.replace(/^@/, ""),
            defaultTitle: settings.seo.defaultTitle,
            defaultDescription: settings.seo.defaultDescription,
          }}
        />
      </div>

      <section aria-labelledby="diger-ayarlar" className="mt-12 max-w-2xl">
        <h2 id="diger-ayarlar" className="text-xl font-medium">
          Diğer ayarlar
        </h2>
        <ul className="mt-3 space-y-3">
          {elsewhere.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-16 flex-col justify-center rounded-xl border bg-surface px-4 py-3 hover:bg-surface-muted"
              >
                <span className="font-semibold">{item.title}</span>
                <span className="text-sm text-muted-foreground">{item.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
