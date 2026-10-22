import { connection } from "next/server";
import { Suspense } from "react";

import { listClosedDays } from "@/features/booking";
import { describeOpenStatus, openStatus, type SiteSettings } from "@/features/site";
import { cn } from "@/lib/utils";
import { logger } from "@/server/logger";

type Hours = SiteSettings["openingHours"];

async function OpenNowStatus({ hours }: { hours: Hours }) {
  // Request time, not build time: the rest of the page stays static (Cache Components).
  await connection();
  const now = new Date();
  // Closures entered in the panel close the whole day too; the site still works without them.
  const closed = await listClosedDays(now).catch((error: unknown) => {
    logger.error("open_now.closures_failed", { error: String(error) });
    return [];
  });
  const status = openStatus({ ...hours, holidays: [...hours.holidays, ...closed] }, now);
  return (
    <>
      <span
        aria-hidden="true"
        className={cn("size-2.5 rounded-full", status.open ? "bg-success" : "bg-muted-foreground")}
      />
      {describeOpenStatus(status)}
    </>
  );
}

/**
 * "Şu an açık · Kapanış 20:00" (REQ-016). Streams in after the static shell; the placeholder
 * keeps the same height so nothing shifts.
 */
export function OpenNow({ hours, className }: { hours: Hours; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex min-h-8 items-center gap-2 rounded-full bg-surface px-3 py-1 text-sm font-semibold",
        className,
      )}
    >
      <Suspense fallback={<span className="text-muted-foreground">Çalışma durumu…</span>}>
        <OpenNowStatus hours={hours} />
      </Suspense>
    </p>
  );
}
