import { CheckCircle2, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Sparkle } from "@/components/common/pastel-blobs";
import { Button } from "@/components/ui/button";
import { isLeadCode } from "@/features/leads";
import { getSiteSettings, whatsappHref } from "@/features/site";
import { pageMetadata } from "@/lib/seo";

// Thank-you pages are never indexed (09-seo §3).
export const metadata: Metadata = pageMetadata({
  title: "Mesajınız alındı",
  description: "İletişim formundan gönderdiğiniz mesaj Nail Art Studios'a ulaştı.",
  path: "/iletisim/tesekkurler",
  noindex: true,
});

async function RequestCode({
  searchParams,
}: Pick<PageProps<"/iletisim/tesekkurler">, "searchParams">) {
  const { kod } = await searchParams;
  const settings = await getSiteSettings();
  // Only a well-formed code is echoed back; anything else is ignored.
  const code = typeof kod === "string" && isLeadCode(kod) ? kod : null;
  const message = code
    ? `${settings.contact.whatsappMessage} Talep numaram: ${code}`
    : settings.contact.whatsappMessage;

  return (
    <>
      {code && (
        <p className="mt-6 rounded-[1.25rem] bg-surface-muted px-5 py-4">
          Talep numaranız: <strong className="font-display text-xl tabular-nums">{code}</strong>
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <a href={whatsappHref(settings, message)}>
            <MessageCircle aria-hidden="true" />
            Daha hızlı yanıt için WhatsApp
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/galeri">Galeriye göz atın</Link>
        </Button>
      </div>
    </>
  );
}

/** Thank-you screen after UC-07: what happens next, the request number, a faster channel. */
export default function ContactThanksPage({ searchParams }: PageProps<"/iletisim/tesekkurler">) {
  return (
    <section className="container-page section-y">
      <div className="mx-auto max-w-xl text-center">
        <CheckCircle2 aria-hidden="true" className="mx-auto size-12 text-success" />
        <h1 className="mt-4 text-4xl font-medium tracking-tight md:text-5xl">
          Mesajınız bize ulaştı
          <Sparkle className="ml-2 inline size-6 text-primary" />
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Çalışma saatlerinde genellikle aynı gün, seçtiğiniz kanaldan dönüyoruz.
        </p>
        <Suspense fallback={<div className="mt-6 h-24" />}>
          <RequestCode searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
