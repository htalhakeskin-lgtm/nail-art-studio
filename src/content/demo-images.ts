/**
 * Demo images (17-icerik §5): the single registry for files in public/demo, their alt text and
 * licence. scripts/images/build-demo-images.ts crops and encodes them from the Pexels
 * originals; docs/gorsel-kaynaklari.md lists the same entries. All are representative stock
 * ("temsilî"), never presented as Bahadır Karasu's own work or hands (RSK-01, RSK-03, K-28).
 */
export type DemoImageSource = {
  /** Folder name under the download directory passed to the build script. */
  sourceId: string;
  landingUrl: string;
  creator: string;
  licence: "Pexels License";
};

export type DemoImage = {
  /** Public path without width and extension: "/demo/hero-yaprak" → /demo/hero-yaprak-960.webp */
  src: `/demo/${string}`;
  /** Intrinsic size of the largest variant (no upscaling beyond the source). */
  width: number;
  height: number;
  /** sharp crop position for the cover crop. */
  position: "attention" | "centre" | "north" | "south" | "east" | "west";
  alt: string;
  source: DemoImageSource;
};

/** Pexels photo page slug ("pink-flower-on-hand-…-20758448"); its trailing number is the id. */
const pexels = (slug: string, creator: string): DemoImageSource => ({
  sourceId: slug.slice(slug.lastIndexOf("-") + 1),
  landingUrl: `https://www.pexels.com/photo/${slug}/`,
  creator,
  licence: "Pexels License",
});

/** 4:5 portrait, the largest crop every chosen original allows (1333 px short side). */
const PORTRAIT = { width: 1064, height: 1330 } as const;

/** Gallery works: 4:5 portrait, crop chosen by sharp's attention strategy. */
const portrait = (src: DemoImage["src"], alt: string, source: DemoImageSource): DemoImage => ({
  src,
  ...PORTRAIT,
  position: "attention",
  alt,
  source,
});

