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
} as const satisfies Record<string, DemoImage>;

export type DemoImageKey = keyof typeof demoImages;
