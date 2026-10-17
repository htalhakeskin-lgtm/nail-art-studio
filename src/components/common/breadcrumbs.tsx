import type { Route } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/common/safe-html";
import { absoluteUrl, jsonLd } from "@/lib/seo";

export type Crumb = { label: string; href: Route };

/**
 * Visible breadcrumb + matching BreadcrumbList JSON-LD (Z-18, 09-seo §4): the structured data
 * only ever describes what the page shows. The last item is the current page.
 */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  const trail: readonly Crumb[] = [{ label: "Ana sayfa", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Sayfa yolu" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {trail.map((crumb, index) => {
            const last = index === trail.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="font-semibold text-foreground">
                    {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.href}
                      className="inline-flex min-h-11 min-w-11 items-center underline-offset-4 hover:underline lg:min-h-0 lg:min-w-0"
                    >
                      {crumb.label}
                    </Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        json={jsonLd({
          "@type": "BreadcrumbList",
          itemListElement: trail.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.label,
            item: absoluteUrl(crumb.href),
          })),
        })}
      />
    </>
  );
}
