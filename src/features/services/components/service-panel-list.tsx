import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";

import { moveServiceForm, toggleServiceActiveForm } from "../actions";
import { type PriceDisplay, visiblePrice } from "../domain/price";
import type { Service } from "../queries";
import { serviceCategories, serviceCategoryLabels } from "../schemas";

/**
 * Panel service list (SCR-105): cards grouped by category on every width. Actions are plain
 * forms bound to server actions, so they work before hydration.
 */
export function ServicePanelList({
  items,
  priceDisplay,
}: {
  items: Service[];
  priceDisplay: PriceDisplay;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-surface p-8 text-center">
        <p className="font-semibold">Henüz hizmet eklenmedi</p>
        <p className="mt-1 text-sm text-muted-foreground">
          En çok istenen hizmetinizi ekleyerek başlayın.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {serviceCategories.map((category) => {
        const group = items.filter((item) => item.category === category);
        if (group.length === 0) return null;
        return (
          <section key={category} aria-labelledby={`hizmet-${category}`}>
            <h3 id={`hizmet-${category}`} className="font-sans text-sm font-bold">
              {serviceCategoryLabels[category]}
            </h3>
            <ul className="mt-3 space-y-3">
              {group.map((service, index) => {
                const price = visiblePrice(service, priceDisplay);
                return (
                  <li
                    key={service.id}
                    className="flex flex-col gap-3 rounded-xl border bg-surface p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold break-words">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(service.durationMinutes)}
                        {price ? ` · ${price}` : " · fiyat gizli"}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {!service.isActive && (
                          <span className="rounded-full bg-warning-muted px-2.5 py-0.5 text-xs font-semibold text-warning">
                            Gizli: sitede görünmüyor
                          </span>
                        )}
                        {!service.isBookable && (
                          <span className="rounded-full bg-info-muted px-2.5 py-0.5 text-xs font-semibold text-info">
                            Online randevuya kapalı
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <form action={moveServiceForm}>
                        <input type="hidden" name="id" value={service.id} />
                        <input type="hidden" name="direction" value="up" />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon-sm"
                          disabled={index === 0}
                          aria-label={`Yukarı taşı: ${service.name}`}
                        >
                          <ArrowUp aria-hidden="true" />
                        </Button>
                      </form>
                      <form action={moveServiceForm}>
                        <input type="hidden" name="id" value={service.id} />
                        <input type="hidden" name="direction" value="down" />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon-sm"
                          disabled={index === group.length - 1}
                          aria-label={`Aşağı taşı: ${service.name}`}
                        >
                          <ArrowDown aria-hidden="true" />
                        </Button>
                      </form>
                      <form action={toggleServiceActiveForm}>
                        <input type="hidden" name="id" value={service.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          aria-label={`${service.isActive ? "Gizle" : "Göster"}: ${service.name}`}
                        >
                          {service.isActive ? (
                            <EyeOff aria-hidden="true" />
                          ) : (
                            <Eye aria-hidden="true" />
                          )}
                          {service.isActive ? "Gizle" : "Göster"}
                        </Button>
                      </form>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/panel/hizmetler/${service.id}` as Route}
                          aria-label={`Düzenle: ${service.name}`}
                        >
                          <Pencil aria-hidden="true" />
                          Düzenle
                        </Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