export const demoImages = {
  heroDots: {
    src: "/demo/hero-puantiye",
    ...PORTRAIT,
    position: "attention",
    alt: "Pembe, sarı, mavi ve beyaz tırnaklarda renkli puantiye nail art",
    source: pexels("a-person-holding-bottles-of-nail-polish-7066298", "locrifa"),
  },
  heroBloom: {
    src: "/demo/hero-pembe-cicek",
    ...PORTRAIT,
    position: "attention",
    alt: "Şeker pembesi taşlı tırnaklar ve elin üzerinde pembe bir krizantem",
    source: pexels("pink-flower-and-woman-manicure-20715643", "mehrab zahedbeigi"),
  },
  heroBlossom: {
    src: "/demo/hero-bahar",
    ...PORTRAIT,
    position: "centre",
    alt: "Pastel turkuaz tırnaklar ve pembe bahar çiçekleri",
    source: pexels("hand-touching-flowers-17323334", "Valeria Boltneva"),
  },
  aboutPalette: {
    src: "/demo/hakkinda-renk-paleti",
    width: 1200,
    height: 800,
    position: "centre",
    alt: "Pembe havlu üzerinde yelpaze biçiminde renk kartelası; bir parmak renk seçiyor",
    source: pexels("finger-pointing-at-nail-color-palette-7755241", "RDNE Stock project"),
  },
  aboutPainting: {
    src: "/demo/hakkinda-pembe-oje",
    width: 1200,
    height: 900,
    position: "centre",
    alt: "Tırnaklara şeker pembesi oje sürülüyor; yanda açık oje şişesi",
    source: pexels("woman-s-pink-pedicure-973405", "Element5 Digital"),
  },

  galleryLilacPink: portrait(
    "/demo/galeri-lila-pembe",
    "Lila pembe kalıcı ojeli badem tırnaklar; yüzük parmağında simli vurgu",
    pexels("person-s-hand-with-pink-manicure-939835", "Valeria Boltneva"),
  ),
  galleryPearl: portrait(
    "/demo/galeri-pastel-inci",
    "Pastel lila, inci parlaklığında badem tırnaklar",
    pexels("pastel-manicure-with-a-smoothie-in-hand-36655811", "N G"),
  ),
  galleryNudeGlitter: portrait(
    "/demo/galeri-nude-sim",
    "Nude ve pembe simli tırnaklar; bir tırnakta ince beyaz çizgi deseni",
    pexels("elegant-nude-and-glitter-manicure-close-up-35491156", "Jaki&Kari Jelevi"),
  ),
  galleryGoldFrench: portrait(
    "/demo/galeri-altin-cizgili-french",
    "Uzun kare tırnaklarda beyaz french ve ince altın çizgiler",
    pexels("elegant-nail-art-with-gold-details-in-natural-light-31744665", "Анастасія"),
  ),
  galleryClassicFrench: portrait(
    "/demo/galeri-klasik-french",
    "Kırmızı peluş üzerinde klasik beyaz french manikür",
    pexels("elegant-hand-with-french-manicure-and-jewelry-34997575", "Salim Da"),
  ),
  galleryFloralBoomer: portrait(
    "/demo/galeri-cicekli-baby-boomer",
    "Pembeden beyaza geçişli tırnaklarda beyaz çiçek çizimleri",
    pexels("hands-with-professional-manicure-17471377", "abolfazl zarghami"),
  ),
  galleryGoldGlitter: portrait(
    "/demo/galeri-altin-sim",
    "Altın simli kalıcı oje ve renkli pullar",
    pexels("person-s-hands-with-gold-glitter-nails-10632142", "Pexels User"),
  ),
  galleryLilacTips: portrait(
    "/demo/galeri-lila-simli-uclar",
    "Açık pembe tırnakların uçlarında lila sim",
    pexels("elegant-hand-with-nail-art-on-red-fur-34835280", "Salim Da"),
  ),
  galleryTurquoiseAlmond: portrait(
    "/demo/galeri-turkuaz-badem",
    "Uzun badem tırnaklarda turkuaz geçişli renk ve gümüş yüzükler",
    pexels("a-person-with-manicured-nails-while-wearing-silver-rings-10420563", "PabloKlik"),
  ),
  galleryPinkFade: portrait(
    "/demo/galeri-pembe-simli-gecis",
    "Pembe tırnakların uçlarına doğru yoğunlaşan lila sim",
    pexels("close-up-of-artistic-pink-manicure-with-glitter-34835283", "Salim Da"),
  ),
  galleryBabyBoomer: portrait(
    "/demo/galeri-baby-boomer",
    "Köpük üzerinde nudeden beyaza geçişli baby boomer tırnaklar",
    pexels("a-hand-touching-shaving-foam-5871914", "cottonbro studio"),
  ),
  galleryRedWave: portrait(
    "/demo/galeri-kirmizi-dalga",
    "Kırmızı ve beyaz dalga desenli tırnaklar, koyu mavi fon",
    pexels("elegant-red-and-white-manicure-on-hand-34871560", "Salim Da"),
  ),
  galleryLeopard: portrait(
    "/demo/galeri-leopar",
    "Leopar desenli ve siyah tırnakların karışımı",
    pexels("stylish-leopard-print-and-black-nail-art-34835304", "Salim Da"),
  ),
  galleryTurquoiseMarble: portrait(
    "/demo/galeri-turkuaz-mermer",
    "Uzun badem tırnaklarda turkuaz mermer deseni",
    pexels("close-up-of-stylish-turquoise-nail-art-34971940", "Salim Da"),
  ),
  gallerySwirlBanana: portrait(
    "/demo/galeri-siyah-beyaz-girdap",
    "Mavi muz heykeli tutan elde siyah, beyaz ve sarı girdap desenli tırnaklar",
    pexels("hand-holdin-5875946", "cottonbro studio"),
  ),
  gallerySpeckled: portrait(
    "/demo/galeri-sari-benekli",
    "Nude tırnaklarda sarı lekeler ve siyah benekler; elde yeşil yaprak",
    pexels("a-hand-with-colorful-nail-art-holding-green-leaf-13277178", "Дарина Ритомская"),
  ),
  galleryCharms: portrait(
    "/demo/galeri-takili-siyah-beyaz",
    "Kısa tırnaklarda siyah ve beyaz oje, haç biçimli metal takılar",
    pexels("close-up-of-woman-manicure-18730147", "honggyu kim"),
  ),
  galleryHearts: portrait(
    "/demo/galeri-kirmizi-kalpler",
    "Açık pembe tırnaklarda küçük kırmızı kalpler; elde beyaz karanfil",
    pexels("woman-holding-a-white-carnation-flower-15343609", "Mariam Gab"),
  ),
  galleryPinkPlain: portrait(
    "/demo/galeri-pembe-sade",
    "Şeker pembesi sade tırnaklar ve elin üzerinde pembe çiçek",
    pexels("pink-flower-on-hand-with-polished-nails-20758448", "mehrab zahedbeigi"),
  ),
  galleryLineArt: portrait(
    "/demo/galeri-minimal-cizim",
    "Nude ve lavanta tırnaklarda ince siyah çizgi çizimler",
    pexels("a-hand-with-manicured-nails-on-white-textile-7664093", "solod_sha Content creator"),
  ),
  galleryTangerine: portrait(
    "/demo/galeri-mandalina",
    "Sarı fonda yeşil kazaklı elde mandalina turuncusu tırnaklar",
    pexels("close-up-photo-of-manicured-nails-11124899", "Anna Shvets"),
  ),
  galleryMixed: portrait(
    "/demo/galeri-her-tirnak-bir-renk",
    "Her tırnağı farklı renkte kısa tırnaklar: kırmızı, mercan, gri, bordo",
    pexels("a-woman-with-colorful-nails-11124918", "Anna Shvets"),
  ),
  galleryOpArt: portrait(
    "/demo/galeri-op-art",
    "Sarı fonda siyah beyaz op-art girdap desenli tırnaklar",
    pexels("fingers-with-nail-polish-5871219", "cottonbro studio"),
  ),
  galleryRainbow: portrait(
    "/demo/galeri-gokkusagi-stiletto",
    "Uzun pembe stiletto tırnaklar; birinde gökkuşağı renklerinde çizgiler",
    pexels("vibrant-stiletto-nail-art-design-close-up-28713174", "Sebastian Balog"),
  ),
} as const satisfies Record<string, DemoImage>;

export type DemoImageKey = keyof typeof demoImages;
