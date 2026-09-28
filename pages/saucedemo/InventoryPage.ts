import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class InventoryPage extends BasePage {
  protected readonly url = 'https://www.saucedemo.com/inventory.html';

  readonly inventoryList: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryList = page.locator('[data-test="inventory-list"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
  }

  /** Espera a que la página esté abierta y el listado de productos visible. */
  async expectLoaded(options?: { timeout?: number }): Promise<void> {
    await expect(this.page).toHaveURL(this.url, options);
    await expect(this.inventoryList).toBeVisible(options);
  }

  /** Tarjeta de un producto del listado, buscada por su nombre. */
  product(name: string): Locator {
    return this.page.locator('[data-test="inventory-item"]').filter({ hasText: name });
  }

  async addProductToCart(name: string): Promise<void> {
    await this.product(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async addProductsToCart(names: string[]): Promise<void> {
    for (const name of names) {
      await this.addProductToCart(name);
    }
  }

  async removeProductFromCart(name: string): Promise<void> {
    await this.product(name).getByRole('button', { name: 'Remove' }).click();
  }

  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toBeHidden();
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }
}
