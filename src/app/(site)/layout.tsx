import { SiteAnalytics } from "@/components/common/site-analytics";
import { SiteShell } from "@/components/layout/site-shell";
import { env } from "@/lib/env";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      {env.VERCEL && <SiteAnalytics />}
    </>
  );
}
