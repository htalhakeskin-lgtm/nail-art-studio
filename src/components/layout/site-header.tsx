import { MessageCircle } from "lucide-react";
import Link from "next/link";

import { getSiteSettings, whatsappHref } from "@/features/site";

/**
 * Sticky header (Z-12). Navigation links are added slice by slice as their pages ship
 * (15-git-ve-ci §2: a screen joins the menu with its last part). On phones the WhatsApp
 * action lives in the bottom action bar instead.
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
        <a
          href={whatsappHref(settings)}
          className="hidden min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity duration-(--duration-fast) hover:opacity-90 md:inline-flex"
        >
          <MessageCircle aria-hidden="true" className="size-4" />
          WhatsApp&apos;tan yazın
        </a>
      </div>
    </header>
  );
}
