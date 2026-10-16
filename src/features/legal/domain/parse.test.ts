import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { legalDocuments } from "../documents";
import { parseLegalDocument } from "./parse";

const sample = `---
baslik: Çerez Politikası
surum: 1.2
yururluk: 2026-10-16
---

<!--
editor note
-->

# Çerez Politikası


Metin.
`;

describe("parseLegalDocument", () => {
  it("reads the front matter and strips editor comments", () => {
    const { meta, body } = parseLegalDocument(sample);
    expect(meta).toEqual({ baslik: "Çerez Politikası", surum: "1.2", yururluk: "2026-10-16" });
    expect(body).toBe("# Çerez Politikası\n\nMetin.");
  });

  it("rejects a document without front matter", () => {
    expect(() => parseLegalDocument("# Başlık")).toThrow(/front matter/);
  });

  it("rejects a placeholder date left from the template", () => {
    expect(() => parseLegalDocument(sample.replace("2026-10-16", "{YYYY-AA-GG}"))).toThrow();
  });

  it.each(Object.values(legalDocuments))("$file is filled in and has one h1", ({ file }) => {
    const raw = readFileSync(path.join(process.cwd(), "content", "yasal", file), "utf8");
    const { body } = parseLegalDocument(raw);
    expect(body.match(/^# /gm)).toHaveLength(1);
    expect(body).not.toMatch(/\{[^}]*\}/); // no template placeholders such as {Unvan}
  });
});
