/**
 * Tiempos máximos aceptados, en milisegundos.
 * Son generosos a propósito: Sauce Demo es un sitio externo y los
 * runners de GitHub Actions son más lentos que una PC local.
 */
export const thresholds = {
  ttfb: 1_500,
  domContentLoaded: 3_000,
  load: 5_000,
  firstContentfulPaint: 3_000,
  largestContentfulPaint: 4_000,
  /** Desde el click en "Login" hasta ver el listado de productos */
  login: 3_000,
  /** Agregar un producto y ver el contador del carrito actualizado */
  addToCart: 1_000,
  /** Desde el click en el carrito hasta ver la página del carrito */
  openCart: 2_000,
};
