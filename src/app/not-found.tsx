import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "@/components/layout/site-shell";
import { getSiteSettings, whatsappHref } from "@/features/site";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: false },
};

const popular = [
  { href: "/", label: "Ana sayfa" },
  { href: "/randevu-kosullari", label: "Randevu ve iptal koşulları" },
  { href: "/kvkk", label: "KVKK aydınlatma metni" },
] as const;

/** Z-11: custom 404 with a way forward. */
export default async function NotFound() {
  const settings = await getSiteSettings();
  return (
    <SiteShell>
      <section className="container-page section-y">
        <div className="mx-auto max-w-prose text-center">
          <p className="font-display text-6xl text-primary italic">404</p>
          <h1 className="mt-4 text-3xl font-medium md:text-4xl">Bu sayfayı bulamadık</h1>
          <p className="mt-4 text-muted-foreground">
            Bağlantı eskimiş ya da adres yanlış yazılmış olabilir. Aşağıdaki sayfalardan devam
            edebilir ya da bize WhatsApp&apos;tan yazabilirsiniz.
          </p>
          <ul className="mt-8 flex flex-col items-center gap-1">
            {popular.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={whatsappHref(settings)}
                className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline"
              >
                WhatsApp&apos;tan yazın
              </a>
            </li>
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
