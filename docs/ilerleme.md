# İlerleme — Nail Art Studios · Bahadır Karasu

> **Son güncelleme:** 2026-10-22 · **Faz:** 4 (geliştirme) · **Sıradaki dilim:** D-02

## Şu an

- **Etkin dilim:** D-08 galeri ✅ (PR açık) → sıradaki D-02
- **Son yapılan:** R-01 pastel tema + canlı Pexels görselleri (K-28); D-08 galeri: 27 eser, stil / renk / uzunluk filtresi, eser sayfası, ana sayfa seçkisi ve stil kartları, panel galeri (yayımla / seçkiye ekle); 130 Vitest (20 entegrasyon) + 184 e2e
- **Sıradaki adım:** `/web-proje devam` → D-02: iletişim sayfası + form → `leads` → panel talep kutusu, teşekkür ekranı, harita + yol tarifi, ulaşım, "şu an açık", `NailSalon` JSON-LD

## Gözetimsiz çalışma notları

- 2026-10-16 — Kullanıcı "tam yetkin var başla" dedi; Faz 0'da soru sorulmadı. Marka adı "Nail Art Studios" (VR-01), tek uzman (VR-02), kurgusal Kadıköy / Moda adresi (VR-03), onay beklemeli randevu (VR-10) varsayıldı. Sistem kuralı gereği plan onayında duruldu.
- 2026-10-22 — Kullanıcı görselleri ve renkleri beğenmedi; "pinterestten olabilir" dedi, galeride işlere göre kategori / filtre önerdi, "tam yetkin var". Pinterest lisans ve başkasının işi sorunu nedeniyle kullanılmadı (K-28); kategoriler planda zaten olan galeri dilimine (D-08) taşındı ve dilim öne alındı.
- 2026-10-16 — `kur` komutu plan onayı sayıldı (K-17). P1 bütçe aşımı ayrıca teyit edilmedi; "tam yetki" beyanıyla dahil sayıldı, D-10'dan önce hatırlatılacak. Açık sorular Q-01…Q-06 cevapsız; varsayımlar geçerli.

## Faz 3 — Kurulum kaydı

