# Görsel Kaynakları

> Standart: [17-icerik-ve-demo-verisi §5](standartlar/17-icerik-ve-demo-verisi.md#5-görseller) · Kayıt kaynağı: `src/content/demo-images.ts` · Üretim: `pnpm tsx scripts/images/build-demo-images.ts <indirme-klasörü>` (`<klasör>/<pexels-no>/original.jpg`)

Kaynağı belirsiz görsel kullanılmaz. Buradaki her görsel **temsilîdir**: Bahadır Karasu'nun işi ya da eli olarak sunulmaz; sitede "Görseller temsilîdir" notu bulunur. Canlıya geçişte izinli gerçek fotoğraflarla değiştirilir (Q-02, BR-GLR-003).

## Kurallar

- **Lisans:** [Pexels Lisansı](https://www.pexels.com/license/): ticari kullanım serbest, atıf zorunlu değil; tek başına satılamaz, kişiyi onaylıyormuş gibi gösterilemez. Kaynak sayfa ve fotoğrafçı yine de kaydedilir.
- **Pinterest kullanılmaz (K-28):** Pinterest bir kaynak değil, başkalarının paylaşımlarını toplayan bir pano; görsellerin lisansı yok ve başka sanatçıların işi. Bahadır Karasu'nun sitesinde başkasının tırnak tasarımı onun işi gibi görünür (RSK-01). Gerçek işler, yayın izniyle panelden eklenir (D-09).
- **İçerik:** yüz yok, okunabilir marka logosu yok, tanınabilir kişi yok.
- **Dosyalar:** `public/demo/<ad>-{480,960,1600}.webp`, kaynaktan büyütülmez, EXIF / XMP silinir. Özgün dosyalar depoya girmez.
- **İndirme:** `https://images.pexels.com/photos/<no>/pexels-photo-<no>.jpeg?auto=compress&cs=tinysrgb&w=2000` (filigransız). Fotoğrafçı adı sayfadaki `ImageObject` JSON-LD'sinin `creator.name` alanından okunur.

## Kayıt

| Dosya | Nerede | Kaynak sayfa | Fotoğrafçı | Kırpma | Alt metin |
|---|---|---|---|---|---|
| `hero-puantiye` | Ana sayfa girişi | [Pexels 7066298](https://www.pexels.com/photo/a-person-holding-bottles-of-nail-polish-7066298/) | locrifa | 1064×1330 (4:5), attention | Pembe, sarı, mavi ve beyaz tırnaklarda renkli puantiye nail art |
| `hero-pembe-cicek` | Ana sayfa girişi | [Pexels 20715643](https://www.pexels.com/photo/pink-flower-and-woman-manicure-20715643/) | mehrab zahedbeigi | 1064×1330 (4:5), attention | Şeker pembesi taşlı tırnaklar ve elin üzerinde pembe bir krizantem |
| `hero-bahar` | Ana sayfa girişi (≥ 640 px) | [Pexels 17323334](https://www.pexels.com/photo/hand-touching-flowers-17323334/) | Valeria Boltneva | 1064×1330 (4:5), centre | Pastel turkuaz tırnaklar ve pembe bahar çiçekleri |
| `hakkinda-renk-paleti` | Ana sayfa "Stüdyo" bölümü, Hakkında | [Pexels 7755241](https://www.pexels.com/photo/finger-pointing-at-nail-color-palette-7755241/) | RDNE Stock project | 1200×800 (3:2), centre | Pembe havlu üzerinde yelpaze biçiminde renk kartelası; bir parmak renk seçiyor |
| `hakkinda-pembe-oje` | Hakkında | [Pexels 973405](https://www.pexels.com/photo/woman-s-pink-pedicure-973405/) | Element5 Digital | 1200×900 (4:3), centre | Tırnaklara şeker pembesi oje sürülüyor; yanda açık oje şişesi |

**Arama yolu (2026-10-22):** Unsplash otomatik tarayıcıya 403 veriyor; Pexels yalnızca görünür (headed) tarayıcıyla açılıyor. "nail art", "colorful nails", "pastel manicure", "french manicure", "glitter nails" aramalarından 138 aday çıktı, 29'u seçildi. Elenenler: yüz görünenler, marka logolu şişeler, bulanık ya da tırnağın küçük kaldığı kareler. Önceki rawpixel CC0 görselleri (D-01a) soluk bulundu ve kaldırıldı.
