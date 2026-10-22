import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { FaqForm } from "@/features/faq/forms";

export const metadata: Metadata = { title: "Yeni soru" };

export default function NewFaqPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "İçerik", href: "/panel/icerik" }]} current="Yeni soru" />
      <h1 className="mt-4 text-3xl font-medium">Yeni soru</h1>
      <div className="mt-8">
        <FaqForm />
      </div>
    </>
  );
}
