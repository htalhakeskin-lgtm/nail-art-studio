import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { ServiceForm } from "@/features/services";

export const metadata: Metadata = { title: "Yeni hizmet" };

export default function NewServicePage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: "Hizmetler", href: "/panel/hizmetler" }]}
        current="Yeni hizmet"
      />
      <h1 className="mt-4 text-3xl font-medium">Yeni hizmet</h1>
      <div className="mt-8">
        <ServiceForm />
      </div>
    </>
  );
}
