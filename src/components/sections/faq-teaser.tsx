import Link from "next/link";

import { Button } from "@/components/ui/button";
import { type FaqGroup, FaqList } from "@/features/faq";

/** Home §10 (plan §6): four common questions; the location half joins with D-02. */
export function FaqTeaser({ groups }: { groups: FaqGroup[] }) {
  const first = groups.flatMap((group) => group.items).slice(0, 4);
  if (first.length === 0) return null;
  const teaser: FaqGroup[] = [{ category: "randevu", items: first }];

  return (
    <section aria-labelledby="sss-ozet" className="container-page section-y">
      <div className="mx-auto max-w-3xl">
        <h2 id="sss-ozet" className="text-3xl font-medium md:text-4xl">
          Sık sorulan sorular
        </h2>
        <div className="mt-6">
          <FaqList groups={teaser} showCategories={false} />
        </div>
        <Button asChild variant="outline" size="lg" className="mt-8">
          <Link href="/sss">Tüm soruları görün</Link>
        </Button>
      </div>
    </section>
  );
}
