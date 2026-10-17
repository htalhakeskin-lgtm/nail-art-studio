---
paths:
  - "tests/**"
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
---

# Testler (test dosyası düzenlemesinde)

Tam kurallar: docs/standartlar/14-test.md

- Kural testinin adı kural numarasıyla başlar: `BR-RND-003: rejects overlapping appointment for the same staff`.
- Davranış test edilir; CSS sınıfı ve iç durum sorgulanmaz. Öğeler rol ve erişilebilir adla bulunur.
- Veritabanı sahte değildir: entegrasyon testleri gerçek PostgreSQL'de çalışır. Sahte nesne yalnızca dış servisler ve zaman için.
- Zaman sabitlenir (`vi.setSystemTime` / `now` parametresi). Sabit süreli bekleme yok; Playwright'ın bekleyen doğrulamaları kullanılır.
- Her test kendi verisini oluşturur; testler birbirine dayanmaz.
- Anlık görüntü (snapshot) testi yazılmaz.
- E2E: tarayıcı saat dilimi UTC, dil `tr-TR`; arayüz yine de İstanbul saatini göstermelidir. Mobil testler `@mobile`, taşma testleri `@responsive` etiketlidir.
- Hata düzeltmesinde önce hatayı yeniden üreten test yazılır.
