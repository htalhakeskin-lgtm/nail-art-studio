import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ruleMessages } from "@/config/rules";
import {
  listServicesForPanel,
  priceDisplayLabels,
  ServicePanelList,
  setPriceDisplayForm,
} from "@/features/services";
import { getSiteSettings } from "@/features/site";

export const metadata: Metadata = { title: "Hizmetler" };

const savedMessages: Record<string, string> = {
  hizmet: "Hizmet kaydedildi. Sitedeki hizmet sayfaları güncellendi.",
  fiyat: "Fiyat gösterimi güncellendi.",
};

/** SCR-105: the service menu, its order and the site-wide price display (P-08, K-05). */
export default async function PanelServicesPage({ searchParams }: PageProps<"/panel/hizmetler">) {
  const [{ kaydedildi, hata }, items, settings] = await Promise.all([
    searchParams,
    listServicesForPanel(),
    getSiteSettings(),
  ]);
  const saved = typeof kaydedildi === "string" ? savedMessages[kaydedildi] : undefined;
  const error =
    typeof hata === "string"
      ? hata in ruleMessages
        ? ruleMessages[hata as keyof typeof ruleMessages]
        : "Bu işlem için yetkiniz yok ya da bir sorun oluştu."
      : undefined;
  const display = settings.pricing.display;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-medium">Hizmetler</h1>
        <Button asChild size="sm">
          <Link href="/panel/hizmetler/yeni">
            <Plus aria-hidden="true" />
            Yeni hizmet
          </Link>
        </Button>
      </div>
      {saved && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-success-muted px-4 py-3 font-semibold text-success"
        >
          {saved}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger"
        >
          {error}
        </p>
      )}

      <section aria-labelledby="fiyat-gosterimi" className="mt-6 rounded-xl border bg-surface p-4">
        <h2 id="fiyat-gosterimi" className="font-sans text-sm font-bold">
          Sitede fiyat gösterimi
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Şu an: <strong>{priceDisplayLabels[display]}</strong>. Hizmet formunda tek tek
          değiştirebilirsiniz. WhatsApp mesajlarında fiyat hiçbir zaman yazmaz.
        </p>
        <form action={setPriceDisplayForm} className="mt-3">
          <input type="hidden" name="display" value={display === "show" ? "contact" : "show"} />
          <Button type="submit" variant="outline" size="sm">
            {display === "show" ? "Fiyatları gizle" : "Fiyatları göster"}
          </Button>
        </form>
      </section>

      <div className="mt-8">
        <ServicePanelList items={items} priceDisplay={display} />
      </div>
    </>
  );
}
