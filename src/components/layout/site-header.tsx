import { MessageCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteNav } from "@/config/navigation";
import { getSiteSettings, instagramHref, phoneHref, whatsappHref } from "@/features/site";

import { MobileMenu } from "./mobile-menu";
import { SiteNav } from "./site-nav";

/**
 * Sticky header (Z-12, 07-mobil §4). Phone: logo + menu button (contact actions also live in
 * the bottom action bar). Desktop: logo, navigation and the WhatsApp action.
 */
export async function SiteHeader() {
  const settings = await getSiteSettings();
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex min-h-11 flex-col justify-center leading-none">
          <span className="font-display text-xl font-semibold tracking-tight">
            {settings.company.name}
          </span>
          <span className="mt-1 text-[0.7rem] tracking-[0.2em] text-muted-foreground uppercase">
            {settings.company.owner}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteNav items={siteNav} />
          <Button asChild className="hidden md:inline-flex">
            <a href={whatsappHref(settings)}>
              <MessageCircle aria-hidden="true" />
              WhatsApp&apos;tan yazın
            </a>
          </Button>
          <MobileMenu
            items={siteNav}
            whatsappHref={whatsappHref(settings)}
            phoneHref={phoneHref(settings)}
            instagramHref={instagramHref(settings)}
          />
        </div>
      </div>
    </header>
  );
}
