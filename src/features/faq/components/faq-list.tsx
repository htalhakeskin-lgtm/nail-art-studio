import { ChevronDown } from "lucide-react";

import { MarkdownContent } from "@/components/common/markdown";

import type { FaqGroup } from "../queries";
import { faqCategoryLabels } from "../schemas";

type FaqListProps = {
  groups: FaqGroup[];
  /** Category headings on the FAQ page; the home teaser shows a flat list. */
  showCategories?: boolean;
};

/**
 * Native <details> accordion (Z-10): keyboard and screen-reader support without JavaScript,
 * and answers stay in the page for search engines. Only the chevron animates (transform).
 */
export function FaqList({ groups, showCategories = true }: FaqListProps) {
  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section
          key={group.category}
          aria-labelledby={showCategories ? `sss-${group.category}` : undefined}
        >
          {showCategories && (
            <h2 id={`sss-${group.category}`} className="text-2xl font-medium md:text-3xl">
              {faqCategoryLabels[group.category]}
            </h2>
          )}
          <div className="mt-4 divide-y border-y">
            {group.items.map((item) => (
              <details key={item.id} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0 text-brand transition-transform duration-(--duration-base) group-open:rotate-180"
                  />
                </summary>
                <div className="max-w-prose pb-5 text-muted-foreground">
                  <MarkdownContent>{item.answer}</MarkdownContent>
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
