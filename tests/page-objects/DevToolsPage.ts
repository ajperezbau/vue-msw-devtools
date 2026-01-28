import { expect, type Locator, type Page } from "@playwright/test";

export class DevToolsPage {
  readonly page: Page;
  readonly toggleButton: Locator;
  readonly dialog: Locator;
  readonly closeButton: Locator;
  readonly registryTable: Locator;
  readonly searchInput: Locator;
  readonly globalDelayInput: Locator;
  readonly fetchUsersButton: Locator;
  readonly fetchProductsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toggleButton = page.getByRole("button", {
      name: "Toggle MSW DevTools",
    });
    this.dialog = page.getByRole("dialog");
    this.closeButton = this.dialog.getByRole("button", { name: "Close" });
    this.registryTable = this.dialog.locator("table.registry-table");
    this.searchInput = this.dialog.getByPlaceholder(
      "Filter by key, URL or method...",
    );
    this.globalDelayInput = this.dialog.locator("#global-delay");
    this.fetchUsersButton = page.locator("#fetch-users");
    this.fetchProductsButton = page.locator("#fetch-products");
  }

  async switchTab(tab: "Registry" | "Activity Log") {
    // Note: The UI shows "Activity Log (N)", so we use part of the name
    await this.dialog.getByRole("button", { name: tab, exact: false }).click();
  }

  async setGlobalDelay(value: number) {
    // We use fill for sliders if they are range inputs, but sliders sometimes need more specific interaction
    // Since it's a native range input, fill should work, but evaluate is safer for reactivity
    await this.globalDelayInput.evaluate((el: HTMLInputElement, val) => {
      el.value = val.toString();
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
  }

  async setHandlerDelay(handlerName: string, value: number) {
    const row = await this.getHandlerRow(handlerName);
    const input = row.locator(".handler-delay-input");
    await input.fill(value.toString());
  }

  async filter(query: string) {
    await this.searchInput.fill(query);
  }

  async clearFilter() {
    await this.searchInput.fill("");
  }

  async goto() {
    await this.page.goto("/");
  }

  async toggle() {
    await this.toggleButton.click();
  }

  async pressShortcut() {
    // Standardizing the shortcut for tests.
    // We use a specific sequence to ensure the modifier is held.
    await this.page.bringToFront();
    // Use focus on the body to ensure we are listening to keydown
    await this.page.focus("body");

    const modifier = process.platform === "darwin" ? "Meta" : "Control";
    await this.page.keyboard.down(modifier);
    await this.page.keyboard.down("Shift");
    await this.page.keyboard.press("M");
    await this.page.keyboard.up("Shift");
    await this.page.keyboard.up(modifier);
  }

  async close() {
    await this.closeButton.click();
  }

  async startDelayedFetch(url: string) {
    await this.page.evaluate((fetchUrl) => {
      (window as any).fetchFinished = false;
      fetch(fetchUrl).then(() => {
        (window as any).fetchFinished = true;
      });
    }, url);
  }

  async isFetchFinished() {
    return await this.page.evaluate(() => (window as any).fetchFinished);
  }

  async waitForFetchFinished(timeout = 2000) {
    await expect
      .poll(async () => this.isFetchFinished(), {
        timeout,
      })
      .toBe(true);
  }

  async expectVisible() {
    await expect(this.toggleButton).toBeVisible();
  }

  async expectModalVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async expectModalHidden() {
    await expect(this.dialog).not.toBeVisible();
  }

  async expectModalTitle(title: string) {
    await expect(
      this.dialog.getByRole("heading", { name: title }),
    ).toBeVisible();
  }

  async getHandlerRow(name: string) {
    return this.dialog.locator("tr", { hasText: name });
  }

  async expectHandler(name: string, method: string, url: string) {
    const row = await this.getHandlerRow(name);
    await expect(row).toBeVisible();
    await expect(row.getByText(method)).toBeVisible();
    await expect(row.getByText(url)).toBeVisible();
  }

  async expectScenario(handlerName: string, scenarioName: string) {
    const row = await this.getHandlerRow(handlerName);
    const select = row.getByRole("combobox");
    await expect(
      select.locator("option", { hasText: scenarioName }),
    ).toBeAttached();
  }

  // Activity Log methods
  async getLogEntry(url: string) {
    return this.dialog.locator(".log-entry", { hasText: url }).first();
  }

  async expectLogEntry(details: {
    method: string;
    url: string;
    key: string;
    scenario: string;
    status: number;
  }) {
    const entry = await this.getLogEntry(details.url);
    await expect(entry).toBeVisible();
    await expect(entry.locator(".method-badge")).toHaveText(details.method);
    await expect(entry.locator(".log-key")).toHaveText(details.key);
    await expect(entry.locator(".log-scenario")).toContainText(
      details.scenario,
    );
    await expect(entry.locator(".status-badge")).toHaveText(
      details.status.toString(),
    );
  }

  async expandLogEntry(url: string) {
    const entry = await this.getLogEntry(url);
    await entry.locator(".log-entry-header").click();
  }

  async expectLogRequestPreview(url: string, previewText: string) {
    const entry = await this.getLogEntry(url);
    const preview = entry.locator(".log-request-preview");
    await expect(preview).toContainText(previewText);
  }

  async expectLogDetails(
    url: string,
    section: "Request Body" | "Response Body",
    content: string,
  ) {
    const entry = await this.getLogEntry(url);
    const sectionLocator = entry.locator(".details-section", {
      hasText: section,
    });
    await expect(sectionLocator.locator(".details-content")).toContainText(
      content,
    );
  }
}
