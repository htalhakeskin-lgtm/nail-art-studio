---
paths:
  - "src/app/*site*/**"
  - "content/**"
---

# Herkese açık sayfalar (sayfa ve içerik düzenlemesinde)

<!-- `*site*` deseni `(site)` rota grubunu kapsar; parantez glob'da grup sözdizimi olduğu için doğrudan yazılmadı. -->

Tam kurallar: docs/standartlar/09-seo.md, 10-yasal-ve-kvkk.md, 12-performans.md, 17-icerik-ve-demo-verisi.md

- Her sayfa `generateMetadata` ile title (≤ 60 karakter), description (≤ 160), canonical ve Open Graph verir.
- Sayfada tek `h1`; başlıklar sırayla. Breadcrumb hem görünür hem `BreadcrumbList` JSON-LD.
- JSON-LD yalnızca sayfada görünen bilgiyle; kurgusal yorumla `Review` / `AggregateRating` yok.
- Yeni dinamik sayfa türü `sitemap.ts`'e eklenir; filtre kombinasyonları ve teşekkür sayfaları `noindex`.
- Statik / önbellekli üretim varsayılan; istek başına dinamik yalnızca gerekirse.
- Kişisel veri alan form: aydınlatma bağlantısı, ayrı ve işaretsiz rıza kutuları, honeypot, hız sınırı.
- Metin: Türkçe, "siz" dili, somut; lorem ipsum yok; kurgusal içerik demo notuyla.
- Görseller: alt metin anlamlı; dekoratifse `alt=""`. Kaynağı `docs/gorsel-kaynaklari.md`'ye yazılır.
