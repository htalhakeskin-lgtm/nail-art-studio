import { Camera, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { FramedImage } from "@/components/common/framed-image";
import { MarkdownContent } from "@/components/common/markdown";
import { Button } from "@/components/ui/button";
import { demoImages } from "@/content/demo-images";
import { getContentBlock } from "@/features/content";
import { getSiteSettings, instagramHref, whatsappHref } from "@/features/site";
import { env } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { company } = await getSiteSettings();
  return pageMetadata({
    title: `Hakkında: ${company.owner}`,
    description:
      "Nail Art Studios'un çalışma yaklaşımı: tasarımı birlikte seçmek, tırnak sağlığını korumak ve temiz çalışmak. Kadıköy, Moda.",
    path: "/hakkinda",
  });
}

/** SCR-009 (Z-08): the operator and the studio's approach, copy from content_blocks.about. */
export default async function AboutPage() {
  const [settings, about] = await Promise.all([getSiteSettings(), getContentBlock("about")]);
  const instagram = instagramHref(settings);

  return (
    <article className="container-page section-y">
      <Breadcrumbs items={[{ label: "Hakkında", href: "/hakkinda" }]} />

      <header className="mt-8 grid items-end gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          {/* Editable text may hold English words: no CSS uppercase under lang="tr" ("NAİL"). */}
          <p className="text-sm font-semibold tracking-[0.12em] text-muted-foreground">
            {about.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-6xl">
            {settings.company.owner}
          </h1>
          <div className="max-w-prose text-lg text-muted-foreground">
            <MarkdownContent>{about.intro}</MarkdownContent>
          </div>
          {env.DEMO_MODE && (
            <p
              role="note"
              className="mt-6 rounded-lg border border-warning/30 bg-warning-muted px-4 py-3 text-sm"
            >
              Bu metin örnektir; işletmecinin kendi anlatımıyla değiştirilecek. Görseller
              temsilîdir.
            </p>
          )}
        </div>
        <FramedImage image={demoImages.aboutPalette} sizes="(min-width: 1024px) 36rem, 100vw" lcp />
      </header>

      <section aria-labelledby="yaklasim" className="mt-16 md:mt-24">
        <h2 id="yaklasim" className="text-3xl font-medium md:text-4xl">
          Nasıl çalışıyoruz
        </h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {about.sections.map((section, index) => (
            <li key={section.title} className="border-t-2 border-brand pt-5">
              <p className="font-display text-sm text-brand tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-xl font-medium">{section.title}</h3>
              <div className="text-muted-foreground">
                <MarkdownContent>{section.body}</MarkdownContent>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-label="İletişim"
        className="mt-16 grid items-center gap-10 md:mt-24 md:grid-cols-[1fr_1.2fr] md:gap-16"
      >
        <FramedImage image={demoImages.aboutPainting} sizes="(min-width: 768px) 40vw, 100vw" />
        <div>
          <div className="max-w-prose text-lg">
            <MarkdownContent>{about.closing}</MarkdownContent>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={whatsappHref(settings)}>
                <MessageCircle aria-hidden="true" />
                WhatsApp&apos;tan yazın
              </a>
            </Button>
            {instagram && (
              <Button asChild size="lg" variant="outline">
                <a href={instagram} target="_blank" rel="noopener noreferrer">
                  <Camera aria-hidden="true" />
                  Instagram&apos;daki işler
                  <span className="sr-only"> (yeni sekmede açılır)</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>
    </article>
  );
}
