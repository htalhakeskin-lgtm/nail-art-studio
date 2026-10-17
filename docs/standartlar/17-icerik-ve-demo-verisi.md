# İçerik ve Demo Verisi

> **Durum:** v1.0 · **Son güncelleme:** 2026-10-16
> **Kararlar:** [Bölüm 9](#9-kararlar)

## 1. Bu belge ne işe yarar

Demo içeriğinin gerçekçi, Türkçe, yasal açıdan güvenli ve portfolyoda iyi görünen biçimde üretilmesini sağlar. Seed betiğinin teknik kuralları [04 §11](04-veri.md#11-seed-ve-sıfırlama)'dedir.

## 2. İlkeler

1. **Lorem ipsum yok.** Her metin sektöre özgü, anlamlı Türkçedir. Yer tutucu metin yayına çıkmaz (kalite kapısı 9).
2. **Kurgusal ama inandırıcı.** Firma, kişi ve yorumlar kurgusaldır ve kurgusal oldukları açıkça işaretlenir; içerik gerçek bir işletmenin yazacağı kalitededir.
3. **Gerçek kimseye ulaşmaz.** Demo'daki telefon, e-posta ve adresler gerçek bir kişiye ya da işletmeye ait olamaz.
4. **Uç durumları göster.** Demo verisi yalnızca mükemmel kayıtlardan oluşmaz; uzun başlık, eksik görsel, iptal, boş kategori arayüzün dayanıklılığını gösterir.

## 3. Kurgusal kimlikler

| Öğe | Kural | Örnek |
|---|---|---|
| Firma adı | Sektöre uygun, Türkçe, akılda kalıcı; aynı şehir + sektörde gerçek bir işletmeyle çakışmadığı aramayla kontrol edilir | "Lâl Diş Kliniği", "Revnak Gayrimenkul" |
| Logo | Projeye özgü üretilir (SVG, kelime işareti + basit simge); gerçek marka andırmaz | — |
| Kişi adları | Çeşitli, gerçekçi Türkçe ad-soyad kombinasyonları; ünlü ya da kamuya mal olmuş kişi adı yok | "Dt. Elif Karaca" |
| Telefon | Varsayılan: `000` blok içeren, aranamayan numaralar. Portfolyo demosunda istenirse ofis / WhatsApp hattı olarak **geliştiricinin kendi gerçek hattı** (kurgusal kişilerin numarası değil; plan K- kararıyla) | `0212 000 12 34`, `0532 000 45 67` |
| WhatsApp | Telefonla aynı kural; mesaj taslağı sayfa bağlamıyla dolu | — |
| E-posta | `example.com` ya da `.test` alan adları (RFC 2606) | `iletisim@lal-dis.example.com` |
| Adres | Gerçek ilçe / mahalle, kurgusal sokak ve kapı no | "Moda Cad. No: 00, Kadıköy / İstanbul" |
| Harita konumu | İlçenin genel bölgesi; gerçek bir işletmenin üstü değil | — |
| Vergi / MERSİS / yetki belgesi no | Açıkça örnek (`0000000000`) | — |

Alt bilgide ve yasal metinlerde: "Bu site gösterim amaçlı bir demodur; firma, kişi ve yorumlar kurgusaldır."

## 4. Metin üslubu

| Konu | Kural |
|---|---|
| Hitap | Ziyaretçiye "siz"; samimi ama profesyonel. Sektöre göre ton plan §11'de (metin tonu): sağlıkta güven veren ve sakin, restoranda sıcak ve iştah açıcı, hukukta ölçülü ve bilgilendirici. |
| Başlık | Fayda odaklı ve somut: "Tek seansta beyazlatma, 60 dakikada" > "Kaliteli hizmet". |
| Abartı | "En iyi", "1 numara", "garantili" kullanılmaz (sağlık ve hukukta ayrıca yasal risk, [10 §10](10-yasal-ve-kvkk.md#10-sektöre-özgü-uyarılar-araştırma-fazında-doğrulanır)). |
| Sayılar | Gerçekçi ve tutarlı: "12 yıllık deneyim" ise ekip ve referanslar da buna uyar. |
| Fiyat | Sektörün o yılki gerçekçi aralığında; KDV dahil yazılır. |
| Mikro metin | Düğme, boş durum, hata ve onay metinleri plan §6'da ekranla birlikte yazılır. |
| Yorumlar | "Örnek yorum" etiketiyle; yapılandırılmış veri basılmaz. Ad yalnızca ad + soyadın baş harfi ("Ayşe K."). |
| Blog | Gerçek bilgi içeren, sektörde sık sorulan konular; sağlık ve hukuk içeriğinde "bilgilendirme amaçlıdır" notu. |

Yapay zekâ ile üretilen metin kontrol edilir: tekrar eden kalıplar ("…dünyasına adım atın", "…ile tanışın"), anlamsız övgü ve yanlış bilgi temizlenir.

## 5. Görseller

| Kaynak | Kullanım | Kayıt |
|---|---|---|
| Ticari kullanıma açık stok (Unsplash, Pexels vb.) | Mekân, ürün, atmosfer | Bağlantı, fotoğrafçı, lisans |
| Yapay zekâ ile üretilmiş | Kurgusal ekip portreleri, ürün, öncesi / sonrası benzeri gösterimler | Araç adı, istem, tarih; "temsilîdir" notu |
| Projeye özgü çizim / SVG | Logo, ikon, desen, harita işaretçisi | — |
| Müşterinin kendi görselleri (canlı) | Gerçek mekân ve ekip | İzin / sözleşme |

- **Kayıt dosyası:** `docs/gorsel-kaynaklari.md` (görsel → kaynak → lisans). Kaynağı belirsiz görsel kullanılmaz.
- Gerçek bir kişinin tanınır fotoğrafı "ekibimiz" ya da "müşterimiz" olarak kullanılmaz; stok model fotoğrafı ekip üyesi gibi sunulacaksa yapay zekâ portresi tercih edilir ve demo notu bulunur.
- Gerçek marka logosu, tanınır ürün ambalajı, plakası okunan araç, başkasına ait sanat eseri kullanılmaz.
- Biçim: AVIF / WebP, en fazla 2560 px; dosya adı Türkçe ASCII ve açıklayıcı (`kadikoy-salon-genel.webp`).
- Oranlar tutarlı: kart 4:3, kapak 16:9, portre 4:5, galeri karışık ama ızgara sabit.
- Her görselin alt metni seed'de yazılıdır.
- Ton: aynı projedeki görseller benzer ışık ve renk sıcaklığında; gerekirse hafif renk eşitleme.

## 6. Hacim (seviyeye göre)

| Varlık | S1 | S2 | S3 | S4 |
|---|---|---|---|---|
| Hizmet / ürün / ilan | 6–10 | 10–20 | 30–60 | 100+ |
| Ekip | 3–4 | 4–8 | 6–12 | — |
| Galeri / proje | 8–12 | 12–24 | 24+ | — |
| Örnek yorum | 4–6 | 6–12 | 12+ | 30+ |
| Blog yazısı | — | 4–6 | 8–12 | 12+ |
| SSS | 6–10 | 10–15 | 15+ | 20+ |
| Talep / CRM kaydı (son 90 gün) | 10–20 | 30–60 | 100–200 | 300+ |
| Randevu / rezervasyon (geçmiş + gelecek) | — | 40–80 | 150+ | 300+ |
| Sipariş (son 6 ay) | — | — | — | 200+ |

Panel grafiklerinin anlamlı görünmesi için kayıtlar zamana dağıtılır (hafta içi / hafta sonu farkı, mevsimsellik, kaynak dağılımı: Google %40, Instagram %25, tavsiye %20, diğer).

## 7. Demo senaryosu

Her projenin plan §19'unda 3–5 dakikalık bir demo senaryosu bulunur ve e2e testiyle korunur. Örnek (diş kliniği):
1. Ziyaretçi telefondan ana sayfaya girer, "Diş beyazlatma" hizmetini açar, fiyat aralığını ve süreci görür.
2. "Randevu al" ile hekim ve saat seçer, formu doldurur, onay kodunu alır, takvime ekler.
3. Yönetici panelde bildirimi görür, randevuyu onaylar; demo kutusunda hastaya giden onay mesajı görünür.
4. Pano: bu haftanın randevuları, talep kaynakları.

## 8. İçerik teslimi (canlı)

- Müşteriden içerik toplama listesi plan §14'te (logo, fotoğraflar, ekip bilgileri, hizmet açıklamaları, fiyatlar, sertifikalar).
- İçerik gelmezse demo içeriği "taslak" olarak kalır ve canlıya geçiş listesinde işaretli kalır; kurgusal içerik canlıda gerçekmiş gibi yayınlanmaz.

## 9. Kararlar

| No | Konu | Karar | Gerekçe |
|---|---|---|---|
| IC-01 | Telefon numaraları | `000` blok kalıbı ya da geliştiricinin kendi hattı | Rastgele görünen numara gerçek birine ait olabilir. Revnak K18'de kurgusal danışman numaraları yerine geliştiricinin gerçek ofis hattı kullanıldı; iki güvenli seçenek de standarda alındı. |
| IC-02 | E-posta alan adı | `example.com` / `.test` | Ayrılmış alan adları; gönderim kazası olmaz. |
| IC-03 | Yorum | Etiketli, şemasız | Yanıltıcı olmama + Google politikası. |
| IC-04 | Görsel kaydı | Zorunlu kaynak dosyası | Lisans sorunu portfolyoda ve canlıda risk. |
| IC-05 | Hacim | Seviyeye göre tablo | Panelin dolu ve gerçekçi görünmesi portfolyonun en güçlü kanıtı. |

## 10. Değişiklik kaydı

| Tarih | Sürüm | Değişiklik |
|---|---|---|
| 2026-10-16 | v1.0 | İlk sürüm. |
