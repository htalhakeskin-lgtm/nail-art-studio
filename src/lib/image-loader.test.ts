import { describe, expect, it } from "vitest";

import imageLoader from "./image-loader";

describe("imageLoader", () => {
  it.each([
    [320, "/demo/hero-yaprak-480.webp"],
    [480, "/demo/hero-yaprak-480.webp"],
    [481, "/demo/hero-yaprak-960.webp"],
    [1200, "/demo/hero-yaprak-1600.webp"],
    [3840, "/demo/hero-yaprak-1600.webp"],
  ])("maps a %s px request to the nearest pre-encoded variant", (width, expected) => {
    expect(imageLoader({ src: "/demo/hero-yaprak", width })).toBe(expected);
  });

  it("extends uploads in the database and in Vercel Blob the same way (K-39)", () => {
    expect(imageLoader({ src: "/media/abc", width: 600 })).toBe("/media/abc-960.webp");
    const blob = "https://abc123.public.blob.vercel-storage.com/gallery/0190";
    expect(imageLoader({ src: blob, width: 300 })).toBe(`${blob}-480.webp`);
  });

  it("leaves other sources untouched", () => {
    expect(imageLoader({ src: "/icons/icon-192.png", width: 192 })).toBe("/icons/icon-192.png");
    const other = "https://example.com/gallery/a.png";
    expect(imageLoader({ src: other, width: 300 })).toBe(other);
  });
});
