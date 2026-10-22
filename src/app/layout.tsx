import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";

import { DemoBanner } from "@/components/layout/demo-banner";
import { getSiteSettings } from "@/features/site";
import { publicEnv } from "@/lib/public-env";

// latin-ext is mandatory for ğ, ş, ı, İ (06-arayuz §4).
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  axes: ["SOFT"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { seo, company } = await getSiteSettings();
  return {
    metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
    title: { template: seo.titleTemplate, default: seo.defaultTitle },
    description: seo.defaultDescription,
    applicationName: company.name,
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#fff7fb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${fraunces.variable} ${manrope.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
