import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas E2E sobre el BUILD ESTÁTICO (out/), servido con las mismas cabeceras
 * que vercel.json. Requiere `npm run build` previo.
 */
const PORT = Number(process.env.E2E_PORT ?? 4173);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    locale: "es-AR",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: "node scripts/serve-static.mjs",
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
