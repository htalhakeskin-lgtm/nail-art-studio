import { Camera, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { OpenNow } from "@/components/common/open-now";
import { PastelBlobs } from "@/components/common/pastel-blobs";
import { PhoneLink } from "@/components/common/phone-link";
import { JsonLd } from "@/components/common/safe-html";
import { StudioMap } from "@/components/common/studio-map";
import { Button } from "@/components/ui/button";
import { entranceNote, transitSteps } from "@/content/location";
import { ContactForm } from "@/features/leads/forms";
import {
  directionLinks,
  getSiteSettings,
  instagramHref,
  localBusinessData,
  phoneHref,
  summarizeWeeklyHours,
  whatsappHref,
} from "@/features/site";
import { env } from "@/lib/env";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "İletişim ve konum",
  description:
    "Kadıköy Moda'daki nail art stüdyosuna WhatsApp'tan yazın, arayın ya da formdan mesaj bırakın. Adres, çalışma saatleri, harita ve ulaşım.",
  path: "/iletisim",
});

/**
 * SCR-010 (UC-07, REQ-010, REQ-016, REQ-017): every way to reach the studio, the form, opening
 * hours with the live "open now" line, map, directions and transit. NailSalon data mirrors the
 * visible name, address and phone.
 */
export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { company, contact } = settings;
  const instagram = instagramHref(settings);
  const hours = summarizeWeeklyHours(settings.openingHours.weekly);
  const [emailUser, emailDomain] = contact.email.split("@");

  return (
    <>
      <JsonLd
        json={jsonLd(
          localBusinessData(settings, {
            url: absoluteUrl("/"),
            image: absoluteUrl("/demo/hero-puantiye-960.webp"),
          }),
        )}
      />

      <section className="relative isolate overflow-hidden">
        <PastelBlobs className="opacity-70" />
        <div className="container-page pt-8 pb-10 md:pt-12">
          <Breadcrumbs items={[{ label: "İletişim", href: "/iletisim" }]} />
          <h1 className="mt-8 text-4xl font-medium tracking-tight md:text-6xl">İletişim</h1>
          <p className="mt-4 max-w-prose text-lg text-muted-foreground">
            En hızlı yol WhatsApp: beğendiğiniz tasarımın fotoğrafını gönderin, uygun günü birlikte
            bulalım. Dilerseniz arayın ya da aşağıdaki formdan mesaj bırakın.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg">
              <a href={whatsappHref(settings)}>
                <MessageCircle aria-hidden="true" />
                WhatsApp&apos;tan yazın
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={phoneHref(settings)}>
                <Phone aria-hidden="true" />
                Arayın
              </a>
            </Button>
            {instagram && (
              <Button asChild size="lg" variant="outline">
                <a href={instagram} target="_blank" rel="noopener noreferrer">
                  <Camera aria-hidden="true" />
                  Instagram
                  <span className="sr-only"> (yeni sekmede açılır)</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 pb-(--section-y) lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <section
          aria-labelledby="mesaj-baslik"
          className="rounded-[1.75rem] bg-surface p-5 shadow-glow md:p-8"
        >
          <h2 id="mesaj-baslik" className="text-2xl font-medium md:text-3xl">
            Mesaj bırakın
          </h2>
          <p className="mt-2 text-muted-foreground">
            Çalışma saatlerinde genellikle aynı gün dönüyoruz.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </section>

        <section aria-labelledby="studyo-bilgi" className="space-y-6">
          <div className="rounded-[1.75rem] bg-surface-muted p-5 md:p-8">
            <h2 id="studyo-bilgi" className="text-2xl font-medium md:text-3xl">
              {company.name}
            </h2>
            <OpenNow hours={settings.openingHours} className="mt-4" />
            <address className="mt-5 space-y-1 not-italic">
              <p className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
                <span>
                  {company.address}
                  {env.DEMO_MODE && (
                    <span className="block text-sm text-muted-foreground">(örnek adres)</span>
                  )}
                </span>
              </p>
              <PhoneLink
                e164={contact.phone}
                className="inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline"
              />
              <p>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline"
                >
                  <span>
                    {emailUser}@
                    <wbr />
                    <span className="whitespace-nowrap">{emailDomain}</span>
                  </span>
                </a>
              </p>
            </address>

            <h3 className="mt-6 font-sans text-sm font-bold">Çalışma saatleri</h3>
            <dl className="mt-2 space-y-1">
              {hours.map((row) => (
                <div key={row.days} className="flex flex-wrap justify-between gap-x-4">
                  <dt>{row.days}</dt>
                  <dd className="font-semibold tabular-nums">{row.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h3 className="font-sans text-sm font-bold">Yol tarifi alın</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {directionLinks(settings).map((link) => (
                <li key={link.label}>
                  <Button asChild variant="outline" size="sm">
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                      <span className="sr-only"> (yeni sekmede açılır)</span>
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section aria-labelledby="ulasim-baslik" className="container-page pb-(--section-y)">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <StudioMap
            lat={company.geo.lat}
            lng={company.geo.lng}
            label={`${company.name}, ${company.district}`}
          />
          <div>
            <h2 id="ulasim-baslik" className="text-2xl font-medium md:text-3xl">
              Nasıl gelinir
            </h2>
            <ul className="mt-4 space-y-3">
              {transitSteps.map((step) => (
                <li key={step.mode} className="rounded-xl bg-surface p-4">
                  <p className="font-semibold">{step.mode}</p>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">{entranceNote}</p>
            {env.DEMO_MODE && (
              <p className="mt-2 text-xs text-muted-foreground">
                Adres örnek olduğu için harita yalnızca Moda bölgesini gösterir.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
