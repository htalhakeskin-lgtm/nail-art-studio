import { MapPin, Navigation } from "lucide-react";
import Link from "next/link";

import { OpenNow } from "@/components/common/open-now";
import { Button } from "@/components/ui/button";
import { directionsHref, type SiteSettings } from "@/features/site";
import { env } from "@/lib/env";

/**
 * Home §10 location half (plan §6): address, the live "open now" line and directions. The map
 * itself stays on /iletisim so the home page never loads the map library.
 */
export function LocationTeaser({ settings }: { settings: SiteSettings }) {
  const { company } = settings;
  return (
    <section aria-labelledby="konum-ozet" className="reveal container-page pb-(--section-y)">
      <div className="mx-auto grid max-w-5xl gap-6 rounded-[2rem] bg-linear-to-br from-nane via-surface-muted to-lila p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div>
          <h2 id="konum-ozet" className="text-3xl font-medium md:text-4xl">
            Moda&apos;da, iskeleye yürüme mesafesinde
          </h2>
          <p className="mt-4 flex items-start gap-2">
            <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
            <span>
              {company.address}
              {env.DEMO_MODE && (
                <span className="text-sm text-muted-foreground"> (örnek adres)</span>
              )}
            </span>
          </p>
          <OpenNow hours={settings.openingHours} className="mt-4" />
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild size="lg">
            <a href={directionsHref(settings)} target="_blank" rel="noopener noreferrer">
              <Navigation aria-hidden="true" />
              Yol tarifi
              <span className="sr-only"> (yeni sekmede açılır)</span>
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/iletisim">Harita ve ulaşım</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
