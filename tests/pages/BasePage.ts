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

  /**
   * Verifica se um elemento está visível
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await expect(locator).toBeVisible({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Aguarda um tempo específico
   */


  /**
   * Obtém o URL atual
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Verifica se há mensagens de erro na página
   */
  async hasErrorMessage(): Promise<boolean> {
    const errorSelectors = [
      '[role="alert"]',
      '.error',
      '.invalid',
      '[aria-invalid="true"]',
      '.notification--error',
      '.alert-error'
    ];

    for (const selector of errorSelectors) {
      const element = this.page.locator(selector);
      if (await this.isElementVisible(element)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Define o viewport para teste de responsividade
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Define o viewport para desktop
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }
}