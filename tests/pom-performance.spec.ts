import { test, expect } from '../fixtures/pages';
import { users, products } from '../test-data/saucedemo';
import { thresholds } from '../test-data/performance';
import {
  getNavigationMetrics,
  getLargestContentfulPaint,
  measure,
  reportMetrics,
} from '../utils/performance';

test.describe('Performance de Sauce Demo', () => {
  // Uno por vez: si varios navegadores arrancan en paralelo compiten por la CPU
  // y las mediciones salen infladas.
  test.describe.configure({ mode: 'default' });

  test('La página de login carga dentro de los tiempos esperados', async ({ loginPage, page }, testInfo) => {
    await loginPage.goto();

    const metrics = await getNavigationMetrics(page);
    reportMetrics(testInfo, metrics);

    // expect.soft: si una métrica falla, igual se evalúan las demás.
    expect.soft(metrics.ttfb, 'TTFB').toBeLessThan(thresholds.ttfb);
    expect.soft(metrics.domContentLoaded, 'DOMContentLoaded').toBeLessThan(thresholds.domContentLoaded);
    expect.soft(metrics.load, 'Load').toBeLessThan(thresholds.load);
    expect.soft(metrics.firstContentfulPaint, 'First Contentful Paint').toBeLessThan(thresholds.firstContentfulPaint);
  });

  test('Largest Contentful Paint de la página de login', async ({ loginPage, page, browserName }, testInfo) => {
    test.skip(browserName !== 'chromium', 'LCP solo está disponible en Chromium');

    await loginPage.goto();

    const lcp = await getLargestContentfulPaint(page);
    reportMetrics(testInfo, { largestContentfulPaint: lcp });

    expect(lcp, 'Largest Contentful Paint').toBeLessThan(thresholds.largestContentfulPaint);
  });

  test('El login lleva al listado de productos rápidamente', async ({ loginPage, inventoryPage }, testInfo) => {
    await loginPage.goto();

    const loginTime = await measure(async () => {
      await loginPage.login(users.standard.username, users.standard.password);
      await inventoryPage.expectLoaded();
    });
    reportMetrics(testInfo, { login: loginTime });

    expect(loginTime, 'Tiempo de login').toBeLessThan(thresholds.login);
  });

  test('Agregar al carrito y abrir el carrito responden rápido', async ({ loginPage, inventoryPage, cartPage }, testInfo) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();

    const addToCartTime = await measure(async () => {
      await inventoryPage.addProductToCart(products.backpack);
      await inventoryPage.expectCartCount(1);
    });

    const openCartTime = await measure(async () => {
      await inventoryPage.goToCart();
      await cartPage.expectProducts([products.backpack]);
    });

    reportMetrics(testInfo, { addToCart: addToCartTime, openCart: openCartTime });

    expect.soft(addToCartTime, 'Agregar al carrito').toBeLessThan(thresholds.addToCart);
    expect.soft(openCartTime, 'Abrir el carrito').toBeLessThan(thresholds.openCart);
  });

  test('Detecta el login lento de performance_glitch_user', async ({ loginPage, inventoryPage }, testInfo) => {
    // Este usuario es lento a propósito: el test comprueba que la medición
    // detecta la demora, o sea que el test de login de arriba fallaría con él.
    await loginPage.goto();

    const loginTime = await measure(async () => {
      await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);
      await inventoryPage.expectLoaded({ timeout: 15_000 });
    });
    reportMetrics(testInfo, { login: loginTime });

    expect(loginTime, 'Tiempo de login con performance_glitch_user').toBeGreaterThan(thresholds.login);
  });
});
