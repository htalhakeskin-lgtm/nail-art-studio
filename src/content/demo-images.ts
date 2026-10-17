/**
 * Demo images (17-icerik §5): the single registry for files in public/demo, their alt text and
 * licence. scripts/images/build-demo-images.ts crops and encodes them from the clean 1024 px
 * previews (the larger rawpixel sizes carry a watermark); docs/gorsel-kaynaklari.md
 * lists the same entries. All are representative stock ("temsilî"), never presented as
 * Bahadır Karasu's own work or hands (RSK-01, RSK-03).
 */
export type DemoImageSource = {
  /** Folder name under the download directory passed to the build script. */
  sourceId: string;
  landingUrl: string;
  creator: string;
  licence: "CC0 1.0";
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

const rawpixel = (id: string, path: string): DemoImageSource => ({
  sourceId: id,
  landingUrl: `https://www.rawpixel.com/image/${path}`,
  creator: "rawpixel (CC0 kamu malı koleksiyonu)",
  licence: "CC0 1.0",
});

export const demoImages = {
  heroPetal: {
    src: "/demo/hero-yaprak",
    width: 546,
    height: 683,
    position: "attention",
    alt: "Açık pembe ojeli parmakların üzerinde kurutulmuş pembe çiçek yaprağı",
    source: rawpixel("586dc1ba", "3293333/free-photo-image-woman-hands-manicure-flowers-skin"),
  },
  heroStripes: {
    src: "/demo/hero-cizgili",
    width: 546,
    height: 683,
    position: "attention",
    alt: "Kırmızı ojeli tırnaklar; bir tırnakta beyaz çizgili nail art deseni",
    source: rawpixel("96b67803", "5922590/free-manicure-image-public-domain-cc0-photo"),
  },
  heroBottles: {
    src: "/demo/hero-oje-siseleri",
    width: 546,
    height: 683,
    position: "centre",
    alt: "Pudradan kırmızıya renk sırasıyla dizilmiş etiketsiz oje şişeleri",
    source: rawpixel("6b535409", "5906601/photo-image-public-domain-art-pink"),
  },
  aboutBrush: {
    src: "/demo/hakkinda-firca",
    width: 1024,
    height: 683,
    position: "centre",
    alt: "Pembe eldivenli bir nail artist ince fırçayla tırnağa desen çiziyor",
    source: rawpixel("68c8be6a", "5926347/photo-image-public-domain-hand-pink"),
  },
  aboutPolish: {
    src: "/demo/hakkinda-bordo-oje",
    width: 910,
    height: 683,
    position: "east",
    alt: "Tırnaklara bordo kalıcı oje sürülüyor",
    source: rawpixel("e1f6ae16", "3299322/free-photo-image-nail-polish-manicure"),
  },
} as const satisfies Record<string, DemoImage>;

export type DemoImageKey = keyof typeof demoImages;
