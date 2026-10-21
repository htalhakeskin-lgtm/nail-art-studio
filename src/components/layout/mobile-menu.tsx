"use client";

import { Camera, Menu, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  items: readonly NavItem[];
  whatsappHref: string;
  phoneHref: string;
  instagramHref: string | null;
};

/**
 * Phone menu (07-mobil §4): side drawer with focus trap, Esc to close and scroll lock
 * (Radix Dialog). Links close the drawer; contact actions repeat the bottom bar for reach.
 */
export function MobileMenu({ items, whatsappHref, phoneHref, instagramHref }: MobileMenuProps) {
  const pathname = usePathname();
  const links: readonly NavItem[] = [{ href: "/", label: "Ana sayfa" }, ...items];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menüyü aç">
          <Menu aria-hidden="true" className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(20rem,85vw)] gap-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-xl">Menü</SheetTitle>
          <SheetDescription className="sr-only">Sayfalar ve iletişim seçenekleri</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobil menü" className="px-3 py-3">
          <ul>
            {links.map((link) => {
              const current = pathname === link.href;
              return (
                <li key={link.href}>
                  <SheetClose asChild>
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 items-center rounded-lg px-3 font-display text-xl hover:bg-surface-muted",
                        current && "text-brand",
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                </li>
              );
            })}
          </ul>
        </nav>
        <SheetFooter className="border-t px-5 py-5">
          <Button asChild size="lg">
            <a href={whatsappHref}>
              <MessageCircle aria-hidden="true" />
              WhatsApp&apos;tan yazın
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={phoneHref}>
              <Phone aria-hidden="true" />
              Ara
            </a>
          </Button>
          {instagramHref && (
            <Button asChild size="lg" variant="ghost">
              <a href={instagramHref} target="_blank" rel="noopener noreferrer">
                <Camera aria-hidden="true" />
                Instagram
                <span className="sr-only"> (yeni sekmede açılır)</span>
              </a>
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
