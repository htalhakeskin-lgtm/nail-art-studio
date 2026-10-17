import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { moveFaqForm, toggleFaqVisibilityForm } from "../actions";
import type { Faq } from "../queries";
import { faqCategories, faqCategoryLabels } from "../schemas";

/**
 * Panel list (SCR-108): cards on every width (13-yonetim-paneli §5: few columns, long text).
 * Actions are plain forms bound to server actions, so they work before hydration.
 */
export function FaqPanelList({ items }: { items: Faq[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-surface p-8 text-center">
        <p className="font-semibold">Henüz soru eklenmedi</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ziyaretçilerin en sık sorduğu soruyu ekleyerek başlayın.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {faqCategories.map((category) => {
        const group = items.filter((item) => item.category === category);
        if (group.length === 0) return null;
        return (
          <section key={category} aria-labelledby={`kategori-${category}`}>
            <h3 id={`kategori-${category}`} className="font-sans text-sm font-bold">
              {faqCategoryLabels[category]}
            </h3>
            <ul className="mt-3 space-y-3">
              {group.map((faq, index) => (
                <li
                  key={faq.id}
                  className="flex flex-col gap-3 rounded-xl border bg-surface p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold break-words">{faq.question}</p>
                    {!faq.isVisible && (
                      <p className="mt-1 inline-flex rounded-full bg-warning-muted px-2.5 py-0.5 text-xs font-semibold text-warning">
                        Gizli: sitede görünmüyor
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <form action={moveFaqForm}>
                      <input type="hidden" name="id" value={faq.id} />
                      <input type="hidden" name="direction" value="up" />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === 0}
                        aria-label={`Yukarı taşı: ${faq.question}`}
                      >
                        <ArrowUp aria-hidden="true" />
                      </Button>
                    </form>
                    <form action={moveFaqForm}>
                      <input type="hidden" name="id" value={faq.id} />
                      <input type="hidden" name="direction" value="down" />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === group.length - 1}
                        aria-label={`Aşağı taşı: ${faq.question}`}
                      >
                        <ArrowDown aria-hidden="true" />
                      </Button>
                    </form>
                    <form action={toggleFaqVisibilityForm}>
                      <input type="hidden" name="id" value={faq.id} />
                      {/* aria-label starts with the visible word (WCAG 2.5.3 label in name). */}
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        aria-label={`${faq.isVisible ? "Gizle" : "Göster"}: ${faq.question}`}
                      >
                        {faq.isVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                        {faq.isVisible ? "Gizle" : "Göster"}
                      </Button>
                    </form>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/panel/icerik/sss/${faq.id}` as Route}
                        aria-label={`Düzenle: ${faq.question}`}
                      >
                        <Pencil aria-hidden="true" />
                        Düzenle
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
