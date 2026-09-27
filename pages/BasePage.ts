import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Clase base con las acciones comunes a todas las páginas.
 * Cada Page Object hereda de acá para reutilizar estas funciones.
 */
export abstract class BasePage {
  readonly page: Page;

  /** URL de la página que abre goto() */
  protected abstract readonly url: string;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async expectTitleToContain(text: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(text instanceof RegExp ? text : new RegExp(text));
  }

  async expectUrlToContain(text: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(text));
  }

  async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(this.url);
  }

  async clickLink(name: string): Promise<void> {
    await this.page.getByRole('link', { name }).first().click();
  }

  heading(name: string): Locator {
    return this.page.getByRole('heading', { name });
  }

  async expectHeadingVisible(name: string): Promise<void> {
    await expect(this.heading(name)).toBeVisible();
  }
}
