import { expect, isMobile, test } from "./fixtures";

test.describe("navegación", () => {
  test("inicio carga con hero, buscador y rubros", async ({ page, consoleErrors }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("a un toque");
    await expect(page.getByRole("search")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Explorá por categoría" })).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("la navegación principal lleva a cada sección", async ({ page }) => {
    await page.goto("/");
    const nav = isMobile(page)
      ? page.getByRole("navigation", { name: "Navegación inferior" })
      : page.getByRole("navigation", { name: "Principal" });

    for (const [label, path, heading] of [
      ["Explorar", "/explorar/", "Explorar"],
      ["Categorías", "/categorias/", "Categorías"],
      ["Favoritos", "/favoritos/", "Favoritos"],
      ["Inicio", "/", null],
    ] as const) {
      await nav.getByRole("link", { name: label, exact: false }).first().click();
      await expect(page).toHaveURL(new RegExp(`${path.replace(/\//g, "\\/")}$`));
      if (heading) await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expect(nav.getByRole("link", { name: label }).first()).toHaveAttribute("aria-current", "page");
    }
  });

  test("las páginas institucionales y legales existen", async ({ page }) => {
    for (const [path, title] of [
      ["/nosotros/", "Qué es TARTAGAL GO"],
      ["/sumar-negocio/", "Sumá tu negocio a TARTAGAL GO"],
      ["/contacto/", "Contacto"],
      ["/privacidad/", "Política de privacidad"],
      ["/terminos/", "Términos y condiciones"],
    ] as const) {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    }
  });

  test("sin contacto configurado se muestra 'configuración pendiente' (sin formularios simulados)", async ({ page }) => {
    await page.goto("/sumar-negocio/");
    await expect(page.getByTestId("contact-pending")).toBeVisible();
    await expect(page.locator("form")).toHaveCount(0);
  });

  test("categoría individual muestra subrubros y negocios", async ({ page }) => {
    await page.goto("/categorias/gastronomia/");
    await expect(page.getByRole("heading", { level: 1, name: "Gastronomía" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /Subrubros/ }).getByRole("link")).toHaveCount(11);
    await expect(page.getByTestId("business-card").first()).toBeVisible();
  });

  test("negocio inexistente responde 404 con página útil", async ({ page }) => {
    const res = await page.goto("/no-existe/");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "No encontramos esta página" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Volver al inicio" })).toBeVisible();
  });

  test("sitemap y robots se generan", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain("/categorias/gastronomia/");
    // Cada negocio tiene web propia: el sitemap no publica fichas internas.
    expect(xml).not.toContain("/negocios/");
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Sitemap:");
  });
});
