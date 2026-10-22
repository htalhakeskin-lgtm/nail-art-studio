import type { Metadata } from "next";

import { SignInForm } from "@/features/panel/forms";

export const metadata: Metadata = { title: "Giriş" };

// Rendered per request: the nonce-based CSP needs every script tag stamped (11-guvenlik §8).
export const instant = false;

export default async function SignInPage({ searchParams }: PageProps<"/panel/giris">) {
  const params = await searchParams;
  const returnTo = typeof params.donus === "string" ? params.donus : undefined;
  const notice = params.hata === "yetki" ? "Bu hesabın panele erişim yetkisi yok." : undefined;

  return (
    <main id="icerik" className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* lang="en": CSS uppercase under lang="tr" would turn the English brand into "NAİL" */}
        <p
          lang="en"
          className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase"
        >
          Nail Art Studios
        </p>
        <h1 className="mt-2 text-3xl font-medium">Panele giriş</h1>
        <SignInForm returnTo={returnTo} notice={notice} />
      </div>
    </main>
  );
}
