import { test } from '../fixtures/pages';
import { users, products } from '../test-data/saucedemo';

test.describe('Add product to shopping cart', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectToBeOpen();
  });

  test('Agregar un producto al carrito', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.expectCartCount(1);

    await inventoryPage.goToCart();
    await cartPage.expectToBeOpen();
    await cartPage.expectProducts([products.backpack]);
  });

  test('Agregar varios productos al carrito', async ({ inventoryPage, cartPage }) => {
    const selected = [products.backpack, products.bikeLight, products.boltTShirt];

    await inventoryPage.addProductsToCart(selected);
    await inventoryPage.expectCartCount(selected.length);

    await inventoryPage.goToCart();
    await cartPage.expectProducts(selected);
  });

  test('Quitar un producto del carrito', async ({ inventoryPage }) => {
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.expectCartCount(1);

    await inventoryPage.removeProductFromCart(products.backpack);
    await inventoryPage.expectCartCount(0);
  });
});
