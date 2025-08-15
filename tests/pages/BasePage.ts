import { Page, Locator, expect } from '@playwright/test';

/**
 * Classe base para todas as páginas
 * Contém funcionalidades comuns compartilhadas entre todas as páginas
 */
export class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page, baseUrl: string = 'https://app.ramp.com') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  /**
   * Navega para uma URL específica
   */
  async goto(path: string = '') {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verifica se a página tem o título esperado
   */
  async verifyTitle(titlePattern: RegExp | string) {
    await expect(this.page).toHaveTitle(titlePattern);
  }

  /**
   * Aguarda um elemento ficar visível
   */
  async waitForElement(locator: Locator, timeout: number = 5000) {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Preenche um campo de input
   */
  async fillField(locator: Locator, value: string) {
    await locator.fill(value);
  }

  /**
   * Clica em um elemento
   */
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