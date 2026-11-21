import { test as base, expect, type Page } from "@playwright/test";

/** Recolecta errores de consola y violaciones de CSP de cada prueba. */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: async ({ page }, provide) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    await provide(errors);
  },
});

export { expect };

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 768;

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "la página no debe desplazarse horizontalmente").toBeLessThanOrEqual(0);
}
