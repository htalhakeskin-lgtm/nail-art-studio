import type { Metadata } from "next";

import { MarkdownContent } from "@/components/common/markdown";
import { env } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

import { type LegalDocumentKey, legalDocuments } from "../documents";
import { getLegalDocument } from "../queries";

export async function legalMetadata(key: LegalDocumentKey): Promise<Metadata> {
  const { meta } = await getLegalDocument(key);
  const { path, description } = legalDocuments[key];
  return pageMetadata({ title: meta.baslik, description, path });
}

export async function LegalPage({ documentKey }: { documentKey: LegalDocumentKey }) {
  const { meta, body } = await getLegalDocument(documentKey);
  return (
    <article className="container-page section-y">
      <div className="mx-auto max-w-prose">
        {env.DEMO_MODE && (
          <p
            role="note"
            className="mb-8 rounded-lg border border-warning/30 bg-warning-muted px-4 py-3 text-sm"
          >
            Örnek metindir; yayından önce hukuki incelemeden geçirilecektir.
          </p>
        )}
        <MarkdownContent>{body}</MarkdownContent>
        <p className="mt-12 border-t border-border pt-4 text-sm text-muted-foreground">
          Sürüm {meta.surum} · Yürürlük tarihi {formatDate(meta.yururluk)}
        </p>
      </div>
    </article>
  );
}
