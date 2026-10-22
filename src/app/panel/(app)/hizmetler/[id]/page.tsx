import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { getServiceForPanel, toServiceFormValues } from "@/features/services";
import { ServiceForm } from "@/features/services/forms";

export const metadata: Metadata = { title: "Hizmeti düzenle" };

export default async function EditServicePage({ params }: PageProps<"/panel/hizmetler/[id]">) {
  const { id } = await params;
  // Unknown or malformed ids look the same: not found (11-guvenlik: no existence leaks).
  const service = z.uuid().safeParse(id).success ? await getServiceForPanel(id) : null;
  if (!service) notFound();

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Hizmetler", href: "/panel/hizmetler" }]}
        current={service.name}
      />
      <h1 className="mt-4 text-3xl font-medium break-words">{service.name}</h1>
      <div className="mt-8">
        <ServiceForm initial={toServiceFormValues(service)} />
      </div>
    </>
  );
}
