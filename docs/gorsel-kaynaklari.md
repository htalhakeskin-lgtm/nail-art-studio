# Görsel Kaynakları

> Standart: [17-icerik-ve-demo-verisi §5](standartlar/17-icerik-ve-demo-verisi.md#5-görseller) · Kayıt kaynağı: `src/content/demo-images.ts` · Üretim: `pnpm tsx scripts/images/build-demo-images.ts <indirme-klasörü>` (`<klasör>/<pexels-no>/original.jpg`)

Kaynağı belirsiz görsel kullanılmaz. Galeri eserleri bu görsellerden `scripts/seed.ts` ile üretilir (`src/content/gallery.ts`); eser sayfasında "Temsilî görsel" notu ve fotoğrafçı bağlantısı görünür. Buradaki her görsel **temsilîdir**: Bahadır Karasu'nun işi ya da eli olarak sunulmaz; sitede "Görseller temsilîdir" notu bulunur. Canlıya geçişte izinli gerçek fotoğraflarla değiştirilir (Q-02, BR-GLR-003).

## Kurallar

- **Lisans:** [Pexels Lisansı](https://www.pexels.com/license/): ticari kullanım serbest, atıf zorunlu değil; tek başına satılamaz, kişiyi onaylıyormuş gibi gösterilemez. Kaynak sayfa ve fotoğrafçı yine de kaydedilir.
- **Pinterest kullanılmaz (K-28):** Pinterest bir kaynak değil, başkalarının paylaşımlarını toplayan bir pano; görsellerin lisansı yok ve başka sanatçıların işi. Bahadır Karasu'nun sitesinde başkasının tırnak tasarımı onun işi gibi görünür (RSK-01). Gerçek işler, yayın izniyle panelden eklenir (D-09).
- **İçerik:** yüz yok, okunabilir marka logosu yok, tanınabilir kişi yok.
- **Dosyalar:** `public/demo/<ad>-{480,960,1600}.webp`, kaynaktan büyütülmez, EXIF / XMP silinir. Özgün dosyalar depoya girmez.
- **İndirme:** `https://images.pexels.com/photos/<no>/pexels-photo-<no>.jpeg?auto=compress&cs=tinysrgb&w=2000` (filigransız). Fotoğrafçı adı sayfadaki `ImageObject` JSON-LD'sinin `creator.name` alanından okunur.

## Kayıt

| Dosya | Nerede | Kaynak sayfa | Fotoğrafçı | Kırpma | Alt metin |
|---|---|---|---|---|---|
| `hero-puantiye` | Ana sayfa girişi, galeri (No. 001) | [Pexels 7066298](https://www.pexels.com/photo/a-person-holding-bottles-of-nail-polish-7066298/) | locrifa | 1064×1330 (4:5), attention | Pembe, sarı, mavi ve beyaz tırnaklarda renkli puantiye nail art |
| `hero-pembe-cicek` | Ana sayfa girişi, galeri (No. 002) | [Pexels 20715643](https://www.pexels.com/photo/pink-flower-and-woman-manicure-20715643/) | mehrab zahedbeigi | 1064×1330 (4:5), attention | Şeker pembesi taşlı tırnaklar ve elin üzerinde pembe bir krizantem |
| `hero-bahar` | Ana sayfa girişi (≥ 640 px), galeri (No. 009) | [Pexels 17323334](https://www.pexels.com/photo/hand-touching-flowers-17323334/) | Valeria Boltneva | 1064×1330 (4:5), centre | Pastel turkuaz tırnaklar ve pembe bahar çiçekleri |
| `hakkinda-renk-paleti` | Ana sayfa "Stüdyo" bölümü, Hakkında | [Pexels 7755241](https://www.pexels.com/photo/finger-pointing-at-nail-color-palette-7755241/) | RDNE Stock project | 1200×800 (3:2), centre | Pembe havlu üzerinde yelpaze biçiminde renk kartelası; bir parmak renk seçiyor |
| `hakkinda-pembe-oje` | Hakkında | [Pexels 973405](https://www.pexels.com/photo/woman-s-pink-pedicure-973405/) | Element5 Digital | 1200×900 (4:3), centre | Tırnaklara şeker pembesi oje sürülüyor; yanda açık oje şişesi |
| `galeri-lila-pembe` | Galeri | [Pexels 939835](https://www.pexels.com/photo/person-s-hand-with-pink-manicure-939835/) | Valeria Boltneva | 1064×1330 (4:5), attention | Lila pembe kalıcı ojeli badem tırnaklar; yüzük parmağında simli vurgu |
| `galeri-pastel-inci` | Galeri | [Pexels 36655811](https://www.pexels.com/photo/pastel-manicure-with-a-smoothie-in-hand-36655811/) | N G | 1064×1330 (4:5), attention | Pastel lila, inci parlaklığında badem tırnaklar |
| `galeri-nude-sim` | Galeri | [Pexels 35491156](https://www.pexels.com/photo/elegant-nude-and-glitter-manicure-close-up-35491156/) | Jaki&Kari Jelevi | 1064×1330 (4:5), attention | Nude ve pembe simli tırnaklar; bir tırnakta ince beyaz çizgi deseni |
| `galeri-altin-cizgili-french` | Galeri | [Pexels 31744665](https://www.pexels.com/photo/elegant-nail-art-with-gold-details-in-natural-light-31744665/) | Анастасія | 1064×1330 (4:5), attention | Uzun kare tırnaklarda beyaz french ve ince altın çizgiler |
| `galeri-klasik-french` | Galeri | [Pexels 34997575](https://www.pexels.com/photo/elegant-hand-with-french-manicure-and-jewelry-34997575/) | Salim Da | 1064×1330 (4:5), attention | Kırmızı peluş üzerinde klasik beyaz french manikür |
| `galeri-cicekli-baby-boomer` | Galeri | [Pexels 17471377](https://www.pexels.com/photo/hands-with-professional-manicure-17471377/) | abolfazl zarghami | 1064×1330 (4:5), attention | Pembeden beyaza geçişli tırnaklarda beyaz çiçek çizimleri |
| `galeri-altin-sim` | Galeri | [Pexels 10632142](https://www.pexels.com/photo/person-s-hands-with-gold-glitter-nails-10632142/) | Pexels User | 1064×1330 (4:5), attention | Altın simli kalıcı oje ve renkli pullar |
| `galeri-lila-simli-uclar` | Galeri | [Pexels 34835280](https://www.pexels.com/photo/elegant-hand-with-nail-art-on-red-fur-34835280/) | Salim Da | 1064×1330 (4:5), attention | Açık pembe tırnakların uçlarında lila sim |
| `galeri-turkuaz-badem` | Galeri | [Pexels 10420563](https://www.pexels.com/photo/a-person-with-manicured-nails-while-wearing-silver-rings-10420563/) | PabloKlik | 1064×1330 (4:5), attention | Uzun badem tırnaklarda turkuaz geçişli renk ve gümüş yüzükler |
| `galeri-pembe-simli-gecis` | Galeri | [Pexels 34835283](https://www.pexels.com/photo/close-up-of-artistic-pink-manicure-with-glitter-34835283/) | Salim Da | 1064×1330 (4:5), attention | Pembe tırnakların uçlarına doğru yoğunlaşan lila sim |
| `galeri-baby-boomer` | Galeri | [Pexels 5871914](https://www.pexels.com/photo/a-hand-touching-shaving-foam-5871914/) | cottonbro studio | 1064×1330 (4:5), attention | Köpük üzerinde nudeden beyaza geçişli baby boomer tırnaklar |
| `galeri-kirmizi-dalga` | Galeri | [Pexels 34871560](https://www.pexels.com/photo/elegant-red-and-white-manicure-on-hand-34871560/) | Salim Da | 1064×1330 (4:5), attention | Kırmızı ve beyaz dalga desenli tırnaklar, koyu mavi fon |
| `galeri-leopar` | Galeri | [Pexels 34835304](https://www.pexels.com/photo/stylish-leopard-print-and-black-nail-art-34835304/) | Salim Da | 1064×1330 (4:5), attention | Leopar desenli ve siyah tırnakların karışımı |
| `galeri-turkuaz-mermer` | Galeri | [Pexels 34971940](https://www.pexels.com/photo/close-up-of-stylish-turquoise-nail-art-34971940/) | Salim Da | 1064×1330 (4:5), attention | Uzun badem tırnaklarda turkuaz mermer deseni |
| `galeri-siyah-beyaz-girdap` | Galeri | [Pexels 5875946](https://www.pexels.com/photo/hand-holdin-5875946/) | cottonbro studio | 1064×1330 (4:5), attention | Mavi muz heykeli tutan elde siyah, beyaz ve sarı girdap desenli tırnaklar |
| `galeri-sari-benekli` | Galeri | [Pexels 13277178](https://www.pexels.com/photo/a-hand-with-colorful-nail-art-holding-green-leaf-13277178/) | Дарина Ритомская | 1064×1330 (4:5), attention | Nude tırnaklarda sarı lekeler ve siyah benekler; elde yeşil yaprak |
| `galeri-takili-siyah-beyaz` | Galeri | [Pexels 18730147](https://www.pexels.com/photo/close-up-of-woman-manicure-18730147/) | honggyu kim | 1064×1330 (4:5), attention | Kısa tırnaklarda siyah ve beyaz oje, haç biçimli metal takılar |
| `galeri-kirmizi-kalpler` | Galeri | [Pexels 15343609](https://www.pexels.com/photo/woman-holding-a-white-carnation-flower-15343609/) | Mariam Gab | 1064×1330 (4:5), attention | Açık pembe tırnaklarda küçük kırmızı kalpler; elde beyaz karanfil |
| `galeri-pembe-sade` | Galeri | [Pexels 20758448](https://www.pexels.com/photo/pink-flower-on-hand-with-polished-nails-20758448/) | mehrab zahedbeigi | 1064×1330 (4:5), attention | Şeker pembesi sade tırnaklar ve elin üzerinde pembe çiçek |
| `galeri-minimal-cizim` | Galeri | [Pexels 7664093](https://www.pexels.com/photo/a-hand-with-manicured-nails-on-white-textile-7664093/) | solod_sha Content creator | 1064×1330 (4:5), attention | Nude ve lavanta tırnaklarda ince siyah çizgi çizimler |
| `galeri-mandalina` | Galeri | [Pexels 11124899](https://www.pexels.com/photo/close-up-photo-of-manicured-nails-11124899/) | Anna Shvets | 1064×1330 (4:5), attention | Sarı fonda yeşil kazaklı elde mandalina turuncusu tırnaklar |
| `galeri-her-tirnak-bir-renk` | Galeri | [Pexels 11124918](https://www.pexels.com/photo/a-woman-with-colorful-nails-11124918/) | Anna Shvets | 1064×1330 (4:5), attention | Her tırnağı farklı renkte kısa tırnaklar: kırmızı, mercan, gri, bordo |
| `galeri-op-art` | Galeri | [Pexels 5871219](https://www.pexels.com/photo/fingers-with-nail-polish-5871219/) | cottonbro studio | 1064×1330 (4:5), attention | Sarı fonda siyah beyaz op-art girdap desenli tırnaklar |
| `galeri-gokkusagi-stiletto` | Galeri | [Pexels 28713174](https://www.pexels.com/photo/vibrant-stiletto-nail-art-design-close-up-28713174/) | Sebastian Balog | 1064×1330 (4:5), attention | Uzun pembe stiletto tırnaklar; birinde gökkuşağı renklerinde çizgiler |

**Arama yolu (2026-10-22):** Unsplash otomatik tarayıcıya 403 veriyor; Pexels yalnızca görünür (headed) tarayıcıyla açılıyor. "nail art", "colorful nails", "pastel manicure", "french manicure", "glitter nails" aramalarından 138 aday çıktı, 29'u seçildi. Elenenler: yüz görünenler, marka logolu şişeler, bulanık ya da tırnağın küçük kaldığı kareler. Önceki rawpixel CC0 görselleri (D-01a) soluk bulundu ve kaldırıldı.
