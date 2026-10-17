import type { ReactNode } from "react";

import { MobileActionBar } from "./mobile-action-bar";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { SkipLink } from "./skip-link";

/**
 * Public site chrome (Z-12, Z-14), shared by the (site) layout and the root 404 page.
 * The bottom padding on phones reserves room for the fixed action bar so it never covers
 * the footer (tests/e2e/responsive.spec.ts).
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <div className="flex flex-1 flex-col pb-[calc(var(--action-bar-h)+env(safe-area-inset-bottom))] md:pb-0">
        <SiteHeader />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
      <MobileActionBar />
    </>
  );
}
