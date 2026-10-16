# Kalite Kapıları (Bitti Tanımı)

> **Proje:** Nail Art Studios · Bahadır Karasu · **Seviye:** S2 · **Ortam:** Demo (kişiye özel)
> Kaynak: web-proje/sablonlar/kalite-kapilari.md v1.0

<!-- Kurulumda (2026-10-16) S2 + demo için işaretlendi. Seviyeye uymayan maddeler silinmedi: "n/a (S2)"; canlıya özgü olanlar "demo'da n/a". -->

Üç düzey vardır. Bir iş, kendi düzeyinin **ve** altındaki düzeylerin koşullarını karşıladığında biter.

## A. Her commit / PR

- [ ] Başlık Conventional Commits biçiminde ve İngilizce; açıklamada ilgili `REQ` / `BR` / `SCR` / `ADR` numaraları.
- [ ] CI yeşil: lint, typecheck, biçim, testler, build, gizli bilgi taraması.
- [ ] Fark satır satır okundu: unutulmuş `console.log`, yorum satırına alınmış kod, istenmeden eklenmiş dosya yok.
- [ ] Değişikliğin türüne göre gereken test eklendi ([14-test §4](standartlar/14-test.md#4-hangi-değişiklik-hangi-testi-ister)).
- [ ] Şema değişikliği migration ile geldi; migration SQL'i okundu.
- [ ] Arayüz değiştiyse 360 px ve 1280 px ekran görüntüsü PR'a eklendi.
- [ ] Kural kapatma (`eslint-disable`) varsa tek satır ve gerekçeli.

## B. Her dilim (özellik)

- [ ] Kabul kriterlerinin tamamı karşılanıyor.
- [ ] **Dikey:** veri + sunucu + ekran + panel tarafı + test birlikte bitti.
- [ ] **Mobil:** 360, 390, 768, 1280 px'te kontrol edildi; yatay kaydırma yok; dokunma hedefleri ≥ 44 px; mobilde tablo yerine kart.
- [ ] Yükleniyor, boş ve hata durumları var; form hatasında veri kaybolmuyor.
- [ ] Klavyeyle baştan sona kullanılabiliyor; odak görünür.
- [ ] Yetki ve sahiplik sunucuda denetleniyor (S2+: testli).
- [ ] Kural ihlalleri Türkçe, ne yapılacağını söyleyen mesajla gösteriliyor.
- [ ] Herkese açık sayfaysa: meta, canonical, JSON-LD, sitemap'te yer.
- [ ] ~~Değişen kayıtlar işlem geçmişine yazılıyor (S3+).~~ n/a (S2); yalnızca randevu durum geçişleri ve başarısız girişler yazılır (plan §9).
- [ ] Seed verisi güncel; demo senaryosu etkileniyorsa e2e testi güncel.
- [ ] Plan ve ilerleme dosyası güncel.

## C. Sürüm / yayın öncesi

| # | Grup | Madde | Seviye | Nasıl | Bu projede |
|---|---|---|---|---|---|
| 1 | Mobil | Tüm sayfalar ve panel ekranları 360–1536 px'te yatay kaydırmasız | Tümü | `tests/e2e/responsive.spec.ts` | Uygulanır |
| 1 | Mobil | Gerçek bir iPhone ve bir Android cihazda ana akış denendi | S2+ | Elle | Uygulanır |
| 1 | Mobil | Panel mobilde alt sekme çubuğuyla kullanılabiliyor | Tümü | Elle + e2e | Uygulanır |
| 2 | Yasal | KVKK aydınlatma, çerez politikası, gizlilik, (gerekirse) kullanım koşulları yayında | Tümü | e2e duman | Uygulanır |
| 2 | Yasal | Onay verilmeden analitik / piksel betiği yüklenmiyor | Tümü | e2e: ağ istekleri | Uygulanır: zorunlu dışı çerez yok (K-13); e2e üçüncü taraf istek denetimi D-11 |
| 2 | Yasal | Formlarda aydınlatma bağlantısı; açık rıza kutuları ayrı ve işaretsiz; onay kaydı tutuluyor | Tümü | Entegrasyon testi | Uygulanır |
| 2 | Yasal | İYS / ticari ileti onayları (varsa) | S2+ | Elle | n/a: pazarlama iletisi yok (plan §14) |
| 2 | Yasal | Yasal metinler hukuki incelemeden geçti | Canlı | Müşteri onayı | demo'da n/a |
| 3 | SEO | `sitemap.xml`, `robots.txt`, canonical, title / description, OG görselleri | Tümü | e2e + Rich Results Test | Uygulanır |
| 3 | SEO | JSON-LD doğrulandı; kurgusal yorum için `Review` yok | Tümü | Schema doğrulayıcı | Uygulanır |
| 3 | SEO | Kırık bağlantı yok; 404 doğru durum kodu | Tümü | Bağlantı tarayıcı | Uygulanır |
| 3 | SEO | Demo'da `noindex`; canlıda kaldırıldı | Tümü | Başlık testi | Uygulanır |
| 4 | Erişilebilirlik | axe: ciddi / kritik ihlal yok (tüm sayfalar) | Tümü | e2e | Uygulanır |
| 4 | Erişilebilirlik | Klavye turu: menü, formlar, diyaloglar, panel | Tümü | Elle | Uygulanır |
| 4 | Erişilebilirlik | Kontrast: tüm token çiftleri AA | S2+ | Birim testi | Uygulanır |
| 5 | Performans | Lighthouse mobil: Perf ≥ 90, A11y ≥ 95, BP ≥ 95, SEO = 100 (indekslenen sayfa) | Tümü | Lighthouse (önizleme) | Uygulanır |
| 5 | Performans | İlk yük JS bütçesi (herkese açık ≤ 170 KB, panel ≤ 300 KB) | S2+ | `pnpm analyze` | Uygulanır |
| 6 | Güvenlik | Güvenlik başlıkları (CSP, HSTS, XFO/frame-ancestors, Referrer-Policy, Permissions-Policy) | Tümü | Başlık testi | Uygulanır |
| 6 | Güvenlik | Form ve giriş hız sınırı; honeypot | Tümü | Entegrasyon testi | Uygulanır |
| 6 | Güvenlik | Yetki ve sahiplik testleri; panel uçları anonim erişime kapalı | S2+ | Entegrasyon testi | Uygulanır |
| 6 | Güvenlik | Depoda gizli bilgi yok (tüm geçmiş) | Tümü | gitleaks | Uygulanır |
| 6 | Güvenlik | Yüksek / kritik açıklı bağımlılık yok | Tümü | `pnpm audit` | Uygulanır |
| 7 | İşlevsellik | Her form uçtan uca: kayıt düşüyor, panelde görünüyor, bildirim gidiyor (demo'da demo kutusu) | Tümü | e2e | Uygulanır |
| 7 | İşlevsellik | Panel CRUD akışları ve uç durumlar (uzun metin, görselsiz kayıt, boş liste) | Tümü | e2e + elle | Uygulanır |
| 8 | Testler | CI yeşil; seviye minimum testleri var; demo senaryosu e2e geçiyor | S3+ | CI | Uygulanır: S2 de demo senaryosu e2e ister (14-test §3) |
| 9 | İçerik | Yer tutucu metin yok; görseller ve alt metinler tam; görsel kaynak kaydı var | Tümü | Arama + elle | Uygulanır |
| 9 | İçerik | Demo notları yerinde (şerit, alt bilgi, yasal metin "örnek" notu) | Demo | Elle | Uygulanır |
| 10 | Belgeler | README, `.env.example`, admin kılavuzu, plan ve ilerleme güncel | Tümü | Elle | Uygulanır |
| 11 | Yayın | Ortam değişkenleri tam (doğrulama açılışta geçiyor) | Tümü | Uygulama açılışı | Uygulanır |
| 11 | Yayın | Alan adı, HTTPS, www / kök yönlendirmesi | Canlı | Elle | demo'da n/a |
| 11 | Yayın | E-posta alan adı doğrulaması (SPF, DKIM, DMARC) | Canlı | Resend paneli | demo'da n/a |
| 11 | Yayın | Uptime izleme ve hata izleme kurulu; yedek doğrulandı | Canlı | Elle | demo'da n/a |
| 11 | Yayın | Search Console ve Bing Webmaster; sitemap gönderildi | Canlı | Elle | demo'da n/a |
| 12 | Portfolyo | `portfolyo/` çıktıları hazır | Tümü | `pnpm screenshots` + elle | Uygulanır |

## Rapor

Sonuçlar `docs/ilerleme.md` → "Kalite kapısı raporu" tablosuna yazılır. Kırmızı madde varsa ilgili dilim yeniden açılır.
