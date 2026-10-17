# İlerleme — Nail Art Studios · Bahadır Karasu

> **Son güncelleme:** 2026-10-16 · **Faz:** 3 (kurulum) → 4 · **Sıradaki dilim:** D-01

## Şu an

- **Etkin dilim:** — · Faz 3 kurulumu bitti; çıkış koşulu sağlandı (CI yeşil, taşma + axe geçiyor, önizleme Ready)
- **Son yapılan:** İskelet + sistem dosyaları + temel tablolar + site kabuğu + yasal sayfalar + panel girişi + demo kutusu; 46 birim + 86 e2e testi yeşil (yerel ve CI); Vercel önizleme + Neon
- **Sıradaki adım:** `/web-proje devam` → D-01: shadcn/ui kurulumu, kontrast birim testi, ana sayfanın görselli ilk sürümü, Hakkında, SSS, `docs/gorsel-kaynaklari.md`

## Gözetimsiz çalışma notları

- 2026-10-16 — Kullanıcı "tam yetkin var başla" dedi; Faz 0'da soru sorulmadı. Marka adı "Nail Art Studios" (VR-01), tek uzman (VR-02), kurgusal Kadıköy / Moda adresi (VR-03), onay beklemeli randevu (VR-10) varsayıldı. Sistem kuralı gereği plan onayında duruldu.
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
| D-01 | Tasarım sistemi + çekirdek sayfalar | shadcn/ui, kontrast birim testi, ana sayfanın görselli ilk sürümü, Hakkında (Bahadır Karasu), SSS, `docs/gorsel-kaynaklari.md`; Z-07, Z-08, Z-10. **Kurulumda yapıldı:** token'lar, yazı tipleri, başlık, alt bilgi, mobil eylem çubuğu, demo şeridi, yasal sayfalar + randevu koşulları (REQ-009), 404 / 500 | M | P0 | ⏳ | — | — |
| D-02 | İletişim + talep kutusu + yerel SEO | İletişim sayfası ve formu → `leads` → panel talepler, teşekkür ekranı; harita + yol tarifi; WhatsApp bağlamlı bağlantı temeli (REQ-005a); `NailSalon` JSON-LD (REQ-010); Z-09, Z-13, Z-15, Z-29 | M | P0 | ⏳ | — | — |
| D-03 | Hizmetler | `services` + seed (16), `/hizmetler`, `/hizmetler/[slug]`, panel hizmet CRUD, fiyat gösterim anahtarı (REQ-004; BR-HZM-001, 002) | M | P0 | ⏳ | — | — |
| D-04 | Müsaitlik motoru + randevu veri modeli | `staff`, `business_hours`, `time_off`, `appointments` + dışlama kısıtı migration; `domain/availability.ts` + tablo testleri; panel müsaitlik ekranı (REQ-001a, REQ-002a, REQ-003a; BR-RND-001…005, 015) | M | P0 | ⏳ | — | — |
| D-05 | Ziyaretçi randevu akışı | `/randevu` adımlı akış (360 px önce), sunucu eylemi (doğrulama + hız sınırı + kısıt → kural kodu), onay ekranı, işletmeye ve müşteriye bildirim (demo kutusu), "WhatsApp'tan ilet", tercih edilen kanal; mobil eylem çubuğuna "Randevu al" (REQ-001b, REQ-005b, REQ-018; BR-RND-003, 006, 010, 011, 014) | M | P0 | ⏳ | — | — |
| D-06 | Randevu yönetim bağlantısı | `/randevu/yonet/[token]`: erteleme / iptal, `.ics`, Google Takvim, yenileme hatırlatıcısı + "aynı hizmetten tekrar" (REQ-002b, REQ-012; BR-RND-007, 009, 012, 013) | M | P0 (+P1 REQ-012) | ⏳ | — | — |
| D-07 | Panel randevu | "Bugün" ekranı (3 KPI), ajanda, detay, durum geçişleri, elle randevu, WhatsApp şablonları + ayarlarda şablon düzenleme (REQ-003b, REQ-005c; BR-RND-008) | M | P0 | ⏳ | — | — |
| D-08 | Galeri (ziyaretçi) | `gallery_items` + seed (22), `/galeri` filtreleri, eser etiketi kartı, ışık kutusu, `/galeri/[slug]`, öncesi / sonrası kaydırıcısı, "Bu tasarımı istiyorum" (REQ-006, 007, 011; BR-GLR-004) | M | P0 (+P1 REQ-011) | ⏳ | — | — |
| D-09 | Galeri yönetimi + güvenli yükleme | `media_assets`, Vercel Blob, `sharp` varyantları, öncesi / sonrası eşleştirme, izin işareti, sıralama, fotoğraf yayın izni şablonu (REQ-008; BR-GLR-001…003) | M | P0 | ⏳ | — | — |
| D-10 | Ana sayfa tamamlama | En yakın boş saatler, seçki, öncesi / sonrası bölümü, süreç adımları (REQ-015), hijyen kartı (REQ-013), örnek yorumlar + panel yorumlar (REQ-014), "Şu an açık" (REQ-016), ulaşım (REQ-017) | M | P1 | ⏳ | — | — |
| D-11 | SEO katmanı denetimi + ölçüm | `Service`, `ImageObject`, `Person` şemaları (REQ-020), sitemap / robots / meta denetimi, Vercel Web Analytics + dönüşüm olayları (REQ-021), onay kayıtları ekranı (REQ-019), onaysız üçüncü taraf istek yok e2e | S | P0 (denetim) + P1 | ⏳ | — | — |
| D-12 | Cila + kalite paketi | Hareket, boş / hata durumları, mikro metinler, bölüm hata sınırları, kaydedilmemiş değişiklik uyarısı, Lighthouse CI, paket boyutu (REQ-022) | M | P1 | ⏳ | — | — |

**P1 onaylanmazsa:** D-10 yalnızca P0 parçalarıyla (seçki + öncesi / sonrası bölümü) D-08'e katılır; REQ-011…022 P2'ye iner.

## Etkin dilim planı

Henüz yok. Sıradaki: D-01.

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
- **pnpm audit: yaması olmayan dolaylı açık** → `braces` (eslint-config-next zinciri, yalnızca geliştirme). Standart muafiyete izin veriyor ama biçim tanımlı değil; `pnpm-workspace.yaml` → `auditConfig.ignoreGhsas` + gerekçe + gözden geçirme tarihi örneği eklenmeli. Belge: 15-git-ve-ci §6. **Sisteme taşı.**
