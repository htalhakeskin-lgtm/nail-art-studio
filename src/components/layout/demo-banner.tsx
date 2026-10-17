import { env } from "@/lib/env";

/**
 * Shown on every page while DEMO_MODE=true (02-mimari §5, Z-06). Server component: the flag
 * never reaches the browser bundle. Kept visible in portfolio screenshots (19-portfolyo §3).
 */
export function DemoBanner() {
  if (!env.DEMO_MODE) return null;
  return (
    <div role="note" className="bg-primary px-4 py-2 text-center text-sm text-primary-foreground">
      Gösterim amaçlı demo — adres, hizmet ayrıntıları, yorumlar, görseller ve randevular örnektir.
    </div>
  );
}
