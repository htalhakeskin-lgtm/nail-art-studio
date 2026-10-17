import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { FaqForm, getFaqForPanel } from "@/features/faq";

export const metadata: Metadata = { title: "Soruyu düzenle" };

export default async function EditFaqPage({ params }: PageProps<"/panel/icerik/sss/[id]">) {
  const { id } = await params;
  // Unknown or malformed ids look the same: not found (11-guvenlik: no existence leaks).
  const faq = z.uuid().safeParse(id).success ? await getFaqForPanel(id) : null;
  if (!faq) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: "İçerik", href: "/panel/icerik" }]} current="Soruyu düzenle" />
      <h1 className="mt-4 text-3xl font-medium">Soruyu düzenle</h1>
      <div className="mt-8">
        <FaqForm
          initial={{
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            isVisible: faq.isVisible,
          }}
        />
      </div>
    </>
  );
}
