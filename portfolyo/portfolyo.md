# Nail Art Studios: galeriden randevuya bir nail art stüdyosu sitesi

> **Canlı demo:** https://nail-art-studio-sigma.vercel.app · **Kaynak kod:** gizli depo
> Konsept / demo projedir. İşletmeci adı, Instagram hesabı ve telefon numarası işletmecinin isteğiyle gerçektir. Adres, hizmet ayrıntıları, galeri görselleri (temsilî, Pexels), yorumlar ve randevular kurgusaldır; site bunu her sayfada bir şeritle belirtir ve arama motorlarına kapalıdır.

## Özet

Kadıköy'de tek kişinin işlettiği bir nail art stüdyosu için mobil öncelikli tanıtım sitesi ve telefondan kullanılan yönetim paneli.

Ziyaretçi Instagram'dan gelir, beğendiği işi galeride bulur, "Bu tasarımı istiyorum" der, boş bir saat seçip randevu talebini gönderir ve onayı WhatsApp'tan alır. İşletmeci günün ajandasını telefonundan görür, talebi tek dokunuşla onaylar ve hazır WhatsApp mesajıyla müşteriye döner. Fiyatlar sitede gösterilmez; ücret WhatsApp'ta konuşulur.

## Problem → Çözüm

| Problem | Çözüm |
|---|---|
| Müşteri tasarımı DM'de tarif etmeye çalışıyor, ekran görüntüsü gönderiyor | Her iş müze etiketi gibi numaralı (No. 001); "Bu tasarımı istiyorum" randevuyu o tasarım ve ilgili hizmetle açar, panelde randevu kartında görünür |
| "Bu hafta yer var mı?" sorusu için mesajlaşma | Ana sayfada canlı "En yakın boş saatler"; randevu akışında yalnızca gerçekten boş günler ve saatler |
| Çift randevu ve hizmet sürelerinin karışması | Müsaitlik motoru hizmet süresi + temizlik arası + çalışma saatleri + izinlerle hesaplar; çakışmayı veritabanı kısıtı da engeller |
| Müşterinin randevusunu değiştirmek için arayıp yazması | Gizli yönetim bağlantısı: erteleme, iptal, takvime ekleme (.ics, Google), dolgu zamanı hatırlatıcısı |
| İşletmeci için masaüstü odaklı karmaşık paneller | "Bugün" ekranı: üç sayı, günün ajandası, tek dokunuşla onay; alt sekme çubuğu |
| Hijyen ve güven sorusu | Ana sayfada hijyen kartı (adımlar + belge no), süreç adımları, etiketli örnek yorumlar |

## Öne çıkan özellikler

- **Galeri:** 26 eser; stil, renk ve uzunluk filtreleri adreste tutulur (paylaşılabilir), ilk ekranda 12 eser, telefonda filtreler alttan açılan panelde.
- **Öncesi / sonrası kaydırıcısı:** dokunma, fare ve ok tuşlarıyla çalışan erişilebilir kaydırıcı; yalnızca aynı elden gerçek bir çift yüklendiğinde görünür.
- **Online randevu:** hizmet → gün → saat → bilgiler; her adım bir bağlantı, JavaScript olmadan da çalışır; onay sayfasında randevu kodu, takvim dosyaları ve WhatsApp'a iletme.
- **Panel:** Bugün, randevular (gün / hafta), müsaitlik (saatler, izinler, kurallar + canlı önizleme), talepler, galeriye fotoğraf yükleme (otomatik küçültme, 4:5 kırpma, WebP, konum bilgisi silme), hizmetler, içerik, yorumlar, onay kayıtları (CSV), ayarlar.
- **WhatsApp köprüsü (API'siz):** onay, hatırlatma ve değişiklik mesajları müşterinin numarasında hazır açılır; mesajlar fiyat ve kampanya içermez.
- **Gizlilik:** çerezsiz, birinci taraf ölçüm; harita karoları dışında üçüncü taraf istek yok; her formda aydınlatma metni sürümü kayıt altında.

## Teknik

**Teknolojiler:** Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict), Tailwind CSS 4, shadcn/ui, PostgreSQL (Neon) + Drizzle ORM, Zod, Better Auth, MapLibre GL, Vercel (Blob, Web Analytics), Vitest, Playwright, Lighthouse CI.

