import { Quote } from "lucide-react";

import type { PublicTestimonial } from "@/features/testimonials";

/**
 * Home §9 (plan §6, REQ-014, V-01): 3–6 review cards in a row the visitor scrolls by hand (no
 * autoplay carousel). Sample reviews say so on the card; no Review / AggregateRating JSON-LD.
 */
export function HomeTestimonials({ items }: { items: PublicTestimonial[] }) {
  const shown = items.slice(0, 6);
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="yorumlar-baslik" className="section-y">
      <div className="container-page">
        <h2 id="yorumlar-baslik" className="text-3xl font-medium md:text-5xl">
          Müşterilerimiz ne diyor
        </h2>
        {shown.some((item) => item.isSample) && (
          <p className="mt-3 text-sm text-muted-foreground">
            Gösterim amaçlı demo: aşağıdaki yorumlar örnektir.
          </p>
        )}
      </div>
      {/* Keyboard users scroll the row once it has focus (WCAG 2.1.1, axe scrollable-region). */}
      <ul
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable region
        tabIndex={0}
        aria-label="Yorumlar, yana kaydırılabilir"
        className="container-page mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto pb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:scroll-px-6 lg:scroll-px-8"
      >
        {shown.map((item) => (
          <li
            key={item.id}
            className="flex w-[85%] shrink-0 snap-start flex-col rounded-2xl border bg-surface p-6 sm:w-[22rem]"
          >
            <Quote aria-hidden="true" className="size-6 text-brand" />
            <blockquote className="mt-3 flex-1 text-lg break-words">{item.body}</blockquote>
            <p className="mt-5 font-semibold">{item.displayName}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {item.serviceName && <span>Hizmet: {item.serviceName}</span>}
              {item.isSample && (
                <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                  Örnek yorum
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
