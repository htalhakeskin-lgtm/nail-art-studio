import type { Route } from "next";

/**
 * Main navigation (Z-12). A page joins the menu in the slice that ships it
 * (15-git-ve-ci §2): Hizmetler (D-03), Galeri (D-08), SSS (D-01b), İletişim (D-02).
 */
export type NavItem = { href: Route; label: string };

export const siteNav: readonly NavItem[] = [{ href: "/hakkinda", label: "Hakkında" }];
