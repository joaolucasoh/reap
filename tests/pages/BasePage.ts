import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    await this.page.goto(`${path}`, { waitUntil: 'domcontentloaded' });
  }

  async verifyTitle(titlePattern: RegExp | string) {
    await expect(this.page).toHaveTitle(titlePattern);
  }

  async waitForElement(locator: Locator, timeout: number = 5000) {
    await expect(locator).toBeVisible({ timeout });
  }

  async fillField(locator: Locator, value: string) {
    await locator.fill(value);
  }

  async clickElement(locator: Locator) {
    await locator.click();
  }

  async isElementVisible(selectorOrLocator: string | Locator): Promise<boolean> {
  try {
    const locator = typeof selectorOrLocator === 'string'
      ? this.page.locator(selectorOrLocator)
      : selectorOrLocator;

    await expect(locator).toBeVisible({ timeout: 30000 });
    return true;
  } catch {
    return false;
  }
}

  getCurrentUrl(): string {
    return this.page.url();
  }

  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }
}