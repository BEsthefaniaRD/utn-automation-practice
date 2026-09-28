import { type Page, type TestInfo } from '@playwright/test';

export type NavigationMetrics = {
  /** Tiempo hasta el primer byte de la respuesta del servidor (TTFB) */
  ttfb: number;
  /** Tiempo hasta que el HTML fue parseado (DOMContentLoaded) */
  domContentLoaded: number;
  /** Tiempo hasta que terminó de cargar la página completa (evento load) */
  load: number;
  /** Tiempo hasta que el navegador pintó el primer contenido (First Contentful Paint) */
  firstContentfulPaint: number;
};

/**
 * Lee las métricas de carga de la página actual usando la
 * Navigation Timing API y la Paint Timing API del navegador.
 * Llamar después de page.goto() (que por defecto espera el evento load).
 */
export async function getNavigationMetrics(page: Page): Promise<NavigationMetrics> {
  return page.evaluate(async () => {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    // El pintado puede registrarse después del evento load, así que lo esperamos.
    const firstContentfulPaint = await new Promise<number>((resolve) => {
      new PerformanceObserver((list) => {
        const fcp = list.getEntriesByName('first-contentful-paint')[0];
        if (fcp) resolve(fcp.startTime);
      }).observe({ type: 'paint', buffered: true });
      setTimeout(() => resolve(NaN), 5_000);
    });
    return {
      ttfb: nav.responseStart - nav.startTime,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      load: nav.loadEventEnd - nav.startTime,
      firstContentfulPaint,
    };
  });
}

/**
 * Largest Contentful Paint: cuándo se pintó el elemento más grande visible.
 * Solo está disponible en navegadores basados en Chromium.
 */
export async function getLargestContentfulPaint(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1].startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        // Si el navegador no reporta LCP, no dejamos el test colgado.
        setTimeout(() => resolve(NaN), 5_000);
      }),
  );
}

/** Ejecuta una acción y devuelve cuántos milisegundos tardó. */
export async function measure(action: () => Promise<void>): Promise<number> {
  const start = performance.now();
  await action();
  return Math.round(performance.now() - start);
}

/** Adjunta las métricas al reporte HTML para poder compararlas entre ejecuciones. */
export function reportMetrics(testInfo: TestInfo, metrics: Record<string, number>): void {
  for (const [name, value] of Object.entries(metrics)) {
    testInfo.annotations.push({ type: name, description: `${Math.round(value)} ms` });
    console.log(`  ${name}: ${Math.round(value)} ms`);
  }
}
