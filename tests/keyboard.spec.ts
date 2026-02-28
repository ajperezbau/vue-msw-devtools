import { expect, test } from "@playwright/test";
import { DevToolsPage } from "./page-objects/DevToolsPage";

test.describe("Keyboard Navigation", () => {
  let devToolsPage: DevToolsPage;

  test.beforeEach(async ({ page }) => {
    devToolsPage = new DevToolsPage(page);
    await devToolsPage.goto();
    await devToolsPage.toggle();
  });

  test("ESC key should close Override Modal but keep DevTools open", async ({
    page,
  }) => {
    const handlerName = "users"; // Uses /api/users defined in main.ts

    // 1. Open Override Modal
    await devToolsPage.openOverrideModal(handlerName);

    // Verify override modal is visible
    await expect(
      page.getByText("Override Response:", { exact: false }),
    ).toBeVisible();

    // 2. Press Escape
    await page.keyboard.press("Escape");

    // 3. Verify Override Modal is hidden
    await expect(
      page.getByText("Override Response:", { exact: false }),
    ).not.toBeVisible();

    // 4. Verify DevTools Main Modal is STILL visible
    await devToolsPage.expectModalVisible();

    // 5. Press Escape again
    await page.keyboard.press("Escape");

    // 6. Verify DevTools Main Modal is now hidden
    await devToolsPage.expectModalHidden();
  });

  test("ESC key should close Export Modal but keep DevTools open", async ({
    page,
  }) => {
    // 1. Open Export Modal
    await devToolsPage.exportButton.click();

    // Verify export modal is visible
    await expect(
      page.getByRole("dialog").last().getByText("Export Options"),
    ).toBeVisible();

    // 2. Press Escape
    await page.keyboard.press("Escape");

    // 3. Verify Export Modal is hidden
    await expect(page.getByText("Export Options")).not.toBeVisible();

    // 4. Verify DevTools Main Modal is STILL visible
    await devToolsPage.expectModalVisible();
  });
});
