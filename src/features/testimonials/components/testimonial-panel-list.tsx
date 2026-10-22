import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { moveTestimonialForm, toggleTestimonialVisibilityForm } from "../actions";
import type { Testimonial } from "../queries";

/**
 * Panel list (SCR-107): cards on every width. Actions are plain forms bound to server actions,
 * so they work before hydration. Order here is the order on the home page.
 */
export function TestimonialPanelList({ items }: { items: Testimonial[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-surface p-8 text-center">
        <p className="font-semibold">Henüz yorum eklenmedi</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Müşterinin izniyle bir yorum ekleyin; ana sayfada görünür.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="flex flex-col gap-3 rounded-xl border bg-surface p-4 sm:flex-row sm:items-center"
        >
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{item.displayName}</p>
            <p className="mt-1 line-clamp-2 text-sm break-words text-muted-foreground">
              {item.body}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.isSample && (
                <span className="inline-flex rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold">
                  Örnek yorum
                </span>
              )}
              {!item.isVisible && (
                <span className="inline-flex rounded-full bg-warning-muted px-2.5 py-0.5 text-xs font-semibold text-warning">
                  Gizli: sitede görünmüyor
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <form action={moveTestimonialForm}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="direction" value="up" />
              <Button
                type="submit"
                variant="ghost"
                size="icon-sm"
                disabled={index === 0}
                aria-label={`Yukarı taşı: ${item.displayName}`}
              >
                <ArrowUp aria-hidden="true" />
              </Button>
            </form>
            <form action={moveTestimonialForm}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="direction" value="down" />
              <Button
                type="submit"
                variant="ghost"
                size="icon-sm"
                disabled={index === items.length - 1}
                aria-label={`Aşağı taşı: ${item.displayName}`}
              >
                <ArrowDown aria-hidden="true" />
              </Button>
            </form>
            <form action={toggleTestimonialVisibilityForm}>
              <input type="hidden" name="id" value={item.id} />
              {/* aria-label starts with the visible word (WCAG 2.5.3 label in name). */}
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                aria-label={`${item.isVisible ? "Gizle" : "Göster"}: ${item.displayName}`}
              >
                {item.isVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                {item.isVisible ? "Gizle" : "Göster"}
              </Button>
            </form>
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/panel/yorumlar/${item.id}` as Route}
                aria-label={`Düzenle: ${item.displayName}`}
              >
                <Pencil aria-hidden="true" />
                Düzenle
              </Link>
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