**Mühendislik notları:**
- Randevu çakışması uygulamada değil veritabanında da engelleniyor: `[başlangıç, temizlik sonu)` aralığı üzerinde `EXCLUDE USING gist` kısıtı; yarışta kaybeden ziyaretçiye en yakın iki boş saat gösteriliyor.
- Yönetim bağlantısı bir parola gibi ele alınıyor: 32 baytlık anahtarın yalnızca SHA-256 özeti saklanıyor; analitiğe adres anahtarsız gidiyor.
- Performans çalışması ölçümle yapıldı: yazı tipi 507 KB → 118 KB, ziyaretçi sayfalarından formlar ve Zod çıkarıldı (özellik başına `client` / `forms` girişleri), dialog kitaplığı yerine yerel `<dialog>`; içerik sayfalarında ilk yük JS 162–169 KB (gzip).
- Next.js'in deneysel kısmi ön yüklemesinde, önbellek etiketi güncellenince istemci gezintisinin yarım yanıt alıp hata sayfasına düştüğü bir durum belirleyici olarak yeniden üretildi ve ayar kapatılarak giderildi.
- Demo kod değişmeden canlıya geçer: `DEMO_MODE` kapanınca dış kanallar gerçek gönderime, `noindex` dizinlemeye döner.

Proje Claude Code ile geliştirildi; ürün kararları, mimari ve kabul ölçütleri bana ait.

## Rakamlarla

| Ölçü | Değer | Kaynak |
|---|---|---|
| Otomatik test | 280 birim + entegrasyon (gerçek PostgreSQL), 367 uçtan uca (mobil + masaüstü) | Yerel üretim derlemesi ve CI, 2026-10-23 |
| Erişilebilirlik ve taşma | Tüm herkese açık ve panel sayfaları × 6 genişlik (360–1536 px): yatay kaydırma yok, axe'te ciddi / kritik ihlal yok | `responsive.spec.ts`, 2026-10-23 |
| Lighthouse (mobil, canlı) | Perf 89 · A11y 100 · BP 100 · SEO 69 (demo `noindex` nedeniyle) | Ana sayfa, 2026-10-23; galeri 86, Hakkında 87 |
| İlk yük JS (gzip) | 162–169 KB içerik sayfaları; 193–204 KB form sayfaları | Yerel üretim derlemesi, 2026-10-23 |
| İçerik | 26 eser, 16 hizmet, 12 SSS; site haritasında 53 adres | Demo veritabanı ve `sitemap.xml`, 2026-10-23 |
| Geliştirme | 17 birleştirilmiş PR, 10 migration | GitHub, 2026-10-23 |

## Görseller

| Dosya | Başlık | Açıklama |
|---|---|---|
| `mockup/01-kapak.png` | Galeriden randevuya | Masaüstünde ana sayfa, telefonda numaralı bir eser. Pastel tema ve "küçük sanat eserleri" vurgusu. |
| `mockup/02-mobil-uclu.png` | Üç dokunuşta randevu | Eser sayfası → yalnızca boş saatlerin gösterildiği saat seçimi → randevu kodu ve onay ekranı. |
| `mockup/03-panel.png` | İşletmecinin günü | Masaüstünde randevu ayrıntısı ve WhatsApp şablonları; telefonda "Bugün" ekranı ve tek dokunuşla onay. |
| `screenshot/01-ana-sayfa-mobil.png` | Ana sayfa, telefon | Değer önerisi, randevu ve WhatsApp düğmeleri, alt eylem çubuğu. |
| `screenshot/02-ana-sayfa-masaustu-tam.png` | Ana sayfa, tamamı | En yakın boş saatler, seçki, hizmetler, süreç, hijyen kartı, yorumlar, SSS ve konum. |
| `screenshot/03-galeri-masaustu.png` | Galeri | Eser etiketli ızgara ve stil / renk / uzunluk filtreleri. |
| `screenshot/04-galeri-eser-mobil.png` | Eser sayfası | Müze etiketi, "Bu tasarımı istiyorum", benzer işler. |
| `screenshot/05-randevu-gun-saat-mobil.png` | Saat seçimi | Yalnızca boş saatler, gün bölümlerine ayrılmış. |
| `screenshot/06-randevu-onay-mobil.png` | Randevu talebi alındı | Randevu kodu, durum, tarih ve adres; takvim ve WhatsApp seçenekleri. |
| `screenshot/07-hizmet-detay-tablet.png` | Hizmet sayfası, tablet | Kime uygun, süreç, dayanım, bakım, fiyat yerine WhatsApp. |
| `screenshot/08-hizmet-detay-masaustu.png` | Hizmet sayfası, masaüstü | Aynı içeriğin geniş ekran düzeni. |
| `screenshot/09-iletisim-mobil.png` | İletişim | Açık / kapalı göstergesi, harita, yol tarifi, iletişim formu. |
| `screenshot/10-panel-bugun-mobil.png` | Panel: Bugün, telefon | Üç gösterge, günün ajandası, onay bekleyenler. |
| `screenshot/11-panel-bugun-masaustu.png` | Panel: Bugün, masaüstü | Aynı ekranın geniş düzeni. |
| `screenshot/12-panel-randevu-detay-masaustu.png` | Randevu ayrıntısı | Durum değişikliği, referans tasarım, WhatsApp şablonları, yönetim bağlantısı. |
| `screenshot/13-panel-galeri-yeni-masaustu.png` | Galeriye iş ekleme | Fotoğraf ve öncesi fotoğrafı yükleme, etiketler, müşteri izni. |
| `screenshot/14-panel-talepler-masaustu.png` | Talepler | İletişim formundan gelen mesajlar ve durumları. |

