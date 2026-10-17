import { Camera } from "lucide-react";
import Link from "next/link";

import { PhoneLink } from "@/components/common/phone-link";
import {
  getSiteSettings,
  instagramHref,
  summarizeWeeklyHours,
  whatsappHref,
} from "@/features/site";
import { env } from "@/lib/env";

const legalLinks = [
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
  { href: "/gizlilik", label: "Gizlilik Politikası" },
  { href: "/cerez-politikasi", label: "Çerez Politikası" },
  { href: "/randevu-kosullari", label: "Randevu ve İptal Koşulları" },
] as const;

const linkClass = "inline-flex min-h-11 items-center underline-offset-4 hover:underline lg:min-h-8";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const { company, contact } = settings;
  const instagram = instagramHref(settings);
  const hours = summarizeWeeklyHours(settings.openingHours.weekly);
  const [emailUser, emailDomain] = contact.email.split("@");

  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1.3fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-semibold">{company.name}</p>
          <p className="mt-2 max-w-xs text-muted-foreground">{company.tagline}</p>
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkClass} mt-4 gap-2 font-semibold`}
            >
              <Camera aria-hidden="true" className="size-5" />
              Instagram: @{settings.social.instagram}
              <span className="sr-only"> (yeni sekmede açılır)</span>
            </a>
          )}
        </div>

        <div>
          <h2 className="font-sans text-sm font-bold tracking-wide uppercase">İletişim</h2>
          <address className="mt-3 not-italic">
            <p>{company.address}</p>
            {env.DEMO_MODE && <p className="text-sm text-muted-foreground">(örnek adres)</p>}
            <ul className="mt-2">
              <li>
                <PhoneLink e164={contact.phone} className={linkClass} />
              </li>
              <li>
                <a href={whatsappHref(settings)} className={linkClass}>
                  WhatsApp&apos;tan yazın
                </a>
              </li>
              <li>
                {/* Line break opportunity after "@" instead of break-all ("…exampl / e.com"). */}
                <a href={`mailto:${contact.email}`} className={linkClass}>
                  <span>
                    {emailUser}@
                    <wbr />
                    <span className="whitespace-nowrap">{emailDomain}</span>
                  </span>
                </a>
              </li>
            </ul>
          </address>
        </div>

        <div>
          <h2 className="font-sans text-sm font-bold tracking-wide uppercase">Çalışma saatleri</h2>
          <dl className="mt-3 space-y-2">
            {hours.map((row) => (
              <div key={row.days}>
                <dt className="font-semibold">{row.days}</dt>
                <dd className="text-muted-foreground tabular-nums">{row.hours}</dd>
              </div>
            ))}
          </dl>
        </div>

        <nav aria-label="Yasal">
          <h2 className="font-sans text-sm font-bold tracking-wide uppercase">Yasal</h2>
          <ul className="mt-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {env.DEMO_MODE && (
        <div className="border-t border-border">
          <p className="container-page py-6 text-sm text-muted-foreground">
            Bu site gösterim amaçlı bir demodur. İşletmeci adı, Instagram hesabı ve telefon numarası
            gerçektir; adres, hizmet ayrıntıları, yorumlar, görseller ve randevu kayıtları örnektir.
          </p>
        </div>
      )}
    </footer>
  );
}
