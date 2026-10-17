/**
 * Demo data (04-veri §11, 17-icerik-ve-demo-verisi). Deterministic and idempotent:
 * running it twice gives the same result. Dates are relative to "today" so the demo
 * always looks alive. Run with: pnpm db:seed   (tsx --conditions=react-server)
 */
import { loadEnvConfig } from "@next/env";

// Load .env.local before any module that validates the environment is imported.
loadEnvConfig(process.cwd());

async function main() {
  const { env } = await import("@/lib/env");
  const { db } = await import("@/server/db/client");
  const { accounts, contentBlocks, faqs, leads, siteSettings, users } =
    await import("@/server/db/schema");
  const { contentBlockDefaults } = await import("@/content/content-blocks");
  const { seedFaqs } = await import("@/content/faqs");
  const { count } = await import("drizzle-orm");
  const { newId } = await import("@/server/db/columns");
  const { siteDefaults } = await import("@/config/site-defaults");
  const { hashPassword } = await import("better-auth/crypto");

  /** Small deterministic PRNG (mulberry32) so every reset produces the same demo. */
  function random(seed: number) {
    let state = seed;
    return () => {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = random(20261016);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(rand() * items.length)] as T;
  const daysAgo = (days: number, hour = 10) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - days);
    date.setUTCHours(hour - 3, Math.floor(rand() * 60), 0, 0); // hour in Istanbul time
    return date;
  };

  async function seedSettings() {
    await db
      .insert(siteSettings)
      .values({ id: "singleton", ...siteDefaults })
      .onConflictDoNothing();
  }

  async function seedDemoAdmin() {
    if (!env.DEMO_MODE || !env.DEMO_ADMIN_EMAIL || !env.DEMO_ADMIN_PASSWORD) return;
    const userId = newId();
    const inserted = await db
      .insert(users)
      .values({
        id: userId,
        name: "Bahadır Karasu",
        email: env.DEMO_ADMIN_EMAIL,
        emailVerified: true,
        role: "owner",
      })
      .onConflictDoNothing()
      .returning({ id: users.id });
    if (inserted.length === 0) return; // already there
    await db.insert(accounts).values({
      id: newId(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: await hashPassword(env.DEMO_ADMIN_PASSWORD),
    });
  }

  async function seedContentBlocks() {
    // Existing rows are kept: the owner may already have edited them in the panel.
    const rows = Object.entries(contentBlockDefaults).map(([key, value]) => ({ key, value }));
    await db.insert(contentBlocks).values(rows).onConflictDoNothing();
  }

  async function seedFaqRows() {
    // Only into an empty table: re-running the seed never duplicates or overwrites panel edits.
    const [existing] = await db.select({ value: count() }).from(faqs);
    if ((existing?.value ?? 0) > 0) return;
    const orders = new Map<string, number>();
    await db.insert(faqs).values(
      seedFaqs.map((faq) => {
        const sortOrder = (orders.get(faq.category) ?? 0) + 10;
        orders.set(faq.category, sortOrder);
        return { ...faq, isVisible: faq.isVisible ?? true, sortOrder };
      }),
    );
  }

  async function seedLeads() {
    // Fictional people only; phones use the 000 block, e-mails example.com (17 §3).
    const names = [
      "Ayşe K.",
      "Mehmet Y.",
      "Elif D.",
      "Can T.",
      "Zeynep A.",
      "Burak Ş.",
      "Selin Ö.",
      "Emre Ç.",
    ];
    const kinds = ["contact", "contact", "callback"] as const;
    const statuses = ["new", "new", "contacted", "closed", "lost"] as const;
    const sources = ["/", "/iletisim", "/hizmetler", "/galeri"];
    const messages = [
      "Krom efektli kalıcı oje için fiyat bilgisi alabilir miyim?",
      "Protez tırnak dolgusu için bu hafta uygun saatiniz var mı?",
      "Düğün için gelin tırnağı düşünüyorum, tasarımı birlikte konuşabilir miyiz?",
      "Kendi tırnağıma jel güçlendirme yapılabilir mi, ne kadar sürer?",
      "Instagram'daki lila baby boomer tasarımın aynısını istiyorum.",
    ];
    const rows = Array.from({ length: 24 }, (_, index) => ({
      code: `TLP-${new Date().getFullYear()}-${String(index + 1).padStart(4, "0")}`,
      kind: pick(kinds),
      status: pick(statuses),
      name: pick(names),
      phone: `+90532000${String(1000 + index).slice(-4)}`,
      email: `ornek${index + 1}@example.com`,
      message: index === 3 ? "Çok uzun bir mesaj örneği: ".repeat(20) : pick(messages),
      sourcePath: pick(sources),
      utm: index % 3 === 0 ? { source: "instagram", medium: "social" } : null,
      createdAt: daysAgo(Math.floor(rand() * 90)),
    }));
    await db.insert(leads).values(rows).onConflictDoNothing();
  }

  await seedSettings();
  await seedContentBlocks();
  await seedFaqRows();
  await seedDemoAdmin();
  await seedLeads();
  console.log("✓ Seed tamamlandı");
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
