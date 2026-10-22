import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { getContentBlock } from "@/features/content";
import { StepsForm } from "@/features/content/forms";

export const metadata: Metadata = { title: "Nasıl ilerliyoruz" };

/** SCR-108: the home page "Nasıl ilerliyoruz" block (content_blocks.process). */
export default async function EditStepsPage() {
  const block = await getContentBlock("process");
  return (
    <>
      <Breadcrumbs
        items={[{ label: "İçerik", href: "/panel/icerik" }]}
        current="Nasıl ilerliyoruz"
      />
      <h1 className="mt-4 text-3xl font-medium">Nasıl ilerliyoruz</h1>
      <div className="mt-8">
        <StepsForm blockKey="process" initial={block} />
      </div>
    </>
  );
}
