<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Nail Art Studios · Bahadır Karasu

> **Sistem:** web-proje 1.0.0 · **Seviye:** S2 · **Hesap modeli:** B (misafir randevu) · **Varyant:** V1 · **Ortam:** Demo (kişiye özel)

## Proje

Kadıköy'de Bahadır Karasu'nun işlettiği nail art stüdyosu için mobil öncelikli site + yönetim paneli. İşler galeri gibi sergilenir; ana dönüşüm akışı galeriden ya da hizmetten **online randevu** (tek uzman, onay beklemeli) ve **WhatsApp** (API'siz `wa.me`, bağlamlı mesaj). Fiyat gösterilmez. İşletmeci adı, Instagram (@bahadirkarasunails) ve telefon (0542 311 58 88) gerçek; geri kalan içerik örnek.

- Plan (tek doğru kaynak): [docs/proje-plani.md](docs/proje-plani.md)
- İlerleme ve sıradaki dilim: [docs/ilerleme.md](docs/ilerleme.md)
- Kalite kapıları: [docs/kalite-kapilari.md](docs/kalite-kapilari.md)
- Standartlar (salt okunur kopya): [docs/standartlar/](docs/standartlar/README.md)

## Komutlar

| Komut | Ne yapar |
|---|---|
| `docker compose up -d` | Yerel PostgreSQL |
| `pnpm dev` | Geliştirme sunucusu |
| `pnpm db:generate` / `pnpm db:migrate` | Migration üret / uygula |
| `pnpm auth:generate` | Better Auth tablolarını yeniden üret (eklenti / alan değişince; ardından `db:generate`) |
| `pnpm db:seed` / `pnpm db:reset` | Demo verisini yükle / sıfırla ve yeniden yükle |
| `pnpm lint` · `pnpm typecheck` · `pnpm format:check` | Statik denetim |
| `pnpm test` | Birim + entegrasyon (Vitest) |
| `pnpm test:e2e` | Uçtan uca (Playwright: masaüstü + mobil, a11y, mobil taşma) |
| `pnpm check` | CI'daki denetimlerin e2e dışındaki tamamı |
| `pnpm analyze` | Paket boyutu analizi (rota başına ilk yük JS) |
| `pnpm screenshots` · `pnpm mockup` | Portfolyo ekran görüntüleri · cihaz mockup'ları |

## Klasörler

```
src/app/(site)/      herkese açık sayfalar (URL'ler Türkçe)
src/app/panel/       yönetim paneli (noindex)
src/app/api/         webhook, cron, sağlık, auth
src/features/<x>/    actions.ts · queries.ts · schemas.ts · domain/ · components/ · index.ts
src/components/      ui/ (shadcn) · layout/ · common/ · sections/
src/server/          db/ · auth.config.ts + auth.ts · action.ts · channels/ · rate-limit.ts · logger.ts
src/lib/             env.ts · public-env.ts · format.ts · money.ts · phone.ts · text.ts · result.ts · seo.ts
src/config/          limits.ts (P-) · rules.ts (BR → mesaj) · permissions.ts · site-defaults.ts
content/             yasal metinler, statik içerik
tests/e2e/           Playwright
scripts/             seed, reset, auth-schema-tz
portfolyo/           screenshot/ · mockup/ · araclar/ · ekranlar.json · portfolyo.md
```

## Projeye özgü notlar

- **Firma bilgileri:** `site_settings` tablosu (panelden değişir); varsayılanlar `src/config/site-defaults.ts`.
- **İş kuralları ve parametreler:** plan §9; mesajlar `src/config/rules.ts`, parametreler `src/config/limits.ts`, mantık ilgili `domain/` klasörleri.
- **Next.js:** bu sürümün belgeleri `node_modules/next/dist/docs/` altında; API'den emin değilsen önce orayı oku.
- **Demo:** `DEMO_MODE=true` → noindex, demo şeridi, dış kanallar demo kutusuna (`/panel/demo-kutusu`).
- **Randevu çakışması** veritabanındaki dışlama kısıtıyla korunur (`ex_appointments_staff_overlap`, aralık `[starts_at, blocked_until)`); `23P01` → `BR-RND-003`. Uygulama tarafı kontrol yarışı yakalamaz.
- **Fiyat gösterilmez** (K-05, BR-HZM-001): `price_display = contact` iken tutar sayfada, JSON-LD'de, WhatsApp şablonunda ve e-postada görünmez.
- **Türkçe ek:** değişken değere ek getirilmez (`{owner}'nun` değil, "Nail artist: {owner}"). **CSS uppercase** `lang="tr"` altında İngilizce kelimeyi bozar ("NAİL"): İngilizce marka adını büyütürken öğeye `lang="en"` ver.
- **Panel ve nonce CSP:** panel sayfaları istek başına render edilmeli (`export const instant = false` + oturum okuma); statik kabuktaki betikler nonce taşımaz. `tests/e2e/panel.spec.ts` bunu denetler.
- **Site ayarları** `getSiteSettings()` ile `"use cache"` + `cacheTag("site-settings")`; ayar değiştiren panel eylemi `updateTag(SITE_SETTINGS_TAG)` çağırır.
- **Entegrasyon testleri** `tests/integration/` altında, gerçek PostgreSQL'de (`app_test`, `.env.test`; `.env.local` yüklenmez). Açılışta migration'lar yalnızca `*_test` adlı veritabanına uygulanır. Oturum (`@/server/auth`), IP (`@/server/request`) ve `next/cache` `vi.mock` ile sahte; veritabanı asla sahte değil.
- **Yerel ortam:** PostgreSQL `localhost:5434` (5432/5433 başka projelerde). `pnpm typecheck` önce `next typegen` çalıştırır (CI'da `.next` yok).
- **pnpm 12:** kurulum betiği politikası `allowBuilds` (eski `ignoredBuiltDependencies` değil); `minimumReleaseAge` 3 gün.
- **Next.js 16.4:** `error.tsx` `retry` alır (`reset` değil); `middleware` yerine `proxy.ts`.

## Kurallar

<!-- web-proje/KURALLAR.md v1.0.0, 2026-10-16'da gömüldü. Değiştirilmez; projeye özgü sapma plan K- kararı olur. -->

### A. Çalışma biçimi

1. **Plan anayasadır.** `docs/proje-plani.md` tek doğru kaynaktır. Plana aykırı bir şey yapılacaksa önce plan güncellenir (K- kararı), sonra kod yazılır.
2. **Önce plan, sonra kod.** Her dilimin başında dokunulacak dosyalar ve adımlar `docs/ilerleme.md`'ye yazılır. Planda olmayan kütüphane sorulmadan eklenmez.
3. **Dikey dilim.** Bir özellik; veri, sunucu, ekran (mobil + masaüstü), test ve belgesiyle birlikte biter. "Önce tüm tablolar, sonra tüm ekranlar" yapılmaz.
4. **Mobilde doğrulanmamış iş bitmemiştir.** Her bileşen önce 360 px için yazılır, sonra büyütülür. "Masaüstünü bitir, sonra mobile uyarla" yasaktır.
5. **Varsay, yaz, devam et.** Kritik belirsizlikte en fazla 5 kısa soru (yalnızca Faz 0). Cevap yoksa makul varsayım yapılır ve planın "Varsayımlar" bölümüne yazılır.
6. **Kapsam kontrollü büyür.** Yeni fikir plana P2 olarak yazılır; seviye zaman kutusunu aşan iş onaysız eklenmez ([karar mantığı](docs/standartlar/00-karar-mantigi.md)).
7. **Her dilim sonunda** `docs/ilerleme.md` güncellenir: ne bitti, ne kaldı, öğrenilen ders.

### B. Varsayılan teknoloji yığını (değişmezse sorulmaz)

Next.js (App Router) · TypeScript strict · Tailwind CSS 4 · shadcn/ui · PostgreSQL (Neon; yerelde Docker) · Drizzle ORM · Zod (istemci + sunucu aynı şema) · Better Auth (hesap gerekiyorsa) · Resend · MapLibre GL · Motion · date-fns · Vitest · Playwright · pnpm · Vercel. Sapma gerekirse ADR yazılır ([01-teknoloji-yigini](docs/standartlar/01-teknoloji-yigini.md)).

### C. Her projede zorunlu kalite

| Konu | Kural |
|---|---|
| Mobil | Mobil öncelikli CSS; 360–1536 px'te yatay kaydırma yok; dokunma hedefi ≥ 44 × 44 px; telefonda tablo yerine kart; giriş alanları ≥ 16 px. |
| Türkçe | Arayüz Türkçe, kod/commit/veritabanı adları İngilizce. `<html lang="tr">`. Harf dönüşümü ve sıralama `tr-TR` ile. Değişken değere Türkçe ek getirilmez ("Ankara'ya" değil "Hedef: Ankara"). |
| Biçimler | Para kuruş cinsinden tam sayı saklanır, `1.234,56 ₺` gösterilir. Zaman UTC saklanır, `Europe/Istanbul` gösterilir. Telefon E.164 saklanır, `0532 123 45 67` gösterilir. Biçimlendirme yalnızca `lib/format` ile. |
| Doğrulama | Aynı Zod şeması formda ve sunucuda. Sunucu her girdiyi yeniden doğrular. |
| Güvenlik | Her sunucu eylemi: doğrulama + yetki + gerekiyorsa hız sınırı. Sahiplik kontrolü (başkasının kaydına erişim) testli. Gizli bilgi kodda ve depoda yok. |
| Erişilebilirlik | WCAG 2.2 AA hedefi: klavyeyle tam kullanım, görünür odak, etiketli alanlar, yeterli kontrast, `prefers-reduced-motion`. |
| Yasal | Kişisel veri toplayan her formda aydınlatma bağlantısı ve onay kaydı. Onay verilmeden izleme betiği yüklenmez. Yasal metinler şablondur, hukuki inceleme ister. |
| SEO | Herkese açık her sayfada title, description, canonical, Open Graph ve uygun JSON-LD. Demo sitelerde `noindex`. |
| Durumlar | Her ekranın yükleniyor, boş ve hata durumu tasarlanır. Form hatasında girilen veri kaybolmaz. |
| Demo | `DEMO_MODE=true` iken dış kanallar (e-posta, SMS, WhatsApp API, ödeme) gerçek gönderim yapmaz, "demo kutusuna" yazar. Kurgusal içerik açıkça işaretlenir. |

### D. Asla yapma

- `.env*` dosyasını, anahtarı, parolayı depoya koyma.
- `any` kullanma; dış veriyi `unknown` alıp Zod ile daralt.
- Tutarı `Number()`/`parseFloat()` ile ayrıştırma, kayan noktayla hesaplama; `lib/money` kullan.
- Argümansız `toLocaleLowerCase()`, `toLocaleUpperCase()`, `localeCompare()` kullanma.
- Görüntülenecek metni JS ile büyük harfe çevirme; büyük harf yalnızca CSS ile ve kısa etiketlerde.
- `dangerouslySetInnerHTML` kullanma (yalnızca sunucuda temizlenmiş zengin metin için tek yardımcı bileşen istisnadır).
- Migration'sız şema değişikliği yapma; canlıda `drizzle-kit push` kullanma.
- Test yazmadan yetki, sahiplik veya ödeme kodu değiştirme.
- `transform` ve `opacity` dışında bir özelliği animasyonla değiştirme.
- Lorem ipsum, gerçek kişi verisi, gerçek marka logosu, lisansı belirsiz görsel kullanma.
- Kurgusal yorumlar için `Review` / `AggregateRating` yapılandırılmış verisi basma.
- Kullanıcıyı hesap açmaya zorlama (hesap modeli planda D değilse).
- Çerez onayı olmadan analitik, piksel veya harita dışı üçüncü taraf betik yükleme.
- `console.log` bırakma; yorum satırına alınmış kod bırakma; numarasız `TODO` yazma.

### E. Nereye bakmalı

| Görev | Önce oku |
|---|---|
| Yeni ekran / bileşen | [06-arayuz](docs/standartlar/06-arayuz.md), [07-mobil](docs/standartlar/07-mobil.md), [08-erisilebilirlik](docs/standartlar/08-erisilebilirlik.md) |
| Tablo, migration, seed | [04-veri](docs/standartlar/04-veri.md), [17-icerik-ve-demo-verisi](docs/standartlar/17-icerik-ve-demo-verisi.md) |
| Form, sunucu eylemi, API | [05-sunucu-ve-api](docs/standartlar/05-sunucu-ve-api.md), [11-guvenlik](docs/standartlar/11-guvenlik.md) |
| Herkese açık sayfa | [09-seo](docs/standartlar/09-seo.md), [12-performans](docs/standartlar/12-performans.md) |
| Form, çerez, üyelik, ödeme | [10-yasal-ve-kvkk](docs/standartlar/10-yasal-ve-kvkk.md) |
| Yönetim paneli | [13-yonetim-paneli](docs/standartlar/13-yonetim-paneli.md) |
| Test | [14-test](docs/standartlar/14-test.md) |
| Commit, PR, CI | [15-git-ve-ci](docs/standartlar/15-git-ve-ci.md) |
| Ortam, yayın, demo → canlı | [16-ortamlar-ve-yayin](docs/standartlar/16-ortamlar-ve-yayin.md) |
| Belge, numara, ADR | [18-dokumantasyon](docs/standartlar/18-dokumantasyon.md) |
| Portfolyo çıktıları | [19-portfolyo](docs/standartlar/19-portfolyo.md) |
| Bir işin bitip bitmediği | `docs/kalite-kapilari.md` |
| Next.js API'si (sürüme özgü) | `node_modules/next/dist/docs/`; eğitim verisindeki eski API'ye güvenme |
