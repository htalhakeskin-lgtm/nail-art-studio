import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { listServicesForPanel } from "@/features/services";
import { getTestimonialForPanel, TestimonialForm } from "@/features/testimonials";

export const metadata: Metadata = { title: "Yorumu düzenle" };

export default async function EditTestimonialPage({ params }: PageProps<"/panel/yorumlar/[id]">) {
  const { id } = await params;
  // Unknown or malformed ids look the same: not found (11-guvenlik: no existence leaks).
  const [item, services] = await Promise.all([
    z.uuid().safeParse(id).success ? getTestimonialForPanel(id) : null,
    listServicesForPanel(),
  ]);
  if (!item) notFound();

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Yorumlar", href: "/panel/yorumlar" }]}
        current="Yorumu düzenle"
      />
      <h1 className="mt-4 text-3xl font-medium">Yorumu düzenle</h1>
      <div className="mt-8">
        <TestimonialForm
          services={services.map(({ id: serviceId, name }) => ({ id: serviceId, name }))}
          initial={{
            id: item.id,
            displayName: item.displayName,
            body: item.body,
            serviceId: item.serviceId ?? "",
            isSample: item.isSample,
            isVisible: item.isVisible,
          }}
        />
      </div>
    </>
  );
}
