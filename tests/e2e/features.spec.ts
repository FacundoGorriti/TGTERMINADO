import AxeBuilder from "@axe-core/playwright";
import { expect, expectNoHorizontalOverflow, test } from "./fixtures";

test.describe("favoritos", () => {
  test("guardar, listar, persistir y quitar", async ({ page }) => {
    await page.goto("/negocios/hotel-demo-yungas/");
    const save = page.getByRole("button", { name: "Guardar", exact: true });
    await save.click();
    await expect(page.getByRole("button", { name: "Guardado", exact: true })).toHaveAttribute("aria-pressed", "true");

    await page.goto("/favoritos/");
    await expect(page.getByTestId("favorites-count")).toContainText("1 negocio guardado");
    await page.reload();
    await expect(page.getByTestId("business-card")).toHaveCount(1);

    await page.getByRole("button", { name: /Quitar Hotel Demo Yungas de favoritos/ }).click();
    await expect(page.getByText("Todavía no guardaste negocios")).toBeVisible();
  });

  test("datos locales corruptos no rompen la página", async ({ page, consoleErrors }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("tgo:favorites:v1", '{"slugs":["<img src=x onerror=alert(1)>", 7, "no-existe-mas"]');
      window.localStorage.setItem("tgo:theme", "<script>");
    });
    await page.goto("/favoritos/");
    await expect(page.getByText("Todavía no guardaste negocios")).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("tema", () => {
  test("cambia, persiste y se aplica antes de hidratar", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");

    const toggle = page.getByTestId("theme-toggle");
    await toggle.click(); // system → light (pref)
    await toggle.click(); // light → dark
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Al recargar, el tema se aplica desde el script bloqueante (sin parpadeo).
    await page.reload();
    const themeAtFirstParse = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(themeAtFirstParse).toBe("dark");
  });

  test("respeta el tema del sistema en modo automático", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme-pref", "system");
  });
});

test.describe("ficha de negocio", () => {
  test("botón principal 'Visitar sitio web' seguro", async ({ page }) => {
    await page.goto("/negocios/cafe-demo-la-plaza/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Café Demo La Plaza");
    const web = page.getByRole("link", { name: /Visitar sitio web/ });
    await expect(web.first()).toHaveAttribute("href", /^https:\/\//);
    await expect(web.first()).toHaveAttribute("rel", "noopener noreferrer");
    await expect(web.first()).toHaveAttribute("target", "_blank");
    await expect(page.getByRole("heading", { name: "Información del rubro" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Ver menú/ })).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("sin sitio web no se muestran botones inexistentes", async ({ page }) => {
    await page.goto("/negocios/artesanias-demo-del-monte/");
    await expect(page.getByRole("link", { name: /Visitar sitio web/ })).toHaveCount(0);
    await expect(page.getByTestId("contact-actions")).toHaveCount(0);
    await expect(page.getByText("todavía no publicó medios de contacto").first()).toBeAttached();
  });

  test("los registros de demostración no se indexan y están rotulados", async ({ page }) => {
    await page.goto("/negocios/hotel-demo-yungas/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByText("Ejemplo ficticio").first()).toBeVisible();
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2); // WebSite + BreadcrumbList, sin LocalBusiness
  });

  test("todos los enlaces externos usan rel noopener noreferrer", async ({ page }) => {
    for (const path of ["/", "/negocios/cafe-demo-la-plaza/", "/negocios/hotel-demo-yungas/"]) {
      await page.goto(path);
      const unsafe = await page.$$eval('a[target="_blank"]', (links) =>
        links.filter((a) => !(a.getAttribute("rel") ?? "").includes("noopener")).map((a) => a.getAttribute("href")),
      );
      expect(unsafe).toEqual([]);
      const badSchemes = await page.$$eval("a[href]", (links) =>
        links.map((a) => a.getAttribute("href") ?? "").filter((h) => /^(javascript|data|vbscript):/i.test(h.trim())),
      );
      expect(badSchemes).toEqual([]);
    }
  });
});

test.describe("seguridad", () => {
  test("CSP por hashes presente y sin violaciones", async ({ page, consoleErrors }) => {
    const res = await page.goto("/explorar/");
    const headers = res?.headers() ?? {};
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");

    const meta = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
    expect(meta).toMatch(/script-src 'self' 'sha256-/);
    expect(meta).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);

    await page.getByRole("searchbox").fill("hotel");
    await expect(page.getByTestId("business-card")).toHaveCount(1);
    expect(consoleErrors.filter((e) => /Content Security Policy|Refused to/i.test(e))).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test("la navegación del cliente funciona bajo la CSP", async ({ page, consoleErrors }) => {
    await page.goto("/categorias/");
    await page.getByRole("link", { name: /Gastronomía/ }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Gastronomía" })).toBeVisible();
    await page.getByTestId("business-card").first().getByRole("link").click();
    await expect(page).toHaveURL(/\/negocios\//);
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("accesibilidad básica (axe, WCAG 2.x A/AA)", () => {
  for (const path of ["/", "/explorar/", "/categorias/", "/categorias/salud-y-bienestar/", "/negocios/farmacia-ejemplo-norte/", "/favoritos/", "/sumar-negocio/", "/privacidad/"]) {
    for (const scheme of ["light", "dark"] as const) {
      test(`${path} (${scheme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        const serious = results.violations
          .filter((v) => v.impact === "serious" || v.impact === "critical")
          .map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
        expect(serious).toEqual([]);
      });
    }
  }
});

test.describe("diseño responsive", () => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    test(`sin desplazamiento horizontal a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/explorar/", "/negocios/cafe-demo-la-plaza/", "/categorias/"]) {
        await page.goto(path);
        await expectNoHorizontalOverflow(page);
      }
    });
  }

  test("áreas táctiles de la navegación inferior ≥ 44px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const boxes = await page.getByRole("navigation", { name: "Navegación inferior" }).getByRole("link").evaluateAll((els) =>
      els.map((e) => e.getBoundingClientRect()).map((r) => ({ w: r.width, h: r.height })),
    );
    expect(boxes).toHaveLength(4);
    for (const b of boxes) {
      expect(b.w).toBeGreaterThanOrEqual(44);
      expect(b.h).toBeGreaterThanOrEqual(44);
    }
  });
});
