import type { Route } from "next";

/**
 * Main navigation (Z-12). A page joins the menu in the slice that ships it
 * (15-git-ve-ci §2).
 */
export type NavItem = { href: Route; label: string };

export const siteNav: readonly NavItem[] = [
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/galeri", label: "Galeri" },
  { href: "/hakkinda", label: "Hakkında" },
  { href: "/sss", label: "SSS" },
  { href: "/iletisim", label: "İletişim" },
];
