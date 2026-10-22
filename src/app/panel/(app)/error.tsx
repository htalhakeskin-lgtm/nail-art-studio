"use client";

import Link from "next/link";

type ErrorPageProps = { error: Error & { digest?: string }; retry: () => void };

/** Panel error state (13-yonetim-paneli, REQ-022): the menu stays, the screen offers a retry. */
export default function PanelError({ error, retry }: ErrorPageProps) {
  return (
    <div className="max-w-prose">
      <h1 className="text-3xl font-medium">Bu ekran açılamadı</h1>
      <p className="mt-3 text-muted-foreground">
        Bağlantı ya da sunucu kaynaklı geçici bir sorun olabilir. Girdiğiniz bilgiler
        kaydedilmediyse tekrar denemeniz gerekebilir.
        {error.digest && <> Destek kodu: {error.digest}</>}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={retry}
          className="min-h-11 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
        >
          Tekrar dene
        </button>
        <Link
          href="/panel"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-input px-6 font-semibold"
        >
          Bugün ekranına dön
        </Link>
      </div>
    </div>
  );
}
