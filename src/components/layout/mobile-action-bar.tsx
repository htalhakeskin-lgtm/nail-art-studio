import { CalendarHeart, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { directionsHref, getSiteSettings, phoneHref, whatsappHref } from "@/features/site";

/**
 * Phone-only bottom action bar (Z-14, 07-mobil §4): "Randevu al" first and filled, then
 * WhatsApp, call and directions. The site layout reserves --action-bar-h below the footer so
 * the bar never covers content.
 */
export async function MobileActionBar() {
  const settings = await getSiteSettings();
  const item =
    "flex min-h-(--action-bar-h) flex-col items-center justify-center gap-1 text-xs font-semibold";
  return (
    <nav
      aria-label="Hızlı işlemler"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4">
        <li>
          {/* Full cell, no padding: the bar keeps exactly --action-bar-h (site-shell reserve). */}
          <Link href="/randevu" className={`${item} bg-primary text-primary-foreground`}>
            <CalendarHeart aria-hidden="true" className="size-5" />
            Randevu al
          </Link>
        </li>
        <li>
          <a href={whatsappHref(settings)} className={`${item} text-brand`}>
            <MessageCircle aria-hidden="true" className="size-5" />
            WhatsApp
          </a>
        </li>
        <li>
          <a href={phoneHref(settings)} className={item}>
            <Phone aria-hidden="true" className="size-5" />
            Ara
          </a>
        </li>
        <li>
          <a
            href={directionsHref(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className={item}
          >
            <MapPin aria-hidden="true" className="size-5" />
            Yol tarifi
            <span className="sr-only"> (yeni sekmede açılır)</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
