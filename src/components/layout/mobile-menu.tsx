"use client";

import { Camera, Menu, MessageCircle, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Drawer, type DrawerHandle, drawerTrigger, openDrawer } from "@/components/ui/drawer";
import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  items: readonly NavItem[];
  whatsappHref: string;
  phoneHref: string;
  instagramHref: string | null;
};

/**
 * Phone menu (07-mobil §4): side drawer on a native modal dialog (focus trap, Esc, scroll lock).
 * Links close the drawer; contact actions repeat the bottom bar for reach.
 */
export function MobileMenu({ items, whatsappHref, phoneHref, instagramHref }: MobileMenuProps) {
  const pathname = usePathname();
  const links: readonly NavItem[] = [{ href: "/", label: "Ana sayfa" }, ...items];
  const drawer = useRef<DrawerHandle>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => drawer.current?.close();

  // A navigation (back / forward too) never leaves the drawer open over the new page.
  useEffect(() => {
    drawer.current?.close();
  }, [pathname]);

  return (
    <>
      <Button
        ref={trigger}
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Menüyü aç"
        {...drawerTrigger("mobil-menu")}
        onClick={() => {
          openDrawer(drawer);
        }}
      >
        <Menu aria-hidden="true" className="size-6" />
      </Button>
      <Drawer
        ref={drawer}
        id="mobil-menu"
        side="right"
        labelledBy="mobil-menu-baslik"
        returnFocus={trigger}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 id="mobil-menu-baslik" className="text-xl">
              Menü
            </h2>
            <Button variant="ghost" size="icon" aria-label="Menüyü kapat" onClick={close}>
              <X aria-hidden="true" className="size-5" />
            </Button>
          </div>
          <nav aria-label="Mobil menü" className="px-3 py-3">
            <ul>
              {links.map((link) => {
                const current = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 items-center rounded-lg px-3 font-display text-xl hover:bg-surface-muted",
                        current && "text-brand",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col gap-2 border-t px-5 py-5">
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
          </div>
        </div>
      </Drawer>
    </>
  );
}
