import { test, expect } from "@playwright/test";
import { DevToolsPage } from "./page-objects/DevToolsPage";

test.describe("MSW DevTools Dragging", () => {
  let devToolsPage: DevToolsPage;

  test.beforeEach(async ({ page }) => {
    devToolsPage = new DevToolsPage(page);
    await devToolsPage.goto();
  });

  test("should be able to drag the toggle button", async ({ page }) => {
    const button = devToolsPage.toggleButton;

    const initialBox = await button.boundingBox();
    expect(initialBox).not.toBeNull();

    if (initialBox) {
      // Drag the button
      const targetX = initialBox.x - 100;
      const targetY = initialBox.y - 100;

      await button.hover();
      await page.mouse.down();
      await page.mouse.move(targetX, targetY, { steps: 10 });
      await page.mouse.up();

      const finalBox = await button.boundingBox();
      expect(finalBox).not.toBeNull();

      if (finalBox) {
        // Allow for some small deviation if constrained or due to padding
        expect(finalBox.x).toBeLessThan(initialBox.x);
        expect(finalBox.y).toBeLessThan(initialBox.y);
      }
    }
  });

  test("should persist position after reload", async ({ page }) => {
    const button = devToolsPage.toggleButton;

    const initialBox = await button.boundingBox();
    expect(initialBox).not.toBeNull();

    if (initialBox) {
      const targetX = 100;
      const targetY = 100;

      await button.hover();
      await page.mouse.down();
      await page.mouse.move(targetX, targetY, { steps: 10 });
      await page.mouse.up();

      const boxBeforeReload = await button.boundingBox();

      await page.reload();
      await devToolsPage.expectVisible();

      const boxAfterReload = await button.boundingBox();

      expect(boxAfterReload).not.toBeNull();
      if (boxAfterReload && boxBeforeReload) {
        expect(Math.abs(boxAfterReload.x - boxBeforeReload.x)).toBeLessThan(2);
        expect(Math.abs(boxAfterReload.y - boxBeforeReload.y)).toBeLessThan(2);
      }
    }
  });

  test("should keep position while in viewport and restore when viewport grows again", async ({
    page,
  }) => {
    const button = devToolsPage.toggleButton;
    const padding = 10;

    await page.evaluate(() => {
      localStorage.removeItem("msw-devtools-x");
      localStorage.removeItem("msw-devtools-y");
    });

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    if (!viewport) return;

    const initialBox = await button.boundingBox();
    expect(initialBox).not.toBeNull();

    if (!initialBox) return;

    // Move the button to a safe spot away from edges so it stays in-view on a small resize
    const margin = 120;
    const targetX = Math.min(
      viewport.width - margin,
      Math.max(margin, viewport.width / 2),
    );
    const targetY = Math.min(
      viewport.height - margin,
      Math.max(margin, viewport.height / 2),
    );

    await button.hover();
    await page.mouse.down();
    await page.mouse.move(targetX, targetY, { steps: 10 });
    await page.mouse.up();

    const boxBeforeResize = await expect
      .poll(async () => button.boundingBox(), { timeout: 2000 })
      .toBeTruthy();
    const resolvedBeforeResize = await button.boundingBox();
    if (!resolvedBeforeResize) return;

    // Shrink the viewport slightly but keep the button within the viewport
    const slightlySmallerViewport = {
      width: viewport.width - 50,
      height: viewport.height - 50,
    };
    await page.setViewportSize(slightlySmallerViewport);
    await expect
      .poll(async () => button.boundingBox(), { timeout: 2000 })
      .toBeTruthy();

    const boxAfterSmallResize = await button.boundingBox();
    if (!boxAfterSmallResize) return;

    // Position should remain effectively the same while still inside viewport
    expect(
      Math.abs(boxAfterSmallResize.x - resolvedBeforeResize.x),
    ).toBeLessThan(6);
    expect(
      Math.abs(boxAfterSmallResize.y - resolvedBeforeResize.y),
    ).toBeLessThan(6);

    // Now shrink significantly so the previous preferred position would be outside viewport,
    // forcing the button to move (clamp)
    const verySmallViewport = {
      width: Math.max(200, Math.floor(resolvedBeforeResize.x + 40)),
      height: Math.max(200, Math.floor(resolvedBeforeResize.y + 40)),
    };
    await page.setViewportSize(verySmallViewport);
    // Poll until the button is clamped to a new position (more than 10px displacement)
    await expect
      .poll(
        async () => {
          const box = await button.boundingBox();
          if (!box) return false;
          return (
            Math.abs(box.x - resolvedBeforeResize.x) > 10 ||
            Math.abs(box.y - resolvedBeforeResize.y) > 10
          );
        },
        { timeout: 2000 },
      )
      .toBe(true);

    const boxAfterVerySmallResize = await button.boundingBox();
    expect(boxAfterVerySmallResize).not.toBeNull();
    if (!boxAfterVerySmallResize) return;

    // After going out of viewport, the button should have moved
    expect(
      Math.abs(boxAfterVerySmallResize.x - resolvedBeforeResize.x) > 10 ||
        Math.abs(boxAfterVerySmallResize.y - resolvedBeforeResize.y) > 10,
    ).toBeTruthy();

    const maxX =
      verySmallViewport.width - boxAfterVerySmallResize.width - padding;
    const maxY =
      verySmallViewport.height - boxAfterVerySmallResize.height - padding;
    expect(boxAfterVerySmallResize.x).toBeLessThanOrEqual(maxX + 1);
    expect(boxAfterVerySmallResize.y).toBeLessThanOrEqual(maxY + 1);

    // Restore original viewport size
    await page.setViewportSize(viewport);
    // Poll until the button is restored to its preferred position
    await expect
      .poll(
        async () => {
          const box = await button.boundingBox();
          if (!box) return false;
          return (
            Math.abs(box.x - resolvedBeforeResize.x) < 6 &&
            Math.abs(box.y - resolvedBeforeResize.y) < 6
          );
        },
        { timeout: 2000 },
      )
      .toBe(true);

    const boxAfterRestore = await button.boundingBox();
    expect(boxAfterRestore).not.toBeNull();
    if (!boxAfterRestore) return;

    // When viewport grows again, the button should return close to its original position
    expect(Math.abs(boxAfterRestore.x - resolvedBeforeResize.x)).toBeLessThan(
      6,
    );
    expect(Math.abs(boxAfterRestore.y - resolvedBeforeResize.y)).toBeLessThan(
      6,
    );
  });
});