| Adım | Durum | Not |
|---|---|---|
| Next.js 16.4.0 (3 günden eski en yeni) + iskelet kopyası | ✅ | Better Auth 1.7.7, TypeScript 6.0.3, Vitest 5, Playwright 1.64 |
| Paketler | ✅ | + `react-markdown`, `remark-gfm` (K-16), `lucide-react`, `sharp` (plan §10–11) |
| Sistem anlık görüntüsü | ✅ | `docs/standartlar/` (21 dosya), `docs/kalite-kapilari.md` (S2 + demo işaretli), `.claude/rules/`, `AGENTS.md` (138 satır, KURALLAR gömülü), `CLAUDE.md`, PR şablonu, `README.md` |
| Temel tablolar | ✅ | 12 tablo (auth 6 + çekirdek 6), `btree_gist` + `pg_trgm`; yerel PostgreSQL 17 `localhost:5434` |
| Kabuk | ✅ | Başlık, alt bilgi (saatler, iletişim, yasal, demo notu), mobil eylem çubuğu (WhatsApp · Ara · Yol tarifi), içeriğe geç, demo şeridi, 404, hata sayfaları, manifest + ikon seti, robots (demo'da kapalı), sitemap |
| Yasal sayfalar | ✅ | `/kvkk`, `/gizlilik`, `/cerez-politikasi`, `/randevu-kosullari` (`content/yasal/`, "örnek metin" notu) |
| Yönetici girişi | ✅ | `/panel/giris`, oturum kapısı, çıkış, başarısız giriş sınırı (P-15) + işlem geçmişi; `/panel` özet, `/panel/demo-kutusu` |
| Seed + reset | ✅ | Demo yönetici (Bahadır Karasu), 24 talep |
| Doğrulama | ✅ | lint, typecheck, format, 46 birim testi, build, 128 e2e (mobil + masaüstü; taşma, 44 px, 16 px giriş, axe, panel nonce CSP) |
| Git + GitHub + CI | ✅ | Gizli depo + PR #1 (`chore/scaffold`, squash); kancalar (ESLint, Prettier, gitleaks, commitlint, main koruması) çalışıyor; CI static / test / security / e2e yeşil (e2e ~3 dk: 86 geçti, 43 bilerek atlandı) |
| Vercel önizleme | ✅ | Proje bağlandı (bölge `fra1`), Neon (Frankfurt) Marketplace entegrasyonuyla, ortam değişkenleri üretim + önizleme; CLI ile önizleme yayını Ready, migration'lar Neon'a uygulandı, demo verisi yüklendi. Önizleme Vercel girişiyle korumalı. **Git entegrasyonu kurulamadı:** Vercel hesabında GitHub giriş bağlantısı yok (kullanıcı panelden bağlamalı) |

## Dilimler

| No | Dilim | Kapsam (özellik / REQ) | Efor | Öncelik | Durum | 360 px | Test |
|---|---|---|---|---|---|---|---|
| D-01a | Tasarım sistemi + görselli giriş + Hakkında | shadcn/ui (K-22), kontrast birim testi, mobil menü (Sheet), breadcrumb + `BreadcrumbList`, `PhoneLink`, görsel boru hattı (K-21) + `docs/gorsel-kaynaklari.md`, ana sayfa giriş kolajı + "Stüdyo" bölümü, `/hakkinda` (`content_blocks.about`); Z-07, Z-08, Z-18. Kurulumda yapılanlar: token'lar, yazı tipleri, başlık, alt bilgi, mobil eylem çubuğu, demo şeridi, yasal sayfalar (REQ-009), 404 / 500 | M | P0 | ✅ | ✅ 360 / 1024 / 1280 | 81 birim + 106 e2e |
| D-01b | SSS + panel İçerik modülü | `faqs` + seed (12 + 1 gizli), `/sss` (`<details>` akordeon, `FAQPage`), ana sayfa SSS özeti, panel `/panel/icerik`: SSS ekle / düzenle / sırala / gizle (K-24), Hakkında metni düzenleme, işlem geçmişi, `updateTag`; menüye "SSS"; entegrasyon testi altyapısı (K-25); Z-10, Z-31 | M | P0 | ✅ | ✅ 360 / 1280 | 107 Vitest (11 entegrasyon) + 127 e2e |
| R-01 | Görsel revizyon (kullanıcı geri bildirimi) | Pastel token'lar + `--brand` (K-28), Fraunces `SOFT`, kemer / polaroid çerçeve, pastel renk lekeleri, yıldız işareti; 5 yeni Pexels görseli; ikon, manifest, tema rengi; `docs/gorsel-kaynaklari.md` | S | P0 | ✅ | ✅ 360 / 1280 | 27 token çifti |
| D-02 | İletişim + talep kutusu + yerel SEO | İletişim sayfası ve formu → `leads` → panel talepler, teşekkür ekranı; harita + yol tarifi; WhatsApp bağlamlı bağlantı temeli (REQ-005a); `NailSalon` JSON-LD (REQ-010); Z-09, Z-13, Z-15, Z-29 | M | P0 | ⏳ | — | — |
| D-03 | Hizmetler | `services` + seed (16), `/hizmetler`, `/hizmetler/[slug]`, panel hizmet CRUD, fiyat gösterim anahtarı (REQ-004; BR-HZM-001, 002) | M | P0 | ⏳ | — | — |
| D-04 | Müsaitlik motoru + randevu veri modeli | `staff`, `business_hours`, `time_off`, `appointments` + dışlama kısıtı migration; `domain/availability.ts` + tablo testleri; panel müsaitlik ekranı (REQ-001a, REQ-002a, REQ-003a; BR-RND-001…005, 015) | M | P0 | ⏳ | — | — |
| D-05 | Ziyaretçi randevu akışı | **SSS seed'indeki "Randevumu nasıl alırım?" cevabını online randevuya göre güncelle.** `/randevu` adımlı akış (360 px önce), sunucu eylemi (doğrulama + hız sınırı + kısıt → kural kodu), onay ekranı, işletmeye ve müşteriye bildirim (demo kutusu), "WhatsApp'tan ilet", tercih edilen kanal; mobil eylem çubuğuna "Randevu al" (REQ-001b, REQ-005b, REQ-018; BR-RND-003, 006, 010, 011, 014) | M | P0 | ⏳ | — | — |
| D-06 | Randevu yönetim bağlantısı | `/randevu/yonet/[token]`: erteleme / iptal, `.ics`, Google Takvim, yenileme hatırlatıcısı + "aynı hizmetten tekrar" (REQ-002b, REQ-012; BR-RND-007, 009, 012, 013) | M | P0 (+P1 REQ-012) | ⏳ | — | — |
| D-07 | Panel randevu | "Bugün" ekranı (3 KPI), ajanda, detay, durum geçişleri, elle randevu, WhatsApp şablonları + ayarlarda şablon düzenleme (REQ-003b, REQ-005c; BR-RND-008) | M | P0 | ⏳ | — | — |
| D-08 | Galeri (ziyaretçi) — öne alındı (K-30) | `gallery_items` + seed (27, 1 taslak), `/galeri` stil / renk / uzunluk filtresi (K-29), eser etiketi kartı, `/galeri/[slug]` (önceki / sonraki, benzer işler), "Bu tasarımı istiyorum" (WhatsApp + eser no), ana sayfa seçkisi + stil kartları, panel `/panel/galeri` yayımla / seçkiye ekle; menüye "Galeri"; sitemap (REQ-006, 011; BR-GLR-003, 004). Öncesi / sonrası D-09'a (K-30) | M | P0 (+P1 REQ-011) | ✅ | ✅ 360 / 1280 | 130 Vitest (20 entegrasyon) + 184 e2e |
| D-09 | Galeri yönetimi + güvenli yükleme + öncesi / sonrası | `media_assets`, Vercel Blob, `sharp` varyantları, öncesi / sonrası eşleştirme, izin işareti, sıralama, fotoğraf yayın izni şablonu (REQ-008; BR-GLR-001…003) | M | P0 | ⏳ | — | — |
| D-10 | Ana sayfa tamamlama | En yakın boş saatler, seçki, öncesi / sonrası bölümü, süreç adımları (REQ-015), hijyen kartı (REQ-013), örnek yorumlar + panel yorumlar (REQ-014), "Şu an açık" (REQ-016), ulaşım (REQ-017) | M | P1 | ⏳ | — | — |
| D-11 | SEO katmanı denetimi + ölçüm | `Service`, `ImageObject`, `Person` şemaları (REQ-020), sitemap / robots / meta denetimi, Vercel Web Analytics + dönüşüm olayları (REQ-021), onay kayıtları ekranı (REQ-019), onaysız üçüncü taraf istek yok e2e | S | P0 (denetim) + P1 | ⏳ | — | — |
| D-12 | Cila + kalite paketi | Hareket, boş / hata durumları, mikro metinler, bölüm hata sınırları, kaydedilmemiş değişiklik uyarısı, Lighthouse CI, paket boyutu (REQ-022) | M | P1 | ⏳ | — | — |

**P1 onaylanmazsa:** D-10 yalnızca P0 parçalarıyla (seçki + öncesi / sonrası bölümü) D-08'e katılır; REQ-011…022 P2'ye iner.

## Etkin dilim planı

**D-08 — Galeri** (✅ 2026-10-22)
- Kabul kriterleri: filtreler URL'de ve paylaşılabilir; aynı seçime tekrar dokunmak filtreyi kaldırır; boş sonuçta açıklama + temizle; telefonda stil çipleri yana kayar, renk / uzunluk alttan açılan panelde, masaüstünde satır içi; eser sayfasında etiket, renk örnekleri, süre, WhatsApp mesajında eser no + ad + bağlantı (ek yok); taslak ve bilinmeyen eser "bulunamadı" sayfası + `noindex`; temsilî görselde fotoğrafçı bağlantısı; panelde yetkisiz rol reddedilir, müşteri izni olmayan gerçek iş yayımlanamaz (BR-GLR-003, eylem + `check`), eser no yeniden kullanılmaz (BR-GLR-004, identity).
- Tablolar / migration: `gallery_items` (`0004_gallery_items.sql`: stil / renk / uzunluk / teknik / slug / izin `check`'leri, slug ve no benzersiz, `(is_published, sort_order)` indeksi).
- Dosyalar: `src/config/gallery.ts`, `src/features/gallery/*`, `src/content/gallery.ts`, `src/components/sections/home-gallery.tsx`, `src/app/(site)/galeri/**`, `src/app/panel/(app)/galeri/page.tsx`, `src/lib/format.ts` (`formatDuration`), `scripts/seed.ts`, `public/demo/galeri-*`.
- Testler: `filters.test.ts`, `neighbours.test.ts` (PRJ-02 mesajı), `format.test.ts`, `tests/integration/gallery-actions.test.ts` (yetki, notFound, yayımla / gizle, BR-GLR-003 eylem + veritabanı, BR-GLR-004, sabit kümeler, yalnızca yayındakiler), `tests/e2e/gallery.spec.ts` (filtre, birleşik filtre + boş durum, paylaşılan bağlantı, eser sayfası + WhatsApp, önceki / sonraki, taslak, ana sayfa stil kartı, panel gizle / yayımla); yeni rotalar taşma + 44 px + axe'ye eklendi.
- Elle: galeri 360 / 1280, filtreli galeri 360, eser sayfası 360, ana sayfa 360 incelendi. Üretim derlemesine karşı tüm e2e geçti.

**R-01 — Görsel revizyon** (✅ 2026-10-22)
- Kabul kriterleri: tüm token çiftleri AA; `text-primary` kullanımları `text-brand`'e taşındı (pastel üzerinde açık metin yok); görseller lisanslı, kaynak ve fotoğrafçı kayıtlı; 360–1536 px taşma yok (dekoratif lekeler `overflow-hidden` bölüm içinde).
- Dosyalar: `src/app/globals.css`, `src/lib/color.test.ts`, `src/components/common/{framed-image,pastel-blobs}.tsx`, `src/components/sections/{home-hero,about-teaser}.tsx`, `src/content/demo-images.ts`, `src/app/{layout.tsx,manifest.ts,icon.svg}`, `scripts/{generate-icons.ts,images/build-demo-images.ts}`, `public/demo/*`, `public/icons/*`.
- Elle: ana sayfa 360 / 1280, Hakkında 360 incelendi.

**D-01b — SSS + panel İçerik modülü** (✅ 2026-10-17)
- Kabul kriterleri: `/sss` kategorilere göre gruplu, klavyeyle açılır, `FAQPage` verisi görünen sorularla birebir; gizli soru sitede ve veride yok; panelde soru ekle / düzenle / sırala / gizle, Hakkında metni düzenle; kayıttan sonra site hemen güncellenir (`updateTag`); form göndermeden önce aynı Zod şemasıyla denetlenir, ilk hatalı alana odaklanır, hatada girilen metin korunur; anonim ve yetkisiz rol reddedilir; değişiklikler işlem geçmişinde.
- Tablolar / migration: `faqs` (`0003_faqs.sql`, kategori `check`, `(category, sort_order)` indeksi).
- Dosyalar: `src/features/faq/*`, `src/features/content/{actions.ts,components/about-form.tsx}`, `src/server/audit.ts`, `src/components/common/{form-field,panel-breadcrumbs}.tsx`, `src/components/ui/{input,textarea,label}.tsx`, `src/components/sections/faq-teaser.tsx`, `src/lib/{form,markdown}.ts`, `src/content/faqs.ts`, `src/config/faq.ts`, `src/app/(site)/sss`, `src/app/panel/(app)/icerik/**`, `tests/setup/*`, `tests/integration/*`, `.env.test`.
- Testler: `order.test.ts`, `form.test.ts`, `markdown.test.ts`, `tests/integration/content-actions.test.ts` (anonim / yetkisiz ret, oluştur, doğrulama, kategori değişimi, notFound, gizle / göster, sırala, Hakkında kaydı), `tests/e2e/content.spec.ts` (SSS sayfası, form doğrulaması, ekle → sitede → gizle, Hakkında düzenle; SQL ile temizlik); yeni panel rotaları taşma + 44 px + axe'ye eklendi.
- Elle: SSS 360 / 1280, panel İçerik 360, soru formu (hatalı) 360, Hakkında formu 1280 incelendi.

**D-01a — Tasarım sistemi + görselli giriş + Hakkında** (✅ 2026-10-17)
- Kabul kriterleri: token çiftleri AA (birim testi); mobilde menü düğmesi + çekmece (odak tuzağı, `Esc`, kaydırma kilidi, bağlantıyla kapanma); masaüstünde `aria-current`; Hakkında içeriği `content_blocks`'tan, demo notu görünür; alt sayfalarda görünür breadcrumb + eşleşen `BreadcrumbList`; görseller `/_next/image` değil önceden üretilmiş WebP; 360–1536 px taşma yok, 44 px hedef, axe temiz.
- Tablolar / migration: `content_blocks` (`0002_content_blocks.sql`, anahtar biçimi `check`).
- Dosyalar: `src/components/ui/{button,sheet}.tsx`, `src/components/layout/{site-nav,mobile-menu,site-header,site-footer}.tsx`, `src/components/common/{breadcrumbs,framed-image,phone-link}.tsx`, `src/components/sections/{home-hero,about-teaser}.tsx`, `src/features/content/*`, `src/content/{content-blocks,demo-images}.ts`, `src/lib/{color,image-loader}.ts`, `scripts/images/build-demo-images.ts`, `src/app/(site)/hakkinda/page.tsx`.
- Testler: `color.test.ts` (23 token çifti), `image-loader.test.ts`, `content/schemas.test.ts` (gerçek kişi adına iddia yok), `tests/e2e/site.spec.ts` (menü, aria-current, Hakkında + breadcrumb JSON-LD, görsel kaynağı); `/hakkinda` taşma + axe rotalarına eklendi.
- Elle: 360 / 1024 / 1280 px ekran görüntüsü incelendi; kolaj notu çerçeveye değiyordu ve e-posta kelime ortasından bölünüyordu, ikisi de düzeltildi.

## Kalite kapısı raporu

Faz 5'te doldurulur.

| Grup | Sonuç | Not |
|---|---|---|
| — | — | — |

## Bilinen sorunlar

- Yok.

## Dersler

- **Efor bütçesi kapsamı belirsiz** → Bağlam: S2 planı. Ne oldu: çekirdek [Z] maddeleri tek başına ~43 puan; S1 (≤ 10) ve S2 (≤ 30) bütçeleri çekirdeği kapsayamıyor. Önerilen kural: "Efor bütçesi çekirdek ve iskeletle gelen maddeleri kapsamaz" cümlesi açıkça yazılsın. Belge: `standartlar/00-karar-mantigi.md` §3.3 / §7.4. **Sisteme taşı.**
- **Varsayım öneki çakışması** → Bağlam: plan şablonu §4. Ne oldu: varsayımlar `V-01` ile numaralanıyor, katalog ziyaretçi özellikleri de `V-` (V-30). Önerilen kural: varsayımlar `VR-` öneki alsın, 18-dokumantasyon §3 tablosuna eklensin. Belge: `sablonlar/proje-plani.md`, `standartlar/18-dokumantasyon.md`. **Sisteme taşı.**
- **Brifte açık istenen özellik ve P0 tanımı** → Bağlam: galeri / öncesi-sonrası. Ne oldu: P0 tanımı ([Z] + Y=1 + ana dönüşüm) müşterinin açıkça istediği ama dönüşüm akışı olmayan özelliği P1'e itiyor; bütçe kuralı da en düşük oranlı P1'i (galeri) P2'ye indiriyordu. Önerilen kural: "Brifte açıkça istenen ve sektör karar anının ön koşulu olan özellik P0 sayılabilir; K- kararıyla gerekçelendirilir." Belge: `standartlar/00-karar-mantigi.md` §7.4. **Sisteme taşı.**
- **API'siz WhatsApp köprüsü, "Bu tasarımı istiyorum", yenileme hatırlatıcısı** → katalogda yok; randevu sektörlerinin (güzellik, sağlık) hepsinde işe yarar. Önerilen: `02-ziyaretci` ve `X-GZL` modülüne eklensin. **Sisteme taşı.**
- **create-next-app kilit dosyası bekleme süresine takılıyor** → Ne oldu: create-next-app kilit dosyasını `pnpm-workspace.yaml` kopyalanmadan önce yazıyor; 3 günden yeni 3 alt bağımlılık `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` verdi. Önerilen: iskelet README adım 3'ten sonra `rm pnpm-lock.yaml && pnpm install`. Belge: `iskelet/README.md` §2. **Sisteme taşı.**
- **pnpm 12'de ayar adı değişti** → `ignoredBuiltDependencies` yok sayılıyor ve kurulum `ERR_PNPM_IGNORED_BUILDS` ile duruyor; yeni ad `allowBuilds: { paket: false }`. Belge: `iskelet/pnpm-workspace.yaml`, `standartlar/15-git-ve-ci.md` §6. **Sisteme taşı.**
- **`typecheck` CI'da `.next/types` olmadan kırılır** → `LayoutProps` / `PageProps` rota tipleri `next typegen` ile üretilir; temiz checkout'ta yok, yerelde de eskiyebiliyor. Önerilen: `"typecheck": "next typegen && tsc --noEmit"`. Belge: iskelet README §2 adım 5. **Sisteme taşı.**
- **`sablonlar/readme.md` proje README şablonu değil** → Dosya şablonlar klasörünün dizini; SKILL.md `kur` modu onu README.md'ye kopyalamayı söylüyor. Önerilen: dizini `sablonlar/README.md` yap, ayrı bir proje README şablonu ekle. **Sisteme taşı.**
- **`sr-only` içeriğe geç bağlantısı dokunma hedefi testini düşürüyor ve odakta küçük kalıyor** → Tailwind `not-sr-only` dolguyu sıfırladığı için odaktaki bağlantı 25,6 px kaldı. Çözüm: ekran dışına kaydırılan, her zaman tam boyutlu bağlantı + "odakta ≥ 44 px" e2e testi; `checks.ts` görsel olarak gizli (≤ 1 px) öğeleri atlar. Belge: `iskelet/tests/e2e/responsive.spec.ts`, 08-erisilebilirlik. **Sisteme taşı.**
- **CSS `uppercase` + `lang="tr"` İngilizce kelimeyi bozar** → "Nail Art Studios" → "NAİL ART STUDİOS". Önerilen kural: İngilizce marka / kelime CSS ile büyütülecekse öğeye `lang="en"`. Belge: KURALLAR C (Türkçe), 06-arayuz §11. **Sisteme taşı.**
- **Next.js 16.4'te `error.tsx` `retry` alır** (`reset` değil) ve panel nonce CSP'si için sayfanın istek başına render edilmesi gerekir (`instant = false`); iskelette panel sayfası örneği yoktu. Önerilen: iskelete `/panel/giris` + oturum kapısı örneği. Belge: iskelet. **Sisteme taşı.**
- **Çift `role="alert"`** → Next.js rota duyurucusu da `role="alert"` taşıyor; e2e'de `getByRole("alert")` forma daraltılmalı. Belge: 14-test. Not.
- **Docker port çakışması** → Aynı makinede birden çok proje 5432 kullanıyor; `docker-compose.yml`'a `name:` ve proje başına port. Belge: 16-ortamlar §4. Not.
- **Commit kancası üretilmiş dosyada düşüyor** → `auth.ts` ESLint'te yok sayılıyor; commit'e girince "File ignored" uyarısı `--max-warnings=0` ile hata oluyor. Çözüm: `lefthook.yml` ESLint komutuna `--no-warn-ignored`. Belge: `iskelet/lefthook.yml`. **Sisteme taşı.**
- **gitleaks yanlış pozitif** → `.claude/rules/sunucu.md`'deki `05-sunucu-ve-api.md` dosya adı `generic-api-key` kuralını tetikliyor; her projede tekrarlar. Çözüm: dar kapsamlı `.gitleaks.toml` izin listesi (standart dosya adı deseni). Belge: iskelet. **Sisteme taşı.**
- **CI'da lint de rota tiplerine muhtaç** → `static` işinde lint, typecheck'ten önce koşuyor; tipli kurallar `PageProps`'u çözemiyor. Çözüm: `"lint": "next typegen && eslint . --max-warnings=0"`. Belge: iskelet README §2 adım 5. **Sisteme taşı.**
- **`prepare: lefthook install` Vercel CLI yüklemesinde kurulumu durduruyor** → `.git` yok. Çözüm: `"prepare": "lefthook install || exit 0"`. Ayrıca `pnpm install` "Already up to date" iken `prepare` çalışmıyor; ilk kurulumda `pnpm exec lefthook install` elle. Belge: iskelet. **Sisteme taşı.**
- **Vercel CLI yan etkileri** → `vercel link` `.gitignore`'un sonuna `.env*` ekliyor (`!.env.example` istisnasını eziyor; geri alındı); `integration add neon` projeye istenmeyen ajan talimat dosyaları (`.agents/`, `.claude/skills/`) ekliyor (silindi) ve `--no-env-pull` olmadan `.env.local`'daki yerel `DATABASE_URL`'i değiştirirdi; `vercel curl` Windows'ta "Malformed input" veriyor. Belge: 16-ortamlar §6. **Sisteme taşı.**
- **CLI yüklemesinde sır sızıntısı riski** → `vercel deploy` yerel klasörü yükler; `.vercelignore` olmadan `.env.local` da gidebilir. Çözüm: iskelete `.vercelignore`. **Sisteme taşı.**
- **Satır sonları** → Windows'ta `core.autocrlf` açıkken bash kancaları CR ile bozulabilir; iskelete `.gitattributes` (`* text=auto eol=lf`). **Sisteme taşı.**
- **CI e2e işi testler bittikten sonra 15 dk asılı kaldı** → Playwright `webServer: "pnpm start"`; pnpm 12 betiği Playwright'ın süreç grubu dışında çalıştırıyor, kapanışta `next-server` öldürülemiyor ("Timed out waiting 900s for the teardown"). Çözüm: CI'da `./node_modules/.bin/next start`. Ayrıca gizli depolarda runner 2 vCPU: `workers: 2`, iz yalnızca ilk tekrar denemede, `globalTimeout` (iptal yerine hata + rapor). Belge: `iskelet/playwright.config.ts`. **Sisteme taşı.**
- **shadcn `init` proje token'larının üzerine yazıyor** → `globals.css`'i nötr renklerle değiştiriyor, Geist yazı tipini ekliyor, düğmeler 32 px, odak halkası %50 saydam (krem zeminde < 3:1). Önerilen: iskelete hazır uyarlanmış `button` / `sheet` + token eşlemesi (`--card` → `--surface` …) ya da `init` sonrası kontrol listesi. Belge: 06-arayuz, iskelet. **Sisteme taşı.**
- **Stok görsel tuzağı: rawpixel büyük boyutları filigranlı** → Openverse'ün 1024 px önizlemesi temiz, `image_1300` filigranlı. Unsplash / StockSnap tam boyuta otomatik erişimi engelliyor. Önerilen: 17-icerik §5'e "indirilen görsel tam çözünürlükte filigran için incelenir" maddesi ve Openverse `license=cc0,pdm` yöntemi. **Sisteme taşı.**
- **Next.js 16: `priority` kullanımdan kalktı** → `.claude/rules/mobil-arayuz.md` "LCP görseline `priority`" diyor; doğrusu `loading="eager"` + `fetchPriority="high"` (ya da `preload`). Belge: `sablonlar/claude-rules/mobil-arayuz.md`, 12-performans. **Sisteme taşı.**
- **Görsel dönüştürme kotası için özel yükleyici** → `images.loaderFile` + sabit genişlikli WebP varyantları `next/image` API'sini korurken kotayı sıfırlar; ayrı `<picture>` bileşeni gerekmez. Önerilen: iskelete `image-loader.ts` + üretim betiği. Belge: 12-performans, U-21. **Sisteme taşı.**
- **CSS `uppercase` düzenlenebilir metinde de bozar** → Panelden gelen üst başlıklarda İngilizce kelime olabilir ("Nail artist" → "NAİL ARTİST"); içerik kaynaklı metinde `uppercase` kullanılmaz. Belge: 06-arayuz §11. **Sisteme taşı.**
- **Flex içindeki breadcrumb bağlantısı "satır içi" istisnasından düşer** → `li` flex olunca bağlantı blok sayılır, 44 px testi takılır; bağlantıya mobilde `min-h-11`. Not.
- **Playwright `webServer` komutu işletim sisteminden bağımsız olmalı** → `./node_modules/.bin/next start` Windows `cmd`'de çalışmıyor; `node node_modules/next/dist/bin/next start` her ikisinde de çalışır ve pnpm sarmalayıcısı yok. Belge: `iskelet/playwright.config.ts`. **Sisteme taşı.**
- **CI security işinde pnpm önbelleği** → İş bağımlılık kurmuyor; kilit dosyası değişince önbellek ıskalıyor ve `setup-node`'un son adımı var olmayan pnpm deposu yüzünden düşüyor ("Path(s) specified … do(es) not exist"). Çözüm: bu işte `cache: pnpm` yok. Belge: `iskelet/.github/workflows/ci.yml`. **Sisteme taşı.**
- **Vercel Hobby: CLI yayını commit yazarına göre engellenir** → GitHub squash birleştirmesi commit'i GitHub "noreply" adresiyle yazar; bu adres Vercel hesabına bağlı değilse CLI dağıtımı "Blocked". Geçici çözüm: `git archive HEAD` ile `.git`'siz dışa aktarımdan yayın. Kalıcı: Vercel hesabına GitHub giriş bağlantısı + Git entegrasyonu (Faz 3'te kurulmalı). Belge: 16-ortamlar §6, iskelet README adım 10. **Sisteme taşı.**
- **Entegrasyon testi altyapısı iskelette yok** → S2 her eylem için yetki testi istiyor ama hazır düzen yoktu. Bu projede: Vitest `projects` (unit / integration), `.env.test` (NODE_ENV=test, `.env.local` yüklenmez), `globalSetup` ile migration ve `*_test` ad denetimi, `vi.mock` ile oturum / IP / `next/cache`. Belge: iskelet, 14-test. **Sisteme taşı.**
- **`getByLabel` alt dize eşleşmesi** → "Soru" etiketi "Sık sorulan **soru**lar" bölümüyle eşleşti (gezinme bitmeden). Kısa etiketlerde `{ exact: true }` ve tıklamadan sonra URL beklemesi. Belge: 14-test. Not.
- **Etiketli onay kutusu ve 44 px testi** → Kutu 20 px, etiketi 44 px; WCAG 2.5.8 etiketi hedef sayar. `checks.ts` etiket içindeki onay kutusunu etiketin boyutuyla ölçer. Belge: `iskelet/tests/e2e/responsive.spec.ts`. **Sisteme taşı.**
- **Görünmeyen `span` ile erişilebilir ad** → "Gizle" + `sr-only` ": soru" adı tutarsız hesaplandı; liste eylemlerinde görünen sözcükle başlayan `aria-label`. Belge: 08-erisilebilirlik. Not.
- **Stok görsel: Pexels otomasyonu** → Unsplash başsız tarayıcıya 403 veriyor; Pexels yalnızca görünür (headed) tarayıcıda açılıyor, CDN adresi (`images.pexels.com/photos/<no>/pexels-photo-<no>.jpeg?w=2000`) curl ile iniyor. Fotoğrafçı adı sayfa başlığından değil `ImageObject` JSON-LD `creator.name`'den okunmalı. Belge: 17-icerik §5. **Sisteme taşı.**
- **Pastel tema ve kontrast** → Pastel ana renk düğme zemini olarak iyi, metin rengi olarak AA'yı geçmiyor. Çözüm: ayrı vurgu metni token'ı (`--brand`) ve `text-primary` yerine `text-brand`. Önerilen: iskelet token'larında "zemin ana rengi" ile "metin vurgu rengi" baştan ayrı. Belge: 06-arayuz §3. **Sisteme taşı.**
- **Kullanıcı "Pinterest'ten al" diyebilir** → Lisanssız ve başkasının işi; sanatçı sitesinde en büyük risk başkasının tasarımını onun işi gibi göstermek. Önerilen: 17-icerik §5'e açık yasak + müşteriye anlatılacak kısa gerekçe. **Sisteme taşı.**
- **Cache Components: dinamik segmentte `notFound()`** → Sayfa akışa başladıktan sonra `notFound()` 404 değil 200 + `noindex` döner (Next.js belgesi). `params` Suspense dışında okunursa geliştirmede "instant shell" uyarısı; tüm sayfa parametreye bağlıysa `export const instant = false`. E2E'de durum kodu yerine "bulunamadı" başlığı ve `noindex` denetlenir. Belge: 14-test, 09-seo. **Sisteme taşı.**
- **İstemci filtresi için History API** → `router.replace` statik sayfada her filtrede sunucuya RSC isteği atıyor, geliştirmede yük altında testleri geciktiriyordu; `window.history.replaceState` `useSearchParams` ile senkron ve gidiş-dönüş yok. Belge: 06-arayuz (filtreler). **Sisteme taşı.**
- **Mobil eylem çubuğu kenarlığı** → Çubuğun 1 px üst kenarlığı ayrılan boşluğa katılmamıştı; sayfa yüksekliği değişince alt bilginin 1 px'i altta kalıyordu. Ayrılan boşluk `--action-bar-h + 1px`. Belge: iskelet `site-shell`. Not.
- **Turbopack geliştirme CSS önbelleği** → `@theme`'e yeni renk eklenince sınıflar üretilmedi; `.next/dev` silinip sunucu yeniden başlatılınca düzeldi. Not.
- **pnpm audit: yaması olmayan dolaylı açık** → `braces` (eslint-config-next zinciri, yalnızca geliştirme). Standart muafiyete izin veriyor ama biçim tanımlı değil; `pnpm-workspace.yaml` → `auditConfig.ignoreGhsas` + gerekçe + gözden geçirme tarihi örneği eklenmeli. Belge: 15-git-ve-ci §6. **Sisteme taşı.**
