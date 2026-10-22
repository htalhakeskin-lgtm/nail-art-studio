import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { getContentBlock } from "@/features/content";
import { AboutForm } from "@/features/content/forms";

export const metadata: Metadata = { title: "Hakkında metni" };

export default async function EditAboutPage() {
  const about = await getContentBlock("about");
  return (
    <>
      <Breadcrumbs items={[{ label: "İçerik", href: "/panel/icerik" }]} current="Hakkında metni" />
      <h1 className="mt-4 text-3xl font-medium">Hakkında metni</h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Kaydettiğinizde Hakkında sayfası ve ana sayfadaki “Stüdyo” bölümü hemen güncellenir.
      </p>
      <div className="mt-8">
        <AboutForm initial={about} />
      </div>
    </>
  );
}
