"use client";

import Link from "next/link";

type ErrorPageProps = { error: Error & { digest?: string }; retry: () => void };

/** Z-11: section-level error page. The digest is the support code that also appears in the logs. */
export default function SiteError({ error, retry }: ErrorPageProps) {
  return (
    <section className="container-page section-y">
      <div className="mx-auto max-w-prose text-center">
        <h1 className="text-3xl font-medium md:text-4xl">Bir sorun oluştu</h1>
        <p className="mt-4 text-muted-foreground">
          Sayfa şu an açılamadı. Birkaç saniye sonra tekrar deneyebilirsiniz.
          {error.digest && <> Destek kodu: {error.digest}</>}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={retry}
            className="min-h-12 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
          >
            Tekrar dene
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-full border border-input px-6 font-semibold"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </section>
  );
}
