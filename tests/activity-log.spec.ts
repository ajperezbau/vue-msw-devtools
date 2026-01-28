import { test } from "@playwright/test";
import { DevToolsPage } from "./page-objects/DevToolsPage";

test.describe("MSW DevTools - Activity Log", () => {
  let devToolsPage: DevToolsPage;

  test.beforeEach(async ({ page }) => {
    devToolsPage = new DevToolsPage(page);
    await devToolsPage.goto();
  });

  test("should record a GET request in the activity log", async () => {
    // 1. Trigger request
    await devToolsPage.fetchUsersButton.click();

    // 2. Open DevTools and switch to Log
    await devToolsPage.toggle();
    await devToolsPage.switchTab("Activity Log");

    // 3. Verify entry
    await devToolsPage.expectLogEntry({
      method: "GET",
      url: "/api/users",
      key: "users",
      scenario: "default",
      status: 200,
    });
  });

  test("should record a POST request with body preview", async () => {
    // 1. Trigger POST request
    await devToolsPage.fetchProductsButton.click();

    // 2. Open DevTools and switch to Log
    await devToolsPage.toggle();
    await devToolsPage.switchTab("Activity Log");

    // 3. Verify entry and preview
    await devToolsPage.expectLogEntry({
      method: "POST",
      url: "/api/products",
      key: "products",
      scenario: "default",
      status: 201,
    });

    await devToolsPage.expectLogRequestPreview("/api/products", "New Product");
  });

  test("should show request and response details when expanded", async () => {
    // 1. Trigger POST request
    await devToolsPage.fetchProductsButton.click();

    // 2. Open DevTools and switch to Log
    await devToolsPage.toggle();
    await devToolsPage.switchTab("Activity Log");

    // 3. Expand entry
    await devToolsPage.expandLogEntry("/api/products");

    // 4. Verify detail content
    await devToolsPage.expectLogDetails(
      "/api/products",
      "Request Body",
      '"name": "New Product"',
    );
    await devToolsPage.expectLogDetails(
      "/api/products",
      "Response Body",
      '"success": true',
    );
  });
});
