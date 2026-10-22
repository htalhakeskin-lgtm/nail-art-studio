import { like } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sessionFor } from "./helpers";

// D-11: the consent records screen and its CSV (REQ-019, SCR-111). The session is stubbed; the
// database is real (14-test §2).
const mocks = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/server/auth", () => ({ getSession: mocks.getSession }));

const { db } = await import("@/server/db/client");
const { consentRecords, leads } = await import("@/server/db/schema");
const { listConsentRecords } = await import("@/features/consents");
const { GET } = await import("@/app/panel/(app)/onaylar/csv/route");

beforeEach(async () => {
  await db.delete(consentRecords);
  await db.delete(leads).where(like(leads.code, "TLP-2099-%")); // only this file's leads
  mocks.getSession.mockResolvedValue(sessionFor("owner"));
});

async function seed() {
  const [lead] = await db
    .insert(leads)
    .values({ code: "TLP-2099-0001", kind: "contact", name: "Ayşe K.", message: "Merhaba" })
    .returning({ id: leads.id });
  if (!lead) throw new Error("setup failed");
  await db.insert(consentRecords).values([
    {
      kind: "information_notice",
      granted: true,
      textVersion: "kvkk-1.0+form-1.0",
      source: "contactForm",
      subjectRef: lead.id,
      ipHash: "abc123",
      createdAt: new Date("2026-10-20T09:00:00Z"),
    },
    {
      kind: "information_notice",
      granted: true,
      textVersion: "=cmd|calc",
      source: "appointmentForm",
      subjectRef: "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b",
      createdAt: new Date("2026-10-21T09:00:00Z"),
    },
  ]);
  return lead.id;
}

describe("listConsentRecords (REQ-019)", () => {
  it("lists newest first and links each record to its request when it still exists", async () => {
    const leadId = await seed();
    const { items, total } = await listConsentRecords(1);
    expect(total).toBe(2);
    expect(items.map((item) => item.source)).toEqual(["appointmentForm", "contactForm"]);
    expect(items[0]?.subject).toBeNull();
    expect(items[1]?.subject).toEqual({ type: "lead", id: leadId, code: "TLP-2099-0001" });
  });
});

describe("GET /panel/onaylar/csv (SCR-111)", () => {
  it("answers 404 to visitors and to staff without audit.view", async () => {
    await seed();
    mocks.getSession.mockResolvedValue(null);
    expect((await GET()).status).toBe(404);
    mocks.getSession.mockResolvedValue(sessionFor("staff"));
    expect((await GET()).status).toBe(404);
  });

  it("downloads every record as a Turkish spreadsheet file with formulas defused", async () => {
    await seed();
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("content-disposition")).toMatch(
      /^attachment; filename="onay-kayitlari-\d{4}-\d{2}-\d{2}\.csv"$/,
    );
    const lines = (await response.text())
      .replace(/^\uFEFF/, "")
      .trim()
      .split("\r\n");
    expect(lines[0]).toBe("Tarih;Kaynak;Tür;Verildi;Metin sürümü;Kayıt no;Kayıt kimliği;IP özeti");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain(";Randevu formu;Aydınlatma metni bildirildi;Evet;'=cmd|calc;;");
    expect(lines[2]).toContain(";İletişim formu;");
    expect(lines[2]).toContain(";TLP-2099-0001;");
  });
});
