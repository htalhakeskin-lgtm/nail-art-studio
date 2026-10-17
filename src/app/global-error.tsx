"use client";

import "./globals.css";

type GlobalErrorProps = { error: Error & { digest?: string }; retry: () => void };

/** Z-11: last-resort 500 page when the root layout itself fails. Replaces <html>. */
export default function GlobalError({ error, retry }: GlobalErrorProps) {
  return (
    <html lang="tr">
      <body className="flex min-h-dvh items-center justify-center p-4">
        <main className="max-w-prose text-center">
          <h1 className="text-3xl font-medium">Bir sorun oluştu</h1>
          <p className="mt-4 text-muted-foreground">
            Site şu an açılamadı. Lütfen birkaç saniye sonra tekrar deneyin.
            {error.digest && <> Destek kodu: {error.digest}</>}
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-8 min-h-12 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
          >
            Tekrar dene
          </button>
        </main>
      </body>
    </html>
  );
}
