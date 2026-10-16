# Performans

> **Durum:** v1.0 · **Son güncelleme:** 2026-10-16
> **Kararlar:** [Bölüm 9](#9-kararlar)

## 1. Bu belge ne işe yarar

Performans hedeflerini, bütçelerini ve bunları tutturan uygulama kurallarını tanımlar. Ölçüm her zaman **mobil profil** ile yapılır.

## 2. Hedefler

| Ölçüt | Hedef | Nerede ölçülür |
|---|---|---|
| LCP | ≤ 2,5 sn | Lighthouse mobil (önizleme), canlıda alan verisi |
| INP | ≤ 200 ms | Canlıda alan verisi; geliştirmede etkileşim testleri |
| CLS | ≤ 0,1 | Lighthouse + e2e |
| TTFB (önbellekli sayfa) | ≤ 0,8 sn | Lighthouse |
| Lighthouse mobil | Performans ≥ 90, Erişilebilirlik ≥ 95, En iyi uygulamalar ≥ 95, SEO 100 (canlı) | Önizleme adresinde, ana şablon sayfalarında |

Alan verisi hedefleri 75. yüzdeliktir. Lighthouse, ana sayfa + her sayfa şablonundan birer örnek (liste, detay, form, iletişim) üzerinde çalıştırılır.

## 3. Bütçeler

| Kaynak | Herkese açık sayfa | Panel |
|---|---|---|
| İlk yük JavaScript (gzip, rota başına) | ≤ 170 KB | ≤ 300 KB |
| LCP görseli | ≤ 200 KB (AVIF / WebP) | — |
| Yazı tipi dosyaları | ≤ 2 aile, ≤ 4 dosya, alt kümeli | Aynı |
| Üçüncü taraf betik | Onaysız 0; onaylı en fazla 2 | 0 |
| Veritabanı sorgusu / sayfa | ≤ 5 (N+1 yok) | ≤ 10 |

Bütçe aşımı PR'da gerekçeyle kabul edilir ya da düzeltilir. Next.js 16'nın `next build` çıktısı artık rota boyutu göstermez; ölçüm `pnpm analyze` (`next analyze`, Turbopack paket analizi) ile yapılır ve yeni bağımlılık eklenen PR'a özeti yazılır (S2+).

## 4. Render ve veri

- Vitrin sayfaları statik / önbellekli üretilir; içerik değişince etiketle yenilenir ([02 §6](02-mimari.md#6-render-ve-önbellek)).
- Bağımsız veri istekleri paralel başlatılır; yavaş bölümler `Suspense` ile akışla gelir, sayfanın geri kalanını bekletmez.
- İstemci bileşenleri yaprakta; büyük kütüphaneler (harita, grafik, zengin metin düzenleyici, galeri) `next/dynamic` ile yalnızca gerektiği yerde yüklenir.
- Listeler sayfalanır (varsayılan 24 kayıt); "tümünü getir" yok.
- Sık filtrelenen kolonlar indeksli ([04 §7](04-veri.md#7-kısıtlar-ve-indeksler)); yavaş sorgu (> 200 ms) logda uyarı üretir.
- Fonksiyon bölgesi veritabanıyla aynı (`fra1` + Neon Frankfurt).

## 5. Görseller

- Her görsel `next/image` ile, doğru `sizes` değeriyle; ilk ekran görseli `priority` (ya da `fetchPriority="high"`), diğerleri tembel.
- Next.js 16'da `images.qualities` izin listesi tanımlanır (ör. `[60, 75, 90]`); kullanılmayan kalite değeri reddedilir.
- Vercel Hobby'de görsel dönüştürme kotası sınırlıdır (ayda 5.000): stok görseller kaynağın CDN'inden özel loader ile, yüklenen görseller yüklemede boyutlandırılmış olarak sunulur; yalnızca gerekli görseller Vercel optimizasyonundan geçer.
- Yer tutucu: `placeholder="blur"` (statik içe aktarılan görselde) ya da token renginde arka plan.
- Video arka plan yok; tanıtım videosu tıklayınca yüklenir (önizleme görseliyle).
- SVG ikonlar satır içi değil bileşen olarak; büyük süs SVG'leri dosya.

## 6. Yazı tipi, CSS ve betik

- `next/font` ile kendi sunucumuzdan, `display: swap`, `latin-ext`; değişken yazı tipi tercih edilir.
- Tailwind dışında global CSS en az; kullanılmayan bileşen kütüphanesi stili yok.
- Üçüncü taraf betikler `next/script` ile `lazyOnload` ya da onaydan sonra; etiket yöneticisi (GTM) varsayılan değildir.
- Harita, sohbet balonu, yorum gömmesi gibi ağır parçalar etkileşimle ya da görünür olunca yüklenir (önizleme görseli + düğme).

## 7. Hareket ve etkileşim

- Animasyonlar yalnızca `transform` / `opacity` ([06 §9](06-arayuz.md#9-hareket)).
- Uzun görevler (> 50 ms) olay işleyicilerinde bölünür; yazarken filtrelemede `useDeferredValue` ya da gecikmeli istek.
- Kaydırma olayına doğrudan bağlı hesaplama yok; `IntersectionObserver` ya da Motion'ın kaydırma API'si.

## 8. Ölçüm araçları

| Araç | Ne zaman |
|---|---|
| Lighthouse (mobil, önizleme adresi) | Her dilim sonunda değişen şablonda; yayından önce tümünde |
| `pnpm analyze` (`next analyze`) | Yeni bağımlılık eklendiğinde, yayından önce |
| Vercel Speed Insights ya da web-vitals → analitik olayı [Ö] | Canlıda alan verisi |
| Playwright CLS denetimi | e2e'de ana sayfalarda |

## 9. Kararlar

| No | Konu | Karar | Gerekçe |
|---|---|---|---|
| PF-01 | Ölçüm profili | Mobil | Ziyaretçi çoğunluğu mobil; masaüstü puanı yanıltıcı yüksek çıkar. |
| PF-02 | JS bütçesi | Herkese açık 170 KB, panel 300 KB | Revnak §11.4 bütçesi; Revnak K14'te GSAP bu bütçe yüzünden demoda kullanılmadı, sahne CSS `sticky` + Motion ile kuruldu. Panel daha az SEO / ilk izlenim baskısı taşır. |
| PF-03 | Görsel kotası | Stok görsel kendi CDN'inden | Hobby planı dönüşüm kotası. |
| PF-04 | Bölge | `fra1` + Neon Frankfurt | Türkiye'ye yakın, veritabanıyla aynı bölge. |

## 10. Değişiklik kaydı

| Tarih | Sürüm | Değişiklik |
|---|---|---|
| 2026-10-16 | v1.0 | İlk sürüm. |
