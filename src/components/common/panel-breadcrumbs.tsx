import type { Route } from "next";
import Link from "next/link";

/** Panel breadcrumb: visible trail only (panel pages are noindex, no structured data). */
export function Breadcrumbs({
  items,
  current,
}: {
  items: readonly { label: string; href: Route }[];
  current: string;
}) {
  return (
    <nav aria-label="Sayfa yolu" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-x-2">
        {items.map((item) => (
          <li key={item.href} className="flex items-center gap-2">
            <Link
              href={item.href}
              className="inline-flex min-h-11 min-w-11 items-center underline-offset-4 hover:underline lg:min-h-0 lg:min-w-0"
            >
              {item.label}
            </Link>
            <span aria-hidden="true">/</span>
          </li>
        ))}
        <li aria-current="page" className="font-semibold text-foreground">
          {current}
        </li>
      </ol>
    </nav>
  );
}
