import { test, expect } from "@playwright/test";
import { DevToolsPage } from "./page-objects/DevToolsPage";

test.describe("MSW DevTools - Handler Compatibility", () => {
  let devToolsPage: DevToolsPage;

  test.beforeEach(async ({ page }) => {
    devToolsPage = new DevToolsPage(page);
    await devToolsPage.goto();
    await devToolsPage.toggle();
  });

  test("should preserve and keep functional handlers with RegExp paths", async ({
    page,
  }) => {
    // Verify the RegExp handler is not visible in devtools UI
    await devToolsPage.expectModalVisible();
    await expect(
      page.locator(".handler-row", { hasText: "/api/regex-test" }),
    ).not.toBeVisible();

    // But the handler should still be functional in MSW
    const response = await page.evaluate(async () => {
      const res = await fetch("/api/regex-test");
      return res.json();
    });

    expect(response).toEqual({ regex: true });
  });

  test("should preserve and keep functional handlers with unsupported methods", async ({
    page,
  }) => {
    // Verify the http.all handler is not visible in devtools UI
    await devToolsPage.expectModalVisible();
    await expect(
      page.locator(".handler-row", { hasText: "/api/all-test" }),
    ).not.toBeVisible();

    // But the handler should still be functional in MSW for different methods
    const getResponse = await page.evaluate(async () => {
      const res = await fetch("/api/all-test", { method: "GET" });
      return res.json();
    });
    expect(getResponse).toEqual({ all: true });

    const postResponse = await page.evaluate(async () => {
      const res = await fetch("/api/all-test", { method: "POST" });
      return res.json();
    });
    expect(postResponse).toEqual({ all: true });
  });
});
