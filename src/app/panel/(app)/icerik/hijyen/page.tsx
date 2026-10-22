import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { getContentBlock, StepsForm } from "@/features/content";

export const metadata: Metadata = { title: "Hijyen kartı" };

/** SCR-108: the home page "Hijyen kartı" block (content_blocks.hygiene). */
export default async function EditStepsPage() {
  const block = await getContentBlock("hygiene");
  return (
    <>
      <Breadcrumbs items={[{ label: "İçerik", href: "/panel/icerik" }]} current="Hijyen kartı" />
      <h1 className="mt-4 text-3xl font-medium">Hijyen kartı</h1>
      <div className="mt-8">
        <StepsForm
          blockKey="hygiene"
          initial={block}
          noteLabel="Belge notu (örn. hijyen eğitimi belgesi no)"
        />
      </div>
    </>
  );
}
