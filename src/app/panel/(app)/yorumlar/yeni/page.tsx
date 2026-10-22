import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { listServicesForPanel } from "@/features/services";
import { TestimonialForm } from "@/features/testimonials";

export const metadata: Metadata = { title: "Yeni yorum" };

export default async function NewTestimonialPage() {
  const services = await listServicesForPanel();
  return (
    <>
      <Breadcrumbs items={[{ label: "Yorumlar", href: "/panel/yorumlar" }]} current="Yeni yorum" />
      <h1 className="mt-4 text-3xl font-medium">Yeni yorum</h1>
      <div className="mt-8">
        <TestimonialForm services={services.map(({ id, name }) => ({ id, name }))} />
      </div>
    </>
  );
}
