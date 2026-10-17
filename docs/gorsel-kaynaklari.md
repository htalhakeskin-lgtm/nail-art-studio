# Görsel Kaynakları

> Standart: [17-icerik-ve-demo-verisi §5](standartlar/17-icerik-ve-demo-verisi.md#5-görseller) · Kayıt kaynağı: `src/content/demo-images.ts` · Üretim: `pnpm tsx scripts/images/build-demo-images.ts <indirme-klasörü>`

Kaynağı belirsiz görsel kullanılmaz. Buradaki her görsel **temsilîdir**: Bahadır Karasu'nun işi ya da eli olarak sunulmaz; sitede "Görseller temsilîdir" notu bulunur. Canlıya geçişte izinli gerçek fotoğraflarla değiştirilir (Q-02, BR-GLR-003).

## Kurallar

- Lisans: yalnızca CC0 ya da kamu malı (atıf zorunluluğu yok). Kaynak sayfa ve oluşturan yine de kaydedilir.
- İçerik: yüz yok, okunabilir marka logosu yok, tanınabilir kişi yok.
- Dosyalar: `public/demo/<ad>-{480,960,1600}.webp`, kaynaktan büyütülmez, EXIF / XMP silinir. Özgün dosyalar depoya girmez.
- **rawpixel:** Openverse'ün verdiği 1024 px önizleme temiz; daha büyük `image_1300` sürümü filigranlı (2026-10-17'de doğrulandı). Yalnızca 1024 px kaynak kullanılır.

## Kayıt

| Dosya | Nerede | Kaynak sayfa | Oluşturan | Lisans | Kırpma | Alt metin |
|---|---|---|---|---|---|---|
| `hero-cizgili` | Ana sayfa girişi | [rawpixel 5922590](https://www.rawpixel.com/image/5922590/free-manicure-image-public-domain-cc0-photo) | rawpixel, CC0 kamu malı koleksiyonu | CC0 1.0 | 546×683 (4:5), attention | Kırmızı ojeli tırnaklar; bir tırnakta beyaz çizgili nail art deseni |
| `hero-yaprak` | Ana sayfa girişi | [rawpixel 3293333](https://www.rawpixel.com/image/3293333/free-photo-image-woman-hands-manicure-flowers-skin) | rawpixel, CC0 kamu malı koleksiyonu | CC0 1.0 | 546×683 (4:5), attention | Açık pembe ojeli parmakların üzerinde kurutulmuş pembe çiçek yaprağı |
| `hero-oje-siseleri` | Ana sayfa girişi (≥ 640 px) | [rawpixel 5906601](https://www.rawpixel.com/image/5906601/photo-image-public-domain-art-pink) | rawpixel, CC0 kamu malı koleksiyonu | CC0 1.0 | 546×683 (4:5), centre | Pudradan kırmızıya renk sırasıyla dizilmiş etiketsiz oje şişeleri |
| `hakkinda-firca` | Ana sayfa "Stüdyo" bölümü, Hakkında | [rawpixel 5926347](https://www.rawpixel.com/image/5926347/photo-image-public-domain-hand-pink) (aynı çekim: [StockSnap XX356Q6EI4](https://stocksnap.io/photo/people-hands-XX356Q6EI4), freestocks.org) | rawpixel / freestocks.org | CC0 1.0 | 1024×683 (3:2), centre | Pembe eldivenli bir nail artist ince fırçayla tırnağa desen çiziyor |
| `hakkinda-bordo-oje` | Hakkında | [rawpixel 3299322](https://www.rawpixel.com/image/3299322/free-photo-image-nail-polish-manicure) | rawpixel, CC0 kamu malı koleksiyonu | CC0 1.0 | 910×683 (4:3), east | Tırnaklara bordo kalıcı oje sürülüyor |

**Arama yolu:** Unsplash ve StockSnap tam boyutlu indirmeye otomatik erişimi engelliyor; görseller [Openverse](https://openverse.org) API'sinde `license=cc0,pdm` süzgeciyle bulundu (2026-10-17). Elenenler: marka logosu görünen oje şişeleri (Openverse `f48aaea2`).
