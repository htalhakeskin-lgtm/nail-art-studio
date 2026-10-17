import Link from "next/link";

import { FramedImage } from "@/components/common/framed-image";
import { MarkdownContent } from "@/components/common/markdown";
import { Button } from "@/components/ui/button";
import { demoImages } from "@/content/demo-images";
import type { ContentBlock } from "@/features/content";
import type { SiteSettings } from "@/features/site";

/** Home §8 (plan §6): the person behind the studio, linking to the about page. */
export function AboutTeaser({
  settings,
  about,
}: {
  settings: SiteSettings;
  about: ContentBlock<"about">;
}) {
  return (
    <section aria-labelledby="studyo-baslik" className="bg-surface-muted section-y">
      <div className="container-page grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <FramedImage image={demoImages.aboutBrush} sizes="(min-width: 768px) 40vw, 100vw" />
        <div>
          {/* Editable text may hold English words: no CSS uppercase under lang="tr" ("NAİL"). */}
          <p className="text-sm font-semibold tracking-[0.12em] text-muted-foreground">
            {about.eyebrow}
          </p>
          <h2 id="studyo-baslik" className="mt-3 text-3xl font-medium md:text-4xl">
            {settings.company.owner}
          </h2>
          <div className="max-w-prose text-lg">
            <MarkdownContent>{about.intro}</MarkdownContent>
          </div>
          <Button asChild variant="outline" size="lg" className="mt-8">
            <Link href="/hakkinda">Çalışma yaklaşımımızı okuyun</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
