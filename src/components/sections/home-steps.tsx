import { ShieldCheck } from "lucide-react";

import type { ContentBlock } from "@/features/content";

/** Home §6 (plan §6, REQ-015, V-16): the visit in four steps, text from the panel. */
export function HomeProcess({ block }: { block: ContentBlock<"process"> }) {
  return (
    <section aria-labelledby="surec-baslik" className="reveal container-page section-y">
      <h2 id="surec-baslik" className="text-3xl font-medium md:text-5xl">
        {block.heading}
      </h2>
      {block.intro && (
        <p className="mt-4 max-w-prose text-lg text-muted-foreground">{block.intro}</p>
      )}
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {block.steps.map((step, index) => (
          <li key={step.title} className="rounded-2xl border bg-surface p-5">
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-accent font-display text-lg text-brand"
            >
              {index + 1}
            </span>
            <h3 className="mt-4 text-xl font-medium">{step.title}</h3>
            <p className="mt-2 text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
      {block.note && <p className="mt-6 text-sm text-muted-foreground">{block.note}</p>}
    </section>
  );
}

/** Home §7 (plan §6, REQ-013, V-15): sterilisation and single-use materials, from the panel. */
export function HomeHygiene({ block }: { block: ContentBlock<"hygiene"> }) {
  return (
    <section aria-labelledby="hijyen-baslik" className="bg-nane/60 section-y">
      <div className="reveal container-page grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <ShieldCheck aria-hidden="true" className="size-10 text-brand" />
          <h2 id="hijyen-baslik" className="mt-4 text-3xl font-medium md:text-5xl">
            {block.heading}
          </h2>
          {block.intro && <p className="mt-4 max-w-prose text-lg">{block.intro}</p>}
          {block.note && (
            <p className="mt-6 inline-flex rounded-full bg-surface px-4 py-1.5 text-sm font-semibold">
              {block.note}
            </p>
          )}
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {block.steps.map((step) => (
            <li key={step.title} className="rounded-2xl bg-surface p-5 shadow-sm">
              <h3 className="text-lg font-medium">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
