import type { Metadata } from "next";

/** The whole panel is private: never indexed (G-01), strict nonce CSP from src/proxy.ts. */
export const metadata: Metadata = {
  title: { template: "%s · Panel · Nail Art Studios", default: "Panel · Nail Art Studios" },
  robots: { index: false, follow: false },
};

export default function PanelRootLayout({ children }: LayoutProps<"/panel">) {
  return <div className="flex flex-1 flex-col bg-background">{children}</div>;
}
