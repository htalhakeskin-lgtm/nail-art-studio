import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { JsonLd } from "@/components/common/safe-html";
import { Button } from "@/components/ui/button";
import { FaqList, getVisibleFaqGroups } from "@/features/faq";
import { getSiteSettings, whatsappHref } from "@/features/site";
import { markdownToPlainText } from "@/lib/markdown";
import { jsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sık sorulan sorular",
  description:
    "Randevu ve iptal, kalıcı oje, jel ve protez tırnak farkı, dayanım, bakım ve hijyen hakkında en çok sorulan sorular ve cevapları.",
  path: "/sss",
});

/** SCR-011 (Z-10): questions grouped by category; FAQPage data mirrors the visible answers. */
export default async function FaqPage() {
  const [groups, settings] = await Promise.all([getVisibleFaqGroups(), getSiteSettings()]);
  const questions = groups.flatMap((group) => group.items);

  return (
    <article className="container-page section-y">
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={[{ label: "SSS", href: "/sss" }]} />
        <h1 className="mt-8 text-4xl font-medium tracking-tight md:text-5xl">
          Sık sorulan sorular
        </h1>
        <p className="mt-4 max-w-prose text-lg text-muted-foreground">
          Randevu, uygulamalar, bakım ve hijyen hakkında en çok sorulanlar. Cevabını bulamadığınız
          soruyu WhatsApp&apos;tan sorabilirsiniz.
        </p>

        <div className="mt-12">
          {questions.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-surface p-8 text-center">
              Sorular şu an yüklenemedi. Sorunuzu WhatsApp&apos;tan iletebilirsiniz.
            </p>
          ) : (
            <FaqList groups={groups} />
          )}
        </div>

        <section
          aria-labelledby="sss-iletisim"
          className="mt-16 rounded-2xl bg-surface-muted p-6 md:p-8"
        >
          <h2 id="sss-iletisim" className="text-2xl font-medium">
            Sorunuz listede yok mu?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Aklınızdaki tasarımın fotoğrafını da ekleyerek yazabilirsiniz.
          </p>
          <Button asChild size="lg" className="mt-6">
            <a href={whatsappHref(settings, "[Demo site] Merhaba, bir sorum var: ")}>
              <MessageCircle aria-hidden="true" />
              WhatsApp&apos;tan sorun
            </a>
          </Button>
        </section>
      </div>

      {questions.length > 0 && (
        <JsonLd
          json={jsonLd({
            "@type": "FAQPage",
            mainEntity: questions.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: markdownToPlainText(item.answer) },
            })),
          })}
        />
      )}
    </article>
  );
}
