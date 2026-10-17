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

  it("leaves other sources untouched", () => {
    expect(imageLoader({ src: "/icons/icon-192.png", width: 192 })).toBe("/icons/icon-192.png");
  });
});