## LinkedIn

**Paylaşım metni:**

> Bir nail art stüdyosunun en çok aldığı iki mesaj: "Bu tasarımın aynısı olur mu?" ve "Bu hafta yer var mı?"
> İkisine de siteden cevap veren bir proje tamamladım.
>
> Nail Art Studios, Kadıköy'de tek kişinin işlettiği bir stüdyo için hazırladığım konsept / demo site + yönetim paneli:
>
> • Galerideki her iş numaralı; "Bu tasarımı istiyorum" randevuyu o tasarımla açıyor
> • Ana sayfada canlı "en yakın boş saatler"; randevuda yalnızca gerçekten boş saatler
> • Müşteri randevusunu gizli bir bağlantıdan erteleyip iptal edebiliyor, takvimine ekliyor
> • İşletmeci günü telefondan yönetiyor: tek dokunuşla onay, hazır WhatsApp mesajları
> • Fiyat yok, çerez yok, üçüncü taraf takip yok
>
> Teknik tarafta en sevdiğim ayrıntı: çift randevuyu yalnızca kod değil, PostgreSQL'deki bir dışlama kısıtı engelliyor. Aynı saate aynı anda iki istek gelse de biri kazanıyor, diğerine en yakın iki boş saat gösteriliyor.
>
> Ölçerek iyileştirdim: yazı tipini 507 KB'tan 118 KB'a indirdim, formları ziyaretçi sayfalarından ayırdım. 367 uçtan uca test her sayfayı 6 ekran genişliğinde taşma ve erişilebilirlik için denetliyor.
>
> Next.js 16, TypeScript, Tailwind, PostgreSQL (Neon), Drizzle, Playwright. Claude Code ile geliştirdim; kararlar ve mimari bana ait.
>
> Demo: https://nail-art-studio-sigma.vercel.app

**Hashtag önerileri:** #NextJS #TypeScript #WebGeliştirme #UXTasarım #Erişilebilirlik #RandevuSistemi

**Carousel sırası:** `01-kapak-dikey` → `02-mobil-uclu` → `04-galeri-eser-mobil` → `05-randevu-gun-saat-mobil` → `06-randevu-onay-mobil` → `03-panel` → `10-panel-bugun-mobil`

## Diğer metinler

- **Portfolyo kartı (≤ 160 karakter):** Nail art stüdyosu için galeriden randevuya site + telefon paneli: canlı boş saatler, WhatsApp köprüsü, çakışmasız randevu.
- **CV satırı:** Nail Art Studios (konsept): Next.js 16 + PostgreSQL ile randevu sistemli stüdyo sitesi ve mobil yönetim paneli; 647 otomatik test, erişilebilirlik 100.
- **GitHub depo açıklaması (İngilizce, ≤ 350 karakter):** Mobile-first site and admin panel for a nail art studio: numbered gallery, live availability, conflict-free online booking (PostgreSQL exclusion constraint), WhatsApp templates, cookieless analytics. Next.js 16, TypeScript, Tailwind 4, Drizzle, Neon, Playwright.
