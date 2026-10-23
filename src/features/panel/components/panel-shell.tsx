import {
  CalendarClock,
  CalendarDays,
  ExternalLink,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Quote,
  Scissors,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { signOut } from "../actions";

/**
 * Panel chrome (13-yonetim-paneli §3). From 1024 px: top bar with links. Below: bottom tab bar
 * (plan §12): Bugün · Randevular · Talepler · Galeri · Site; the rest from the "Bugün" page,
 * which lists every module (rarely used ones are not in the top bar either).
 */
const links = [
  { href: "/panel", label: "Bugün", icon: LayoutDashboard },
  { href: "/panel/randevular", label: "Randevular", icon: CalendarDays },
  { href: "/panel/talepler", label: "Talepler", icon: MessagesSquare },
  { href: "/panel/galeri", label: "Galeri", icon: Images },
  // The phone tab bar has five slots; the rest are linked from the overview page.
  { href: "/panel/hizmetler", label: "Hizmetler", icon: Scissors, tab: false },
  { href: "/panel/musaitlik", label: "Müsaitlik", icon: CalendarClock, tab: false },
  { href: "/panel/icerik", label: "İçerik", icon: FileText, tab: false },
  { href: "/panel/yorumlar", label: "Yorumlar", icon: Quote, tab: false },
  { href: "/panel/onaylar", label: "Onaylar", icon: ShieldCheck, tab: false, top: false },
  { href: "/panel/ayarlar", label: "Ayarlar", icon: Settings, tab: false },
  { href: "/panel/demo-kutusu", label: "Demo kutusu", icon: Inbox, tab: false, top: false },
] as const;

export function PanelShell({ userName, children }: { userName: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
      <header className="border-b border-border bg-surface">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-4 xl:gap-6">
            <Link
              href="/panel"
              className="inline-flex min-h-11 items-center font-display text-lg whitespace-nowrap"
            >
              <span className="lg:hidden xl:inline">Nail Art Studios ·&nbsp;</span>Panel
            </Link>
            <nav aria-label="Panel" className="hidden lg:block">
              <ul className="flex">
                {links
                  .filter((link) => !("top" in link))
                  .map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold whitespace-nowrap hover:bg-surface-muted xl:px-3"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm whitespace-nowrap text-muted-foreground sm:inline lg:hidden 2xl:inline">
              {userName}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold whitespace-nowrap hover:bg-surface-muted"
              >
                <LogOut aria-hidden="true" className="size-4" />
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="icerik" className="container-page flex-1 py-8">
        {children}
      </main>

      <nav
        aria-label="Panel kısayolları"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {links
            .filter((link) => !("tab" in link))
            .map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold"
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {label}
                </Link>
              </li>
            ))}
          <li>
            <Link
              href="/"
              className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold"
            >
              <ExternalLink aria-hidden="true" className="size-5" />
              Site
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
