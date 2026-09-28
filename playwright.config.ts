import { defineConfig, devices, type ReporterDescription } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ...(process.env.CI
      ? ([
          /* Marca los tests fallidos como anotaciones en GitHub Actions */
          ['github'],
          /* Salida en consola para los logs del job */
          ['list'],
          /* Reporte HTML que el workflow sube como artifact (sin abrir el navegador) */
          ['html', { outputFolder: 'playwright-report', open: 'never' }],
          /* Resultados en XML, compatibles con otras herramientas de CI */
          ['junit', { outputFile: 'test-results/junit.xml' }],
        ] satisfies ReporterDescription[])
      : ([
          ['list'],
          ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
        ] satisfies ReporterDescription[])),
    /* Reporte QA (tabla con criterio, prioridad, resultado, responsable y fecha) en HTML y CSV */
    [
      './reporters/qa-report.ts',
      {
        outputFolder: 'qa-report',
        titulo: 'Reporte de pruebas - UTN Automation Practice',
        // En GitHub Actions usa el usuario que disparó el workflow.
        responsable: process.env.QA_RESPONSABLE ?? process.env.GITHUB_ACTOR ?? 'BEsthefaniaRD',
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Evidencia de los tests fallidos; queda adjunta en el reporte HTML */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
