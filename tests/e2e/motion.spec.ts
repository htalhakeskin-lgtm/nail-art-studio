import { expect, test } from "@playwright/test";

/** D-12: motion is transform / opacity only and disappears with reduced motion (K-43). */

// Runs in the browser: no closures.
const animationsOf = (node: Element) =>
  node.getAnimations({ subtree: false }).map((animation) => {
    const effect = animation.effect as KeyframeEffect | null;
    const properties = (effect?.getKeyframes() ?? []).flatMap((frame) =>
      Object.keys(frame).filter(
        (key) => !["offset", "easing", "composite", "computedOffset"].includes(key),
      ),
    );
    return { name: (animation as CSSAnimation).animationName, properties };
  });

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("hero tiles rise in and sections reveal on scroll, ending fully visible", async ({
    page,
  }) => {
    await page.goto("/");
    const tiles = page.locator(".rise-in");
    expect(await tiles.count()).toBeGreaterThan(0);
    const heroAnimations = await tiles.first().evaluate(animationsOf);
    expect(heroAnimations[0]?.name).toBe("rise-in");
    for (const animation of heroAnimations) {
      expect(animation.properties.every((key) => ["opacity", "translate"].includes(key))).toBe(
        true,
      );
    }

    const services = page.getByRole("region", { name: "Hizmetler" });
    await services.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 600);
    await expect.poll(() => services.evaluate((node) => getComputedStyle(node).opacity)).toBe("1");
  });
});

test("reduced motion: nothing animates on the home page", async ({ page }) => {
  await page.goto("/");
  await page.mouse.wheel(0, 1500);
  const running = await page.evaluate(
    () => document.getAnimations().filter((animation) => animation.playState === "running").length,
  );
  expect(running).toBe(0);
  await expect(page.getByRole("region", { name: "Hizmetler" })).toHaveCSS("opacity", "1");
});
