import { test, expect } from "@playwright/test";
import { DevToolsPage } from "./page-objects/DevToolsPage";

test.describe("MSW DevTools - Custom Scenarios", () => {
  let devToolsPage: DevToolsPage;

  test.beforeEach(async ({ page }) => {
    devToolsPage = new DevToolsPage(page);
    await devToolsPage.goto();
    await devToolsPage.toggle();
  });

  test("should create a custom scenario using the override modal", async ({
    page,
  }) => {
    const handlerName = "users";
    const customScenarioName = "E2E Created Scenario";
    const customBody = JSON.stringify({ e2e: "success" });

    await devToolsPage.openOverrideModal(handlerName);

    // Fill the body and the scenario name
    await devToolsPage.fillOverrideBody(customBody);
    await devToolsPage.saveOverride(customScenarioName);

    // Verify it appeared in the registry table as a selectable scenario
    const row = await devToolsPage.getHandlerRow(handlerName);
    const select = row.getByRole("combobox");
    await expect(select).toHaveValue(customScenarioName);

    // Close devtools
    await devToolsPage.close();

    // Verify it's actually working by fetching
    const [response] = await Promise.all([
      page.waitForResponse("/api/users"),
      devToolsPage.fetchUsersButton.click(),
    ]);

    const json = await response.json();
    expect(json).toEqual({ e2e: "success" });
    expect(response.status()).toBe(200);
  });

  test("should create a temporary override when no name is provided", async ({
    page,
  }) => {
    const handlerName = "users";
    const customBody = JSON.stringify({ temp: "override" });

    await devToolsPage.openOverrideModal(handlerName);
    await devToolsPage.fillOverrideBody(customBody);
    await devToolsPage.saveOverride(); // No name

    // Should indicate it's using an override (the 'M' badge)
    const row = await devToolsPage.getHandlerRow(handlerName);
    const indicator = row.locator(".override-indicator");
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveText("M");

    // Close devtools to ensure button is clickable and fetch is clear
    await devToolsPage.close();

    // Verify fetch
    const [response] = await Promise.all([
      page.waitForResponse("/api/users"),
      devToolsPage.fetchUsersButton.click(),
    ]);

    const json = await response.json();
    expect(json).toEqual({ temp: "override" });
  });
});
