import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class CartPage extends BasePage {
  protected readonly url = 'https://www.saucedemo.com/cart.html';

  readonly itemNames: Locator;

  constructor(page: Page) {
    super(page);
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
  }

  /** Verifica que el carrito tenga exactamente estos productos. */
  async expectProducts(names: string[]): Promise<void> {
    await expect(this.itemNames).toHaveText(names);
  }
}
